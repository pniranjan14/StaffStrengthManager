const db = require('./db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Full names & categories mapping for office codes
const OFFICE_META = {
  'DC KTYM': { name: 'District Collectorate, Kottayam', category: 'Collectorate' },
  'RDO KTM': { name: 'Revenue Divisional Office, Kottayam', category: 'RDO Office' },
  'RDO PALA': { name: 'Revenue Divisional Office, Pala', category: 'RDO Office' },
  'PSO KTM': { name: 'Public Relations & Security Office, Kottayam', category: 'Collectorate' },
  'Taluk KTM': { name: 'Taluk Office, Kottayam', category: 'Taluk Office' },
  'Taluk KPLY': { name: 'Taluk Office, Kanjirappally', category: 'Taluk Office' },
  'Taluk CHRY': { name: 'Taluk Office, Changanasserry', category: 'Taluk Office' },
  'Taluk MNL': { name: 'Taluk Office, Meenachil (Pala)', category: 'Taluk Office' },
  'Taluk VKM': { name: 'Taluk Office, Vaikom', category: 'Taluk Office' },
  'RR KTM': { name: 'Revenue Recovery Office, Kottayam', category: 'Revenue Recovery' },
  'RR PALA': { name: 'Revenue Recovery Office, Pala', category: 'Revenue Recovery' },
  'LA Gl KTM': { name: 'Land Acquisition General, Kottayam', category: 'Land Acquisition' },
  'LA Gl PALA': { name: 'Land Acquisition General, Pala', category: 'Land Acquisition' },
  'LA KiiFB, Vaikom': { name: 'Land Acquisition (KIIFB), Vaikom', category: 'Land Acquisition' },
  'LA Mundakkayam': { name: 'Land Acquisition, Mundakkayam', category: 'Land Acquisition' },
  'LA Greenfield': { name: 'Land Acquisition (Greenfield Airport)', category: 'Land Acquisition' },
  'KSFE KTM': { name: 'KSFE Special Unit, Kottayam', category: 'Special Wing' },
  'Resurvey PALA': { name: 'Re-survey Office, Pala', category: 'Re-survey' },
  'Resurvey KTM': { name: 'Re-survey Office, Kottayam', category: 'Re-survey' },
  'Resurvey Supdt Pala': { name: 'Re-survey Superintendent Office, Pala', category: 'Re-survey' },
  'Mapping KTM': { name: 'Mapping & Drafting Wing, Kottayam', category: 'Re-survey' },
  'Resurvey VKM 1': { name: 'Re-survey Office, Vaikom Unit 1', category: 'Re-survey' },
  'Resurvey VKM 2': { name: 'Re-survey Office, Vaikom Unit 2', category: 'Re-survey' }
};

// Full names & order for designations
const DESIGNATION_META = {
  'DC': { full: 'District Collector', category: 'Gazetted Class I', order: 1 },
  'SC': { full: 'Special Collector', category: 'Gazetted Class I', order: 2 },
  'RDO': { full: 'Revenue Divisional Officer', category: 'Gazetted Class I', order: 3 },
  'DY CLTR': { full: 'Deputy Collector', category: 'Gazetted Class I', order: 4 },
  'PSO': { full: 'Personal Security Officer', category: 'Gazetted Class II', order: 5 },
  'DLO': { full: 'District Law Officer', category: 'Gazetted Class II', order: 6 },
  'Legal Asst': { full: 'Legal Assistant', category: 'Non-Gazetted', order: 7 },
  'DD SLR': { full: 'Deputy Director (Survey & Land Records)', category: 'Gazetted Class I', order: 8 },
  'FO': { full: 'Finance Officer', category: 'Gazetted Class II', order: 9 },
  'CA': { full: 'Confidential Assistant', category: 'Clerical', order: 10 },
  'HS': { full: 'Head Surveyor', category: 'Survey', order: 11 },
  'THR': { full: 'Tehsildar', category: 'Gazetted Class II', order: 12 },
  'SS': { full: 'Senior Superintendent', category: 'Gazetted Class II', order: 13 },
  'JS': { full: 'Junior Superintendent', category: 'Non-Gazetted Executive', order: 14 },
  'DT': { full: 'Deputy Tehsildar', category: 'Gazetted Class II', order: 15 },
  'VA': { full: 'Village Officer / Assistant', category: 'Executive', order: 16 },
  'CI': { full: 'Revenue Inspector', category: 'Executive', order: 17 },
  'RI': { full: 'Revenue Inspector', category: 'Executive', order: 18 },
  'HC': { full: 'Head Clerk', category: 'Clerical', order: 19 },
  'VO': { full: 'Village Officer', category: 'Executive', order: 20 },
  'Supdt SLR': { full: 'Superintendent (Survey & Land Records)', category: 'Survey', order: 21 },
  'Hd Sy': { full: 'Head Surveyor', category: 'Survey', order: 22 },
  'Surveyor': { full: 'Surveyor', category: 'Survey', order: 23 },
  'Draftsman': { full: 'Draftsman', category: 'Survey', order: 24 },
  'Tracer': { full: 'Tracer', category: 'Technical', order: 25 },
  'Blue printer': { full: 'Blue Printer', category: 'Technical', order: 26 },
  'Sr Clerk': { full: 'Senior Clerk', category: 'Clerical', order: 27 },
  'Clerk': { full: 'Junior Clerk', category: 'Clerical', order: 28 },
  'SVO': { full: 'Special Village Officer', category: 'Executive', order: 29 },
  'FCS': { full: 'Financial Control Specialist', category: 'Clerical', order: 30 },
  'Sl Gr Typist': { full: 'Selection Grade Typist', category: 'Clerical', order: 31 },
  'Sr Gr Typist': { full: 'Senior Grade Typist', category: 'Clerical', order: 32 },
  'UD Typist': { full: 'Upper Division Typist', category: 'Clerical', order: 33 },
  'LD Typist': { full: 'Lower Division Typist', category: 'Clerical', order: 34 },
  'Attender': { full: 'Office Attender', category: 'Subordinate', order: 35 },
  'Sergernt': { full: 'Sergeant', category: 'Subordinate', order: 36 },
  'Duffedar': { full: 'Duffedar', category: 'Subordinate', order: 37 },
  'Chowkidar': { full: 'Chowkidar', category: 'Subordinate', order: 38 },
  'Gardner': { full: 'Gardener', category: 'Subordinate', order: 39 },
  'VFA': { full: 'Village Field Assistant', category: 'Executive', order: 40 },
  'OA': { full: 'Office Attendant', category: 'Subordinate', order: 41 },
  'Driver': { full: 'Driver (Gr I / Gr II)', category: 'Subordinate', order: 42 },
  'Chain man': { full: 'Chainman (Survey)', category: 'Subordinate', order: 43 },
  'PTS': { full: 'Part-Time Sweeper', category: 'Subordinate', order: 44 },
  'Casual sweeper': { full: 'Casual Sweeper', category: 'Subordinate', order: 45 },
  'lift operator': { full: 'Lift Operator', category: 'Subordinate', order: 46 }
};

const SAMPLE_NAMES = [
  "Sreekumar K. N.", "Anilkumar P. V.", "Radhakrishnan Nair", "Geetha Devi R.",
  "Santhosh Kumar B.", "Biju Thomas", "Muhammad Asharaf", "Deepa S. Nair",
  "Raji Varghese", "Suresh Babu M.", "Jisha K. Pillai", "Vinod Chandran",
  "Pradeep Kumar G.", "Maya S. Kumar", "Harikrishnan R.", "Mini Mol V.",
  "Unnikrishnan P.", "Sobhana Kumari", "Ratheesh R.", "Sindhu V. Nair",
  "Gopakumar S.", "Shailaja P.", "Mathew Kurian", "Anoop V. S.",
  "Preetha P. Nair", "Jayakumar K.", "Lekha R. Prasad", "Sunil Dutt",
  "Beena P. John", "Kiran V. Nath", "Reshmi S. Pillai", "Ajithkumar R."
];

const DEPARTMENTS = [
  "Land Revenue", "General Administration", "Election", "Disaster Management",
  "Revenue Recovery", "Land Acquisition", "Survey & Land Records"
];

function seed() {
  console.log("Starting Database Seeding...");

  // 1. Seed Users
  const salt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync("admin123", salt);
  const viewerPass = bcrypt.hashSync("viewer123", salt);

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (username, password_hash, name, role)
    VALUES (?, ?, ?, ?)
  `);

  insertUser.run("admin", adminPass, "Administrator (Kottayam Revenue)", "ADMIN");
  insertUser.run("viewer", viewerPass, "Public / Staff Viewer", "VIEWER");
  console.log("Users seeded: admin (admin123), viewer (viewer123)");

  // 2. Load JSON data
  const jsonPath = path.join(__dirname, '..', 'parsed_staff_data.json');
  if (!fs.existsSync(jsonPath)) {
    console.error("parsed_staff_data.json not found! Run python parser first.");
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // 3. Seed Offices
  const insertOffice = db.prepare(`
    INSERT OR IGNORE INTO offices (code, name, category)
    VALUES (?, ?, ?)
  `);

  const officeMap = {};
  for (const entry of rawData) {
    const code = entry.office;
    if (!officeMap[code]) {
      const meta = OFFICE_META[code] || { name: code, category: 'Other Office' };
      insertOffice.run(code, meta.name, meta.category);
      const row = db.prepare("SELECT id FROM offices WHERE code = ?").get(code);
      officeMap[code] = row.id;
    }
  }
  console.log(`Offices seeded: ${Object.keys(officeMap).length}`);

  // 4. Seed Designations
  const insertDesignation = db.prepare(`
    INSERT OR IGNORE INTO designations (code, full_title, category, order_index)
    VALUES (?, ?, ?, ?)
  `);

  const desigMap = {};
  for (const entry of rawData) {
    const code = entry.designation;
    if (!desigMap[code]) {
      const meta = DESIGNATION_META[code] || { full: code, category: 'General', order: 99 };
      insertDesignation.run(code, meta.full, meta.category, meta.order);
      const row = db.prepare("SELECT id FROM designations WHERE code = ?").get(code);
      desigMap[code] = row.id;
    }
  }
  console.log(`Designations seeded: ${Object.keys(desigMap).length}`);

  // 5. Seed Staff Strength
  const insertStrength = db.prepare(`
    INSERT INTO staff_strength (office_id, designation_id, sanctioned_permanent, sanctioned_temporary, working_strength)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(office_id, designation_id) DO UPDATE SET
      sanctioned_permanent = sanctioned_permanent + excluded.sanctioned_permanent,
      sanctioned_temporary = sanctioned_temporary + excluded.sanctioned_temporary,
      working_strength = working_strength + excluded.working_strength
  `);

  // Reset strength table
  db.exec("DELETE FROM staff_strength");
  db.exec("DELETE FROM officers");

  let strengthRecords = 0;
  for (const entry of rawData) {
    const offId = officeMap[entry.office];
    const desigId = desigMap[entry.designation];
    const isPerm = entry.post_type === 'Permanent';
    const perm = isPerm ? entry.sanctioned_count : 0;
    const temp = !isPerm ? entry.sanctioned_count : 0;
    // Assume working strength initially equals permanent + temporary sanctioned
    const working = perm + temp;

    insertStrength.run(offId, desigId, perm, temp, working);
    strengthRecords++;
  }
  console.log(`Staff Strength records inserted: ${strengthRecords}`);

  // 6. Generate Officers Sample Data mapped to actual office & designation strength
  const insertOfficer = db.prepare(`
    INSERT OR IGNORE INTO officers (pen, name, designation_id, office_id, department, status, joined_date)
    VALUES (?, ?, ?, ?, ?, 'Active', '2022-01-15')
  `);

  let penCounter = 701001;
  let nameIndex = 0;

  // Generate sample officer profiles for high/mid level positions in Kottayam Revenue
  const keyStrengths = db.prepare(`
    SELECT ss.*, o.code as office_code, o.name as office_name, d.code as desig_code, d.full_title
    FROM staff_strength ss
    JOIN offices o ON ss.office_id = o.id
    JOIN designations d ON ss.designation_id = d.id
    ORDER BY d.order_index ASC, o.id ASC
  `).all();

  let officersCreated = 0;
  for (const st of keyStrengths) {
    // Generate up to 3 sample officer records per designation/office combination to populate table
    const countToGenerate = Math.min(st.working_strength, 2);
    for (let i = 0; i < countToGenerate; i++) {
      const name = SAMPLE_NAMES[nameIndex % SAMPLE_NAMES.length] + (nameIndex >= SAMPLE_NAMES.length ? ` (${i + 1})` : '');
      const pen = `PEN${penCounter++}`;
      const dept = DEPARTMENTS[nameIndex % DEPARTMENTS.length];

      insertOfficer.run(pen, name, st.designation_id, st.office_id, dept);
      officersCreated++;
      nameIndex++;
    }
  }
  console.log(`Sample Officer profiles created: ${officersCreated}`);

  // Audit log entry for initial seed
  db.prepare(`
    INSERT INTO audit_logs (officer_id, officer_name, action, details, performed_by)
    VALUES (0, 'System', 'EXCEL_IMPORT', 'Initial staff strength data imported from Kottayam Revenue Excel sheet', 'SYSTEM')
  `).run();

  console.log("Seeding completed successfully!");
}

seed();
