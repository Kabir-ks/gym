import crypto from "crypto";

export const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateInviteCode = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const isCodeExpired = (expiresAt) => {
  return new Date(expiresAt) < new Date();
};
