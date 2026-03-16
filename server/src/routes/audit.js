import express from "express";
import db from "../models/db.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get audit logs
router.get("/", authenticateAdmin, (req, res) => {
  const logs = db
    .prepare(
      `
    SELECT al.*, a.name as admin_name, a.email as admin_email
    FROM audit_logs al
    LEFT JOIN admins a ON al.admin_id = a.id
    ORDER BY al.created_at DESC
    LIMIT 200
  `,
    )
    .all();

  res.json(logs);
});

// Get audit logs by entity
router.get("/entity/:type/:id", authenticateAdmin, (req, res) => {
  const logs = db
    .prepare(
      `
    SELECT al.*, a.name as admin_name
    FROM audit_logs al
    LEFT JOIN admins a ON al.admin_id = a.id
    WHERE al.entity_type = ? AND al.entity_id = ?
    ORDER BY al.created_at DESC
  `,
    )
    .all(req.params.type, req.params.id);

  res.json(logs);
});

export default router;
