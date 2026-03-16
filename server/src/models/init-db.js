import bcrypt from "bcryptjs";
import db from "./db.js";

// Create first admin if none exists
const initFirstAdmin = () => {
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get();

  if (adminCount.count === 0) {
    const password = "admin123";
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.prepare(
      `
      INSERT INTO admins (email, password_hash, name)
      VALUES (?, ?, ?)
    `,
    ).run("admin@gymsmart.com", hashedPassword, "System Admin");

    console.log("✅ First admin created:");
    console.log("   Email: admin@gymsmart.com");
    console.log("   Password: admin123");
    console.log("   ⚠️  Please change this password after first login!");
  } else {
    console.log("✅ Database already initialized");
  }
};

initFirstAdmin();
