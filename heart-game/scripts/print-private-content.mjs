import fs from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";

const file = path.resolve(process.cwd(), "private-content.json");

async function main() {
  let raw;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    console.error("❌ Ficheiro não encontrado:", file);
    console.error("Cria `private-content.json` (este ficheiro é ignorado pelo git).");
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error("❌ JSON inválido em:", file);
    console.error(String(err));
    process.exit(1);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    console.error("❌ O conteúdo deve ser um objeto JSON no topo.");
    process.exit(1);
  }

  const out = JSON.stringify(data);

  console.log("COPIA ISTO PARA PRIVATE_CONTENT_JSON:");
  console.log(out);

  const bytes = Buffer.byteLength(out, "utf8");
  console.error(`INFO: PRIVATE_CONTENT_JSON size = ${bytes} bytes`);
  if (bytes > 3500) {
    console.error(
      "AVISO: isto pode não caber em env vars nas Vercel Functions. Usa `node scripts/upload-private-content.mjs` e define `PRIVATE_CONTENT_URL`."
    );
  }
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
