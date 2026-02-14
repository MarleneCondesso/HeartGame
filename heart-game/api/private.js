import { COOKIE_NAME, verifySessionToken } from "./_lib/auth.js";
import process from "process";

let cachedContent = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function loadPrivateContent() {
  const now = Date.now();
  if (cachedContent && now - cachedAt < CACHE_TTL_MS) return cachedContent;

  const url =
    typeof process.env.PRIVATE_CONTENT_URL === "string" ? process.env.PRIVATE_CONTENT_URL.trim() : "";

  let content;
  if (url) {
    const upstream = await fetch(url, { cache: "no-store" });
    if (!upstream.ok) throw new Error("UPSTREAM_PRIVATE_CONTENT_FAILED");
    content = await upstream.json();
  } else if (process.env.PRIVATE_CONTENT_JSON) {
    content = JSON.parse(process.env.PRIVATE_CONTENT_JSON);
  } else {
    throw new Error("MISSING_PRIVATE_CONTENT");
  }

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    throw new Error("INVALID_PRIVATE_CONTENT");
  }

  cachedContent = content;
  cachedAt = now;
  return content;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false });

  const token = req.cookies?.[COOKIE_NAME];

  if (!verifySessionToken(token, process.env.AUTH_SECRET)) {
    return res.status(401).json({ ok: false });
  }

  let content;
  try {
    content = await loadPrivateContent();
  } catch (err) {
    const msg = String(err?.message || "");
    if (msg === "MISSING_PRIVATE_CONTENT") {
      return res
        .status(500)
        .json({ ok: false, error: "Missing PRIVATE_CONTENT_URL or PRIVATE_CONTENT_JSON" });
    }
    if (msg === "UPSTREAM_PRIVATE_CONTENT_FAILED") {
      return res.status(502).json({ ok: false, error: "Upstream error (PRIVATE_CONTENT_URL)" });
    }
    if (msg === "INVALID_PRIVATE_CONTENT") {
      return res.status(500).json({ ok: false, error: "Invalid private content" });
    }
    return res.status(500).json({ ok: false, error: "Failed to load private content" });
  }

  // Injecta src protegido na galeria:
  // Espera gallery como [{ id: "p1", alt: "..." }, ...]
  if (Array.isArray(content.gallery)) {
    content.gallery = content.gallery.map((p) => ({
      ...p,
      src: `/api/photo?id=${encodeURIComponent(p.id)}`,
    }));
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(content);
}
