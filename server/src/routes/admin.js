import express from "express";
import db from "../models/db.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { auditLog } from "../middleware/audit.js";
import {
  updatePaymentStatuses,
  getPaymentStats,
} from "../utils/paymentSchedule.js";

const router = express.Router();

// Get all admins
router.get("/", authenticateAdmin, (req, res) => {
  const admins = db
    .prepare(
      `
    SELECT a.id, a.email, a.name, a.created_at, a.invited_by,
           inv.name as invited_by_name
    FROM admins a
    LEFT JOIN admins inv ON a.invited_by = inv.id
    ORDER BY a.created_at DESC
  `,
    )
    .all();

  res.json(admins);
});

// Delete admin (with protection)
router.delete(
  "/:id",
  authenticateAdmin,
  auditLog("admin_deleted", "admin"),
  (req, res) => {
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get();
    const memberCount = db
      .prepare("SELECT COUNT(*) as count FROM members")
      .get();

    if (adminCount.count === 1 && memberCount.count > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete the last admin when members exist" });
    }

    if (parseInt(req.params.id) === req.admin.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    db.prepare("DELETE FROM admins WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  },
);

// Get dashboard stats
router.get("/dashboard/stats", authenticateAdmin, (req, res) => {
  updatePaymentStatuses();

  const totalMembers = db
    .prepare("SELECT COUNT(*) as count FROM members")
    .get().count;
  const activeMembers = db
    .prepare("SELECT COUNT(*) as count FROM members WHERE status = 'active'")
    .get().count;
  const todayAttendance = db
    .prepare(
      "SELECT COUNT(*) as count FROM attendance WHERE DATE(check_in) = DATE('now')",
    )
    .get().count;
  const monthlyRevenue =
    db
      .prepare(
        "SELECT SUM(amount) as total FROM payments WHERE strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')",
      )
      .get().total || 0;

  const paymentStats = getPaymentStats();

  res.json({
    totalMembers,
    activeMembers,
    todayAttendance,
    monthlyRevenue,
    paymentStats,
  });
});

export default router;
