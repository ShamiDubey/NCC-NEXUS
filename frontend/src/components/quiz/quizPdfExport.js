import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatDuration } from "./quizFormatters";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatDate = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  const date = new Date(value);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const normalizeOptions = (options) => {
  if (!Array.isArray(options)) {
    return [];
  }
  return options.map((option, index) => {
    if (typeof option === "string") {
      const id = String.fromCharCode(65 + index);
      return { id, text: option };
    }
    return {
      id: option?.id ?? String.fromCharCode(65 + index),
      text: option?.text ?? "",
    };
  });
};

const buildQuestionBlock = (question, index) => {
  const options = normalizeOptions(question.options);
  const selectedOption = question.selected_option || "Not Attempted";
  const correctOption = question.correct_option || "-";
  const marks = Number(question.marks_awarded || 0);
  const marksText = marks > 0 ? "+1" : marks < 0 ? "-0.25" : "0";
  const explanationText = question.explanation || "No explanation available.";

  const optionsHtml = options
    .map((option) => {
      const isCorrect = option.id === correctOption;
      const isSelectedWrong = option.id === selectedOption && selectedOption !== correctOption;
      const className = isCorrect ? "option-correct" : isSelectedWrong ? "option-wrong" : "";
      return `
        <li class="option-item ${className}">
          ${escapeHtml(option.id)}) ${escapeHtml(option.text)}
        </li>
      `;
    })
    .join("");

  return `
    <section class="question-card">
      <h3>Q${index + 1}. ${escapeHtml(question.question_text || "")}</h3>
      <ul class="option-list">
        ${optionsHtml}
      </ul>
      <div class="meta-grid">
        <p><strong>Selected Answer:</strong> ${escapeHtml(selectedOption)}</p>
        <p><strong>Correct Answer:</strong> ${escapeHtml(correctOption)}</p>
        <p><strong>Marks Awarded:</strong> ${escapeHtml(marksText)}</p>
      </div>
      <p class="explanation"><strong>Explanation:</strong> ${escapeHtml(explanationText)}</p>
    </section>
  `;
};

const REPORT_STYLE = `
  <style>
    .pdf-page-frame {
      width: 794px;
      height: 1048px;
      background: #ffffff;
      overflow: hidden;
    }
    .pdf-report-root {
      width: 100%;
      height: 100%;
      background: #ffffff;
      color: #1f2848;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.4;
      padding: 28px;
      box-sizing: border-box;
    }
    .header-title {
      text-align: center;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      color: #1a237e;
    }
    .header-subtitle {
      text-align: center;
      font-size: 14px;
      margin: 4px 0 10px;
      color: #4f5880;
    }
    .divider {
      border-top: 2px solid #d8def6;
      margin: 10px 0 16px;
    }
    .section-title {
      font-size: 16px;
      color: #1a237e;
      margin: 0 0 10px;
      font-weight: 700;
    }
    .participant-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 16px;
      margin-bottom: 18px;
    }
    .participant-item {
      border: 1px solid #dce1f7;
      border-radius: 6px;
      padding: 8px;
      font-size: 12px;
    }
    .participant-item strong {
      color: #182247;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #d7dcf1;
      padding: 8px;
      text-align: left;
    }
    th {
      background: #eef1ff;
      font-weight: 700;
    }
    .question-card {
      border: 1px solid #dce1f7;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .question-card h3 {
      margin: 0 0 8px;
      font-size: 14px;
      color: #1d2850;
    }
    .option-list {
      margin: 0 0 8px;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 5px;
    }
    .option-item {
      border: 1px solid #e4e8f8;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 12px;
    }
    .option-correct {
      border-color: #2e7d32;
      background: #d8f3dc;
    }
    .option-wrong {
      border-color: #c62828;
      background: #ffebee;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 5px 10px;
      margin-bottom: 8px;
    }
    .meta-grid p,
    .explanation {
      margin: 0;
      font-size: 12px;
    }
  </style>
`;

const createIntroSectionHtml = (attemptData) => `
  <h1 class="header-title">NCC Nexus</h1>
  <p class="header-subtitle">Quiz Attempt Report</p>
  <div class="divider"></div>

  <h2 class="section-title">Participant Information</h2>
  <div class="participant-grid">
    <div class="participant-item"><strong>Cadet Name:</strong> ${escapeHtml(attemptData.cadetName || "-")}</div>
    <div class="participant-item"><strong>Cadet Rank:</strong> ${escapeHtml(attemptData.cadetRank || "-")}</div>
    <div class="participant-item"><strong>Level:</strong> ${escapeHtml(attemptData.level || "-")}</div>
    <div class="participant-item"><strong>Mode:</strong> ${escapeHtml(attemptData.mode || "-")}</div>
    <div class="participant-item"><strong>Date of Attempt:</strong> ${escapeHtml(attemptData.date || "-")}</div>
    <div class="participant-item"><strong>Time of Attempt:</strong> ${escapeHtml(attemptData.time || "-")}</div>
    <div class="participant-item"><strong>Total Questions:</strong> ${escapeHtml(attemptData.totalQuestions || 0)}</div>
    <div class="participant-item"><strong>Marks Obtained:</strong> ${escapeHtml(attemptData.score || 0)}</div>
    <div class="participant-item"><strong>Accuracy %:</strong> ${escapeHtml(attemptData.accuracy || 0)}</div>
    <div class="participant-item"><strong>Negative Marks Deducted:</strong> ${escapeHtml(attemptData.negativeMarks || 0)}</div>
    <div class="participant-item"><strong>Time Taken:</strong> ${escapeHtml(formatDuration(attemptData.timeTakenSeconds || 0))}</div>
  </div>

  <h2 class="section-title">Section 2: Summary Table</h2>
  <table>
    <thead>
      <tr>
        <th>Total Questions</th>
        <th>Correct</th>
        <th>Incorrect</th>
        <th>Unattempted</th>
        <th>Final Score</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${escapeHtml(attemptData.totalQuestions || 0)}</td>
        <td>${escapeHtml(attemptData.correct || 0)}</td>
        <td>${escapeHtml(attemptData.incorrect || 0)}</td>
        <td>${escapeHtml(attemptData.unattempted || 0)}</td>
        <td>${escapeHtml(attemptData.score || 0)}</td>
      </tr>
    </tbody>
  </table>
`;

