import { Navigate, Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import "./Final.css";

export default function Final() {
  const { mode, content } = useContent();
  const heartsWon = localStorage.getItem("sofia_game_won") === "1";
  const connectionsWon = localStorage.getItem("sofia_connections_won") === "1";
  const strandsWon = localStorage.getItem("sofia_strands_won") === "1";

  if (!heartsWon) return <Navigate to="/game" replace />;
  if (!connectionsWon) return <Navigate to="/connections" replace />;
  if (!strandsWon) return <Navigate to="/strands" replace />;

  return (
    <main className="final">
      <section className="final__card">
        <h1 className="final__title">{content.final?.title || "Surpresa 💛"}</h1>
        <p className="final__text">{content.final?.message}</p>

        {mode === "demo" && (
          <p className="final__note">
            Estás em DEMO — faz login para veres o conteúdo real.
          </p>
        )}

        <div className="final__actions">
          <Link className="btn btn--ghost" to="/">
            ← Início
          </Link>
          <Link className="btn btn--primary" to="/gallery">
            Ver fotos →
          </Link>
        </div>
      </section>
    </main>
  );
}
