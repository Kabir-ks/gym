import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, "../../database/gymsmart.db"));
db.pragma("journal_mode = WAL");

// Create tables
const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      invited_by INTEGER REFERENCES admins(id)
    );

    CREATE TABLE IF NOT EXISTS admin_invites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      created_by INTEGER REFERENCES admins(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      used_by INTEGER REFERENCES admins(id)
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      access_code TEXT UNIQUE NOT NULL,
      membership_type TEXT NOT NULL,
      membership_start DATE NOT NULL,
      membership_end DATE NOT NULL,
      membership_fee REAL NOT NULL,
      payment_day INTEGER DEFAULT 1,
      last_payment_date DATE,
      next_payment_due DATE,
      payment_status TEXT DEFAULT 'current',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER REFERENCES admins(id)
    );

    CREATE TABLE IF NOT EXISTS payment_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER REFERENCES members(id),
      due_date DATE NOT NULL,
      expected_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_id INTEGER REFERENCES payments(id),
      days_overdue INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER REFERENCES members(id),
      payment_schedule_id INTEGER REFERENCES payment_schedules(id),
      amount REAL NOT NULL,
      payment_date DATE NOT NULL,
      payment_method TEXT,
      recorded_by INTEGER REFERENCES admins(id),
      is_late BOOLEAN DEFAULT 0,
      late_fee REAL DEFAULT 0,
      notes TEXT,
      payment_status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER REFERENCES members(id),
      check_in DATETIME NOT NULL,
      check_out DATETIME,
      recorded_by INTEGER REFERENCES admins(id)
    );

    CREATE TABLE IF NOT EXISTS nutrition_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_type TEXT NOT NULL,
      user_id INTEGER,
      name TEXT,
      age INTEGER,
      weight REAL,
      height REAL,
      activity_level TEXT,
      goal TEXT,
      calculated_calories INTEGER,
      protein_grams REAL,
      carbs_grams REAL,
      fats_grams REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER REFERENCES admins(id),
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

createTables();

export default db;
