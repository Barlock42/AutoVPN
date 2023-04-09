import crypto from "crypto";

export function generateToken() {
  return crypto.randomBytes(128).toString("hex");
}
