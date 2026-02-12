import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContent();

  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const result = await login(code.trim());
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
          No modo privado aparece o conteúdo real (incluindo fotos).
        </p>

        <form className="login__form" onSubmit={onSubmit}>
          <label className="login__label">
            Código
            <input
              className="login__input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex: SOFIA-2026"
              autoComplete="off"
            />
          </label>

          {err && <p className="login__error">{err}</p>}

          <button className="btn btn--primary" disabled={loading || !code.trim()} type="submit">
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
