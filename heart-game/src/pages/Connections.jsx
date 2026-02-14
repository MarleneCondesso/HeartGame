import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import "./Connections.css";

const LS_HEARTS_WON = "sofia_game_won";
const LS_CONNECTIONS_WON = "sofia_connections_won";
const LS_STRANDS_WON = "sofia_strands_won";

const MAX_MISTAKES = 4;

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function asTileId(groupId, idx) {
  return `${groupId}:${idx}`;
}

function buildConnectionsModel(connections) {
  const groups = Array.isArray(connections?.groups) ? connections.groups : [];

  const normalizedGroups = groups
    .filter((g) => g && typeof g === "object" && !Array.isArray(g))
    .map((g) => ({
      id: String(g.id || "").trim(),
      title: String(g.title || "").trim(),
      color: String(g.color || "").trim(),
      words: Array.isArray(g.words) ? g.words.map((w) => String(w)) : [],
    }))
    .filter((g) => g.id && g.words.length === 4);

  const tiles = normalizedGroups.flatMap((g) =>
    g.words.map((text, idx) => ({
      id: asTileId(g.id, idx),
      text,
      groupId: g.id,
    }))
  );

  const solutionByGroupId = Object.fromEntries(
    normalizedGroups.map((g) => [
      g.id,
      g.words.map((_, idx) => asTileId(g.id, idx)),
    ])
  );

  return { groups: normalizedGroups, tiles, solutionByGroupId };
}

