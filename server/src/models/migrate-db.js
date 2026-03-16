import db from "./db.js";

// Migration script to add new payment system fields
const migrateDatabase = () => {
  console.log("Starting database migration...");

  try {
    // Check if columns already exist
    const tableInfo = db.prepare("PRAGMA table_info(members)").all();
    const columnNames = tableInfo.map((col) => col.name);

    // Add new columns to members table if they don't exist
    if (!columnNames.includes("membership_fee")) {
      console.log("Adding membership_fee column...");
      db.prepare(
        "ALTER TABLE members ADD COLUMN membership_fee REAL DEFAULT 3000",
      ).run();
    }

    if (!columnNames.includes("payment_day")) {
      console.log("Adding payment_day column...");
      db.prepare(
        "ALTER TABLE members ADD COLUMN payment_day INTEGER DEFAULT 1",
      ).run();
    }

    if (!columnNames.includes("last_payment_date")) {
      console.log("Adding last_payment_date column...");
      db.prepare("ALTER TABLE members ADD COLUMN last_payment_date DATE").run();
    }

    if (!columnNames.includes("next_payment_due")) {
      console.log("Adding next_payment_due column...");
      db.prepare("ALTER TABLE members ADD COLUMN next_payment_due DATE").run();
    }

    if (!columnNames.includes("payment_status")) {
      console.log("Adding payment_status column...");
      db.prepare(
        "ALTER TABLE members ADD COLUMN payment_status TEXT DEFAULT 'current'",
      ).run();
    }

    // Update existing members with default values
    console.log("Updating existing members...");
    const members = db.prepare("SELECT * FROM members").all();

    members.forEach((member) => {
      if (!member.membership_fee) {
        const startDate = new Date(member.membership_start);
        const paymentDay = startDate.getDate();

        db.prepare(
          `
          UPDATE members
          SET membership_fee = 3000,
              payment_day = ?,
              next_payment_due = ?
          WHERE id = ?
        `,
        ).run(paymentDay, member.membership_start, member.id);
      }
    });

    // Check if payments table needs updates
    const paymentsTableInfo = db.prepare("PRAGMA table_info(payments)").all();
    const paymentsColumns = paymentsTableInfo.map((col) => col.name);

    if (!paymentsColumns.includes("payment_schedule_id")) {
      console.log("Adding payment_schedule_id column to payments...");
      db.prepare(
        "ALTER TABLE payments ADD COLUMN payment_schedule_id INTEGER REFERENCES payment_schedules(id)",
      ).run();
    }

    if (!paymentsColumns.includes("is_late")) {
      console.log("Adding is_late column to payments...");
      db.prepare(
        "ALTER TABLE payments ADD COLUMN is_late BOOLEAN DEFAULT 0",
      ).run();
    }

    if (!paymentsColumns.includes("late_fee")) {
      console.log("Adding late_fee column to payments...");
      db.prepare(
        "ALTER TABLE payments ADD COLUMN late_fee REAL DEFAULT 0",
      ).run();
    }

    if (!paymentsColumns.includes("payment_status")) {
      console.log("Adding payment_status column to payments...");
      db.prepare(
        "ALTER TABLE payments ADD COLUMN payment_status TEXT DEFAULT 'completed'",
      ).run();
    }

    console.log("✅ Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  }
};

migrateDatabase();
