import express from "express";
import db from "../models/db.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { auditLog } from "../middleware/audit.js";

const router = express.Router();

// Get all attendance records
router.get("/", authenticateAdmin, (req, res) => {
  const attendance = db
    .prepare(
      `
    SELECT a.*, m.name as member_name, ad.name as recorded_by_name
    FROM attendance a
    LEFT JOIN members m ON a.member_id = m.id
    LEFT JOIN admins ad ON a.recorded_by = ad.id
    ORDER BY a.check_in DESC
    LIMIT 100
  `,
    )
    .all();

  res.json(attendance);
});

// Check in member
router.post(
  "/checkin",
  authenticateAdmin,
  auditLog("member_checkin", "attendance"),
  (req, res) => {
    const { member_id } = req.body;

    const result = db
      .prepare(
        `
    INSERT INTO attendance (member_id, check_in, recorded_by)
    VALUES (?, CURRENT_TIMESTAMP, ?)
  `,
      )
      .run(member_id, req.admin.id);

    const attendance = db
      .prepare(
        `
    SELECT a.*, m.name as member_name
    FROM attendance a
    LEFT JOIN members m ON a.member_id = m.id
    WHERE a.id = ?
  `,
      )
      .get(result.lastInsertRowid);

    res.json(attendance);
  },
);

// Check out member
router.post(
  "/checkout/:id",
  authenticateAdmin,
  auditLog("member_checkout", "attendance"),
  (req, res) => {
    db.prepare(
      `
    UPDATE attendance
    SET check_out = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    ).run(req.params.id);

    const attendance = db
      .prepare("SELECT * FROM attendance WHERE id = ?")
      .get(req.params.id);
    res.json(attendance);
  },
);

// Get today's attendance
router.get("/today", authenticateAdmin, (req, res) => {
  const attendance = db
    .prepare(
      `
    SELECT a.*, m.name as member_name
    FROM attendance a
    LEFT JOIN members m ON a.member_id = m.id
    WHERE DATE(a.check_in) = DATE('now')
    ORDER BY a.check_in DESC
  `,
    )
    .all();

  res.json(attendance);
});

export default router;
