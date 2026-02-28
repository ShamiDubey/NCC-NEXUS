const CORRECT_MARK = 1;
const INCORRECT_MARK = -0.25;

const clampScore = (value) => Math.max(0, Number(value.toFixed(2)));

export const calculateResult = ({
  questions,
  answers,
  durationSeconds,
  startTimestamp,
  submittedAt,
}) => {
  const totalQuestions = questions.length;
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;
  let positiveMarks = 0;
  let negativeMarks = 0;

  const questionBreakdown = questions.map((question, index) => {
    const selectedOption = answers[question.id] ?? null;
    const isAttempted = selectedOption !== null;
    const isCorrect = isAttempted && selectedOption === question.correct_option;

    let marksAwarded = 0;
    let status = "unattempted";

    if (!isAttempted) {
      unattempted += 1;
      status = "unattempted";
      marksAwarded = 0;
    } else if (isCorrect) {
      correct += 1;
      status = "correct";
      marksAwarded = CORRECT_MARK;
      positiveMarks += CORRECT_MARK;
    } else {
      incorrect += 1;
      status = "incorrect";
      marksAwarded = INCORRECT_MARK;
      negativeMarks += Math.abs(INCORRECT_MARK);
    }

    return {
      questionId: question.id,
      questionNo: index + 1,
      questionText: question.question_text,
      options: question.options,
      selectedOption,
      correctOption: question.correct_option,
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      status,
      marksAwarded,
    };
  });

  const rawScore = positiveMarks - negativeMarks;
  const finalScore = clampScore(rawScore);
  const accuracy = totalQuestions > 0
    ? Number(((correct / totalQuestions) * 100).toFixed(2))
    : 0;

  const safeSubmittedAt = submittedAt || Date.now();
  const elapsedSeconds = Math.max(
    0,
    Math.floor((safeSubmittedAt - (startTimestamp || safeSubmittedAt)) / 1000),
  );
  const timeTakenSeconds = Math.min(durationSeconds, elapsedSeconds);

  return {
    totalQuestions,
    correct,
    incorrect,
    unattempted,
    positiveMarks: Number(positiveMarks.toFixed(2)),
    negativeMarks: Number(negativeMarks.toFixed(2)),
    finalScore,
    accuracy,
    timeTakenSeconds,
    submittedAt: safeSubmittedAt,
    questionBreakdown,
  };
};

