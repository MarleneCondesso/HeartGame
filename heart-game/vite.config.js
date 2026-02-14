import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function localPrivatePhotos() {
  const mountPath = "/__local_photos__/";
  const baseDir = path.resolve(process.cwd(), "private-photos");

  return {
    name: "local-private-photos",
    configureServer(server) {
      server.middlewares.use(mountPath, (req, res) => {
        const reqUrl = req.url || "";
        const url = new URL(reqUrl, "http://localhost");
        let rel;
        try {
          rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
        } catch {
          res.statusCode = 400;
          res.end("Bad request");
          return;
        }

        // Only allow simple filenames like `1.jpg`, `2.webp`, etc.
        if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(rel)) {
          res.statusCode = 400;
          res.end("Bad request");
          return;
        }

        const filePath = path.resolve(baseDir, rel);
        if (!filePath.startsWith(baseDir + path.sep)) {
          res.statusCode = 400;
          res.end("Bad request");
          return;
        }

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType =
          ext === ".png"
            ? "image/png"
            : ext === ".webp"
              ? "image/webp"
              : "image/jpeg";

        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "no-store");
        fs.createReadStream(filePath).pipe(res);
      });
    },
  };
}

function localPrivateContent() {
  const mountPath = "/__local_private_content__/";
  const filePath = path.resolve(process.cwd(), "private-content.json");

  return {
    name: "local-private-content",
    configureServer(server) {
      server.middlewares.use(mountPath, (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        const reqUrl = req.url || "";
        const url = new URL(reqUrl, "http://localhost");
        if (url.pathname !== "/content.json") {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        fs.createReadStream(filePath).pipe(res);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    localPrivatePhotos(),
    localPrivateContent(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
