import { buildCookie, makeSessionToken } from "./_lib/auth.js";
import process from "process";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  const code = (req.body?.code || "").trim();

  if (!process.env.PRIVATE_CODE || !process.env.AUTH_SECRET) {
    return res.status(500).json({ ok: false, error: "Missing env vars" });
  }

  if (code !== process.env.PRIVATE_CODE) {
    return res.status(401).json({ ok: false, error: "Invalid code" });
  }

  const maxAge = 60 * 60 * 24 * 30; // 30 dias
  const token = makeSessionToken(process.env.AUTH_SECRET, maxAge);

  res.setHeader("Set-Cookie", buildCookie(token, maxAge, isProd));
  return res.status(200).json({ ok: true });
}
