import { createSlice } from "@reduxjs/toolkit";
import { calculateResult } from "../components/quiz/quizResultUtils";

const QUIZ_DURATION_SECONDS = 10 * 60;

const initialState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  markedForReview: {},
  visited: {},
  timer: {
    durationSeconds: QUIZ_DURATION_SECONDS,
    remainingSeconds: QUIZ_DURATION_SECONDS,
    startTimestamp: null,
    endTimestamp: null,
  },
  mode: "practice",
  level: "mixed",
  proctorFlags: {
    count: 0,
    events: [],
    flagged: false,
  },
  status: "home",
  homeSection: "start_quiz",
  rulesAccepted: false,
  result: null,
  attemptId: null,
  attempts: [],
  selectedAttemptId: null,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setQuizMode(state, action) {
      state.mode = action.payload;
    },
    setQuizLevel(state, action) {
      state.level = action.payload;
    },
    prepareQuizSession(state, action) {
      const { questions = [], durationSeconds = QUIZ_DURATION_SECONDS } = action.payload || {};
      state.questions = questions;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.markedForReview = {};
      state.visited = {};
      state.timer = {
        durationSeconds,
        remainingSeconds: durationSeconds,
        startTimestamp: null,
        endTimestamp: null,
      };
      state.proctorFlags = {
        count: 0,
        events: [],
        flagged: false,
      };
      state.status = "instructions";
      state.rulesAccepted = false;
      state.result = null;
      state.attemptId = null;
      state.selectedAttemptId = null;
    },
    setHomeSection(state, action) {
      state.homeSection = action.payload;
    },
    setRulesAccepted(state, action) {
      state.rulesAccepted = Boolean(action.payload);
    },
    startQuizAttempt(state, action) {
      const { startTimestamp, endTimestamp } = action.payload;
      state.status = "in_progress";
      state.timer.startTimestamp = startTimestamp;
      state.timer.endTimestamp = endTimestamp;
      state.timer.remainingSeconds = Math.max(
        0,
        Math.ceil((endTimestamp - startTimestamp) / 1000),
      );
      const firstQuestion = state.questions[0];
      if (firstQuestion) {
        state.visited[firstQuestion.id] = true;
      }
      state.attemptId = `ATTEMPT-${startTimestamp}`;
    },
    hydrateQuizSession(state, action) {
      const payload = action.payload || {};
      if (!payload.questions?.length) {
        return;
      }
      state.questions = payload.questions;
      state.currentQuestionIndex = payload.currentQuestionIndex || 0;
      state.answers = payload.answers || {};
      state.markedForReview = payload.markedForReview || {};
      state.visited = payload.visited || {};
      state.timer = payload.timer || state.timer;
      state.mode = payload.mode || state.mode;
      state.level = payload.level || state.level;
      state.proctorFlags = payload.proctorFlags || state.proctorFlags;
      state.status = payload.status || "home";
      state.attemptId = payload.attemptId || state.attemptId;
      state.homeSection = payload.homeSection || state.homeSection;
      state.rulesAccepted = false;
      state.result = payload.result || null;
    },
    hydrateAttempts(state, action) {
      const attempts = Array.isArray(action.payload) ? action.payload : [];
      state.attempts = attempts;
    },
    setRemainingSeconds(state, action) {
      state.timer.remainingSeconds = Math.max(0, action.payload);
    },
    goToQuestion(state, action) {
      const index = action.payload;
      if (index < 0 || index >= state.questions.length) {
        return;
      }
      state.currentQuestionIndex = index;
      const question = state.questions[index];
      if (question) {
        state.visited[question.id] = true;
      }
    },
    nextQuestion(state) {
      if (state.currentQuestionIndex >= state.questions.length - 1) {
        return;
      }
      state.currentQuestionIndex += 1;
      const question = state.questions[state.currentQuestionIndex];
      if (question) {
        state.visited[question.id] = true;
      }
    },
    previousQuestion(state) {
      if (state.currentQuestionIndex <= 0) {
        return;
      }
      state.currentQuestionIndex -= 1;
      const question = state.questions[state.currentQuestionIndex];
      if (question) {
        state.visited[question.id] = true;
      }
    },
    answerQuestion(state, action) {
      const { questionId, optionId } = action.payload;
      state.answers[questionId] = optionId;
      state.visited[questionId] = true;
    },
    toggleMarkForReview(state, action) {
      const questionId = action.payload;
      state.markedForReview[questionId] = !state.markedForReview[questionId];
    },
    registerProctorFlag(state, action) {
      const event = action.payload || {};
      state.proctorFlags.count += 1;
      state.proctorFlags.events.push({
        type: event.type || "Unknown event",
        at: event.at || Date.now(),
      });
      state.proctorFlags.flagged = state.proctorFlags.count > 5;
    },
    submitQuiz(state, action) {
      const submittedAt = action.payload?.submittedAt || Date.now();
      const result = calculateResult({
        questions: state.questions,
        answers: state.answers,
        durationSeconds: state.timer.durationSeconds,
        startTimestamp: state.timer.startTimestamp,
        submittedAt,
      });

      const attempt = {
        id: state.attemptId || `ATTEMPT-${submittedAt}`,
        date: submittedAt,
        level: state.level,
        mode: state.mode,
        score: result.finalScore,
        accuracy: result.accuracy,
        timeTakenSeconds: result.timeTakenSeconds,
        negativeMarks: result.negativeMarks,
        correct: result.correct,
        incorrect: result.incorrect,
        unattempted: result.unattempted,
        totalQuestions: result.totalQuestions,
        proctorFlags: state.proctorFlags.count,
        questions: state.questions,
        answers: Object.entries(state.answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
        answerMap: state.answers,
        questionBreakdown: result.questionBreakdown,
        summary: result,
      };

      state.result = attempt;
      state.attempts.unshift(attempt);
      state.status = "submitted";
      state.timer.remainingSeconds = Math.max(0, state.timer.remainingSeconds);
      state.selectedAttemptId = attempt.id;
    },
    openAttemptReview(state, action) {
      state.selectedAttemptId = action.payload;
      state.status = "attempt_review";
    },
    closeAttemptReview(state) {
      state.selectedAttemptId = null;
      state.status = "home";
      state.homeSection = "my_attempts";
    },
    returnToQuizHome(state) {
      state.status = "home";
      state.questions = [];
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.markedForReview = {};
      state.visited = {};
      state.timer = {
        durationSeconds: QUIZ_DURATION_SECONDS,
        remainingSeconds: QUIZ_DURATION_SECONDS,
        startTimestamp: null,
        endTimestamp: null,
      };
      state.proctorFlags = {
        count: 0,
        events: [],
        flagged: false,
      };
      state.rulesAccepted = false;
      state.result = null;
      state.attemptId = null;
      state.selectedAttemptId = null;
      state.homeSection = "start_quiz";
    },
  },
});

export const {
  setQuizMode,
  setQuizLevel,
  prepareQuizSession,
  setRulesAccepted,
  startQuizAttempt,
  hydrateQuizSession,
  setRemainingSeconds,
  goToQuestion,
  nextQuestion,
  previousQuestion,
  answerQuestion,
  toggleMarkForReview,
  registerProctorFlag,
  submitQuiz,
  hydrateAttempts,
  setHomeSection,
  openAttemptReview,
  closeAttemptReview,
  returnToQuizHome,
} = quizSlice.actions;

export const QUIZ_EXAM_DURATION_SECONDS = QUIZ_DURATION_SECONDS;

export default quizSlice.reducer;
