import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import "./Home.css";

export default function Home() {
  const { mode, content } = useContent();

  return (
    <main className="home">
      <section className="home__card">
        <p className="home__kicker">{mode === "private" ? "🔒 Privado" : "🧪 Demo"}</p>
        <h1 className="home__title">{content.product?.name || "LoveCard"}</h1>
        <p className="home__text">{content.product?.tagline}</p>

        <div className="home__actions">
          <Link className="btn btn--primary" to="/reasons">
            Começar ✨
          </Link>

          <Link className="btn btn--ghost" to="/game">
            Jogar 🎮
          </Link>

          {mode === "demo" && (
            <Link className="btn btn--ghost" to="/login">
              Ver conteúdo privado →
            </Link>
          )}
        </div>

        <nav className="home__nav">
          <Link className="home__link" to="/reasons">Razões</Link>
          <span className="home__dot">•</span>
          <Link className="home__link" to="/timeline">Timeline</Link>
          <span className="home__dot">•</span>
          <Link className="home__link" to="/gallery">Galeria</Link>
          <span className="home__dot">•</span>
          <Link className="home__link" to="/quiz">Quiz</Link>
          <span className="home__dot">•</span>
          <Link className="home__link" to="/final">Final</Link>
        </nav>
      </section>
    </main>
  );
}
