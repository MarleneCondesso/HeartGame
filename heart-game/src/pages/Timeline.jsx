import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import "./Timeline.css";

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT");
}

export default function Timeline() {
  const { content } = useContent();
  const timelineData = content.timeline || [];

  const sorted = [...timelineData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <main className="timeline">
      <header className="timeline__header">
        <div>
          <p className="timeline__kicker">🗓️</p>
          <h1 className="timeline__title">Timeline</h1>
          <p className="timeline__subtitle">Alguns momentos nossos.</p>
        </div>

        <div className="timeline__headerActions">
          <Link className="btn btn--ghost" to="/reasons">
            ← Razões
          </Link>
          <Link className="btn btn--primary" to="/gallery">
            Galeria →
          </Link>
        </div>
      </header>

      <section className="timeline__rail" aria-label="Linha do tempo">
        {sorted.map((item, idx) => (
          <article key={idx} className="timelineCard">
            <div className="timelineCard__dot" aria-hidden="true" />
            <div className="timelineCard__content">
              <div className="timelineCard__top">
                <span className="timelineCard__date">{formatDate(item.date)}</span>
                <span className="timelineCard__emoji" aria-hidden="true">
                  {item.emoji}
                </span>
              </div>

              <h2 className="timelineCard__title">{item.title}</h2>
              <p className="timelineCard__text">{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <footer className="timeline__footer">
        <Link className="btn btn--ghost" to="/">
          ← Início
        </Link>

        <div className="timeline__next">
          <span className="timeline__nextLabel">Próximo:</span>
          <Link className="btn btn--primary" to="/gallery">
            Galeria →
          </Link>
        </div>
      </footer>
    </main>
  );
}
