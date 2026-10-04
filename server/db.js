const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'revenue.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS offices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT DEFAULT 'Kottayam'
    );

    CREATE TABLE IF NOT EXISTS designations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      full_title TEXT NOT NULL,
      category TEXT NOT NULL,
      order_index INTEGER DEFAULT 99
    );

    CREATE TABLE IF NOT EXISTS staff_strength (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      office_id INTEGER NOT NULL,
      designation_id INTEGER NOT NULL,
      sanctioned_permanent INTEGER DEFAULT 0,
      sanctioned_temporary INTEGER DEFAULT 0,
      working_strength INTEGER DEFAULT 0,
      FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
      FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE CASCADE,
      UNIQUE(office_id, designation_id)
    );

    CREATE TABLE IF NOT EXISTS officers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pen TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      designation_id INTEGER NOT NULL,
      office_id INTEGER NOT NULL,
      department TEXT DEFAULT 'Land Revenue',
      status TEXT DEFAULT 'Active',
      joined_date TEXT,
      FOREIGN KEY (designation_id) REFERENCES designations(id),
      FOREIGN KEY (office_id) REFERENCES offices(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'VIEWER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      officer_id INTEGER,
      officer_name TEXT,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

initDb();

module.exports = db;
