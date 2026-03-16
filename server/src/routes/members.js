import express from "express";
import db from "../models/db.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { auditLog } from "../middleware/audit.js";
import { generateSixDigitCode } from "../utils/codes.js";
import {
  generatePaymentSchedules,
  createPaymentSchedules,
} from "../utils/paymentSchedule.js";

const router = express.Router();

// Get all members (admin)
router.get("/", authenticateAdmin, (req, res) => {
  const members = db
    .prepare(
      `
    SELECT m.*, a.name as created_by_name
    FROM members m
    LEFT JOIN admins a ON m.created_by = a.id
    ORDER BY m.created_at DESC
  `,
    )
    .all();

  res.json(members);
});

// Get single member (admin)
router.get("/:id", authenticateAdmin, (req, res) => {
  const member = db
    .prepare("SELECT * FROM members WHERE id = ?")
    .get(req.params.id);

  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  res.json(member);
});

// Create member (admin)
router.post(
  "/",
  authenticateAdmin,
  auditLog("member_created", "member"),
  (req, res) => {
    const {
      name,
      email,
      phone,
      membership_type,
      membership_start,
      membership_end,
      membership_fee,
    } = req.body;

    let accessCode;
    let isUnique = false;

    while (!isUnique) {
      accessCode = generateSixDigitCode();
      const existing = db
        .prepare("SELECT id FROM members WHERE access_code = ?")
        .get(accessCode);
      if (!existing) isUnique = true;
    }

    // Calculate payment day from membership start date
    const startDate = new Date(membership_start);
    const paymentDay = startDate.getDate();

    // First payment due is the membership start date
    const nextPaymentDue = membership_start;

    const result = db
      .prepare(
        `
    INSERT INTO members (name, email, phone, access_code, membership_type, membership_start, membership_end, membership_fee, payment_day, next_payment_due, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
      )
      .run(
        name,
        email,
        phone,
        accessCode,
        membership_type,
        membership_start,
        membership_end,
        membership_fee,
        paymentDay,
        nextPaymentDue,
        req.admin.id,
      );

    const memberId = result.lastInsertRowid;

    // Generate payment schedules
    const schedules = generatePaymentSchedules(
      memberId,
      membership_start,
      membership_end,
      membership_fee,
      membership_type,
    );
    createPaymentSchedules(schedules);

    const member = db
      .prepare("SELECT * FROM members WHERE id = ?")
      .get(memberId);
    res.json(member);
  },
);

// Update member (admin)
router.put(
  "/:id",
  authenticateAdmin,
  auditLog("member_updated", "member"),
  (req, res) => {
    const {
      name,
      email,
      phone,
      membership_type,
      membership_start,
      membership_end,
      membership_fee,
      status,
    } = req.body;

    db.prepare(
      `
    UPDATE members
    SET name = ?, email = ?, phone = ?, membership_type = ?, membership_start = ?, membership_end = ?, membership_fee = ?, status = ?
    WHERE id = ?
  `,
    ).run(
      name,
      email,
      phone,
      membership_type,
      membership_start,
      membership_end,
      membership_fee,
      status,
      req.params.id,
    );

    const member = db
      .prepare("SELECT * FROM members WHERE id = ?")
      .get(req.params.id);
    res.json(member);
  },
);

// Delete member (admin)
router.delete(
  "/:id",
  authenticateAdmin,
  auditLog("member_deleted", "member"),
  (req, res) => {
    const memberId = req.params.id;

    // Use a transaction to handle all deletions atomically
    const deleteTransaction = db.transaction(() => {
      // Get all payment IDs for this member
      const paymentIds = db
        .prepare("SELECT id FROM payments WHERE member_id = ?")
        .all(memberId)
        .map((p) => p.id);

      // Clear payment_id references in payment_schedules
      if (paymentIds.length > 0) {
        const placeholders = paymentIds.map(() => "?").join(",");
        db.prepare(
          `UPDATE payment_schedules SET payment_id = NULL WHERE payment_id IN (${placeholders})`,
        ).run(...paymentIds);
      }

      // Delete all related records
      db.prepare(
        "DELETE FROM nutrition_plans WHERE user_type = 'member' AND user_id = ?",
      ).run(memberId);
      db.prepare("DELETE FROM attendance WHERE member_id = ?").run(memberId);
      db.prepare("DELETE FROM payments WHERE member_id = ?").run(memberId);
      db.prepare("DELETE FROM payment_schedules WHERE member_id = ?").run(
        memberId,
      );
      db.prepare("DELETE FROM members WHERE id = ?").run(memberId);
    });

    deleteTransaction();
    res.json({ success: true });
  },
);

// Get member by access code (member portal)
router.post("/portal/access", (req, res) => {
  const { accessCode } = req.body;

  const member = db
    .prepare("SELECT * FROM members WHERE access_code = ?")
    .get(accessCode);

  if (!member) {
    return res.status(404).json({ error: "Invalid access code" });
  }

  res.json(member);
});

// Get member payments
router.get("/:id/payments", authenticateAdmin, (req, res) => {
  const payments = db
    .prepare(
      `
    SELECT p.*, a.name as recorded_by_name
    FROM payments p
    LEFT JOIN admins a ON p.recorded_by = a.id
    WHERE p.member_id = ?
    ORDER BY p.payment_date DESC
  `,
    )
    .all(req.params.id);

  res.json(payments);
});

// Get member payments (member portal)
router.post("/portal/:code/payments", (req, res) => {
  const member = db
    .prepare("SELECT id FROM members WHERE access_code = ?")
    .get(req.params.code);

  if (!member) {
    return res.status(404).json({ error: "Invalid access code" });
  }

  const payments = db
    .prepare(
      `
    SELECT id, amount, payment_date, payment_method, notes, created_at, is_late
    FROM payments
    WHERE member_id = ?
    ORDER BY payment_date DESC
  `,
    )
    .all(member.id);

  res.json(payments);
});

// Get member attendance
router.get("/:id/attendance", authenticateAdmin, (req, res) => {
  const attendance = db
    .prepare(
      `
    SELECT a.*, ad.name as recorded_by_name
    FROM attendance a
    LEFT JOIN admins ad ON a.recorded_by = ad.id
    WHERE a.member_id = ?
    ORDER BY a.check_in DESC
  `,
    )
    .all(req.params.id);

  res.json(attendance);
});

// Get member attendance (member portal)
router.post("/portal/:code/attendance", (req, res) => {
  const member = db
    .prepare("SELECT id FROM members WHERE access_code = ?")
    .get(req.params.code);

  if (!member) {
    return res.status(404).json({ error: "Invalid access code" });
  }

  const attendance = db
    .prepare(
      `
    SELECT id, check_in, check_out, created_at
    FROM attendance
    WHERE member_id = ?
    ORDER BY check_in DESC
  `,
    )
    .all(member.id);

  res.json(attendance);
});

export default router;
