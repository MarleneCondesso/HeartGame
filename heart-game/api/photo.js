import { COOKIE_NAME, verifySessionToken } from "./_lib/auth.js";
import process from "process";
import { Buffer } from "buffer";

let cachedMap = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function loadPhotoMap() {
  const now = Date.now();
  if (cachedMap && now - cachedAt < CACHE_TTL_MS) return cachedMap;

  const url =
    typeof process.env.PRIVATE_PHOTO_MAP_URL === "string" ? process.env.PRIVATE_PHOTO_MAP_URL.trim() : "";

  let map;
  if (url) {
    const upstream = await fetch(url, { cache: "no-store" });
    if (!upstream.ok) throw new Error("UPSTREAM_PHOTO_MAP_FAILED");
    map = await upstream.json();
  } else if (process.env.PRIVATE_PHOTO_MAP_JSON) {
    map = JSON.parse(process.env.PRIVATE_PHOTO_MAP_JSON);
  } else {
    throw new Error("MISSING_PHOTO_MAP");
  }

  if (!map || typeof map !== "object" || Array.isArray(map)) {
    throw new Error("INVALID_PHOTO_MAP");
  }

  cachedMap = map;
  cachedAt = now;
  return map;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  const token = req.cookies?.[COOKIE_NAME];

  if (!verifySessionToken(token, process.env.AUTH_SECRET)) {
    return res.status(401).send("Unauthorized");
  }

  const id = typeof req.query?.id === "string" ? req.query.id : "";
  if (!id) return res.status(400).send("Bad request");

  let map;
  try {
    map = await loadPhotoMap();
  } catch (err) {
    const msg = String(err?.message || "");
    if (msg === "MISSING_PHOTO_MAP") {
      return res.status(500).send("Missing PRIVATE_PHOTO_MAP_URL or PRIVATE_PHOTO_MAP_JSON");
    }
    if (msg === "UPSTREAM_PHOTO_MAP_FAILED") {
      return res.status(502).send("Upstream error");
    }
    if (msg === "INVALID_PHOTO_MAP") {
      return res.status(500).send("Invalid configuration");
    }
    return res.status(500).send("Invalid configuration");
  }
  const blobUrl = map[id];

  if (!blobUrl) return res.status(404).send("Not found");

  const upstream = await fetch(blobUrl);
  if (!upstream.ok) return res.status(502).send("Upstream error");

  const contentType = upstream.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await upstream.arrayBuffer());

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "private, no-store");

  return res.status(200).send(buf);
}
