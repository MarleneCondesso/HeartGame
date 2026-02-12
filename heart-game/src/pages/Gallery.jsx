import { Link } from "react-router-dom";
import { useState } from "react";
import { useContent } from "../context/ContentContext";
import "./Gallery.css";

export default function Gallery() {
  const { content } = useContent();
  const photos = content.gallery || [];

  const [active, setActive] = useState(null);

  const open = (idx) => setActive(idx);
  const close = () => setActive(null);

  const hasModal = active !== null;

  const prev = () => {
    setActive((i) => {
      if (i === null) return null;
      return (i - 1 + photos.length) % photos.length;
    });
  };

  const next = () => {
    setActive((i) => {
      if (i === null) return null;
      return (i + 1) % photos.length;
    });
  };

  return (
    <main className="gallery">
      <header className="gallery__header">
        <div>
          <p className="gallery__kicker">📸</p>
          <h1 className="gallery__title">Galeria</h1>
          <p className="gallery__subtitle">Carrega numa foto para abrir em grande.</p>
        </div>

        <div className="gallery__headerActions">
          <Link className="btn btn--ghost" to="/timeline">
            ← Timeline
          </Link>
          <Link className="btn btn--primary" to="/quiz">
            Quiz →
          </Link>
        </div>
      </header>

      <section className="gallery__grid" aria-label="Galeria de fotos">
        {photos.map((p, idx) => (
          <button
            key={`${p.src}-${idx}`}
            className="photoCard"
            type="button"
            onClick={() => open(idx)}
            aria-label={`Abrir ${p.alt || `Foto ${idx + 1}`}`}
          >
            <img className="photoCard__img" src={p.src} alt={p.alt || `Foto ${idx + 1}`} loading="lazy" />
            <div className="photoCard__overlay">
              <span className="photoCard__hint">ver</span>
            </div>
          </button>
        ))}
      </section>

      <footer className="gallery__footer">
        <Link className="btn btn--ghost" to="/">
          ← Início
        </Link>

        <div className="gallery__next">
          <span className="gallery__nextLabel">Próximo:</span>
          <Link className="btn btn--primary" to="/quiz">
            Quiz →
          </Link>
        </div>
      </footer>

      {hasModal && photos[active] && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Foto ampliada">
          <button className="modal__backdrop" type="button" onClick={close} aria-label="Fechar" />

          <div className="modal__content">
            <button className="modal__close" type="button" onClick={close} aria-label="Fechar">
              ✕
            </button>

            <button className="modal__nav modal__nav--left" type="button" onClick={prev} aria-label="Anterior">
              ‹
            </button>

            <img className="modal__img" src={photos[active].src} alt={photos[active].alt || "Foto"} />

            <button className="modal__nav modal__nav--right" type="button" onClick={next} aria-label="Seguinte">
              ›
            </button>

            <div className="modal__caption">
              <span>{photos[active].alt || "Foto"}</span>
              <span className="modal__count">
                {active + 1}/{photos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
