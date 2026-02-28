import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  Eye,
  Flag,
  ShieldAlert,
} from "lucide-react";
import { buildQuizQuestions } from "./mockQuestions";
import {
  answerQuestion,
  closeAttemptReview,
  goToQuestion,
  hydrateAttempts,
  hydrateQuizSession,
  nextQuestion,
  openAttemptReview,
  prepareQuizSession,
  previousQuestion,
  registerProctorFlag,
  returnToQuizHome,
  setHomeSection,
  setQuizLevel,
  setQuizMode,
  setRemainingSeconds,
  setRulesAccepted,
  startQuizAttempt,
  submitQuiz,
  toggleMarkForReview,
} from "../../store/quizSlice";
import {
  clearQuizSession,
  loadQuizAttempts,
  loadQuizSession,
  saveQuizAttempts,
  saveQuizSession,
} from "./quizPersistence";
import { formatAttemptDate, formatDuration, titleCase } from "./quizFormatters";
import { generateQuizReportPdf, mapAttemptToPdfData } from "./quizPdfExport";
import "./quiz.css";

const LEVEL_OPTIONS = ["easy", "medium", "hard", "mixed"];
const MODE_OPTIONS = [
  { key: "practice", label: "Practice Mode", description: "Standard mock test." },
  { key: "exam", label: "Exam Mode (Proctored)", description: "Fullscreen monitored attempt." },
];

const SECTION_OPTIONS = [
  { key: "start_quiz", label: "Start Quiz" },
  { key: "my_attempts", label: "My Attempts" },
];

const flagBadgeText = (count) => (count > 5 ? "Attempt Flagged" : `${count} Flag${count === 1 ? "" : "s"}`);

