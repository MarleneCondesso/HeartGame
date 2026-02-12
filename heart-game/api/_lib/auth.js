import crypto from "node:crypto";
import { Buffer } from "buffer";

export const COOKIE_NAME = "du_session";

function sign(input, secret) {
  return crypto.createHmac("sha256", secret).update(input).digest("base64url");
}

function timingSafeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function makeSessionToken(secret, maxAgeSeconds) {
  const payload = {
    v: 1,
    exp: Date.now() + maxAgeSeconds * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = sign(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export function verifySessionToken(token, secret) {
  if (!token || !secret) return false;

  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;

  const expected = sign(payloadB64, secret);
  if (!timingSafeEqual(sig, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    return payload.exp && Date.now() < payload.exp;
  } catch {
    return false;
  }
}

export function buildCookie(token, maxAgeSeconds, isProd) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (isProd) parts.push("Secure");
  return parts.join("; ");
}

export function clearCookie(isProd) {
  const parts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (isProd) parts.push("Secure");
  return parts.join("; ");
}
