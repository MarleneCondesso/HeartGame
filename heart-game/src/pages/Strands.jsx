import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import "./Strands.css";

const LS_HEARTS_WON = "sofia_game_won";
const LS_CONNECTIONS_WON = "sofia_connections_won";
const LS_STRANDS_WON = "sofia_strands_won";

const PREFERRED_COLS = 6;
const COLS_ORDER = [6, 7, 5, 8, 4, 9, 10, 3, 11, 12, 2];
const EMPTY_ARR = [];

function normalizeLetters(s) {
  return String(s || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z]/g, "");
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function neighborsOf(idx, cols, rows) {
  const x = idx % cols;
  const y = Math.floor(idx / cols);
  const out = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      out.push(ny * cols + nx);
    }
  }
  return out;
}

function pickGridDims(totalLetters) {
  if (!Number.isFinite(totalLetters) || totalLetters <= 0) {
    return { cols: PREFERRED_COLS, rows: 0 };
  }

  for (const cols of COLS_ORDER) {
    if (cols > 0 && totalLetters % cols === 0) {
      return { cols, rows: totalLetters / cols };
    }
  }

  // Fallback: qualquer divisor >= 2
  for (let cols = 2; cols <= totalLetters; cols++) {
    if (totalLetters % cols === 0) return { cols, rows: totalLetters / cols };
  }

  // Prime (ou caso estranho): uma linha.
  return { cols: totalLetters, rows: 1 };
}

function buildSnakePath(cols, rows) {
  const path = [];
  for (let y = 0; y < rows; y++) {
    if (y % 2 === 0) {
      for (let x = 0; x < cols; x++) path.push(y * cols + x);
    } else {
      for (let x = cols - 1; x >= 0; x--) path.push(y * cols + x);
    }
  }
  return path;
}

function generateStrandsPuzzle({ theme, words, spangram }) {
  const normalizedSpangram = normalizeLetters(spangram);
  const normalizedThemeWordsRaw = (Array.isArray(words) ? words : [])
    .map((w) => normalizeLetters(w))
    .filter(Boolean);

  const themeWords = [];
  const seenTheme = new Set();
  for (const w of normalizedThemeWordsRaw) {
    if (!w) continue;
    if (normalizedSpangram && w === normalizedSpangram) continue;
    if (seenTheme.has(w)) continue;
    seenTheme.add(w);
    themeWords.push(w);
  }

  const allWords = [];
  const seenAll = new Set();
  if (normalizedSpangram) {
    allWords.push(normalizedSpangram);
    seenAll.add(normalizedSpangram);
  }
  for (const w of themeWords) {
    if (seenAll.has(w)) continue;
    seenAll.add(w);
    allWords.push(w);
  }

  const totalLetters = allWords.reduce((sum, w) => sum + w.length, 0);
  const { cols, rows } = pickGridDims(totalLetters);
  const size = cols * rows;

  const sorted = [...allWords].sort((a, b) => {
    const d = b.length - a.length;
    if (d) return d;
    if (a === normalizedSpangram) return -1;
    if (b === normalizedSpangram) return 1;
    return a.localeCompare(b);
  });

  const baseSeed = hashString([normalizeLetters(theme), ...sorted].join("|"));

  if (!size) {
    return { rows: 0, cols, grid: [], placements: {}, themeWords, spangram: normalizedSpangram, allWords };
  }

  const neighborMap = Array.from({ length: size }, (_, i) => neighborsOf(i, cols, rows));

  for (let attempt = 0; attempt < 80; attempt++) {
    const rng = mulberry32(baseSeed + attempt * 1013);
    const grid = Array.from({ length: size }, () => "");
    const used = Array.from({ length: size }, () => false);
    const placements = {};

    const tryPlaceWord = (word) => {
      const starts = shuffleWithRng(
        Array.from({ length: size }, (_, i) => i).filter((i) => !used[i]),
        rng
      );

      for (const start of starts) {
        const path = [start];
        const inPath = new Set(path);

        const dfs = (pos, wi) => {
          if (wi === word.length - 1) return true;

          const neigh = shuffleWithRng([...neighborMap[pos]], rng);

          for (const n of neigh) {
            if (used[n]) continue;
            if (inPath.has(n)) continue;

            // antecipadamente: se a célula estiver livre, podemos usar.
            // (as letras só são escritas no fim)
            inPath.add(n);
            path.push(n);
            if (dfs(n, wi + 1)) return true;
            path.pop();
            inPath.delete(n);
          }

          return false;
        };

        if (dfs(start, 0)) return path;
      }

      return null;
    };

    let ok = true;
    for (const w of sorted) {
      const path = tryPlaceWord(w);
      if (!path) {
        ok = false;
        break;
      }

      placements[w] = path;
      for (let i = 0; i < w.length; i++) {
        const idx = path[i];
        used[idx] = true;
        grid[idx] = w[i];
      }
    }

    if (!ok) continue;

    if (grid.some((ch) => !ch)) continue;

    return { rows, cols, grid, placements, themeWords, spangram: normalizedSpangram, allWords };
  }

  // Fallback (nunca deveria acontecer): grid simples com letras aleatórias
  const rng = mulberry32(baseSeed);
  const wordOrder = shuffleWithRng([...sorted], rng);
  const snake = buildSnakePath(cols, rows);

  const grid = Array.from({ length: size }, () => "");
  const placements = {};
  let cursor = 0;

  for (const w of wordOrder) {
    const seg = snake.slice(cursor, cursor + w.length);
    placements[w] = seg;
    for (let i = 0; i < w.length; i++) grid[seg[i]] = w[i];
    cursor += w.length;
  }

  return { rows, cols, grid, placements, themeWords, spangram: normalizedSpangram, allWords };
}