export default function Connections() {
  const navigate = useNavigate();
  const { content } = useContent();

  const heartsWon = localStorage.getItem(LS_HEARTS_WON) === "1";
  const alreadyWon = localStorage.getItem(LS_CONNECTIONS_WON) === "1";

  const { groups, tiles: allTiles, solutionByGroupId } = useMemo(
    () => buildConnectionsModel(content.connections),
    [content.connections]
  );

  const initialTiles = useMemo(() => shuffleInPlace([...allTiles]), [allTiles]);

  const [tiles, setTiles] = useState(initialTiles);
  const [selected, setSelected] = useState([]);
  const [mistakesLeft, setMistakesLeft] = useState(MAX_MISTAKES);
  const [solvedGroupIds, setSolvedGroupIds] = useState(() => []);
  const [shakeKey, setShakeKey] = useState(0);

  const solvedAll = solvedGroupIds.length === groups.length && groups.length > 0;
  const displaySolvedGroupIds = alreadyWon && groups.length ? groups.map((g) => g.id) : solvedGroupIds;
  const displaySolvedAll = groups.length > 0 && displaySolvedGroupIds.length === groups.length;
  const displayMistakesLeft = alreadyWon ? MAX_MISTAKES : mistakesLeft;
  const displayTiles = alreadyWon ? [] : tiles;

  useEffect(() => {
    if (solvedAll) {
      localStorage.setItem(LS_CONNECTIONS_WON, "1");
    }
  }, [solvedAll]);

  const toggleSelect = (tileId) => {
    setSelected((prev) => {
      if (prev.includes(tileId)) return prev.filter((id) => id !== tileId);
      if (prev.length >= 4) return prev;
      return [...prev, tileId];
    });
  };

  const deselectAll = () => setSelected([]);

  const shuffleTiles = () => {
    setTiles((prev) => shuffleInPlace([...prev]));
  };

  const reset = () => {
    localStorage.removeItem(LS_CONNECTIONS_WON);
    localStorage.removeItem(LS_STRANDS_WON);
    setTiles(shuffleInPlace([...allTiles]));
    setSelected([]);
    setMistakesLeft(MAX_MISTAKES);
    setSolvedGroupIds([]);
    setShakeKey((k) => k + 1);
  };

  const submit = () => {
    if (alreadyWon || displaySolvedAll) return;
    if (mistakesLeft <= 0) return;
    if (selected.length !== 4) return;

    const selectedSet = new Set(selected);

    const match = groups.find((g) => {
      if (solvedGroupIds.includes(g.id)) return false;
      const sol = solutionByGroupId[g.id] || [];
      if (sol.length !== 4) return false;
      return sol.every((id) => selectedSet.has(id));
    });

    if (match) {
      const solvedIds = solutionByGroupId[match.id] || [];
      setSolvedGroupIds((prev) => [...prev, match.id]);
      setTiles((prev) => prev.filter((t) => !solvedIds.includes(t.id)));
      setSelected([]);
      return;
    }

    setMistakesLeft((m) => Math.max(0, m - 1));
    setShakeKey((k) => k + 1);
  };

  const mistakesDots = Array.from({ length: MAX_MISTAKES }, (_, i) => i < displayMistakesLeft);

  if (!heartsWon) return <Navigate to="/game" replace />;

  return (
    <main className="connections">
      <header className="connections__header">
        <div>
          <p className="connections__kicker">🧩</p>
          <h1 className="connections__title">{content.connections?.title || "Connections"}</h1>
          <p className="connections__subtitle">
            {content.connections?.subtitle || "Create four groups of four!"}
          </p>
        </div>

        <div className="connections__meta" aria-label="Mistakes">
          <span className="connections__metaLabel">Mistakes Remaining:</span>
          <div className="connections__dots" aria-hidden="true">
            {mistakesDots.map((on, idx) => (
              <span
                key={idx}
                className={["connections__dot", on ? "connections__dot--on" : ""].join(" ")}
              />
            ))}
          </div>
        </div>
      </header>

      <section className="connections__board" aria-label="Connections board">
        {displaySolvedGroupIds.map((gid) => {
          const g = groups.find((x) => x.id === gid);
          if (!g) return null;
          const words = Array.isArray(g.words) ? g.words.join(", ") : "";
          return (
            <div key={gid} className={["groupBar", `groupBar--${g.color || "yellow"}`].join(" ")}>
              <div className="groupBar__title">{g.title}</div>
              <div className="groupBar__words">{words}</div>
            </div>
          );
        })}

        {!displaySolvedAll && (
          <div
            key={shakeKey}
            className={["connections__grid", shakeKey ? "connections__grid--shake" : ""].join(" ")}
          >
            {displayTiles.map((t) => {
              const isOn = selected.includes(t.id);
              return (
                <button
                  key={t.id}
                  className={["tile", isOn ? "tile--on" : ""].join(" ")}
                  type="button"
                  onClick={() => toggleSelect(t.id)}
                  aria-pressed={isOn}
                >
                  {t.text}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <footer className="connections__footer">
        <div className="connections__actions">
          <button className="btn btn--ghost" type="button" onClick={shuffleTiles} disabled={displaySolvedAll}>
            Shuffle
          </button>
          <button className="btn btn--ghost" type="button" onClick={deselectAll} disabled={!selected.length || displaySolvedAll}>
            Deselect All
          </button>
          <button
            className="btn btn--primary"
            type="button"
            onClick={submit}
            disabled={displaySolvedAll || displayMistakesLeft <= 0 || selected.length !== 4}
          >
            Submit
          </button>
          <button className="btn btn--ghost" type="button" onClick={reset}>
            Recomeçar
          </button>
        </div>

        {displaySolvedAll && (
          <div className="connections__next">
            <button className="btn btn--primary" type="button" onClick={() => navigate("/strands")}>
              Próximo jogo →
            </button>
          </div>
        )}

        {displayMistakesLeft <= 0 && !displaySolvedAll && (
          <div className="connections__lost">
            <div className="connections__lostText">Sem tentativas.</div>
            <button className="btn btn--primary" type="button" onClick={reset}>
              Tentar outra vez
            </button>
          </div>
        )}

        <button className="connections__back" type="button" onClick={() => navigate("/game")}>
          ← voltar ao jogo dos corações
        </button>
      </footer>
    </main>
  );
}
