import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Game.css";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function Game() {
  const navigate = useNavigate();

  const isE2E =
    typeof window !== "undefined" &&
    typeof window.location?.search === "string" &&
    new URLSearchParams(window.location.search).has("e2e");

  const GOAL = isE2E ? 3 : 15; // pontos para ganhar
  const GAME_SECONDS = isE2E ? 12 : 25; // duração do jogo
  const SPAWN_MS = isE2E ? 999999 : 550; // frequência de corações

  const [hearts, setHearts] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(GAME_SECONDS);

  // status DERIVADO (sem setStatus em effects)
  const status =
    score >= GOAL ? "won" : secondsLeft <= 0 ? "lost" : "playing";

  const nextId = useRef(1);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const spawnE2EHeart = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const size = 92;
    const duration = 9999;
    const x = rect.width / 2;

    setHearts([{ id: nextId.current++, x, size, duration, static: true }]);
  }, []);

  useEffect(() => {
    const fn = () =>
      JSON.stringify({
        route: "/game",
        status,
        goal: GOAL,
        score,
        missed,
        secondsLeft,
        heartsOnScreen: hearts.length,
        coords: {
          origin: "top-left of gameArea",
          units: "px",
        },
      });
    window.render_game_to_text = fn;
    return () => {
      if (window.render_game_to_text === fn) delete window.render_game_to_text;
    };
  }, [GOAL, hearts.length, missed, score, secondsLeft, status]);

  // Canvas "âncora" (screenshots + ações por coordenadas no client do Playwright)
  useEffect(() => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const resize = () => {
      const rect = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    };

    resize();

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resize);
      ro.observe(el);
    }

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      ro?.disconnect();
    };
  }, []);

  // Side-effect “externo” ok: localStorage
  useEffect(() => {
    if (status === "won") {
      localStorage.setItem("sofia_game_won", "1");
    } else if (status === "lost") {
      localStorage.removeItem("sofia_game_won");
      localStorage.removeItem("sofia_connections_won");
      localStorage.removeItem("sofia_strands_won");
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

    if (isE2E) {
      spawnE2EHeart();
      return;
    }

    const spawn = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();

      const isCoarsePointer =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(pointer: coarse)").matches;

      const minSize = isCoarsePointer ? 44 : 28;
      const maxSize = isCoarsePointer ? 72 : 54;
      const size = clamp(
        minSize + Math.random() * (maxSize - minSize),
        minSize,
        maxSize
      );

      const minDuration = isCoarsePointer ? 3.2 : 2.6;
      const maxDuration = isCoarsePointer ? 5.6 : 4.8;
      const duration = clamp(
        minDuration + Math.random() * (maxDuration - minDuration),
        minDuration,
        maxDuration
      );

      const x =
        rect.width <= size
          ? rect.width / 2
          : clamp(Math.random() * rect.width, size / 2, rect.width - size / 2);

      const heart = { id: nextId.current++, x, size, duration };
      setHearts((prev) => [...prev, heart]);
    };

    const t = setInterval(spawn, SPAWN_MS);
    return () => clearInterval(t);
  }, [SPAWN_MS, isE2E, spawnE2EHeart, status]);

  // E2E helper: spawna 1 coração sempre no centro até chegar ao objetivo
  useEffect(() => {
    if (!isE2E) return;
    if (status !== "playing") return;
    if (score >= GOAL) return;
    if (hearts.length) return;

    spawnE2EHeart();
  }, [GOAL, hearts.length, isE2E, score, spawnE2EHeart, status]);

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
    localStorage.removeItem("sofia_connections_won");
    localStorage.removeItem("sofia_strands_won");
  };

  return (
    <div className="gamePage">
      <div className="gameHeader">
        <div className="badge">⏳ {secondsLeft}s</div>

        <div className="title">
          <h1>Apanha os Corações</h1>
          <p>
            Chega a <b>{GOAL}</b> para desbloquear o próximo jogo 💛
          </p>
        </div>

        <div className="stats">
          <div className="badge">❤️ {score}</div>
          <div className="badge">💔 {missed}</div>
        </div>
      </div>

      <div className="gameArea" ref={containerRef}>
        <canvas className="gameCanvas" ref={canvasRef} aria-hidden="true" />

        {hearts.map((h) => (
          <button
            key={h.id}
            className="heart"
            style={{
              left: `${h.x}px`,
              width: `${h.size}px`,
              height: `${h.size}px`,
              animationDuration: `${h.duration}s`,
              ...(h.static
                ? {
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    animationName: "none",
                  }
                : null),
            }}
            onClick={() => onCatch(h.id)}
            onAnimationEnd={h.static ? undefined : () => onMiss(h.id)}
            aria-label="Coração"
            type="button"
          >
            💛 
          </button>
        ))}

        {status !== "playing" && (
          <div className="overlay">
            {status === "won" ? (
              <div className="panel">
                <h2>Ganhaste! 💘</h2>
                <p>Ok… agora tens mais dois jogos antes do final.</p>
                <div className="row">
                  <button className="btn btn--primary" onClick={() => navigate("/connections")}>
                    Próximo jogo
                  </button>
                  <button className="btn btn--ghost" onClick={reset}>
                    Jogar outra vez
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel">
                <h2>Quase! 😄</h2>
                <p>Tenta outra vez para desbloquear a surpresa.</p>
                <div className="row">
                  <button className="btn btn--primary" onClick={reset}>
                    Tentar outra vez
                  </button>
                  <button className="btn btn--ghost" onClick={() => navigate("/")}>
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