function idxToXY(idx, cols) {
  return { x: idx % cols, y: Math.floor(idx / cols) };
}

function isNeighbor(aIdx, bIdx, cols) {
  const a = idxToXY(aIdx, cols);
  const b = idxToXY(bIdx, cols);
  return Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1 && !(a.x === b.x && a.y === b.y);
}

export default function Strands() {
  const navigate = useNavigate();
  const { content } = useContent();

  const search = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(search);
  const isE2E = params.has("e2e");

  const heartsWon = isE2E || localStorage.getItem(LS_HEARTS_WON) === "1";
  const connectionsWon = isE2E || localStorage.getItem(LS_CONNECTIONS_WON) === "1";
  const alreadyWon = (isE2E && params.has("won")) || localStorage.getItem(LS_STRANDS_WON) === "1";

  const puzzle = useMemo(
    () =>
      generateStrandsPuzzle({
        theme: content.strands?.theme || "",
        spangram: content.strands?.spangram || "",
        words: content.strands?.words || [],
      }),
    [content.strands]
  );

  const themeWords = Array.isArray(puzzle.themeWords) ? puzzle.themeWords : EMPTY_ARR;
  const allWords = Array.isArray(puzzle.allWords) ? puzzle.allWords : EMPTY_ARR;
  const spangramWord = typeof puzzle.spangram === "string" ? puzzle.spangram : "";

  const targetSet = useMemo(() => new Set(allWords), [allWords]);

  const [found, setFound] = useState(() => new Set());
  const [foundPaths, setFoundPaths] = useState(() => ({}));
  const [activePath, setActivePath] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hintPath, setHintPath] = useState(null);

  const gridRef = useRef(null);
  const pointerIdRef = useRef(null);

  const displayFound = alreadyWon ? new Set(allWords) : found;
  const displayFoundPaths = alreadyWon ? puzzle.placements : foundPaths;

  const foundCells = new Set();
  const spangramCells = new Set();
  const wordsToPaint = alreadyWon ? allWords : Array.from(found);
  for (const w of wordsToPaint) {
    const p = displayFoundPaths?.[w];
    if (!Array.isArray(p)) continue;
    for (const idx of p) {
      foundCells.add(idx);
      if (spangramWord && w === spangramWord) spangramCells.add(idx);
    }
  }

  const themeFoundCount = themeWords.reduce((acc, w) => (displayFound.has(w) ? acc + 1 : acc), 0);
  const totalTheme = themeWords.length;
  const spangramFound = !spangramWord || displayFound.has(spangramWord);
  const solvedAll = allWords.length > 0 && themeFoundCount >= totalTheme && spangramFound;

  useEffect(() => {
    if (solvedAll) localStorage.setItem(LS_STRANDS_WON, "1");
  }, [solvedAll]);

  const clearSelection = () => {
    setActivePath([]);
    setIsSelecting(false);
    pointerIdRef.current = null;
  };

  const pathToWord = (path) => path.map((i) => puzzle.grid[i]).join("");

  const commitPath = (path) => {
    const word = normalizeLetters(pathToWord(path));
    const rev = normalizeLetters([...path].reverse().map((i) => puzzle.grid[i]).join(""));

    const matched = targetSet.has(word) ? word : targetSet.has(rev) ? rev : null;
    if (!matched) return false;

    setFound((prev) => {
      const next = new Set(prev);
      next.add(matched);
      return next;
    });

    setFoundPaths((prev) => ({ ...prev, [matched]: path }));
    return true;
  };

  const onPointerDownCell = (idx, e) => {
    if (solvedAll) return;
    if (foundCells.has(idx)) return;
    e.preventDefault();

    const gridEl = gridRef.current;
    if (!gridEl) return;

    pointerIdRef.current = e.pointerId;
    gridEl.setPointerCapture(e.pointerId);

    setIsSelecting(true);
    setActivePath([idx]);
  };

  const pickCellFromPointer = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return null;
    const cell = el.closest?.("[data-idx]");
    if (!cell) return null;
    const raw = cell.getAttribute("data-idx");
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const extendPath = (idx) => {
    setActivePath((prev) => {
      if (!prev.length) return [idx];

      const last = prev[prev.length - 1];
      if (idx === last) return prev;

      // backtrack
      if (prev.length >= 2 && idx === prev[prev.length - 2]) {
        return prev.slice(0, -1);
      }

      if (!isNeighbor(last, idx, puzzle.cols)) return prev;
      if (foundCells.has(idx)) return prev;
      if (prev.includes(idx)) return prev;

      return [...prev, idx];
    });
  };

  const onPointerMove = (e) => {
    if (!isSelecting) return;
    if (pointerIdRef.current !== e.pointerId) return;
    e.preventDefault();

    const idx = pickCellFromPointer(e);
    if (idx === null) return;
    extendPath(idx);
  };

  const onPointerUp = (e) => {
    if (!isSelecting) return;
    if (pointerIdRef.current !== e.pointerId) return;
    e.preventDefault();

    const path = activePath;
    clearSelection();
    if (path.length < 2) return;
    commitPath(path);
  };

  const revealHint = () => {
    if (solvedAll) return;

    const revealOrder = [...themeWords, spangramWord].filter(Boolean);
    const remaining = revealOrder.find((w) => !displayFound.has(w));
    if (!remaining) return;

    const path = puzzle.placements?.[remaining];
    if (!Array.isArray(path) || !path.length) return;

    setHintPath(path);
    setTimeout(() => setHintPath(null), 1400);
  };

  const reset = () => {
    localStorage.removeItem(LS_STRANDS_WON);
    setFound(new Set());
    setFoundPaths({});
    setActivePath([]);
    setIsSelecting(false);
    setHintPath(null);
  };

  if (!heartsWon) return <Navigate to="/game" replace />;
  if (!connectionsWon) return <Navigate to="/connections" replace />;

  return (
    <main className="strands">
      <header className="strands__header">
        <div className="strands__themeCard">
          <div className="strands__themeLabel">TODAY&apos;S THEME</div>
          <div className="strands__themeValue">{content.strands?.theme || "—"}</div>
        </div>
        <div className="strands__sub">
          <span className="badge">Hint: {content.strands?.hint || "—"}</span>
        </div>
      </header>

      <section className="strands__board" aria-label="Strands board">
        <div
          className="strands__grid"
          ref={gridRef}
          style={{ "--strands-cols": puzzle.cols }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {puzzle.grid.map((ch, idx) => {
            const isActive = activePath.includes(idx);
            const isFound = foundCells.has(idx);
            const isSpangram = spangramCells.has(idx);

            const isHint = Array.isArray(hintPath) && hintPath.includes(idx);

            return (
              <button
                key={idx}
                className={[
                  "strandCell",
                  isSpangram ? "strandCell--spangram" : isFound ? "strandCell--found" : "",
                  isActive ? "strandCell--active" : "",
                  isHint ? "strandCell--hint" : "",
                ].join(" ")}
                type="button"
                data-idx={idx}
                onPointerDown={(e) => onPointerDownCell(idx, e)}
                aria-label={`Letra ${ch}`}
              >
                {ch}
              </button>
            );
          })}
        </div>
      </section>

      <footer className="strands__footer">
        <button className="btn btn--ghost strands__hintBtn" type="button" onClick={revealHint} disabled={solvedAll}>
          Hint
        </button>

        <div className="strands__progress" aria-live="polite">
          {themeFoundCount} of {totalTheme} theme words found.
          {spangramWord && !spangramFound ? " Encontra a palavra amarela." : ""}
        </div>

        <button className="btn btn--ghost" type="button" onClick={reset}>
          Recomeçar
        </button>

        {solvedAll && (
          <div className="strands__done">
            <button className="btn btn--primary" type="button" onClick={() => navigate("/final")}>
              Final →
            </button>
          </div>
        )}

        <button className="strands__back" type="button" onClick={() => navigate("/connections")}>
          ← voltar ao Connections
        </button>
      </footer>
    </main>
  );
}
