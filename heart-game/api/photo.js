import { COOKIE_NAME, verifySessionToken } from "./_lib/auth.js";
import process from "process";
import { Buffer } from "buffer";

export default async function handler(req, res) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!verifySessionToken(token, process.env.AUTH_SECRET)) {
    return res.status(401).send("Unauthorized");
  }

  const id = req.query?.id;
  if (!id || !process.env.PRIVATE_PHOTO_MAP_JSON) {
    return res.status(400).send("Bad request");
  }

  const map = JSON.parse(process.env.PRIVATE_PHOTO_MAP_JSON);
  const blobUrl = map[id];

  if (!blobUrl) return res.status(404).send("Not found");

  const upstream = await fetch(blobUrl);
  if (!upstream.ok) return res.status(502).send("Upstream error");

  const contentType = upstream.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await upstream.arrayBuffer());

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "private, max-age=3600");

  return res.status(200).send(buf);
}
