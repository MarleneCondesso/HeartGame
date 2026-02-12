import { Link } from "react-router-dom";
import { useState } from "react";
import { useContent } from "../context/ContentContext";
import "./Quiz.css";

export default function Quiz() {
  const { content } = useContent();
  const quizData = content.quiz || [];

  const total = quizData.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => Array(total).fill(null));

  const isFinished = step >= total;
  const current = !isFinished ? quizData[step] : null;
  const chosen = !isFinished ? answers[step] : null;

  const answeredCount = answers.filter((a) => a !== null).length;

  const score = answers.reduce((acc, a, i) => {
    if (a === null) return acc;
    return acc + (a === quizData[i]?.correctIndex ? 1 : 0);
  }, 0);

  const percent = total ? Math.round((score / total) * 100) : 0;

  const selectOption = (idx) => {
    if (isFinished) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = idx;
      return next;
    });
  };

  const nextStep = () => {
    if (isFinished) return;
    if (answers[step] === null) return;
    setStep((s) => Math.min(s + 1, total));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const restart = () => {
    setAnswers(Array(total).fill(null));
    setStep(0);
  };

  return (
    <main className="quiz">
      <header className="quiz__header">
        <div>
          <p className="quiz__kicker">🧩</p>
          <h1 className="quiz__title">Quiz</h1>
          <p className="quiz__subtitle">Responde e depois joga para desbloquear o final 🎮</p>
        </div>

        <div className="quiz__headerActions">
          <Link className="btn btn--ghost" to="/gallery">
            ← Galeria
          </Link>
          <Link className="btn btn--primary" to="/game">
            Ir para o jogo 🎮
          </Link>
        </div>
      </header>

      <section className="quiz__body">
        <div className="quiz__progress">
          <div className="quiz__progressTop">
            <span>{isFinished ? "Finalizado" : `Pergunta ${step + 1} de ${total}`}</span>
            <span className="quiz__muted">Respondidas: {answeredCount}/{total}</span>
          </div>

          <progress className="quiz__progressBar" max={total} value={Math.min(step, total)} />
        </div>

        {!isFinished ? (
          <article className="quizCard">
            <h2 className="quizCard__question">{current?.question}</h2>

            <div className="quizCard__options">
              {(current?.options || []).map((opt, idx) => {
                const isSelected = chosen === idx;
                return (
                  <button
                    key={`${opt}-${idx}`}
                    type="button"
                    className={["option", isSelected ? "option--selected" : ""].join(" ")}
                    onClick={() => selectOption(idx)}
                  >
                    <span className="option__bullet" aria-hidden="true" />
                    <span className="option__text">{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="quizCard__actions">
              <button className="btn btn--ghost" type="button" onClick={prevStep} disabled={step === 0}>
                ← Anterior
              </button>

              <button className="btn btn--primary" type="button" onClick={nextStep} disabled={answers[step] === null}>
                Próxima →
              </button>
            </div>

            {answers[step] === null && <p className="quizCard__hint">Escolhe uma opção para avançar.</p>}
          </article>
        ) : (
          <article className="resultCard">
            <h2 className="resultCard__title">Resultado 💘</h2>

            <div className="resultCard__stats">
              <div className="pill">✅ {score}/{total}</div>
              <div className="pill">📈 {percent}%</div>
            </div>

            <p className="resultCard__text">
              Agora falta o último passo: ganhar o mini-jogo para desbloquear a surpresa final.
            </p>

            <div className="resultCard__actions">
              <button className="btn btn--ghost" type="button" onClick={restart}>
                Recomeçar
              </button>

              <Link className="btn btn--primary" to="/game">
                Jogar 🎮
              </Link>
            </div>
          </article>
        )}
      </section>

      <footer className="quiz__footer">
        <Link className="btn btn--ghost" to="/">
          ← Início
        </Link>

        <div className="quiz__next">
          <span className="quiz__nextLabel">Próximo:</span>
          <Link className="btn btn--primary" to="/game">
            Jogo →
          </Link>
        </div>
      </footer>
    </main>
  );
}
