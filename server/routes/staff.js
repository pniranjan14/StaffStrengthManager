const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/staff/summary
router.get('/summary', verifyToken, (req, res) => {
  const permTotal = db.prepare('SELECT SUM(sanctioned_permanent) as total FROM staff_strength').get().total || 0;
  const tempTotal = db.prepare('SELECT SUM(sanctioned_temporary) as total FROM staff_strength').get().total || 0;
  const workingTotal = db.prepare('SELECT SUM(working_strength) as total FROM staff_strength').get().total || 0;
  const totalOffices = db.prepare('SELECT COUNT(*) as count FROM offices').get().count || 0;
  const totalOfficers = db.prepare("SELECT COUNT(*) as count FROM officers WHERE status = 'Active'").get().count || 0;

  // Category breakdown
  const categoryStats = db.prepare(`
    SELECT o.category, SUM(ss.sanctioned_permanent) as permanent, SUM(ss.sanctioned_temporary) as temporary, SUM(ss.working_strength) as working
    FROM staff_strength ss
    JOIN offices o ON ss.office_id = o.id
    GROUP BY o.category
  `).all();

  res.json({
    sanctionedPermanent: permTotal,
    sanctionedTemporary: tempTotal,
    grandTotalSanctioned: permTotal + tempTotal,
    workingStrength: workingTotal,
    totalOffices,
    totalOfficers,
    categoryStats
  });
});

