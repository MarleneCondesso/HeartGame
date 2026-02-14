import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContent();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const result = await login({ username: username.trim(), password });
    setLoading(false);

    if (!result.ok) {
      setErr(result.error || "Falhou.");
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <main className="login">
      <section className="login__card">
        <h1 className="login__title">Entrar</h1>
        <p className="login__subtitle">
          O modo privado carrega conteúdo real (incluindo fotos) a partir do servidor.
        </p>

        <form className="login__form" onSubmit={onSubmit}>
          <label className="login__label">
            Username
            <input
              className="login__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: marlene"
              autoComplete="username"
            />
          </label>

          <label className="login__label">
            Palavra‑passe
            <input
              className="login__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
            />
          </label>

          {err && <p className="login__error">{err}</p>}

          <button
            className="btn btn--primary"
            disabled={loading || !username.trim() || !password}
            type="submit"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>

        <Link className="btn btn--ghost" to="/">
          ← Voltar
        </Link>
      </section>
    </main>
  );
}
