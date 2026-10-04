const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const db = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

// POST /api/admin/import-excel
router.post('/import-excel', verifyToken, requireAdmin, upload.single('excelFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Excel file is required.' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length < 4) {
      return res.status(400).json({ error: 'Invalid spreadsheet format. Insufficient rows.' });
    }

    const headerOffices = rows[1];
    const headerTypes = rows[2];

    const colMapping = {};
    let currentOffice = null;
    for (let c = 2; c < headerOffices.length; c++) {
      if (headerOffices[c]) {
        currentOffice = String(headerOffices[c]).trim();
      }
      const stype = headerTypes[c] ? String(headerTypes[c]).trim() : '';
      if (currentOffice && (stype === 'P' || stype === 'T')) {
        colMapping[c] = { office: currentOffice, type: stype === 'P' ? 'Permanent' : 'Temporary' };
      }
    }

    let recordsUpdated = 0;
    const updateTx = db.transaction(() => {
      for (let r = 3; r < rows.length; r++) {
        const row = rows[r];
        const desig = row[1];
        if (!desig || String(desig).trim().startsWith('GT') || String(desig).trim().startsWith('Total')) {
          continue;
        }
        const desigCode = String(desig).trim();

        const desigRow = db.prepare('SELECT id FROM designations WHERE code = ?').get(desigCode);
        if (!desigRow) continue;

        for (const [colIdx, meta] of Object.entries(colMapping)) {
          const val = row[colIdx];
          if (val !== undefined && val !== null && !isNaN(val) && Number(val) > 0) {
            const count = parseInt(val);
            const offRow = db.prepare('SELECT id FROM offices WHERE code = ?').get(meta.office);
            if (offRow) {
              const isPerm = meta.type === 'Permanent';
              const permVal = isPerm ? count : 0;
              const tempVal = !isPerm ? count : 0;

              db.prepare(`
                INSERT INTO staff_strength (office_id, designation_id, sanctioned_permanent, sanctioned_temporary, working_strength)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(office_id, designation_id) DO UPDATE SET
                  sanctioned_permanent = CASE WHEN ? THEN ? ELSE sanctioned_permanent END,
                  sanctioned_temporary = CASE WHEN NOT ? THEN ? ELSE sanctioned_temporary END
              `).run(offRow.id, desigRow.id, permVal, tempVal, permVal + tempVal, isPerm, permVal, isPerm, tempVal);
              recordsUpdated++;
            }
          }
        }
      }

      db.prepare(`
        INSERT INTO audit_logs (officer_id, officer_name, action, details, performed_by)
        VALUES (0, 'Excel Import', 'EXCEL_IMPORT', 'Re-imported staff strength data from uploaded spreadsheet', ?)
      `).run(req.user.name);
    });

    updateTx();

    res.json({ message: `Excel data processed successfully! ${recordsUpdated} staff strength entries updated.` });
  } catch (err) {
    console.error('Excel Import Error:', err);
    res.status(500).json({ error: 'Failed to parse Excel file: ' + err.message });
  }
});

module.exports = router;
