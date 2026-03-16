import db from "../models/db.js";

export const auditLog = (
  action,
  entityType = null,
  entityId = null,
  details = null,
) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.admin) {
        try {
          db.prepare(
            `
            INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          ).run(
            req.admin.id,
            action,
            entityType,
            entityId || data?.id || null,
            details ? JSON.stringify(details) : JSON.stringify(data),
            req.ip,
          );
        } catch (error) {
          console.error("Audit log error:", error);
        }
      }
      return originalJson(data);
    };

    next();
  };
};
