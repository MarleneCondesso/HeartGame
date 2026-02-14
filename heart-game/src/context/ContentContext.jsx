/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { demoContent } from "../content/demoContent";

const ContentContext = createContext(null);

const LS_MODE = "du_mode";
const LOCAL_DEV_PHOTO_PREFIX = "/__local_photos__";
const LOCAL_DEV_PRIVATE_CONTENT_PATH = "/__local_private_content__/content.json";

const DEFAULT_PRIVATE_FINAL = {
  title: "Surpresa 💝",
  message: "Modo privado — conteúdo real desbloqueado.",
};

function getLocalPhotoCount() {
  const raw = import.meta.env.VITE_LOCAL_PHOTO_COUNT;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 26;
}

function buildDevLocalGallery() {
  const count = getLocalPhotoCount();
  return Array.from({ length: count }, (_, i) => ({
    src: `${LOCAL_DEV_PHOTO_PREFIX}/${i + 1}.jpg`,
    alt: `Foto ${i + 1}`,
  }));
}

function buildDevLocalGalleryFromMeta(meta) {
  if (!Array.isArray(meta) || meta.length === 0) return buildDevLocalGallery();

  const out = [];

  for (const item of meta) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;

    const id =
      typeof item.id === "string" ? item.id.trim() : String(item.id ?? "").trim();
    if (!id) continue;

    // Por defeito assume `<id>.jpg` em `private-photos/` (servido por Vite em DEV).
    // Se quiseres outra extensão, define `file` no JSON (ex.: "26.webp").
    const file =
      typeof item.file === "string" && item.file.trim()
        ? item.file.trim()
        : `${id}.jpg`;

    // Mantém a ordem e o alt do `private-content.json`, mas aponta para fotos locais.
    out.push({
      ...item,
      id,
      src: `${LOCAL_DEV_PHOTO_PREFIX}/${file}`,
      alt: item.alt || `Foto ${id}`,
    });
  }

  return out.length ? out : buildDevLocalGallery();
}

async function fetchDevLocalPrivateContent() {
  try {
    const r = await fetch(LOCAL_DEV_PRIVATE_CONTENT_PATH, { cache: "no-store" });
    if (!r.ok) return null;
    const data = await r.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    return data;
  } catch {
    return null;
  }
}

async function buildDevLocalPrivateContent() {
  const fromFile = await fetchDevLocalPrivateContent();
  const base = fromFile && typeof fromFile === "object" && !Array.isArray(fromFile) ? fromFile : {};

  return {
    ...base,
    gallery: buildDevLocalGalleryFromMeta(base.gallery),
    final: { ...DEFAULT_PRIVATE_FINAL, ...(base.final || {}), message: base.final?.message || "Modo privado (DEV) — conteúdo real carregado localmente." },
  };
}

export function ContentProvider({ children }) {
  const isNative = Capacitor.isNativePlatform();

  const initialMode = localStorage.getItem(LS_MODE) || "demo";

  const [mode, setMode] = useState(initialMode);
  const [privateContent, setPrivateContent] = useState(null);

  const content =
    mode === "private" && privateContent
      ? {
          ...demoContent,
          ...privateContent,
          product: { ...demoContent.product, ...(privateContent.product || {}) },
          final: { ...DEFAULT_PRIVATE_FINAL, ...(privateContent.final || {}) },
        }
      : demoContent;

  const setModePersist = useCallback((m) => {
    setMode(m);
    localStorage.setItem(LS_MODE, m);
  }, []);

  const clearPrivate = useCallback(() => {
    setPrivateContent(null);
  }, []);

  const login = async (creds) => {
    const username = (creds?.username || "").trim();
    const password = typeof creds?.password === "string" ? creds.password : "";
    if (!username || !password) return { ok: false, error: "Credenciais inválidas." };

    const unlockLocalPrivate = async () => {
      const local = await buildDevLocalPrivateContent();
      setPrivateContent(local);
      setModePersist("private");
      return { ok: true };
    };

    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!r.ok) {
        // Em `npm run dev` não existe backend `/api/*` (Vercel/Netlify functions),
        // então dá 404. Nesses casos, desbloqueamos as fotos locais para dev.
        if (r.status === 500) {
          return {
            ok: false,
            error: "Backend mal configurado (env vars em falta).",
          };
        }
        if (r.status === 404) {
          if (import.meta.env.DEV) return await unlockLocalPrivate();
          if (isNative) {
            return {
              ok: false,
              error:
                "Backend não configurado no Android. Define CAPACITOR_SERVER_URL e sincroniza o Capacitor.",
            };
          }
        }
        return { ok: false, error: "Credenciais inválidas." };
      }

      const contentRes = await fetch("/api/private", { cache: "no-store" });
      if (!contentRes.ok) {
        if (contentRes.status === 500) {
          return {
            ok: false,
            error: "Backend mal configurado (conteúdo privado em falta).",
          };
        }
        if (contentRes.status === 404) {
          if (import.meta.env.DEV) return await unlockLocalPrivate();
          if (isNative) {
            return {
              ok: false,
              error:
                "Backend não configurado no Android. Define CAPACITOR_SERVER_URL e sincroniza o Capacitor.",
            };
          }
        }
        return { ok: false, error: "Falha a carregar conteúdo privado." };
      }

      const data = await contentRes.json();
      setPrivateContent(data);
      setModePersist("private");
      return { ok: true };
    } catch {
      // Fallback para dev (sem backend /api). Útil para pré-visualizar as fotos locais.
      if (import.meta.env.DEV) {
        return await unlockLocalPrivate();
      }

      if (isNative) {
        return {
          ok: false,
          error:
            "Sem ligação ao servidor no Android. Confirma CAPACITOR_SERVER_URL e a ligação à internet.",
        };
      }
      return { ok: false, error: "Sem ligação ao servidor." };
    }
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    clearPrivate();
    setModePersist("demo");
    localStorage.removeItem("sofia_game_won");
    localStorage.removeItem("sofia_connections_won");
    localStorage.removeItem("sofia_strands_won");
  };

  useEffect(() => {
    if (mode !== "private") return;
    if (privateContent) return;

    if (import.meta.env.DEV) {
      let cancelled = false;

      (async () => {
        const local = await buildDevLocalPrivateContent();
        if (cancelled) return;
        setPrivateContent(local);
      })();

      return () => {
        cancelled = true;
      };
    }
    let cancelled = false;

    (async () => {
      try {
        const r = await fetch("/api/private", { cache: "no-store" });
        if (!r.ok) throw new Error("unauthorized");
        const data = await r.json();
        if (cancelled) return;
        setPrivateContent(data);
      } catch {
        if (cancelled) return;
        clearPrivate();
        setModePersist("demo");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, privateContent, isNative, clearPrivate, setModePersist]);

  return (
    <ContentContext.Provider value={{ mode, content, login, logout }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
