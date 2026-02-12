import { createContext, useContext, useState } from "react";
import { demoContent } from "../content/demoContent";

const ContentContext = createContext(null);

const LS_MODE = "du_mode";
const LS_PRIVATE = "du_private_content";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function ContentProvider({ children }) {
  const initialMode = localStorage.getItem(LS_MODE) || "demo";
  const initialPrivate = safeParse(localStorage.getItem(LS_PRIVATE) || "null");

  const [mode, setMode] = useState(initialMode);
  const [privateContent, setPrivateContent] = useState(initialPrivate);

  const content = mode === "private" && privateContent ? privateContent : demoContent;

  const setModePersist = (m) => {
    setMode(m);
    localStorage.setItem(LS_MODE, m);
  };

  const persistPrivate = (data) => {
    setPrivateContent(data);
    localStorage.setItem(LS_PRIVATE, JSON.stringify(data));
  };

  const clearPrivate = () => {
    setPrivateContent(null);
    localStorage.removeItem(LS_PRIVATE);
  };

  const login = async (code) => {
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!r.ok) return { ok: false, error: "Código inválido." };

    const contentRes = await fetch("/api/private");
    if (!contentRes.ok) return { ok: false, error: "Falha a carregar conteúdo privado." };

    const data = await contentRes.json();
    persistPrivate(data);
    setModePersist("private");
    return { ok: true };
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    clearPrivate();
    setModePersist("demo");
    localStorage.removeItem("sofia_game_won");
  };

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
