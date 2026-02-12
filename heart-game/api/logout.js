import { clearCookie } from "./_lib/auth.js";
import process from "process";

export default async function handler(req, res) {
  const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", clearCookie(isProd));
  return res.status(200).json({ ok: true });
}
