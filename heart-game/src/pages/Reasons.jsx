import { useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import "./Reasons.css";

export default function Reasons() {
  const { mode, content } = useContent();
  const reasonsData = content.reasons || [];

  const [revealed, setRevealed] = useState(() => new Set());
  const [randomPick, setRandomPick] = useState(null);

  const total = reasonsData.length;
  const revealedCount = revealed.size;

  const toggleReveal = (idx) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const revealNext = () => {
    if (!total) return;

    let pick = null;
    for (let i = 0; i < total; i++) {
      if (!revealed.has(i)) {
        pick = i;
        break;
      }
    }

    if (pick === null) return;

    setRandomPick(pick);
    setRevealed((prev) => new Set(prev).add(pick));
  };

  const revealAll = () => {
    setRevealed(new Set(reasonsData.map((_, i) => i)));
    setRandomPick(null);
  };

  const reset = () => {
    setRevealed(new Set());
    setRandomPick(null);
  };

  return (
    <main className="reasons">
      <header className="reasons__header">
        <div>
          <p className="reasons__kicker">💌</p>
          <h1 className="reasons__title">Razões</h1>
          <p className="reasons__subtitle">
            {revealedCount}/{total} reveladas
          </p>
          {mode === "demo" && (
            <p className="reasons__note">
              Razões de demonstração — faz login para ver as reais.
            </p>
          )}
        </div>

        <div className="reasons__headerActions">
          <button
            className="btn btn--primary"
            onClick={revealNext}
            type="button"
            disabled={total > 0 && revealedCount >= total}
          >
            Revelar uma ✨
          </button>
          <button className="btn btn--ghost" onClick={revealAll} type="button">
            Revelar tudo
          </button>
          <button className="btn btn--ghost" onClick={reset} type="button">
            Recomeçar
          </button>
        </div>
      </header>

      <section className="reasons__grid" aria-label="Razões">
        {reasonsData.map((text, idx) => {
          const isOn = revealed.has(idx);
          const isHighlight = randomPick === idx;

          return (
            <button
              key={idx}
              className={[
                "reasonCard",
                isOn ? "reasonCard--on" : "reasonCard--off",
                isHighlight ? "reasonCard--highlight" : "",
              ].join(" ")}
              onClick={() => toggleReveal(idx)}
              type="button"
              aria-label={`Razão ${idx + 1}`}
            >
              <div className="reasonCard__top">
                <span className="reasonCard__index">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="reasonCard__hint">
                  {isOn ? "toque para esconder" : "toque para revelar"}
                </span>
              </div>

              <div className="reasonCard__body">
                {isOn ? (
                  <p className="reasonCard__text">{text}</p>
                ) : (
                  <p className="reasonCard__mask">••••••••••••••</p>
                )}
              </div>
            </button>
          );
        })}
      </section>

      <footer className="reasons__footer">
        <Link className="btn btn--ghost" to="/">
          ← Início
        </Link>

        <div className="reasons__next">
          <span className="reasons__nextLabel">Próximo:</span>
          <Link className="btn btn--primary" to="/timeline">
            Timeline →
          </Link>
        </div>
      </footer>
    </main>
  );
}