export default function QuizModule({ participantName = "Cadet Participant", participantRank = "Cadet" }) {
  const dispatch = useDispatch();
  const quiz = useSelector((state) => state.quiz);
  const [toastMessage, setToastMessage] = useState("");
  const [showFlaggedModal, setShowFlaggedModal] = useState(false);
  const [downloadingAttemptId, setDownloadingAttemptId] = useState(null);
  const lastFlagTimestampRef = useRef(0);
  const previousFlagCountRef = useRef(quiz.proctorFlags.count);

  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  const selectedAttempt = useMemo(
    () => quiz.attempts.find((item) => item.id === quiz.selectedAttemptId) || null,
    [quiz.attempts, quiz.selectedAttemptId],
  );
  const answeredCount = useMemo(
    () =>
      quiz.questions.reduce((count, question) => (
        quiz.answers[question.id] ? count + 1 : count
      ), 0),
    [quiz.answers, quiz.questions],
  );

  useEffect(() => {
    dispatch(hydrateAttempts(loadQuizAttempts()));
    const persistedSession = loadQuizSession();
    if (persistedSession?.status === "in_progress") {
      dispatch(hydrateQuizSession(persistedSession));
      if (persistedSession?.timer?.endTimestamp <= Date.now()) {
        dispatch(setRemainingSeconds(0));
        dispatch(submitQuiz({ submittedAt: Date.now() }));
      }
      return;
    }
    clearQuizSession();
  }, [dispatch]);

  useEffect(() => {
    saveQuizAttempts(quiz.attempts);
  }, [quiz.attempts]);

  useEffect(() => {
    if (quiz.status === "in_progress") {
      saveQuizSession(quiz);
    } else if (quiz.status === "submitted" || quiz.status === "home" || quiz.status === "attempt_review") {
      clearQuizSession();
    }
  }, [quiz]);

  useEffect(() => {
    if (quiz.status !== "in_progress" || !quiz.timer.endTimestamp) {
      return undefined;
    }

    const tick = () => {
      const remainingSeconds = Math.max(0, Math.ceil((quiz.timer.endTimestamp - Date.now()) / 1000));
      dispatch(setRemainingSeconds(remainingSeconds));
      if (remainingSeconds === 0) {
        dispatch(submitQuiz({ submittedAt: Date.now() }));
      }
    };
    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [dispatch, quiz.status, quiz.timer.endTimestamp]);

  useEffect(() => {
    if (quiz.mode !== "exam" || quiz.status !== "in_progress") {
      return undefined;
    }

    const raiseFlag = (type) => {
      const now = Date.now();
      if (now - lastFlagTimestampRef.current < 900) {
        return;
      }
      lastFlagTimestampRef.current = now;
      dispatch(registerProctorFlag({ type, at: now }));
    };

    const onVisibilityChange = () => document.hidden && raiseFlag("Tab switch");
    const onWindowBlur = () => raiseFlag("Window blur");
    const onFullscreenChange = () => !document.fullscreenElement && raiseFlag("Fullscreen exit");
    const onCopy = () => raiseFlag("Copy attempt");
    const onContextMenu = () => raiseFlag("Right click");
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
        raiseFlag("Copy attempt");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("copy", onCopy);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch, quiz.mode, quiz.status]);

  useEffect(() => {
    if (quiz.proctorFlags.count > previousFlagCountRef.current) {
      setToastMessage("Suspicious activity detected.");
      const timeoutId = setTimeout(() => setToastMessage(""), 2500);
      previousFlagCountRef.current = quiz.proctorFlags.count;
      return () => clearTimeout(timeoutId);
    }
    previousFlagCountRef.current = quiz.proctorFlags.count;
    return undefined;
  }, [quiz.proctorFlags.count]);

  useEffect(() => {
    setShowFlaggedModal(quiz.status === "in_progress" && quiz.proctorFlags.flagged);
  }, [quiz.proctorFlags.flagged, quiz.status]);

  const startQuizFlow = () => {
    dispatch(prepareQuizSession({ questions: buildQuizQuestions(quiz.level, 25), durationSeconds: 600 }));
  };

  const beginAttempt = async () => {
    const now = Date.now();
    const endTimestamp = now + 10 * 60 * 1000;
    if (quiz.mode === "exam" && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        dispatch(registerProctorFlag({ type: "Fullscreen unavailable", at: Date.now() }));
      }
    }
    dispatch(startQuizAttempt({ startTimestamp: now, endTimestamp }));
  };

  const submitAttempt = async () => {
    dispatch(submitQuiz({ submittedAt: Date.now() }));
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // no-op
      }
    }
  };

  const reviewColor = (question) => {
    if (quiz.markedForReview[question.id]) return "marked";
    if (quiz.answers[question.id]) return "answered";
    if (quiz.visited[question.id]) return "visited";
    return "not-visited";
  };

  const onDownloadAttempt = async (attempt) => {
    setDownloadingAttemptId(attempt.id);
    try {
      const data = mapAttemptToPdfData({
        attempt,
        cadetName: participantName,
        cadetRank: participantRank,
      });
      await generateQuizReportPdf(data);
    } finally {
      setDownloadingAttemptId(null);
    }
  };

  if (quiz.status === "attempt_review" && selectedAttempt) {
    const summary = selectedAttempt.summary;
    return (
      <div className="quiz-shell">
        <section className="quiz-result-card">
          <div className="quiz-result-header">
            <h2>Attempt Review</h2>
            <div className="quiz-inline-actions">
              <button className="quiz-btn-secondary" disabled={downloadingAttemptId === selectedAttempt.id} onClick={() => onDownloadAttempt(selectedAttempt)}>
                <Download size={14} /> {downloadingAttemptId === selectedAttempt.id ? "Generating..." : "Download PDF"}
              </button>
              <button className="quiz-btn-primary" onClick={() => dispatch(closeAttemptReview())}>Back to Attempts</button>
            </div>
          </div>
          <div className="quiz-result-summary">
            <div className="quiz-metric"><span>Score</span><strong>{summary.finalScore}</strong></div>
            <div className="quiz-metric"><span>Accuracy</span><strong>{summary.accuracy}%</strong></div>
            <div className="quiz-metric"><span>Total Questions</span><strong>{summary.totalQuestions}</strong></div>
            <div className="quiz-metric"><span>Time Taken</span><strong>{formatDuration(summary.timeTakenSeconds)}</strong></div>
            <div className="quiz-metric"><span>Correct</span><strong>{summary.correct}</strong></div>
            <div className="quiz-metric"><span>Incorrect</span><strong>{summary.incorrect}</strong></div>
            <div className="quiz-metric"><span>Unattempted</span><strong>{summary.unattempted}</strong></div>
            <div className="quiz-metric"><span>Negative Deduction</span><strong>-{summary.negativeMarks}</strong></div>
          </div>
          <div className="quiz-review-list">
            {summary.questionBreakdown.map((item) => (
              <details key={item.questionId} className={`quiz-review-item ${item.status}`} open={item.questionNo <= 2}>
                <summary>Q{item.questionNo}. {item.questionText}</summary>
                <div className="quiz-review-options">
                  {item.options.map((option) => {
                    const isCorrect = option.id === item.correctOption;
                    const isWrongSelected = option.id === item.selectedOption && item.selectedOption !== item.correctOption;
                    return (
                      <p key={option.id} className={`quiz-review-option ${isCorrect ? "correct" : ""} ${isWrongSelected ? "wrong" : ""}`}>
                        {option.id}. {option.text}
                      </p>
                    );
                  })}
                </div>
                <p><strong>Selected:</strong> {item.selectedOption || "Not Attempted"}</p>
                <p><strong>Correct:</strong> {item.correctOption}</p>
                <p><strong>Marks:</strong> {item.marksAwarded > 0 ? "+1" : item.marksAwarded < 0 ? "-0.25" : "0"}</p>
                <details className="quiz-explanation">
                  <summary>Explanation</summary>
                  <p>{item.explanation}</p>
                </details>
              </details>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (quiz.status === "submitted" && quiz.result) {
    const summary = quiz.result.summary;
    return (
      <div className="quiz-shell">
        <section className="quiz-result-card">
          <div className="quiz-result-header">
            <h2>Attempt Result</h2>
            <div className="quiz-inline-actions">
              <button className="quiz-btn-secondary" disabled={downloadingAttemptId === quiz.result.id} onClick={() => onDownloadAttempt(quiz.result)}>
                <Download size={14} /> {downloadingAttemptId === quiz.result.id ? "Generating..." : "Download PDF"}
              </button>
              <button className="quiz-btn-primary" onClick={() => dispatch(openAttemptReview(quiz.result.id))}>View Detailed Review</button>
              <button className="quiz-btn-secondary" onClick={() => dispatch(returnToQuizHome())}>New Attempt</button>
            </div>
          </div>
          <div className="quiz-result-summary">
            <div className="quiz-metric"><span>Correct</span><strong>{summary.correct}</strong></div>
            <div className="quiz-metric"><span>Incorrect</span><strong>{summary.incorrect}</strong></div>
            <div className="quiz-metric"><span>Unattempted</span><strong>{summary.unattempted}</strong></div>
            <div className="quiz-metric"><span>Negative Deducted</span><strong>-{summary.negativeMarks}</strong></div>
            <div className="quiz-metric"><span>Final Score</span><strong>{summary.finalScore}</strong></div>
            <div className="quiz-metric"><span>Accuracy</span><strong>{summary.accuracy}%</strong></div>
            <div className="quiz-metric"><span>Time Taken</span><strong>{formatDuration(summary.timeTakenSeconds)}</strong></div>
          </div>
        </section>
      </div>
    );
  }

  if (quiz.status === "in_progress" && currentQuestion) {
    return (
      <div className="quiz-shell">
        <header className="quiz-topbar">
          <div>
            <h2>NCC Examination Portal</h2>
            <p>{quiz.mode === "exam" ? "Exam Mode" : "Practice Mode"}</p>
          </div>
          <span className="quiz-warning-pill"><ShieldAlert size={14} /> {flagBadgeText(quiz.proctorFlags.count)}</span>
        </header>
        <div className="quiz-attempt-layout">
          <section className="quiz-question-panel">
            <p className="quiz-question-meta">Question {quiz.currentQuestionIndex + 1} of {quiz.questions.length}</p>
            <h3>{currentQuestion.question_text}</h3>
            <div className="quiz-options">
              {currentQuestion.options.map((option) => (
                <label key={option.id} className={`quiz-option ${quiz.answers[currentQuestion.id] === option.id ? "active" : ""}`}>
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    checked={quiz.answers[currentQuestion.id] === option.id}
                    onChange={() => dispatch(answerQuestion({ questionId: currentQuestion.id, optionId: option.id }))}
                  />
                  <span>{option.id}. {option.text}</span>
                </label>
              ))}
            </div>
            <label className="quiz-mark">
              <input
                type="checkbox"
                checked={Boolean(quiz.markedForReview[currentQuestion.id])}
                onChange={() => dispatch(toggleMarkForReview(currentQuestion.id))}
              />
              Mark for Review
            </label>
            <div className="quiz-question-actions">
              <button className="quiz-btn-secondary" disabled={quiz.currentQuestionIndex === 0} onClick={() => dispatch(previousQuestion())}>Previous</button>
              <button className="quiz-btn-primary" disabled={quiz.currentQuestionIndex === quiz.questions.length - 1} onClick={() => dispatch(nextQuestion())}>Next</button>
            </div>
          </section>
          <aside className="quiz-navigator-panel">
            <div className={`quiz-timer ${quiz.timer.remainingSeconds < 60 ? "critical" : ""}`}>
              <Clock3 size={16} />
              <span>{formatDuration(quiz.timer.remainingSeconds)}</span>
            </div>
            <p className="quiz-grid-title">Question Navigator</p>
            <div className="quiz-grid">
              {quiz.questions.map((question, index) => (
                <button
                  key={question.id}
                  className={`quiz-grid-item ${reviewColor(question)} ${index === quiz.currentQuestionIndex ? "current" : ""}`}
                  onClick={() => dispatch(goToQuestion(index))}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="quiz-navigator-meta">
              <p>Answered: <strong>{answeredCount}</strong></p>
              <p>Remaining: <strong>{quiz.questions.length - answeredCount}</strong></p>
            </div>
            <button className="quiz-btn-danger" onClick={submitAttempt}>Submit Attempt</button>
          </aside>
        </div>
        {toastMessage ? <div className="quiz-toast"><AlertTriangle size={16} />{toastMessage}</div> : null}
        {showFlaggedModal ? (
          <div className="quiz-overlay">
            <div className="quiz-modal">
              <h3>Your attempt is flagged.</h3>
              <p>More than 5 suspicious activities were detected. Your response is still being recorded.</p>
              <button className="quiz-btn-primary" onClick={() => setShowFlaggedModal(false)}>Continue Attempt</button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="quiz-shell">
      <section className="quiz-home-card">
        <div className="quiz-home-title">
          <ClipboardCheck size={20} />
          <h2>Quiz & Mock Tests</h2>
        </div>
        <div className="quiz-home-tabs">
          {SECTION_OPTIONS.map((item) => (
            <button
              key={item.key}
              className={`quiz-home-tab ${quiz.homeSection === item.key ? "active" : ""}`}
              onClick={() => dispatch(setHomeSection(item.key))}
            >
              {item.label}
            </button>
          ))}
        </div>
        {quiz.homeSection === "start_quiz" ? (
          <>
            <div className="quiz-selection-group">
              <p>Mode Selection</p>
              <div className="quiz-pill-row">
                {MODE_OPTIONS.map((mode) => (
                  <button key={mode.key} className={`quiz-pill ${quiz.mode === mode.key ? "active" : ""}`} onClick={() => dispatch(setQuizMode(mode.key))}>
                    <strong>{mode.label}</strong>
                    <span>{mode.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="quiz-selection-group">
              <p>Level Selection</p>
              <div className="quiz-chip-row">
                {LEVEL_OPTIONS.map((level) => (
                  <button key={level} className={`quiz-chip ${quiz.level === level ? "active" : ""}`} onClick={() => dispatch(setQuizLevel(level))}>
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="quiz-info-card">
              <p><CheckCircle2 size={16} /> 25 Questions</p>
              <p><Clock3 size={16} /> 10 Minutes</p>
              <p><Flag size={16} /> Auto Submit</p>
              <p><ShieldAlert size={16} /> {quiz.mode === "exam" ? "Fullscreen required" : "Fullscreen optional"}</p>
            </div>
            <button className="quiz-btn-primary" onClick={startQuizFlow}>Start Quiz</button>
          </>
        ) : (
          <div className="quiz-attempts-section">
            <div className="quiz-admin-table-wrap">
              <table className="quiz-admin-table">
                <thead>
                  <tr>
                    <th>Attempt Date</th>
                    <th>Level</th>
                    <th>Mode</th>
                    <th>Score</th>
                    <th>Accuracy %</th>
                    <th>Time Taken</th>
                    <th>Download PDF</th>
                    <th>View Details</th>
                  </tr>
                </thead>
                <tbody>
                  {quiz.attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td>{formatAttemptDate(attempt.date)}</td>
                      <td>{titleCase(attempt.level)}</td>
                      <td>{titleCase(attempt.mode)}</td>
                      <td>{attempt.score}</td>
                      <td>{attempt.accuracy}</td>
                      <td>{formatDuration(attempt.timeTakenSeconds)}</td>
                      <td>
                        <button className="quiz-view-btn" disabled={downloadingAttemptId === attempt.id} onClick={() => onDownloadAttempt(attempt)}>
                          <Download size={14} /> {downloadingAttemptId === attempt.id ? "Generating..." : "PDF"}
                        </button>
                      </td>
                      <td>
                        <button className="quiz-view-btn" onClick={() => dispatch(openAttemptReview(attempt.id))}>
                          <Eye size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!quiz.attempts.length ? (
                    <tr>
                      <td colSpan={8} className="quiz-empty">No attempts yet. Start your first quiz attempt.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {quiz.status === "instructions" ? (
        <div className="quiz-overlay">
          <div className="quiz-modal">
            <h3>Pre-Quiz Instructions</h3>
            <ul>
              <li>Total Questions: 25</li>
              <li>Time Limit: 10 minutes</li>
              <li>Negative Marking: -0.25 for each incorrect answer</li>
              <li>Auto-submit on time expiry</li>
              <li>Fullscreen required in exam mode</li>
              <li>Tab switching and copy/right click are monitored</li>
            </ul>
            <label className="quiz-mark">
              <input
                type="checkbox"
                checked={quiz.rulesAccepted}
                onChange={(event) => dispatch(setRulesAccepted(event.target.checked))}
              />
              I agree to exam rules
            </label>
            <div className="quiz-modal-actions">
              <button className="quiz-btn-secondary" onClick={() => dispatch(returnToQuizHome())}>Cancel</button>
              <button className="quiz-btn-primary" disabled={!quiz.rulesAccepted} onClick={beginAttempt}>Start Exam</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
