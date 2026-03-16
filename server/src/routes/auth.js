import express from "express";
import bcrypt from "bcryptjs";
import db from "../models/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { generateInviteCode, isCodeExpired } from "../utils/codes.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { auditLog } from "../middleware/audit.js";

const router = express.Router();

// Admin login
router.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  res.json({
    accessToken,
    refreshToken,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  });
});

// Refresh token
router.post("/admin/refresh", (req, res) => {
  const { refreshToken } = req.body;

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  const admin = db.prepare("SELECT * FROM admins WHERE id = ?").get(decoded.id);
  if (!admin) {
    return res.status(401).json({ error: "Admin not found" });
  }

  const accessToken = generateAccessToken(admin);
  res.json({ accessToken });
});

// Generate invite code
router.post(
  "/admin/invite",
  authenticateAdmin,
  auditLog("admin_invite_created"),
  (req, res) => {
    const code = generateInviteCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = db
      .prepare(
        `
    INSERT INTO admin_invites (code, created_by, expires_at)
    VALUES (?, ?, ?)
  `,
      )
      .run(code, req.admin.id, expiresAt.toISOString());

    res.json({
      id: result.lastInsertRowid,
      code,
      expiresAt,
    });
  },
);

// Get active invites
router.get("/admin/invites", authenticateAdmin, (req, res) => {
  const invites = db
    .prepare(
      `
    SELECT ai.*, a.name as created_by_name
    FROM admin_invites ai
    LEFT JOIN admins a ON ai.created_by = a.id
    WHERE ai.used_at IS NULL
    ORDER BY ai.created_at DESC
  `,
    )
    .all();

  res.json(invites);
});

// Register new admin with invite code
router.post("/admin/register", (req, res) => {
  const { inviteCode, email, password, name } = req.body;

  const invite = db
    .prepare("SELECT * FROM admin_invites WHERE code = ?")
    .get(inviteCode);

  if (!invite) {
    return res.status(400).json({ error: "Invalid invite code" });
  }

  if (invite.used_at) {
    return res.status(400).json({ error: "Invite code already used" });
  }

  if (isCodeExpired(invite.expires_at)) {
    return res.status(400).json({ error: "Invite code expired" });
  }

  const existingAdmin = db
    .prepare("SELECT * FROM admins WHERE email = ?")
    .get(email);
  if (existingAdmin) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const result = db
    .prepare(
      `
    INSERT INTO admins (email, password_hash, name, invited_by)
    VALUES (?, ?, ?, ?)
  `,
    )
    .run(email, hashedPassword, name, invite.created_by);

  db.prepare(
    `
    UPDATE admin_invites
    SET used_at = CURRENT_TIMESTAMP, used_by = ?
    WHERE id = ?
  `,
  ).run(result.lastInsertRowid, invite.id);

  const admin = db
    .prepare("SELECT * FROM admins WHERE id = ?")
    .get(result.lastInsertRowid);
  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  res.json({
    accessToken,
    refreshToken,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  });
});

// Member login with 6-digit code
router.post("/member/login", (req, res) => {
  const { accessCode } = req.body;

  const member = db
    .prepare("SELECT * FROM members WHERE access_code = ?")
    .get(accessCode);

  if (!member) {
    return res.status(401).json({ error: "Invalid access code" });
  }

  res.json({ member });
});

export default router;
