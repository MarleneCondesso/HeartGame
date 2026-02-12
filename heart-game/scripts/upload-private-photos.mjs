import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const folder = "./private-photos";      // onde metes as fotos reais
const blobFolder = "private-photos";    // “pasta” no blob (prefixo)
const access = "public";                // blob é public, mas tu vais servir via /api/photo (proxy)
const addRandomSuffix = true;           // URLs difíceis de adivinhar

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
    console.log("❌ Pasta vazia:", folder);
    process.exit(1);
  }

  const map = {};
  const gallery = [];

  for (const file of files) {
    const full = path.join(folder, file);
    const data = await fs.readFile(full);

    const parsed = path.parse(file);
    const id = parsed.name; // p1, p2, etc.
    const contentType = contentTypeFromExt(parsed.ext);

    const blob = await put(`${blobFolder}/${file}`, data, {
      access,
      addRandomSuffix,
      contentType,
    });

    map[id] = blob.url;
    gallery.push({ id, alt: id });

    console.log(`✅ ${file} -> ${blob.url}`);
  }

  console.log("\n==============================");
  console.log("COPIA ISTO PARA PRIVATE_PHOTO_MAP_JSON:");
  console.log(JSON.stringify(map));

  console.log("\n------------------------------");
  console.log("EXEMPLO gallery para PRIVATE_CONTENT_JSON:");
  console.log(JSON.stringify(gallery));
  console.log("==============================\n");
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