const createQuestionSectionHeadingHtml = (continued = false) => `
  <h2 class="section-title">
    Section 3: Question-wise Detailed Review${continued ? " (Continued)" : ""}
  </h2>
`;

const toFileDate = (value) => {
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const generateQuizReportPdf = async (attemptData) => {
  const PAGE_WIDTH_PX = 794;
  const PAGE_HEIGHT_PX = 1048; // A4 printable height equivalent after 10mm margins
  const MARGIN_MM = 10;
  const PDF_PAGE_WIDTH_MM = 210;
  const PDF_PAGE_HEIGHT_MM = 297;
  const CONTENT_WIDTH_MM = PDF_PAGE_WIDTH_MM - MARGIN_MM * 2;
  const CONTENT_HEIGHT_MM = PDF_PAGE_HEIGHT_MM - MARGIN_MM * 2;

  const tempDiv = document.createElement("div");
  tempDiv.style.position = "fixed";
  tempDiv.style.left = "-10000px";
  tempDiv.style.top = "0";
  tempDiv.style.width = `${PAGE_WIDTH_PX}px`;
  tempDiv.style.background = "#ffffff";
  tempDiv.style.zIndex = "-1";
  tempDiv.innerHTML = REPORT_STYLE;

  document.body.appendChild(tempDiv);

  try {
    const normalizedData = {
      ...attemptData,
      date: attemptData.date || formatDate(Date.now()),
      time: attemptData.time || formatTime(Date.now()),
    };
    const questions = Array.isArray(normalizedData.questions) ? normalizedData.questions : [];

    const createPage = (continued = false) => {
      const page = document.createElement("div");
      page.className = "pdf-page-frame";
      page.innerHTML = `<div class="pdf-report-root"><div class="page-content"></div></div>`;
      const pageContent = page.querySelector(".page-content");
      if (continued) {
        pageContent.insertAdjacentHTML("beforeend", createQuestionSectionHeadingHtml(true));
      }
      tempDiv.appendChild(page);
      return { page, pageContent };
    };

    const pages = [];
    let current = createPage(false);
    pages.push(current.page);

    current.pageContent.insertAdjacentHTML("beforeend", createIntroSectionHtml(normalizedData));
    current.pageContent.insertAdjacentHTML("beforeend", createQuestionSectionHeadingHtml(false));

    questions.forEach((question, index) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = buildQuestionBlock(question, index);
      const questionNode = wrapper.firstElementChild;
      current.pageContent.appendChild(questionNode);

      if (current.page.scrollHeight > current.page.clientHeight) {
        current.pageContent.removeChild(questionNode);
        current = createPage(true);
        pages.push(current.page);
        current.pageContent.appendChild(questionNode);
      }
    });

    const pdf = new jsPDF("p", "mm", "a4");

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const pageCanvas = await html2canvas(pages[pageIndex], {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: PAGE_WIDTH_PX,
        height: PAGE_HEIGHT_PX,
        windowWidth: PAGE_WIDTH_PX,
        windowHeight: PAGE_HEIGHT_PX,
      });

      const pageImage = pageCanvas.toDataURL("image/png");
      pdf.addImage(
        pageImage,
        "PNG",
        MARGIN_MM,
        MARGIN_MM,
        CONTENT_WIDTH_MM,
        CONTENT_HEIGHT_MM,
        undefined,
        "FAST",
      );
    }

    const fileDate = toFileDate(attemptData.date || Date.now());
    pdf.save(`NCC_Quiz_Report_${fileDate}.pdf`);
  } finally {
    tempDiv.remove();
  }
};

export const mapAttemptToPdfData = ({
  attempt,
  cadetName,
  cadetRank,
}) => {
  const attemptDate = new Date(attempt.date || Date.now());
  const questions = Array.isArray(attempt.questionBreakdown)
    ? attempt.questionBreakdown.map((item) => ({
      question_text: item.questionText,
      options: item.options,
      selected_option: item.selectedOption,
      correct_option: item.correctOption,
      explanation: item.explanation,
      marks_awarded: item.marksAwarded,
    }))
    : [];

  return {
    cadetName: cadetName || "Cadet Participant",
    cadetRank: cadetRank || "Cadet",
    level: String(attempt.level || "").toUpperCase(),
    mode: String(attempt.mode || "").toUpperCase(),
    date: formatDate(attemptDate),
    time: formatTime(attemptDate),
    score: attempt.score ?? attempt.summary?.finalScore ?? 0,
    accuracy: attempt.accuracy ?? attempt.summary?.accuracy ?? 0,
    negativeMarks: attempt.negativeMarks ?? attempt.summary?.negativeMarks ?? 0,
    timeTakenSeconds: attempt.timeTakenSeconds ?? attempt.summary?.timeTakenSeconds ?? 0,
    totalQuestions: attempt.totalQuestions ?? attempt.summary?.totalQuestions ?? 0,
    correct: attempt.correct ?? attempt.summary?.correct ?? 0,
    incorrect: attempt.incorrect ?? attempt.summary?.incorrect ?? 0,
    unattempted: attempt.unattempted ?? attempt.summary?.unattempted ?? 0,
    questions,
  };
};
