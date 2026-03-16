import { verifyAccessToken } from "../utils/tokens.js";

export const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.admin = decoded;
  next();
};

export const authenticateMember = (req, res, next) => {
  const { accessCode } = req.body;

  if (!accessCode || accessCode.length !== 6) {
    return res.status(401).json({ error: "Invalid access code" });
  }

  req.memberCode = accessCode;
  next();
};
