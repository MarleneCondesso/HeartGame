import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const file = path.resolve(process.cwd(), "private-content.json");
const blobPath = "private-content/content.json";
const access = "public";
const addRandomSuffix = true;

async function main() {
  let raw;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    console.error("[ERR] Ficheiro não encontrado:", file);
    console.error("Cria `private-content.json` (este ficheiro é ignorado pelo git).");
    process.exit(1);
  }

  try {
    JSON.parse(raw);
  } catch (err) {
    console.error("[ERR] JSON inválido em:", file);
    console.error(String(err));
    process.exit(1);
  }

  const blob = await put(blobPath, raw, {
    access,
    addRandomSuffix,
    contentType: "application/json",
  });

  console.log("==============================");
  console.log("COPIA ISTO PARA PRIVATE_CONTENT_URL:");
  console.log(blob.url);
  console.log("==============================");
}

main().catch((err) => {
  console.error("[ERR] Erro:", err);
  process.exit(1);
});
