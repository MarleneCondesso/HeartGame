import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const folder = "./private-photos"; // onde metes as fotos reais
const blobFolder = "private-photos"; // “pasta” no blob (prefixo)
const access = "public"; // blob é public, mas tu vais servir via /api/photo (proxy)
const addRandomSuffix = true; // URLs difíceis de adivinhar
const uploadMapJson = true; // recomendado: evita limite de env vars

function contentTypeFromExt(ext) {
  const e = ext.toLowerCase();
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".png") return "image/png";
  if (e === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function main() {
  const files = (await fs.readdir(folder))
    .filter((f) => !f.startsWith("."))
    .sort();

  if (!files.length) {
    console.log("[ERR] Pasta vazia:", folder);
    process.exit(1);
  }

  const map = {};
  const gallery = [];

  for (const file of files) {
    const full = path.join(folder, file);
    const data = await fs.readFile(full);

    const parsed = path.parse(file);
    const id = parsed.name; // 26, 25, etc.
    const contentType = contentTypeFromExt(parsed.ext);

    const blob = await put(`${blobFolder}/${file}`, data, {
      access,
      addRandomSuffix,
      contentType,
    });

    map[id] = blob.url;
    gallery.push({ id, alt: id });

    console.log(`[OK] ${file} -> ${blob.url}`);
  }

  console.log("\n==============================");
  console.log("COPIA ISTO PARA PRIVATE_PHOTO_MAP_JSON (se couber):");
  console.log(JSON.stringify(map));

  if (uploadMapJson) {
    try {
      const blob = await put(`${blobFolder}/map.json`, JSON.stringify(map), {
        access,
        addRandomSuffix,
        contentType: "application/json",
      });

      console.log("\n------------------------------");
      console.log("RECOMENDADO (evita limite de env vars):");
      console.log("COPIA ISTO PARA PRIVATE_PHOTO_MAP_URL:");
      console.log(blob.url);
    } catch (err) {
      console.log("\n------------------------------");
      console.log("[ERR] Falhou upload do map.json:", String(err?.message || err));
    }
  }

  console.log("\n------------------------------");
  console.log("EXEMPLO gallery para o teu private-content.json:");
  console.log(JSON.stringify(gallery));
  console.log("==============================\n");
}

main().catch((err) => {
  console.error("[ERR] Erro:", err);
  process.exit(1);
});
