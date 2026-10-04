const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /api/offices
router.get('/', verifyToken, (req, res) => {
  const offices = db.prepare(`
    SELECT 
      o.*,
      COALESCE(SUM(ss.sanctioned_permanent), 0) as permanent_sanctioned,
      COALESCE(SUM(ss.sanctioned_temporary), 0) as temporary_sanctioned,
      COALESCE(SUM(ss.working_strength), 0) as total_working
    FROM offices o
    LEFT JOIN staff_strength ss ON o.id = ss.office_id
    GROUP BY o.id
    ORDER BY o.category ASC, o.name ASC
  `).all();

  res.json(offices);
});

// GET /api/offices/designations
router.get('/designations', verifyToken, (req, res) => {
  const designations = db.prepare('SELECT * FROM designations ORDER BY order_index ASC, full_title ASC').all();
  res.json(designations);
});

module.exports = router;
