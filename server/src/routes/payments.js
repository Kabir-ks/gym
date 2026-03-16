import express from "express";
import db from "../models/db.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { auditLog } from "../middleware/audit.js";
import {
  calculateNextPaymentDue,
  updatePaymentStatuses,
  getPaymentStats,
} from "../utils/paymentSchedule.js";

const router = express.Router();

// Get payment statistics
router.get("/stats", authenticateAdmin, (req, res) => {
  updatePaymentStatuses();
  const stats = getPaymentStats();
  res.json(stats);
});

// Get all payments
router.get("/", authenticateAdmin, (req, res) => {
  const payments = db
    .prepare(
      `
    SELECT p.*, m.name as member_name, a.name as recorded_by_name,
           ps.due_date as schedule_due_date
    FROM payments p
    LEFT JOIN members m ON p.member_id = m.id
    LEFT JOIN admins a ON p.recorded_by = a.id
    LEFT JOIN payment_schedules ps ON p.payment_schedule_id = ps.id
    ORDER BY p.payment_date DESC
  `,
    )
    .all();

  res.json(payments);
});

// Get payments due (today, overdue, upcoming)
router.get("/due", authenticateAdmin, (req, res) => {
  updatePaymentStatuses();
  const today = new Date().toISOString().split("T")[0];

  const { filter } = req.query; // 'today', 'overdue', 'upcoming', 'all'

  let query = `
    SELECT ps.*, m.name as member_name, m.phone, m.email, m.access_code,
           m.membership_fee, m.payment_status
    FROM payment_schedules ps
    LEFT JOIN members m ON ps.member_id = m.id
    WHERE ps.status = 'pending' AND m.status = 'active'
  `;

  if (filter === "today") {
    query += ` AND ps.due_date = '${today}'`;
  } else if (filter === "overdue") {
    query += ` AND ps.due_date < '${today}'`;
  } else if (filter === "upcoming") {
    query += ` AND ps.due_date > '${today}' AND ps.due_date <= date('${today}', '+7 days')`;
  }

  query += ` ORDER BY ps.due_date ASC`;

  const duePayments = db.prepare(query).all();
  res.json(duePayments);
});

// Get member payment schedules
router.get("/schedules/:memberId", authenticateAdmin, (req, res) => {
  const schedules = db
    .prepare(
      `
    SELECT ps.*, p.payment_date, p.amount as paid_amount, p.payment_method, p.is_late
    FROM payment_schedules ps
    LEFT JOIN payments p ON ps.payment_id = p.id
    WHERE ps.member_id = ?
    ORDER BY ps.due_date DESC
  `,
    )
    .all(req.params.memberId);

  res.json(schedules);
});

// Record payment
router.post(
  "/",
  authenticateAdmin,
  auditLog("payment_recorded", "payment"),
  (req, res) => {
    const {
      member_id,
      amount,
      payment_date,
      payment_method,
      notes,
      payment_schedule_id,
    } = req.body;

    // Check if payment is late
    let isLate = false;
    let scheduleId = payment_schedule_id;

    if (scheduleId) {
      const schedule = db
        .prepare("SELECT * FROM payment_schedules WHERE id = ?")
        .get(scheduleId);
      if (schedule && payment_date > schedule.due_date) {
        isLate = true;
      }
    } else {
      // Find the pending schedule for this member
      const schedule = db
        .prepare(
          `
      SELECT * FROM payment_schedules
      WHERE member_id = ? AND status = 'pending'
      ORDER BY due_date ASC
      LIMIT 1
    `,
        )
        .get(member_id);

      if (schedule) {
        scheduleId = schedule.id;
        if (payment_date > schedule.due_date) {
          isLate = true;
        }
      }
    }

    // Insert payment
    const result = db
      .prepare(
        `
    INSERT INTO payments (member_id, payment_schedule_id, amount, payment_date, payment_method, notes, recorded_by, is_late)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
      )
      .run(
        member_id,
        scheduleId,
        amount,
        payment_date,
        payment_method,
        notes,
        req.admin.id,
        isLate ? 1 : 0,
      );

    const paymentId = result.lastInsertRowid;

    // Update payment schedule status
    if (scheduleId) {
      db.prepare(
        `
      UPDATE payment_schedules
      SET status = 'paid', payment_id = ?
      WHERE id = ?
    `,
      ).run(paymentId, scheduleId);
    }

    // Update member's last payment date and next payment due
    const member = db
      .prepare("SELECT * FROM members WHERE id = ?")
      .get(member_id);
    const nextDue = calculateNextPaymentDue(
      payment_date,
      member.membership_type,
    );

    db.prepare(
      `
    UPDATE members
    SET last_payment_date = ?, next_payment_due = ?, payment_status = 'current'
    WHERE id = ?
  `,
    ).run(payment_date, nextDue, member_id);

    // Create next payment schedule if within membership period
    if (new Date(nextDue) <= new Date(member.membership_end)) {
      db.prepare(
        `
      INSERT INTO payment_schedules (member_id, due_date, expected_amount, status)
      VALUES (?, ?, ?, 'pending')
    `,
      ).run(member_id, nextDue, member.membership_fee);
    }

    const payment = db
      .prepare(
        `
    SELECT p.*, m.name as member_name
    FROM payments p
    LEFT JOIN members m ON p.member_id = m.id
    WHERE p.id = ?
  `,
      )
      .get(paymentId);

    res.json(payment);
  },
);

// Update payment
router.put(
  "/:id",
  authenticateAdmin,
  auditLog("payment_updated", "payment"),
  (req, res) => {
    const { amount, payment_date, payment_method, notes } = req.body;

    db.prepare(
      `
    UPDATE payments
    SET amount = ?, payment_date = ?, payment_method = ?, notes = ?
    WHERE id = ?
  `,
    ).run(amount, payment_date, payment_method, notes, req.params.id);

    const payment = db
      .prepare("SELECT * FROM payments WHERE id = ?")
      .get(req.params.id);
    res.json(payment);
  },
);

// Delete payment
router.delete(
  "/:id",
  authenticateAdmin,
  auditLog("payment_deleted", "payment"),
  (req, res) => {
    const payment = db
      .prepare("SELECT * FROM payments WHERE id = ?")
      .get(req.params.id);

    if (payment && payment.payment_schedule_id) {
      // Reset the schedule status
      db.prepare(
        `
      UPDATE payment_schedules
      SET status = 'pending', payment_id = NULL
      WHERE id = ?
    `,
      ).run(payment.payment_schedule_id);
    }

    db.prepare("DELETE FROM payments WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  },
);

export default router;