// GET /api/staff/strength-matrix
router.get('/strength-matrix', verifyToken, (req, res) => {
  const { office_id, category } = req.query;

  let query = `
    SELECT 
      ss.id,
      ss.sanctioned_permanent,
      ss.sanctioned_temporary,
      ss.working_strength,
      o.id as office_id,
      o.code as office_code,
      o.name as office_name,
      o.category as office_category,
      d.id as designation_id,
      d.code as desig_code,
      d.full_title as desig_title,
      d.category as desig_category
    FROM staff_strength ss
    JOIN offices o ON ss.office_id = o.id
    JOIN designations d ON ss.designation_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (office_id) {
    query += ' AND ss.office_id = ?';
    params.push(office_id);
  }
  if (category) {
    query += ' AND o.category = ?';
    params.push(category);
  }

  query += ' ORDER BY d.order_index ASC, o.name ASC';

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// GET /api/staff/officers
router.get('/officers', verifyToken, (req, res) => {
  const { search, office_id, designation_id, department, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  let baseQuery = `
    FROM officers f
    JOIN offices o ON f.office_id = o.id
    JOIN designations d ON f.designation_id = d.id
    WHERE f.status = 'Active'
  `;
  const params = [];

  if (search) {
    baseQuery += ' AND (f.name LIKE ? OR f.pen LIKE ? OR o.name LIKE ? OR d.full_title LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  if (office_id) {
    baseQuery += ' AND f.office_id = ?';
    params.push(office_id);
  }
  if (designation_id) {
    baseQuery += ' AND f.designation_id = ?';
    params.push(designation_id);
  }
  if (department) {
    baseQuery += ' AND f.department = ?';
    params.push(department);
  }

  const countRow = db.prepare(`SELECT COUNT(*) as count ${baseQuery}`).get(...params);
  const total = countRow.count;

  const dataQuery = `
    SELECT 
      f.id,
      f.pen,
      f.name,
      f.department,
      f.status,
      f.joined_date,
      o.id as office_id,
      o.code as office_code,
      o.name as office_name,
      d.id as designation_id,
      d.code as desig_code,
      d.full_title as desig_title
    ${baseQuery}
    ORDER BY f.id DESC
    LIMIT ? OFFSET ?
  `;
  
  const officers = db.prepare(dataQuery).all(...params, parseInt(limit), parseInt(offset));

  res.json({
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    officers
  });
});

// PUT /api/staff/officers/:id (ADMIN)
router.put('/officers/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, pen, department } = req.body;

  const officer = db.prepare('SELECT * FROM officers WHERE id = ?').get(id);
  if (!officer) {
    return res.status(404).json({ error: 'Officer not found.' });
  }

  db.prepare(`
    UPDATE officers 
    SET name = COALESCE(?, name),
        pen = COALESCE(?, pen),
        department = COALESCE(?, department)
    WHERE id = ?
  `).run(name, pen, department, id);

  db.prepare(`
    INSERT INTO audit_logs (officer_id, officer_name, action, details, performed_by)
    VALUES (?, ?, 'NAME_EDIT', ?, ?)
  `).run(id, name || officer.name, `Updated details for ${name || officer.name} (PEN: ${pen || officer.pen})`, req.user.name);

  res.json({ message: 'Officer details updated successfully.' });
});

// POST /api/staff/officers/:id/transfer (ADMIN)
router.post('/officers/:id/transfer', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { new_office_id, remarks } = req.body;

  if (!new_office_id) {
    return res.status(400).json({ error: 'New office assignment is required.' });
  }

  const officer = db.prepare('SELECT * FROM officers WHERE id = ?').get(id);
  if (!officer) {
    return res.status(404).json({ error: 'Officer not found.' });
  }

  const oldOffice = db.prepare('SELECT name FROM offices WHERE id = ?').get(officer.office_id);
  const newOffice = db.prepare('SELECT name FROM offices WHERE id = ?').get(new_office_id);

  if (!newOffice) {
    return res.status(404).json({ error: 'Selected destination office does not exist.' });
  }

  // Transaction for transfer
  const transferTx = db.transaction(() => {
    // 1. Update officer's office
    db.prepare('UPDATE officers SET office_id = ? WHERE id = ?').run(new_office_id, id);

    // 2. Adjust working strength: decrement old office, increment new office
    db.prepare(`
      UPDATE staff_strength 
      SET working_strength = MAX(0, working_strength - 1)
      WHERE office_id = ? AND designation_id = ?
    `).run(officer.office_id, officer.designation_id);

    db.prepare(`
      INSERT INTO staff_strength (office_id, designation_id, sanctioned_permanent, sanctioned_temporary, working_strength)
      VALUES (?, ?, 0, 0, 1)
      ON CONFLICT(office_id, designation_id) DO UPDATE SET
        working_strength = working_strength + 1
    `).run(new_office_id, officer.designation_id);

    // 3. Log audit record
    const detailMsg = `Transferred ${officer.name} from ${oldOffice.name} to ${newOffice.name}. ${remarks ? 'Remarks: ' + remarks : ''}`;
    db.prepare(`
      INSERT INTO audit_logs (officer_id, officer_name, action, details, performed_by)
      VALUES (?, ?, 'TRANSFER', ?, ?)
    `).run(id, officer.name, detailMsg, req.user.name);
  });

  transferTx();

  res.json({ message: `Successfully transferred ${officer.name} to ${newOffice.name}.` });
});

// POST /api/staff/officers/:id/promote (ADMIN)
router.post('/officers/:id/promote', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { new_designation_id, new_office_id, remarks } = req.body;

  if (!new_designation_id) {
    return res.status(400).json({ error: 'New designation is required.' });
  }

  const officer = db.prepare('SELECT * FROM officers WHERE id = ?').get(id);
  if (!officer) {
    return res.status(404).json({ error: 'Officer not found.' });
  }

  const oldDesig = db.prepare('SELECT full_title FROM designations WHERE id = ?').get(officer.designation_id);
  const newDesig = db.prepare('SELECT full_title FROM designations WHERE id = ?').get(new_designation_id);
  const targetOfficeId = new_office_id || officer.office_id;

  if (!newDesig) {
    return res.status(404).json({ error: 'Selected designation does not exist.' });
  }

  const promoteTx = db.transaction(() => {
    // 1. Decrement working strength for old designation
    db.prepare(`
      UPDATE staff_strength 
      SET working_strength = MAX(0, working_strength - 1)
      WHERE office_id = ? AND designation_id = ?
    `).run(officer.office_id, officer.designation_id);

    // 2. Increment working strength for new designation
    db.prepare(`
      INSERT INTO staff_strength (office_id, designation_id, sanctioned_permanent, sanctioned_temporary, working_strength)
      VALUES (?, ?, 0, 0, 1)
      ON CONFLICT(office_id, designation_id) DO UPDATE SET
        working_strength = working_strength + 1
    `).run(targetOfficeId, new_designation_id);

    // 3. Update officer record
    db.prepare('UPDATE officers SET designation_id = ?, office_id = ? WHERE id = ?').run(new_designation_id, targetOfficeId, id);

    // 4. Log audit record
    const detailMsg = `Promoted ${officer.name} from ${oldDesig.full_title} to ${newDesig.full_title}. ${remarks ? 'Remarks: ' + remarks : ''}`;
    db.prepare(`
      INSERT INTO audit_logs (officer_id, officer_name, action, details, performed_by)
      VALUES (?, ?, 'PROMOTION', ?, ?)
    `).run(id, officer.name, detailMsg, req.user.name);
  });

  promoteTx();

  res.json({ message: `Successfully promoted ${officer.name} to ${newDesig.full_title}.` });
});

// POST /api/staff/officers (ADMIN)
router.post('/officers', verifyToken, requireAdmin, (req, res) => {
  const { pen, name, designation_id, office_id, department } = req.body;

  if (!pen || !name || !designation_id || !office_id) {
    return res.status(400).json({ error: 'PEN, Name, Designation, and Office are required.' });
  }

  const existing = db.prepare('SELECT id FROM officers WHERE pen = ?').get(pen);
  if (existing) {
    return res.status(400).json({ error: `An officer with PEN ${pen} already exists.` });
  }

  const addTx = db.transaction(() => {
    const resInfo = db.prepare(`
      INSERT INTO officers (pen, name, designation_id, office_id, department, status, joined_date)
      VALUES (?, ?, ?, ?, ?, 'Active', DATE('now'))
    `).run(pen, name, designation_id, office_id, department || 'Land Revenue');

    db.prepare(`
      INSERT INTO staff_strength (office_id, designation_id, sanctioned_permanent, sanctioned_temporary, working_strength)
      VALUES (?, ?, 1, 0, 1)
      ON CONFLICT(office_id, designation_id) DO UPDATE SET
        working_strength = working_strength + 1
    `).run(office_id, designation_id);

    db.prepare(`
      INSERT INTO audit_logs (officer_id, officer_name, action, details, performed_by)
      VALUES (?, ?, 'ADD_OFFICER', ?, ?)
    `).run(resInfo.lastInsertRowid, name, `Added new officer ${name} (PEN: ${pen})`, req.user.name);
  });

  addTx();

  res.json({ message: 'New officer added successfully.' });
});

// GET /api/staff/audit-logs
router.get('/audit-logs', verifyToken, (req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50').all();
  res.json(logs);
});

module.exports = router;
