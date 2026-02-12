import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Game.css";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function Game() {
  const navigate = useNavigate();

  const GOAL = 15;          // pontos para ganhar
  const GAME_SECONDS = 25;  // duração do jogo
  const SPAWN_MS = 550;     // frequência de corações

  const [hearts, setHearts] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(GAME_SECONDS);

  // ✅ status DERIVADO (sem setStatus em effects)
  const status =
    score >= GOAL ? "won" : secondsLeft <= 0 ? "lost" : "playing";

  const nextId = useRef(1);
  const containerRef = useRef(null);

  // ✅ Side-effect “externo” ok: localStorage
  useEffect(() => {
    if (status === "won") {
      localStorage.setItem("sofia_game_won", "1");
    } else if (status === "lost") {
      localStorage.removeItem("sofia_game_won");
    }
  }, [status]);

  const removeHeart = (id) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  };

  const onCatch = (id) => {
    // remove sempre (mesmo se já acabou)
    removeHeart(id);
    if (status !== "playing") return;
    setScore((s) => s + 1);
  };

  const onMiss = (id) => {
    removeHeart(id);
    if (status !== "playing") return;
    setMissed((m) => m + 1);
  };

  // Spawn de corações (só enquanto está a jogar)
  useEffect(() => {
    if (status !== "playing") return;

    const spawn = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = Math.random() * rect.width;

      const size = clamp(28 + Math.random() * 26, 28, 54);
      const duration = clamp(2.7 + Math.random() * 1.7, 2.6, 4.8);

      const heart = { id: nextId.current++, x, size, duration };
      setHearts((prev) => [...prev, heart]);
    };

    const t = setInterval(spawn, SPAWN_MS);
    return () => clearInterval(t);
  }, [status]);

  // Timer (só enquanto está a jogar)
  useEffect(() => {
    if (status !== "playing") return;

    const t = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    return () => clearInterval(t);
  }, [status]);

  const reset = () => {
    setHearts([]);
    setScore(0);
    setMissed(0);
    setSecondsLeft(GAME_SECONDS);
    localStorage.removeItem("sofia_game_won");
  };

  return (
    <div className="gamePage">
      <div className="gameHeader">
        <div className="badge">⏳ {secondsLeft}s</div>

        <div className="title">
          <h1>Apanha os Corações</h1>
          <p>
            Chega a <b>{GOAL}</b> para desbloquear a surpresa 💝
          </p>
        </div>

        <div className="stats">
          <div className="badge">❤️ {score}</div>
          <div className="badge">💔 {missed}</div>
        </div>
      </div>

      <div className="gameArea" ref={containerRef}>
        {hearts.map((h) => (
          <button
            key={h.id}
            className="heart"
            style={{
              left: `${h.x}px`,
              width: `${h.size}px`,
              height: `${h.size}px`,
              animationDuration: `${h.duration}s`,
            }}
            onClick={() => onCatch(h.id)}
            onAnimationEnd={() => onMiss(h.id)}
            aria-label="Coração"
            type="button"
          >
            ❤️
          </button>
        ))}

        {status !== "playing" && (
          <div className="overlay">
            {status === "won" ? (
              <div className="panel">
                <h2>Ganhaste! 💘</h2>
                <p>Ok… agora podes abrir a surpresa final.</p>
                <div className="row">
                  <button className="btn" onClick={() => navigate("/final")}>
                    Abrir surpresa
                  </button>
                  <button className="btn ghost" onClick={reset}>
                    Jogar outra vez
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel">
                <h2>Quase! 😄</h2>
                <p>Tenta outra vez para desbloquear a surpresa.</p>
                <div className="row">
                  <button className="btn" onClick={reset}>
                    Tentar outra vez
                  </button>
                  <button className="btn ghost" onClick={() => navigate("/")}>
                    Voltar ao início
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="gameFooter">
        <button className="linkBtn" onClick={() => navigate("/")}>
          ← voltar ao início
        </button>
      </div>
    </div>
  );
}
