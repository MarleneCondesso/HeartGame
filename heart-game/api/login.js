import { buildCookie, makeSessionToken } from "./_lib/auth.js";
import process from "process";
import crypto from "node:crypto";
import { Buffer } from "buffer";

function safeEqual(a, b) {
  const aa = typeof a === "string" ? a : "";
  const bb = typeof b === "string" ? b : "";
  const ba = Buffer.from(aa);
  const bbuff = Buffer.from(bb);
  if (ba.length !== bbuff.length) return false;
  return crypto.timingSafeEqual(ba, bbuff);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  const body = req.body || {};

  if (!process.env.AUTH_SECRET) {
    return res.status(500).json({ ok: false, error: "Missing env vars" });
  }

  let isValid = false;

  // Prefer user/pass auth (server-only env vars). Fallback to PRIVATE_CODE for older setups.
  if (process.env.PRIVATE_USERNAME && process.env.PRIVATE_PASSWORD) {
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (username && password) {
      isValid =
        safeEqual(username, process.env.PRIVATE_USERNAME) &&
        safeEqual(password, process.env.PRIVATE_PASSWORD);
    }
  } else if (process.env.PRIVATE_CODE) {
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (code) isValid = safeEqual(code, process.env.PRIVATE_CODE);
  } else {
    return res.status(500).json({ ok: false, error: "Missing env vars" });
  }

  if (!isValid) {
    // Pequeno atraso para dificultar brute-force (sem storage/ratelimit persistente).
    await new Promise((r) => setTimeout(r, 350));
    return res.status(401).json({ ok: false });
  }

  const maxAge = 60 * 60 * 24 * 30; // 30 dias
  const token = makeSessionToken(process.env.AUTH_SECRET, maxAge);

  res.setHeader("Set-Cookie", buildCookie(token, maxAge, isProd));
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ok: true });
}
