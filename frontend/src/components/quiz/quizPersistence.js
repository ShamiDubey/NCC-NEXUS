export const QUIZ_SESSION_STORAGE_KEY = "ncc_quiz_session_v1";
export const QUIZ_ATTEMPTS_STORAGE_KEY = "ncc_quiz_attempts_v1";

export const saveQuizSession = (state) => {
  try {
    const payload = {
      status: state.status,
      mode: state.mode,
      level: state.level,
      questions: state.questions,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      markedForReview: state.markedForReview,
      visited: state.visited,
      timer: state.timer,
      proctorFlags: state.proctorFlags,
      attemptId: state.attemptId,
      homeSection: state.homeSection,
    };
    localStorage.setItem(QUIZ_SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures gracefully.
  }
};

export const loadQuizSession = () => {
  try {
    const raw = localStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearQuizSession = () => {
  try {
    localStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage failures gracefully.
  }
};

export const saveQuizAttempts = (attempts) => {
  try {
    localStorage.setItem(QUIZ_ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
  } catch {
    // Ignore storage failures gracefully.
  }
};

export const loadQuizAttempts = () => {
  try {
    const raw = localStorage.getItem(QUIZ_ATTEMPTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
