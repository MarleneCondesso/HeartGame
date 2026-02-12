import { COOKIE_NAME, verifySessionToken } from "./_lib/auth.js";
import process from "process";

export default async function handler(req, res) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!verifySessionToken(token, process.env.AUTH_SECRET)) {
    return res.status(401).json({ ok: false });
  }

  if (!process.env.PRIVATE_CONTENT_JSON) {
    return res.status(500).json({ ok: false, error: "Missing PRIVATE_CONTENT_JSON" });
  }

  const content = JSON.parse(process.env.PRIVATE_CONTENT_JSON);

  // Injecta src protegido na galeria:
  // Espera gallery como [{ id: "p1", alt: "..." }, ...]
  if (Array.isArray(content.gallery)) {
    content.gallery = content.gallery.map((p) => ({
      ...p,
      src: `/api/photo?id=${encodeURIComponent(p.id)}`,
    }));
  }

  return res.status(200).json(content);
}
