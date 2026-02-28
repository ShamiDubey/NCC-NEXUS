const quizQuestionBank = [
  {
    id: "Q1",
    question_text: "NCC was formally raised on which date?",
    options: [
      { id: "A", text: "15 August 1947" },
      { id: "B", text: "16 April 1948" },
      { id: "C", text: "26 January 1950" },
      { id: "D", text: "2 October 1949" },
    ],
    correct_option: "B",
    explanation: "The National Cadet Corps was established through the NCC Act in April 1948.",
    difficulty: "easy",
    topic: "NCC History",
  },
  {
    id: "Q2",
    question_text: "What is the NCC motto?",
    options: [
      { id: "A", text: "Service Before Self" },
      { id: "B", text: "Unity and Discipline" },
      { id: "C", text: "Duty, Honor, Nation" },
      { id: "D", text: "Strength and Courage" },
    ],
    correct_option: "B",
    explanation: "The official NCC motto is Unity and Discipline.",
    difficulty: "easy",
    topic: "NCC Fundamentals",
  },
  {
    id: "Q3",
    question_text: "Which wing of NCC is represented by blue color in ceremonial context?",
    options: [
      { id: "A", text: "Army Wing" },
      { id: "B", text: "Naval Wing" },
      { id: "C", text: "Air Wing" },
      { id: "D", text: "Medical Wing" },
    ],
    correct_option: "C",
    explanation: "Blue color corresponds to the Air Wing identity.",
    difficulty: "medium",
    topic: "NCC Organization",
  },
  {
    id: "Q4",
    question_text: "In map reading, a contour line represents:",
    options: [
      { id: "A", text: "Road alignment" },
      { id: "B", text: "River direction" },
      { id: "C", text: "Equal elevation" },
      { id: "D", text: "Forest boundary" },
    ],
    correct_option: "C",
    explanation: "Contours connect points of equal elevation above mean sea level.",
    difficulty: "medium",
    topic: "Map Reading",
  },
  {
    id: "Q5",
    question_text: "Which command is given to bring a squad to attention?",
    options: [
      { id: "A", text: "Vishram" },
      { id: "B", text: "Savdhan" },
      { id: "C", text: "Dahine Mur" },
      { id: "D", text: "Tez Chal" },
    ],
    correct_option: "B",
    explanation: "Savdhan is the drill command for attention.",
    difficulty: "easy",
    topic: "Drill",
  },
  {
    id: "Q6",
    question_text: "The primary purpose of first aid is to:",
    options: [
      { id: "A", text: "Replace hospital treatment" },
      { id: "B", text: "Provide immediate temporary care" },
      { id: "C", text: "Diagnose all diseases" },
      { id: "D", text: "Issue medicines only" },
    ],
    correct_option: "B",
    explanation: "First aid provides immediate and temporary care until professional help arrives.",
    difficulty: "easy",
    topic: "First Aid",
  },
  {
    id: "Q7",
    question_text: "In communication procedure, 'Roger' means:",
    options: [
      { id: "A", text: "Repeat message" },
      { id: "B", text: "Message received" },
      { id: "C", text: "Wait for orders" },
      { id: "D", text: "Message unclear" },
    ],
    correct_option: "B",
    explanation: "Roger confirms that the transmitted message has been received.",
    difficulty: "easy",
    topic: "Field Communication",
  },
  {
    id: "Q8",
    question_text: "The full form of CPR is:",
    options: [
      { id: "A", text: "Cardio Pulmonary Resuscitation" },
      { id: "B", text: "Cardiac Pulse Recovery" },
      { id: "C", text: "Critical Patient Response" },
      { id: "D", text: "Compressed Pulse Revival" },
    ],
    correct_option: "A",
    explanation: "CPR stands for Cardio Pulmonary Resuscitation.",
    difficulty: "easy",
    topic: "First Aid",
  },
  {
    id: "Q9",
    question_text: "Which is the correct order of command hierarchy for a troop movement?",
    options: [
      { id: "A", text: "Squad, Platoon, Company" },
      { id: "B", text: "Company, Platoon, Squad" },
      { id: "C", text: "Platoon, Squad, Company" },
      { id: "D", text: "Section, Battalion, Squad" },
    ],
    correct_option: "A",
    explanation: "The smallest to larger formation goes from squad to platoon to company.",
    difficulty: "medium",
    topic: "Field Craft",
  },
  {
    id: "Q10",
    question_text: "A bearing measured clockwise from North is called:",
    options: [
      { id: "A", text: "Grid reference" },
      { id: "B", text: "Magnetic declination" },
      { id: "C", text: "Azimuth" },
      { id: "D", text: "Relief angle" },
    ],
    correct_option: "C",
    explanation: "Azimuth is a direction measured clockwise from North.",
    difficulty: "medium",
    topic: "Navigation",
  },
  {
    id: "Q11",
    question_text: "When treating severe bleeding, the first priority is to:",
    options: [
      { id: "A", text: "Give water immediately" },
      { id: "B", text: "Apply direct pressure" },
      { id: "C", text: "Move casualty quickly" },
      { id: "D", text: "Remove all clothing" },
    ],
    correct_option: "B",
    explanation: "Direct pressure is the immediate lifesaving step for external bleeding.",
    difficulty: "medium",
    topic: "First Aid",
  },
  {
    id: "Q12",
    question_text: "The objective of social service activities in NCC is to build:",
    options: [
      { id: "A", text: "Weapon proficiency only" },
      { id: "B", text: "Civic responsibility and leadership" },
      { id: "C", text: "Academic ranking" },
      { id: "D", text: "Sports specialization" },
    ],
    correct_option: "B",
    explanation: "NCC social service initiatives strengthen civic sense and leadership traits.",
    difficulty: "easy",
    topic: "Social Service",
  },
  {
    id: "Q13",
    question_text: "Which certificate is generally the highest certification level in Senior Division NCC?",
    options: [
      { id: "A", text: "A Certificate" },
      { id: "B", text: "B Certificate" },
      { id: "C", text: "C Certificate" },
      { id: "D", text: "D Certificate" },
    ],
    correct_option: "C",
    explanation: "C Certificate is considered the highest NCC certificate level in SD/SW.",
    difficulty: "easy",
    topic: "NCC Exams",
  },
  {
    id: "Q14",
    question_text: "In field signals, raising one arm vertically often indicates:",
    options: [
      { id: "A", text: "Advance" },
      { id: "B", text: "Halt" },
      { id: "C", text: "Enemy in sight" },
      { id: "D", text: "Retreat" },
    ],
    correct_option: "B",
    explanation: "A vertical raised arm is commonly used as a visual halt signal.",
    difficulty: "hard",
    topic: "Field Signals",
  },
  {
    id: "Q15",
    question_text: "If magnetic bearing is 110° and declination is 5° East, true bearing is:",
    options: [
      { id: "A", text: "105°" },
      { id: "B", text: "110°" },
      { id: "C", text: "115°" },
      { id: "D", text: "120°" },
    ],
    correct_option: "C",
    explanation: "For East declination, true bearing is magnetic bearing plus declination.",
    difficulty: "hard",
    topic: "Navigation",
  },
  {
    id: "Q16",
    question_text: "Which leadership principle emphasizes assigning tasks with clear intent and accountability?",
    options: [
      { id: "A", text: "Delegation" },
      { id: "B", text: "Camouflage" },
      { id: "C", text: "Concealment" },
      { id: "D", text: "Deflection" },
    ],
    correct_option: "A",
    explanation: "Delegation requires clarity of mission and ownership of outcomes.",
    difficulty: "medium",
    topic: "Leadership",
  },
  {
    id: "Q17",
    question_text: "In cyber safety, the safest action on a suspicious link is to:",
    options: [
      { id: "A", text: "Open in incognito mode" },
      { id: "B", text: "Forward to friends" },
      { id: "C", text: "Click and verify later" },
      { id: "D", text: "Avoid clicking and report it" },
    ],
    correct_option: "D",
    explanation: "Suspicious links should be avoided and reported through proper channels.",
    difficulty: "easy",
    topic: "Cyber Awareness",
  },
  {
    id: "Q18",
    question_text: "The immediate response to a heat stroke casualty includes:",
    options: [
      { id: "A", text: "Keep casualty in direct sunlight" },
      { id: "B", text: "Cool the body rapidly and seek help" },
      { id: "C", text: "Give solid food first" },
      { id: "D", text: "Make casualty run to improve circulation" },
    ],
    correct_option: "B",
    explanation: "Heat stroke is an emergency requiring rapid cooling and medical support.",
    difficulty: "medium",
    topic: "Health & Safety",
  },
  {
    id: "Q19",
    question_text: "Which of the following best describes camouflage?",
    options: [
      { id: "A", text: "Using bright colors to distract enemy" },
      { id: "B", text: "Blending with surroundings to avoid detection" },
      { id: "C", text: "Moving quickly in open terrain" },
      { id: "D", text: "Using loud communication to coordinate" },
    ],
    correct_option: "B",
    explanation: "Camouflage helps personnel and equipment blend with environment.",
    difficulty: "medium",
    topic: "Field Craft",
  },
  {
    id: "Q20",
    question_text: "The command 'Dahine Mur' means:",
    options: [
      { id: "A", text: "Turn left" },
      { id: "B", text: "Turn right" },
      { id: "C", text: "About turn" },
      { id: "D", text: "Stand easy" },
    ],
    correct_option: "B",
    explanation: "Dahine Mur is the drill command for right turn.",
    difficulty: "easy",
    topic: "Drill",
  },
  {
    id: "Q21",
    question_text: "Which document captures attendance and progress during camp-level training?",
    options: [
      { id: "A", text: "Signal log sheet" },
      { id: "B", text: "Parade state register" },
      { id: "C", text: "Magazine issue book" },
      { id: "D", text: "Topographical chart" },
    ],
    correct_option: "B",
    explanation: "Parade state register is used for attendance and status of cadets.",
    difficulty: "hard",
    topic: "Administration",
  },
  {
    id: "Q22",
    question_text: "A good MCQ strategy during timed exams is to:",
    options: [
      { id: "A", text: "Spend equal time on every question no matter what" },
      { id: "B", text: "Attempt easy questions first and mark doubtful ones" },
      { id: "C", text: "Skip reading options fully" },
      { id: "D", text: "Keep changing answers repeatedly" },
    ],
    correct_option: "B",
    explanation: "Prioritizing easy questions improves completion and confidence under time limits.",
    difficulty: "easy",
    topic: "Exam Strategy",
  },
  {
    id: "Q23",
    question_text: "In weapon safety, the first principle before handling is to:",
    options: [
      { id: "A", text: "Assume it is unloaded without checking" },
      { id: "B", text: "Keep finger on trigger" },
      { id: "C", text: "Treat every weapon as loaded" },
      { id: "D", text: "Point toward nearest wall" },
    ],
    correct_option: "C",
    explanation: "Universal weapon safety starts with treating every weapon as loaded.",
    difficulty: "medium",
    topic: "Weapon Training",
  },
  {
    id: "Q24",
    question_text: "In leadership communication, feedback should be:",
    options: [
      { id: "A", text: "Delayed and vague" },
      { id: "B", text: "Specific and timely" },
      { id: "C", text: "Only critical and public" },
      { id: "D", text: "Limited to written notices" },
    ],
    correct_option: "B",
    explanation: "Specific and timely feedback is key for effective leadership development.",
    difficulty: "medium",
    topic: "Leadership",
  },
  {
    id: "Q25",
    question_text: "Which camp type is focused on centralized advanced training and evaluation?",
    options: [
      { id: "A", text: "Annual Training Camp (ATC)" },
      { id: "B", text: "Combined Annual Training Camp (CATC)" },
      { id: "C", text: "National Integration Camp (NIC)" },
      { id: "D", text: "Republic Day Camp (RDC) selection stage only" },
    ],
    correct_option: "B",
    explanation: "CATC is designed for integrated and structured camp-level training exposure.",
    difficulty: "hard",
    topic: "Camps",
  },
];

const fallbackOrder = ["easy", "medium", "hard"];

const normalizeLevel = (level) => {
  if (!level) {
    return "mixed";
  }
  return level.toLowerCase();
};

const cloneQuestion = (question) => ({
  ...question,
  options: question.options.map((option) => ({ ...option })),
});

const stableSortById = (questions) =>
  [...questions].sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));

export const buildQuizQuestions = (level, count = 25) => {
  const normalizedLevel = normalizeLevel(level);
  const allQuestions = stableSortById(quizQuestionBank);

  if (normalizedLevel === "mixed") {
    return allQuestions.slice(0, count).map(cloneQuestion);
  }

  const primaryPool = allQuestions.filter(
    (question) => question.difficulty === normalizedLevel,
  );
  const selected = [...primaryPool];

  if (selected.length < count) {
    fallbackOrder
      .filter((difficulty) => difficulty !== normalizedLevel)
      .forEach((difficulty) => {
        allQuestions
          .filter((question) => question.difficulty === difficulty)
          .forEach((question) => {
            if (selected.length < count && !selected.some((item) => item.id === question.id)) {
              selected.push(question);
            }
          });
      });
  }

  return selected.slice(0, count).map(cloneQuestion);
};

export default quizQuestionBank;

