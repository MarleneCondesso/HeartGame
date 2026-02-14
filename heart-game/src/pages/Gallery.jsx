import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useContent } from "../context/ContentContext";
import "./Gallery.css";

export default function Gallery() {
  const { mode, content } = useContent();
  const isNative = Capacitor.isNativePlatform();
  const photos = content.gallery || [];

  const [active, setActive] = useState(null);
  const swipeRef = useRef({ x: null, y: null, t: 0 });

  const open = useCallback((idx) => setActive(idx), []);
  const close = useCallback(() => setActive(null), []);

  const hasModal = active !== null;

  const prev = useCallback(() => {
    setActive((i) => {
      if (i === null) return null;
      if (!photos.length) return null;
      return (i - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  const next = useCallback(() => {
    setActive((i) => {
      if (i === null) return null;
      if (!photos.length) return null;
      return (i + 1) % photos.length;
    });
  }, [photos.length]);

  useEffect(() => {
    if (!hasModal) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hasModal, close, prev, next]);

  const onTouchStart = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    swipeRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };

  const onTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;

    const start = swipeRef.current;
    if (start.x === null || start.y === null) return;

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dt = Date.now() - start.t;

    // Swipe horizontal rápido (mobile) para navegar.
    if (dt < 500 && Math.abs(dx) > 60 && Math.abs(dy) < 50) {
      if (dx < 0) next();
      else prev();
    }

    swipeRef.current = { x: null, y: null, t: 0 };
  };

  return (
    <main className="gallery">
      <header className="gallery__header">
        <div>
          <p className="gallery__kicker">📸</p>
          <h1 className="gallery__title">Galeria</h1>
          <p className="gallery__subtitle">Carrega numa foto para abrir em grande.</p>
          {mode === "demo" && (
            <p className="gallery__note">
              Fotos de demonstração — faz login para ver as fotos reais.
            </p>
          )}
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
            <img
              className="photoCard__img"
              src={p.src}
              alt={p.alt || `Foto ${idx + 1}`}
              loading="lazy"
              decoding="async"
              draggable="false"
            />
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

          <div className="modal__content" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <button className="modal__close" type="button" onClick={close} aria-label="Fechar">
              ✕
            </button>

            <button className="modal__nav modal__nav--left" type="button" onClick={prev} aria-label="Anterior">
              ‹
            </button>

            <img
              className="modal__img"
              src={photos[active].src}
              alt={photos[active].alt || "Foto"}
              decoding="async"
              draggable="false"
            />

            {mode === "private" && isNative && (
              <div className="modal__watermark" aria-hidden="true">
                LoveCard • Privado
              </div>
            )}

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
