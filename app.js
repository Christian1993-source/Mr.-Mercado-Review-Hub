const STORAGE_KEY = "mrMercadoReviews";
const SIMULATOR_KEY = "mrMercadoSimulators";
const ADMIN_HASH_KEY = "mrMercadoAdminHash";
const REVIEWS_JSON_PATH = "reviews.json";
const SIMULATORS_JSON_PATH = "simulators.json";
const ADMIN_CONFIG_HASH = typeof window !== "undefined" ? window.MR_MERCADO_ADMIN_HASH : null;
const SITE_ACCESS_HASH = typeof window !== "undefined" ? window.MR_MERCADO_SITE_HASH : null;
const SITE_ACCESS_SESSION_KEY = "mrMercadoSiteAccessGranted";
// SECURITY NOTE: Client-side password checks are only deterrents.
// For true security, enforce auth at hosting layer (server, proxy, or provider access control).

const state = {
  reviews: [],
  simulators: [],
  selectedCourse: null,
  selectedReview: null,
  quiz: null,
  isAdmin: false,
  editingId: null,
  editingSimulatorId: null
};

const studentViews = document.querySelectorAll("[data-student-view]");
const adminViews = document.querySelectorAll("[data-admin-view]");

const teacherAdminBtn = document.getElementById("teacherAdminBtn");
const homeView = document.getElementById("homeView");
const courseView = document.getElementById("courseView");
const quizView = document.getElementById("quizView");
const resultsView = document.getElementById("resultsView");
const adminDashboard = document.getElementById("adminDashboard");
const adminEditor = document.getElementById("adminEditor");
const simulatorEditor = document.getElementById("simulatorEditor");

const courseTitle = document.getElementById("courseTitle");
const courseSubtitle = document.getElementById("courseSubtitle");
const courseCards = document.getElementById("courseCards");
const backHomeBtn = document.getElementById("backHomeBtn");

const simulatorGrid = document.getElementById("simulatorGrid");
const simulatorAdminList = document.getElementById("simulatorAdminList");
const createSimulatorBtn = document.getElementById("createSimulatorBtn");

const timerDisplay = document.getElementById("timerDisplay");
const progressDisplay = document.getElementById("progressDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const questionText = document.getElementById("questionText");
const optionsGrid = document.getElementById("optionsGrid");
const feedbackText = document.getElementById("feedbackText");
const continueBtn = document.getElementById("continueBtn");
const homeBtnQuiz = document.getElementById("homeBtnQuiz");
const questionNav = document.getElementById("questionNav");

const finalScore = document.getElementById("finalScore");
const finalPercent = document.getElementById("finalPercent");
const finalMessage = document.getElementById("finalMessage");
const retryBtn = document.getElementById("retryBtn");
const backTopicsBtn = document.getElementById("backTopicsBtn");
const resultsSnakeCanvas = document.getElementById("resultsSnakeCanvas");
const resultsSnakeScore = document.getElementById("resultsSnakeScore");
const resultsSnakeMessage = document.getElementById("resultsSnakeMessage");
const resultsSnakeRestartBtn = document.getElementById("resultsSnakeRestartBtn");
const resultsSnakeControls = document.querySelectorAll(".results-snake-control");

const adminLoginModal = document.getElementById("adminLoginModal");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassword = document.getElementById("adminPassword");
const adminLoginError = document.getElementById("adminLoginError");
const adminCancelBtn = document.getElementById("adminCancelBtn");
const adminLoginHint = document.getElementById("adminLoginHint");

const adminList = document.getElementById("adminList");
const createReviewBtn = document.getElementById("createReviewBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importInput = document.getElementById("importInput");
const exportSimBtn = document.getElementById("exportSimBtn");
const importSimBtn = document.getElementById("importSimBtn");
const importSimInput = document.getElementById("importSimInput");
const clearLocalBtn = document.getElementById("clearLocalBtn");

const editorForm = document.getElementById("editorForm");
const editorTitle = document.getElementById("editorTitle");
const courseSelect = document.getElementById("courseSelect");
const titleInput = document.getElementById("titleInput");
const questionsInput = document.getElementById("questionsInput");
const parseErrors = document.getElementById("parseErrors");
const cancelEditorBtn = document.getElementById("cancelEditorBtn");
const editorModeInputs = document.querySelectorAll('input[name="editorMode"]');
const manualFields = document.getElementById("manualFields");
const jsonFields = document.getElementById("jsonFields");
const jsonFileInput = document.getElementById("jsonFileInput");
const jsonTextInput = document.getElementById("jsonTextInput");

const simulatorForm = document.getElementById("simulatorForm");
const simulatorEditorTitle = document.getElementById("simulatorEditorTitle");
const simTitleInput = document.getElementById("simTitleInput");
const simLinkInput = document.getElementById("simLinkInput");
const simErrors = document.getElementById("simErrors");
const cancelSimulatorBtn = document.getElementById("cancelSimulatorBtn");

const snakeModal = document.getElementById("snakeModal");
const snakeCanvas = document.getElementById("snakeCanvas");
const snakeScore = document.getElementById("snakeScore");
const snakeMessage = document.getElementById("snakeMessage");
const snakeRestartBtn = document.getElementById("snakeRestartBtn");
const closeSnakeBtn = document.getElementById("closeSnakeBtn");
const snakeControls = document.querySelectorAll(".snake-control");

const courseButtons = document.querySelectorAll(".course-btn");
const siteAccessGate = document.getElementById("siteAccessGate");
const siteAccessForm = document.getElementById("siteAccessForm");
const siteAccessPassword = document.getElementById("siteAccessPassword");
const siteAccessError = document.getElementById("siteAccessError");

const DEFAULT_QUIZ_SECONDS = 45 * 60;

const DEFAULT_REVIEWS = [];

const DEFAULT_SIMULATORS = [];

const snakeState = {
  gridSize: 16,
  snake: [],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  food: { x: 0, y: 0 },
  score: 0,
  timerId: null,
  isRunning: false,
  isGameOver: false,
  cellSize: 20
};

const resultsSnakeState = {
  gridSize: 16,
  snake: [],
  direction: { x: 0, y: 0 },
  nextDirection: { x: 0, y: 0 },
  food: { x: 0, y: 0 },
  score: 0,
  timerId: null,
  isRunning: false,
  isGameOver: false,
  cellSize: 20
};

function showStudentView(viewId) {
  studentViews.forEach((view) => {
    view.classList.toggle("is-active", view.id === viewId);
  });
  adminViews.forEach((view) => view.classList.remove("is-active"));
  document.body.classList.remove("admin-mode");
  if (viewId !== "resultsView") {
    stopResultsSnakeGame();
  }
}

function showAdminView(viewId) {
  adminViews.forEach((view) => {
    view.classList.toggle("is-active", view.id === viewId);
  });
  studentViews.forEach((view) => view.classList.remove("is-active"));
  document.body.classList.add("admin-mode");
  stopResultsSnakeGame();
}

function updateTeacherButton() {
  teacherAdminBtn.textContent = state.isAdmin ? "Exit Admin" : "Teacher Admin";
}

function getStoredAdminHash() {
  if (ADMIN_CONFIG_HASH) return ADMIN_CONFIG_HASH;
  return localStorage.getItem(ADMIN_HASH_KEY);
}

function setStoredAdminHash(hash) {
  localStorage.setItem(ADMIN_HASH_KEY, hash);
}

async function hashPassword(value) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function computePasswordKey(value) {
  if (window.crypto && window.crypto.subtle) {
    return hashPassword(value);
  }
  return value;
}

function openSiteAccessGate() {
  if (siteAccessGate) {
    siteAccessGate.classList.add("open");
    siteAccessGate.setAttribute("aria-hidden", "false");
  }
  document.body.classList.add("site-locked");
  if (siteAccessError) {
    siteAccessError.textContent = "";
  }
  if (siteAccessPassword) {
    siteAccessPassword.value = "";
    setTimeout(() => siteAccessPassword.focus(), 0);
  }
}

function closeSiteAccessGate() {
  if (siteAccessGate) {
    siteAccessGate.classList.remove("open");
    siteAccessGate.setAttribute("aria-hidden", "true");
  }
  document.body.classList.remove("site-locked");
}

function hasSiteAccessSession() {
  try {
    return sessionStorage.getItem(SITE_ACCESS_SESSION_KEY) === "1";
  } catch (error) {
    return false;
  }
}

function setSiteAccessSession() {
  try {
    sessionStorage.setItem(SITE_ACCESS_SESSION_KEY, "1");
  } catch (error) {
    // Ignore storage errors.
  }
}

async function requireSiteAccess() {
  if (!siteAccessGate || !siteAccessForm || !siteAccessPassword || !siteAccessError) {
    document.body.classList.remove("site-locked");
    return;
  }

  if (!SITE_ACCESS_HASH) {
    closeSiteAccessGate();
    return;
  }

  if (hasSiteAccessSession()) {
    closeSiteAccessGate();
    return;
  }

  openSiteAccessGate();

  await new Promise((resolve) => {
    const handleSubmit = async (event) => {
      event.preventDefault();
      const inputValue = siteAccessPassword.value.trim();
      if (!inputValue) {
        siteAccessError.textContent = "Enter the access password.";
        return;
      }
      const inputHash = await computePasswordKey(inputValue);
      if (inputHash === SITE_ACCESS_HASH) {
        setSiteAccessSession();
        closeSiteAccessGate();
        siteAccessForm.removeEventListener("submit", handleSubmit);
        resolve();
      } else {
        siteAccessError.textContent = "Incorrect password.";
      }
    };

    siteAccessForm.addEventListener("submit", handleSubmit);
  });
}

function normalizeQuestion(question) {
  if (!question || typeof question !== "object") return null;

  if (question.type === "fill" || typeof question.answer === "string") {
    return {
      type: "fill",
      questionText: String(question.questionText || "").trim(),
      answer: String(question.answer || "").trim()
    };
  }

  if (Array.isArray(question.choices) && question.choices.length === 4 && Number.isInteger(question.correctIndex)) {
    return {
      type: "mc",
      questionText: String(question.questionText || "").trim(),
      choices: question.choices.map((choice) => String(choice)),
      correctIndex: question.correctIndex
    };
  }

  return null;
}

function normalizeReview(review) {
  const questions = Array.isArray(review.questions)
    ? review.questions.map(normalizeQuestion).filter(Boolean)
    : [];
  return {
    ...review,
    timeLimitSeconds: DEFAULT_QUIZ_SECONDS,
    questions
  };
}

async function loadReviews() {
  const fallback = DEFAULT_REVIEWS.map(normalizeReview);
  try {
    const response = await fetch(REVIEWS_JSON_PATH, { cache: "no-store" });
    if (response.ok) {
      const parsed = await response.json();
      if (Array.isArray(parsed) && validateImportedReviews(parsed)) {
        state.reviews = parsed.map(normalizeReview);
        saveReviews();
        return;
      }
    }
  } catch (error) {
    // Ignore fetch errors and fall back to local storage.
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    state.reviews = fallback;
    saveReviews();
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      state.reviews = parsed.map(normalizeReview);
    } else {
      state.reviews = fallback;
    }
  } catch (error) {
    state.reviews = fallback;
  }
}

function saveReviews() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.reviews));
}

async function loadSimulators() {
  try {
    const response = await fetch(SIMULATORS_JSON_PATH, { cache: "no-store" });
    if (response.ok) {
      const parsed = await response.json();
      if (Array.isArray(parsed) && validateSimulators(parsed)) {
        state.simulators = parsed;
        saveSimulators();
        return;
      }
    }
  } catch (error) {
    // Ignore fetch errors and fall back to local storage.
  }

  const stored = localStorage.getItem(SIMULATOR_KEY);
  if (!stored) {
    state.simulators = [...DEFAULT_SIMULATORS];
    saveSimulators();
    return;
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      state.simulators = parsed;
    } else {
      state.simulators = [...DEFAULT_SIMULATORS];
    }
  } catch (error) {
    state.simulators = [...DEFAULT_SIMULATORS];
  }
}

function saveSimulators() {
  localStorage.setItem(SIMULATOR_KEY, JSON.stringify(state.simulators));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function renderCourseCards() {
  courseTitle.textContent = `${state.selectedCourse} Reviews`;
  courseSubtitle.textContent = "Select a review to start.";

  const reviews = state.reviews.filter((review) => review.course === state.selectedCourse);
  courseCards.innerHTML = "";

  if (reviews.length === 0) {
    courseCards.innerHTML = `<div class="review-card"><h3>No reviews yet</h3><p class="review-meta">Create reviews in the Teacher Admin area.</p></div>`;
    return;
  }

  reviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <h3>${review.title}</h3>
      <div class="review-meta">Questions: ${review.questions.length}</div>
      <div class="review-meta">Time: ${formatTime(DEFAULT_QUIZ_SECONDS)}</div>
      <button class="btn primary" data-review-id="${review.id}">Start</button>
    `;
    card.querySelector("button").addEventListener("click", () => startQuiz(review.id));
    courseCards.appendChild(card);
  });
}

function renderSimulatorGrid() {
  simulatorGrid.innerHTML = "";

  if (state.simulators.length === 0) {
    simulatorGrid.innerHTML = `
      <div class="review-card">
        <h3>No simulators yet</h3>
        <div class="review-meta">Add simulator links in the Teacher Admin area.</div>
      </div>
    `;
    return;
  }

  state.simulators.forEach((sim) => {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <h3><a class="simulator-link" href="${sim.link}">${sim.title}</a></h3>
    `;

    simulatorGrid.appendChild(card);
  });
}

function startQuiz(reviewId) {
  stopResultsSnakeGame();
  const review = state.reviews.find((item) => item.id === reviewId);
  if (!review) return;

  if (state.quiz && state.quiz.timerId) {
    clearInterval(state.quiz.timerId);
  }

  state.selectedReview = review;
  state.quiz = {
    index: 0,
    score: 0,
    timeLeft: DEFAULT_QUIZ_SECONDS,
    timerId: null,
    answered: false,
    consecutiveWrong: 0,
    isPaused: false,
    responses: review.questions.map((question) => ({
      type: question.type,
      answered: false,
      correct: false,
      value: null,
      selectedIndex: null
    }))
  };

  showStudentView("quizView");
  updateQuizStatus();
  renderQuestion();
  renderQuestionNav();
  startTimer();
}

function updateQuizStatus() {
  if (!state.quiz || !state.selectedReview) return;
  timerDisplay.textContent = formatTime(state.quiz.timeLeft);
  progressDisplay.textContent = `Question ${state.quiz.index + 1} of ${state.selectedReview.questions.length}`;
  scoreDisplay.textContent = `Score: ${state.quiz.score}`;
}

function renderQuestionNav() {
  if (!questionNav || !state.quiz || !state.selectedReview) return;
  questionNav.innerHTML = "";
  state.selectedReview.questions.forEach((_, idx) => {
    const response = state.quiz.responses[idx];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "question-pill";
    button.textContent = idx + 1;
    if (response.answered) {
      button.classList.add("done");
    } else {
      button.classList.add("pending");
    }
    if (idx === state.quiz.index) {
      button.classList.add("current");
    }
    button.addEventListener("click", () => {
      state.quiz.index = idx;
      renderQuestion();
      renderQuestionNav();
    });
    questionNav.appendChild(button);
  });
}

function allQuestionsAnswered() {
  return state.quiz.responses.every((response) => response.answered);
}

function getNextUnansweredIndex() {
  const total = state.quiz.responses.length;
  for (let offset = 1; offset <= total; offset += 1) {
    const idx = (state.quiz.index + offset) % total;
    if (!state.quiz.responses[idx].answered) {
      return idx;
    }
  }
  return state.quiz.index;
}

function renderQuestion() {
  const question = state.selectedReview.questions[state.quiz.index];
  if (!question) return;

  state.quiz.answered = false;
  updateQuizStatus();
  renderQuestionNav();
  questionText.textContent = question.questionText;
  optionsGrid.innerHTML = "";
  feedbackText.textContent = "";
  continueBtn.disabled = true;

  const response = state.quiz.responses[state.quiz.index];
  state.quiz.answered = response.answered;
  if (question.type === "fill") {
    const fillBlock = document.createElement("div");
    fillBlock.className = "fill-block";
    fillBlock.innerHTML = `
      <input class="fill-input" type="text" placeholder="Type your answer" />
      <button class="btn primary fill-submit" type="button">Check Answer</button>
    `;
    const input = fillBlock.querySelector(".fill-input");
    const submit = fillBlock.querySelector(".fill-submit");
    const submitAnswer = () => handleFillAnswer(input, submit);
    submit.addEventListener("click", submitAnswer);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitAnswer();
      }
    });
    optionsGrid.appendChild(fillBlock);
    if (response.answered) {
      input.value = response.value || "";
      input.disabled = true;
      submit.disabled = true;
      feedbackText.textContent = response.correct ? "Correct. Continue." : "Incorrect. Continue.";
      continueBtn.disabled = false;
    }
  } else {
    question.choices.forEach((choice, index) => {
      const optionBtn = document.createElement("button");
      optionBtn.className = "option-btn";
      optionBtn.innerHTML = `
        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
        <span class="option-text">${choice}</span>
      `;
      optionBtn.addEventListener("click", () => handleAnswer(optionBtn, index));
      optionsGrid.appendChild(optionBtn);
    });
    if (response.answered) {
      optionsGrid.querySelectorAll(".option-btn").forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === response.selectedIndex) {
          btn.classList.add(response.correct ? "correct" : "incorrect");
        }
      });
      feedbackText.textContent = response.correct ? "Correct. Continue." : "Incorrect. Continue.";
      continueBtn.disabled = false;
    }
  }
}

function handleAnswer(button, index) {
  if (state.quiz.answered) return;

  const question = state.selectedReview.questions[state.quiz.index];
  const isCorrect = index === question.correctIndex;
  state.quiz.answered = true;
  const response = state.quiz.responses[state.quiz.index];
  response.answered = true;
  response.correct = isCorrect;
  response.selectedIndex = index;

  if (isCorrect) {
    state.quiz.score += 1;
    state.quiz.consecutiveWrong = 0;
    feedbackText.textContent = "Correct. Continue.";
    button.classList.add("correct");
  } else {
    state.quiz.consecutiveWrong += 1;
    feedbackText.textContent = "Incorrect. Continue.";
    button.classList.add("incorrect");
    if (state.quiz.consecutiveWrong >= 3) {
      state.quiz.consecutiveWrong = 0;
      openSnakeGame();
    }
  }

  optionsGrid.querySelectorAll(".option-btn").forEach((btn) => (btn.disabled = true));
  continueBtn.disabled = false;
  updateQuizStatus();
  renderQuestionNav();
}

function normalizeAnswerText(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function handleFillAnswer(input, submitBtn) {
  if (state.quiz.answered) return;
  const question = state.selectedReview.questions[state.quiz.index];
  const userAnswer = input.value.trim();
  if (!userAnswer) {
    feedbackText.textContent = "Enter an answer to continue.";
    return;
  }
  const isCorrect = normalizeAnswerText(userAnswer) === normalizeAnswerText(question.answer);
  state.quiz.answered = true;
  const response = state.quiz.responses[state.quiz.index];
  response.answered = true;
  response.correct = isCorrect;
  response.value = userAnswer;

  if (isCorrect) {
    state.quiz.score += 1;
    state.quiz.consecutiveWrong = 0;
    feedbackText.textContent = "Correct. Continue.";
  } else {
    state.quiz.consecutiveWrong += 1;
    feedbackText.textContent = "Incorrect. Continue.";
    if (state.quiz.consecutiveWrong >= 3) {
      state.quiz.consecutiveWrong = 0;
      openSnakeGame();
    }
  }

  input.disabled = true;
  submitBtn.disabled = true;
  continueBtn.disabled = false;
  updateQuizStatus();
  renderQuestionNav();
}

function startTimer() {
  if (!state.quiz || state.quiz.timerId) return;
  state.quiz.timerId = setInterval(() => {
    state.quiz.timeLeft -= 1;
    if (state.quiz.timeLeft <= 0) {
      state.quiz.timeLeft = 0;
      updateQuizStatus();
      endQuiz();
    } else {
      updateQuizStatus();
    }
  }, 1000);
}

function pauseTimer() {
  if (!state.quiz || !state.quiz.timerId) return;
  clearInterval(state.quiz.timerId);
  state.quiz.timerId = null;
  state.quiz.isPaused = true;
}

function resumeTimer() {
  if (!state.quiz || !state.quiz.isPaused) return;
  if (state.quiz.timeLeft <= 0) return;
  state.quiz.isPaused = false;
  startTimer();
}

function endQuiz() {
  if (state.quiz && state.quiz.timerId) {
    clearInterval(state.quiz.timerId);
  }
  closeSnakeGame(true);
  const total = state.selectedReview.questions.length;
  const score = state.quiz.score;
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);

  finalScore.textContent = `Final score: ${score} / ${total}`;
  finalPercent.textContent = `${percent}%`;

  if (percent < 60) {
    finalMessage.textContent = "You should review the key concepts and try again.";
  } else if (percent < 80) {
    finalMessage.textContent = "Good progress. Review what you missed and retry.";
  } else {
    finalMessage.textContent = "Excellent. You are ready for the assessment.";
  }

  showStudentView("resultsView");
  if (resultsSnakeCanvas) {
    requestAnimationFrame(() => {
      initResultsSnakeGame();
    });
  }
}

function goHomeFromQuiz() {
  if (state.quiz && state.quiz.timerId) {
    clearInterval(state.quiz.timerId);
  }
  closeSnakeGame(true);
  state.quiz = null;
  state.selectedReview = null;
  showStudentView("homeView");
}

function openAdminLogin() {
  adminLoginModal.classList.add("open");
  adminLoginModal.setAttribute("aria-hidden", "false");
  adminLoginError.textContent = "";
  adminPassword.value = "";
  if (adminLoginHint) {
    if (ADMIN_CONFIG_HASH) {
      adminLoginHint.textContent = "Enter the admin password to access the dashboard.";
    } else {
      const hasPassword = Boolean(getStoredAdminHash());
      adminLoginHint.textContent = hasPassword
        ? "Enter your admin password to access the dashboard."
        : "First time here? Set your admin password to unlock the dashboard.";
    }
  }
  adminPassword.focus();
}

function closeAdminLogin() {
  adminLoginModal.classList.remove("open");
  adminLoginModal.setAttribute("aria-hidden", "true");
}

function enterAdmin() {
  state.isAdmin = true;
  updateTeacherButton();
  renderAdminList();
  renderSimulatorAdminList();
  showAdminView("adminDashboard");
}

function exitAdmin() {
  state.isAdmin = false;
  updateTeacherButton();
  showStudentView("homeView");
}

function renderAdminList() {
  adminList.innerHTML = "";
  const sorted = [...state.reviews].sort((a, b) => a.course.localeCompare(b.course));

  sorted.forEach((review) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <div>
        <h3>${review.title}</h3>
        <div class="admin-meta">Course: ${review.course} · Questions: ${review.questions.length} · Time: ${formatTime(DEFAULT_QUIZ_SECONDS)}</div>
      </div>
      <div class="admin-actions">
        <button class="btn ghost" data-action="edit">Edit</button>
        <button class="btn ghost" data-action="duplicate">Duplicate</button>
        <button class="btn ghost" data-action="delete">Delete</button>
      </div>
    `;

    const [editBtn, duplicateBtn, deleteBtn] = row.querySelectorAll("button");
    editBtn.addEventListener("click", () => openEditor(review));
    duplicateBtn.addEventListener("click", () => duplicateReview(review));
    deleteBtn.addEventListener("click", () => deleteReview(review));

    adminList.appendChild(row);
  });
}

function renderSimulatorAdminList() {
  simulatorAdminList.innerHTML = "";

  if (state.simulators.length === 0) {
    simulatorAdminList.innerHTML = `
      <div class="admin-row">
        <div>
          <h3>No simulators yet</h3>
          <div class="admin-meta">Add your first simulator to share with students.</div>
        </div>
      </div>
    `;
    return;
  }

  state.simulators.forEach((sim) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <div>
        <h3>${sim.title}</h3>
        <div class="admin-meta">Link: ${sim.link}</div>
      </div>
      <div class="admin-actions">
        <button class="btn ghost" data-action="edit">Edit</button>
        <button class="btn ghost" data-action="delete">Delete</button>
      </div>
    `;

    const [editBtn, deleteBtn] = row.querySelectorAll("button");
    editBtn.addEventListener("click", () => openSimulatorEditor(sim));
    deleteBtn.addEventListener("click", () => deleteSimulator(sim));

    simulatorAdminList.appendChild(row);
  });
}

function openEditor(review = null) {
  parseErrors.classList.remove("show");
  parseErrors.textContent = "";

  if (review) {
    state.editingId = review.id;
    editorTitle.textContent = "Edit Review";
    setEditorMode("manual");
    editorModeInputs.forEach((input) => {
      input.disabled = true;
    });
    courseSelect.value = review.course;
    titleInput.value = review.title;
    questionsInput.value = review.questions
      .map((q) => {
        const lines = [`Q: ${q.questionText}`];
        if (q.type === "fill") {
          lines.push(`Answer: ${q.answer}`);
        } else {
          q.choices.forEach((choice, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const star = idx === q.correctIndex ? "*" : "";
            lines.push(`${letter}) ${choice}${star}`);
          });
        }
        return lines.join("\n");
      })
      .join("\n\n");
  } else {
    state.editingId = null;
    editorTitle.textContent = "Create New Review";
    setEditorMode("manual");
    editorModeInputs.forEach((input) => {
      input.disabled = false;
    });
    courseSelect.value = "Physics";
    titleInput.value = "";
    questionsInput.value = "";
    if (jsonTextInput) jsonTextInput.value = "";
    if (jsonFileInput) jsonFileInput.value = "";
  }

  showAdminView("adminEditor");
}

function openSimulatorEditor(simulator = null) {
  simErrors.classList.remove("show");
  simErrors.textContent = "";

  if (simulator) {
    state.editingSimulatorId = simulator.id;
    simulatorEditorTitle.textContent = "Edit Simulator";
    simTitleInput.value = simulator.title;
    simLinkInput.value = simulator.link;
  } else {
    state.editingSimulatorId = null;
    simulatorEditorTitle.textContent = "Add Simulator";
    simTitleInput.value = "";
    simLinkInput.value = "";
  }

  showAdminView("simulatorEditor");
}

function deleteReview(review) {
  const confirmed = window.confirm(`Delete "${review.title}"? This cannot be undone.`);
  if (!confirmed) return;
  state.reviews = state.reviews.filter((item) => item.id !== review.id);
  saveReviews();
  renderAdminList();
}

function deleteSimulator(sim) {
  const confirmed = window.confirm(`Delete "${sim.title}"? This cannot be undone.`);
  if (!confirmed) return;
  state.simulators = state.simulators.filter((item) => item.id !== sim.id);
  saveSimulators();
  renderSimulatorAdminList();
  renderSimulatorGrid();
}

function duplicateReview(review) {
  const newReview = {
    ...review,
    id: generateId(),
    title: `${review.title} (Copy)`
  };
  state.reviews.push(newReview);
  saveReviews();
  renderAdminList();
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `review-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function parseQuestions(rawText) {
  const cleaned = rawText.replace(/\r\n/g, "\n").trim();
  const errors = [];

  if (!cleaned) {
    return { questions: [], errors: ["Questions input cannot be empty."] };
  }

  const segments = cleaned.split(/(?=^Q\s*\d*\s*:)/gm).map((segment) => segment.trim()).filter(Boolean);
  const questions = [];

  segments.forEach((segment, idx) => {
    if (!/^Q\s*\d*\s*:/.test(segment)) {
      errors.push(`Question ${idx + 1}: Missing "Q:" at the start.`);
      return;
    }

    const lines = segment.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) {
      errors.push(`Question ${idx + 1}: Missing content.`);
      return;
    }

    let questionText = lines[0].replace(/^Q\s*\d*\s*:\s*/, "").trim();
    const options = {};
    let starCount = 0;
    let correctLetter = null;
    let optionsStarted = false;
    let answerLine = null;
    let answerCount = 0;

    for (let i = 1; i < lines.length; i += 1) {
      const line = lines[i];
      const answerMatch = line.match(/^Answer:\s*(.+)$/i);
      if (answerMatch) {
        answerCount += 1;
        if (answerCount > 1) {
          errors.push(`Question ${idx + 1}: Only one Answer: line is allowed.`);
          return;
        }
        answerLine = answerMatch[1].trim();
        continue;
      }
      const match = line.match(/^([A-D])\)\s*(.+)$/);
      if (match) {
        optionsStarted = true;
        const letter = match[1];
        if (options[letter]) {
          errors.push(`Question ${idx + 1}: Duplicate option ${letter}).`);
          return;
        }
        let text = match[2].trim();
        const stars = text.match(/\*/g);
        if (stars) {
          starCount += stars.length;
          correctLetter = letter;
          text = text.replace(/\*/g, "").trim();
        }
        options[letter] = text;
      } else if (!optionsStarted) {
        questionText += ` ${line}`;
      }
    }

    const letters = ["A", "B", "C", "D"];
    if (!questionText) {
      errors.push(`Question ${idx + 1}: Missing question text.`);
      return;
    }
    const hasOptions = Object.keys(options).length > 0;
    if (hasOptions) {
      if (answerLine !== null) {
        errors.push(`Question ${idx + 1}: Use either multiple choice options or Answer:, not both.`);
        return;
      }
      if (letters.some((letter) => !(letter in options)) || Object.keys(options).length !== 4) {
        errors.push(`Question ${idx + 1}: Must include exactly four options A) to D).`);
        return;
      }
      if (starCount !== 1 || !correctLetter) {
        errors.push(`Question ${idx + 1}: Mark exactly one correct option with *.`);
        return;
      }
      const choices = letters.map((letter) => options[letter]);
      const correctIndex = letters.indexOf(correctLetter);
      questions.push({ type: "mc", questionText, choices, correctIndex });
      return;
    }

    if (answerLine !== null) {
      const answer = answerLine.replace(/\*/g, "").trim();
      if (!answer) {
        errors.push(`Question ${idx + 1}: Answer cannot be empty.`);
        return;
      }
      questions.push({ type: "fill", questionText, answer });
      return;
    }

    errors.push(`Question ${idx + 1}: Provide four options A)-D) or an Answer: line.`);
  });

  if (questions.length === 0 && errors.length === 0) {
    errors.push("No questions detected. Make sure each question starts with Q:.");
  }

  if (questions.length > 100) {
    errors.push("Maximum 100 questions allowed per review.");
  }

  return { questions, errors };
}

function parseReviewJsonInput(rawText) {
  const errors = [];
  const trimmed = rawText.trim();
  if (!trimmed) {
    errors.push("Pega el JSON o sube un archivo.");
    return { reviews: [], errors };
  }

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    errors.push("El JSON no es válido. Verifica el formato.");
    return { reviews: [], errors };
  }

  const list = Array.isArray(parsed) ? parsed : [parsed];
  if (!validateImportedReviews(list)) {
    errors.push("El JSON no tiene el formato esperado para los repasos.");
    return { reviews: [], errors };
  }

  const reviews = list.map((review) => normalizeReview({
    ...review,
    id: review.id || generateId()
  }));

  return { reviews, errors };
}

function getEditorMode() {
  const checked = Array.from(editorModeInputs).find((input) => input.checked);
  return checked ? checked.value : "manual";
}

function setEditorMode(mode) {
  if (manualFields) {
    manualFields.classList.toggle("hidden", mode === "json");
  }
  if (jsonFields) {
    jsonFields.classList.toggle("hidden", mode !== "json");
  }
  editorModeInputs.forEach((input) => {
    input.checked = input.value === mode;
  });
  parseErrors.classList.remove("show");
  parseErrors.textContent = "";
}

function handleEditorSave(event) {
  event.preventDefault();
  const mode = getEditorMode();

  if (mode === "json") {
    const { reviews, errors } = parseReviewJsonInput(jsonTextInput ? jsonTextInput.value : "");
    if (errors.length > 0) {
      parseErrors.innerHTML = errors.map((err) => `<div>${err}</div>`).join("");
      parseErrors.classList.add("show");
      return;
    }
    reviews.forEach((review) => {
      state.reviews.push(review);
    });
    saveReviews();
    renderAdminList();
    showAdminView("adminDashboard");
    if (state.selectedCourse) {
      renderCourseCards();
    }
    if (jsonTextInput) jsonTextInput.value = "";
    if (jsonFileInput) jsonFileInput.value = "";
    return;
  }

  const title = titleInput.value.trim();

  const validationErrors = [];
  if (!title) validationErrors.push("Title is required.");

  const { questions, errors } = parseQuestions(questionsInput.value);
  validationErrors.push(...errors);

  if (validationErrors.length > 0) {
    parseErrors.innerHTML = validationErrors.map((err) => `<div>${err}</div>`).join("");
    parseErrors.classList.add("show");
    return;
  }

  const review = {
    id: state.editingId || generateId(),
    course: courseSelect.value,
    title,
    timeLimitSeconds: DEFAULT_QUIZ_SECONDS,
    questions
  };

  if (state.editingId) {
    state.reviews = state.reviews.map((item) => (item.id === state.editingId ? review : item));
  } else {
    state.reviews.push(review);
  }

  saveReviews();
  renderAdminList();
  showAdminView("adminDashboard");

  if (state.selectedCourse === review.course) {
    renderCourseCards();
  }
}

function handleJsonFileInput(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (jsonTextInput) {
      jsonTextInput.value = String(reader.result || "");
    }
  };
  reader.readAsText(file);
}

function handleSimulatorSave(event) {
  event.preventDefault();
  const title = simTitleInput.value.trim();
  const link = simLinkInput.value.trim();

  const errors = [];
  if (!title) errors.push("Title is required.");
  if (!link) errors.push("Simulator link is required.");

  if (errors.length > 0) {
    simErrors.innerHTML = errors.map((err) => `<div>${err}</div>`).join("");
    simErrors.classList.add("show");
    return;
  }

  const simulator = {
    id: state.editingSimulatorId || generateId(),
    title,
    link
  };

  if (state.editingSimulatorId) {
    state.simulators = state.simulators.map((item) => (item.id === state.editingSimulatorId ? simulator : item));
  } else {
    state.simulators.push(simulator);
  }

  saveSimulators();
  renderSimulatorAdminList();
  renderSimulatorGrid();
  showAdminView("adminDashboard");
}

function exportReviews() {
  const blob = new Blob([JSON.stringify(state.reviews, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mr-mercado-reviews-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportSimulators() {
  const blob = new Blob([JSON.stringify(state.simulators, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mr-mercado-simulators-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function validateImportedReviews(data) {
  if (!Array.isArray(data)) return false;
  const allowedCourses = ["Physics", "Chemistry"];

  for (const review of data) {
    if (!review || typeof review !== "object") return false;
    if (!allowedCourses.includes(review.course)) return false;
    if (typeof review.title !== "string") return false;
    if (!Array.isArray(review.questions)) return false;

    for (const question of review.questions) {
      if (!question || typeof question !== "object") return false;
      if (typeof question.questionText !== "string") return false;
      if (question.type === "fill" || typeof question.answer === "string") {
        if (typeof question.answer !== "string") return false;
      } else {
        if (!Array.isArray(question.choices) || question.choices.length !== 4) return false;
        if (!Number.isInteger(question.correctIndex)) return false;
        if (question.correctIndex < 0 || question.correctIndex > 3) return false;
      }
    }
  }

  return true;
}

function validateSimulators(data) {
  if (!Array.isArray(data)) return false;
  for (const sim of data) {
    if (!sim || typeof sim !== "object") return false;
    if (typeof sim.title !== "string" || !sim.title.trim()) return false;
    if (typeof sim.link !== "string" || !sim.link.trim()) return false;
  }
  return true;
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!validateImportedReviews(parsed)) {
        alert("Invalid review file. Please upload a valid JSON export.");
        return;
      }
      state.reviews = parsed.map((review) => normalizeReview({
        ...review,
        id: review.id || generateId()
      }));
      saveReviews();
      renderAdminList();
      alert("Reviews imported successfully.");
    } catch (error) {
      alert("Could not read the JSON file. Please check the format.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function handleImportSimulators(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!validateSimulators(parsed)) {
        alert("Invalid simulators file. Please upload a valid JSON export.");
        return;
      }
      state.simulators = parsed;
      saveSimulators();
      renderSimulatorAdminList();
      renderSimulatorGrid();
      alert("Simulators imported successfully.");
    } catch (error) {
      alert("Could not read the JSON file. Please check the format.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function resizeSnakeCanvas() {
  const rect = snakeCanvas.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  const dpr = window.devicePixelRatio || 1;
  snakeCanvas.width = size * dpr;
  snakeCanvas.height = size * dpr;
  snakeState.cellSize = snakeCanvas.width / snakeState.gridSize;
}

function initSnakeGame() {
  resizeSnakeCanvas();
  const startX = Math.floor(snakeState.gridSize / 2);
  const startY = Math.floor(snakeState.gridSize / 2);
  snakeState.snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY }
  ];
  snakeState.direction = { x: 0, y: 0 };
  snakeState.nextDirection = { x: 0, y: 0 };
  snakeState.score = 0;
  snakeState.isGameOver = false;
  snakeState.isRunning = false;
  snakeMessage.textContent = "Press an arrow key or tap the board to start.";
  snakeScore.textContent = "0";
  spawnFood();
  drawSnake();
}

function spawnFood() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * snakeState.gridSize),
      y: Math.floor(Math.random() * snakeState.gridSize)
    };
  } while (snakeState.snake.some((segment) => segment.x === position.x && segment.y === position.y));
  snakeState.food = position;
}

function startSnakeGame() {
  stopSnakeGame();
  snakeState.isRunning = true;
  snakeState.timerId = setInterval(tickSnake, 140);
}

function stopSnakeGame() {
  if (snakeState.timerId) {
    clearInterval(snakeState.timerId);
  }
  snakeState.timerId = null;
  snakeState.isRunning = false;
}

function tickSnake() {
  if (snakeState.isGameOver) return;
  if (snakeState.nextDirection.x === 0 && snakeState.nextDirection.y === 0) return;
  snakeState.direction = { ...snakeState.nextDirection };
  const head = snakeState.snake[0];
  const newHead = {
    x: head.x + snakeState.direction.x,
    y: head.y + snakeState.direction.y
  };

  if (
    newHead.x < 0 ||
    newHead.x >= snakeState.gridSize ||
    newHead.y < 0 ||
    newHead.y >= snakeState.gridSize ||
    snakeState.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
  ) {
    snakeState.isGameOver = true;
    snakeMessage.textContent = "Game over! Press restart to try again.";
    stopSnakeGame();
    return;
  }

  snakeState.snake.unshift(newHead);

  if (newHead.x === snakeState.food.x && newHead.y === snakeState.food.y) {
    snakeState.score += 1;
    snakeScore.textContent = String(snakeState.score);
    spawnFood();
  } else {
    snakeState.snake.pop();
  }

  drawSnake();
}

function drawSnake() {
  const ctx = snakeCanvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);

  ctx.fillStyle = "#fdf7ec";
  ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

  const cell = snakeState.cellSize;
  ctx.fillStyle = "rgba(31, 27, 22, 0.06)";
  for (let i = 0; i <= snakeState.gridSize; i += 1) {
    ctx.fillRect(i * cell, 0, 1, snakeCanvas.height);
    ctx.fillRect(0, i * cell, snakeCanvas.width, 1);
  }

  snakeState.snake.forEach((segment, idx) => {
    ctx.fillStyle = idx === 0 ? "#0f766e" : "#63b8af";
    ctx.fillRect(segment.x * cell + 1, segment.y * cell + 1, cell - 2, cell - 2);
  });

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.arc(
    snakeState.food.x * cell + cell / 2,
    snakeState.food.y * cell + cell / 2,
    Math.max(cell / 3, 4),
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function setSnakeDirection(direction) {
  if (!state.quiz || !snakeModal.classList.contains("open")) return;
  if (snakeState.isGameOver) return;
  const opposite =
    snakeState.direction.x === -direction.x &&
    snakeState.direction.y === -direction.y &&
    (snakeState.direction.x !== 0 || snakeState.direction.y !== 0);
  if (opposite) return;
  snakeState.nextDirection = direction;
  if (!snakeState.isRunning) {
    snakeMessage.textContent = "";
    startSnakeGame();
  }
}

function handleSnakeKey(event) {
  if (!snakeModal.classList.contains("open")) return;
  const key = event.key.toLowerCase();
  let direction = null;
  if (key === "arrowup" || key === "w") direction = { x: 0, y: -1 };
  if (key === "arrowdown" || key === "s") direction = { x: 0, y: 1 };
  if (key === "arrowleft" || key === "a") direction = { x: -1, y: 0 };
  if (key === "arrowright" || key === "d") direction = { x: 1, y: 0 };
  if (direction) {
    event.preventDefault();
    setSnakeDirection(direction);
  }
}

function handleSnakeTap(event) {
  if (!snakeModal.classList.contains("open")) return;
  const rect = snakeCanvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  if (Math.abs(dx) > Math.abs(dy)) {
    setSnakeDirection({ x: dx > 0 ? 1 : -1, y: 0 });
  } else {
    setSnakeDirection({ x: 0, y: dy > 0 ? 1 : -1 });
  }
}

function openSnakeGame() {
  if (snakeModal.classList.contains("open")) return;
  snakeModal.classList.add("open");
  snakeModal.setAttribute("aria-hidden", "false");
  pauseTimer();
  initSnakeGame();
}

function closeSnakeGame(silent = false) {
  if (!snakeModal.classList.contains("open")) return;
  snakeModal.classList.remove("open");
  snakeModal.setAttribute("aria-hidden", "true");
  stopSnakeGame();
  if (!silent) {
    resumeTimer();
  }
}

function isResultsViewActive() {
  return resultsView.classList.contains("is-active");
}

function resizeResultsSnakeCanvas() {
  if (!resultsSnakeCanvas) return;
  const rect = resultsSnakeCanvas.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  const dpr = window.devicePixelRatio || 1;
  resultsSnakeCanvas.width = size * dpr;
  resultsSnakeCanvas.height = size * dpr;
  resultsSnakeState.cellSize = resultsSnakeCanvas.width / resultsSnakeState.gridSize;
}

function spawnResultsSnakeFood() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * resultsSnakeState.gridSize),
      y: Math.floor(Math.random() * resultsSnakeState.gridSize)
    };
  } while (resultsSnakeState.snake.some((segment) => segment.x === position.x && segment.y === position.y));
  resultsSnakeState.food = position;
}

function drawResultsSnake() {
  if (!resultsSnakeCanvas) return;
  const ctx = resultsSnakeCanvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, resultsSnakeCanvas.width, resultsSnakeCanvas.height);
  ctx.fillStyle = "#fdf7ec";
  ctx.fillRect(0, 0, resultsSnakeCanvas.width, resultsSnakeCanvas.height);

  const cell = resultsSnakeState.cellSize;
  ctx.fillStyle = "rgba(31, 27, 22, 0.06)";
  for (let i = 0; i <= resultsSnakeState.gridSize; i += 1) {
    ctx.fillRect(i * cell, 0, 1, resultsSnakeCanvas.height);
    ctx.fillRect(0, i * cell, resultsSnakeCanvas.width, 1);
  }

  resultsSnakeState.snake.forEach((segment, idx) => {
    ctx.fillStyle = idx === 0 ? "#0f766e" : "#63b8af";
    ctx.fillRect(segment.x * cell + 1, segment.y * cell + 1, cell - 2, cell - 2);
  });

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.arc(
    resultsSnakeState.food.x * cell + cell / 2,
    resultsSnakeState.food.y * cell + cell / 2,
    Math.max(cell / 3, 4),
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function stopResultsSnakeGame() {
  if (resultsSnakeState.timerId) {
    clearInterval(resultsSnakeState.timerId);
  }
  resultsSnakeState.timerId = null;
  resultsSnakeState.isRunning = false;
}

function startResultsSnakeGame() {
  stopResultsSnakeGame();
  resultsSnakeState.isRunning = true;
  resultsSnakeState.timerId = setInterval(tickResultsSnake, 140);
}

function initResultsSnakeGame() {
  if (!resultsSnakeCanvas || !resultsSnakeScore || !resultsSnakeMessage) return;
  stopResultsSnakeGame();
  resizeResultsSnakeCanvas();
  const startX = Math.floor(resultsSnakeState.gridSize / 2);
  const startY = Math.floor(resultsSnakeState.gridSize / 2);
  resultsSnakeState.snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY }
  ];
  resultsSnakeState.direction = { x: 0, y: 0 };
  resultsSnakeState.nextDirection = { x: 0, y: 0 };
  resultsSnakeState.score = 0;
  resultsSnakeState.isGameOver = false;
  resultsSnakeScore.textContent = "0";
  resultsSnakeMessage.textContent = "Press an arrow key or tap the board to start.";
  spawnResultsSnakeFood();
  drawResultsSnake();
}

function tickResultsSnake() {
  if (!isResultsViewActive()) return;
  if (resultsSnakeState.isGameOver) return;
  if (resultsSnakeState.nextDirection.x === 0 && resultsSnakeState.nextDirection.y === 0) return;

  resultsSnakeState.direction = { ...resultsSnakeState.nextDirection };
  const head = resultsSnakeState.snake[0];
  const newHead = {
    x: head.x + resultsSnakeState.direction.x,
    y: head.y + resultsSnakeState.direction.y
  };

  if (
    newHead.x < 0 ||
    newHead.x >= resultsSnakeState.gridSize ||
    newHead.y < 0 ||
    newHead.y >= resultsSnakeState.gridSize ||
    resultsSnakeState.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
  ) {
    resultsSnakeState.isGameOver = true;
    resultsSnakeMessage.textContent = "Game over! Press restart to try again.";
    stopResultsSnakeGame();
    return;
  }

  resultsSnakeState.snake.unshift(newHead);

  if (newHead.x === resultsSnakeState.food.x && newHead.y === resultsSnakeState.food.y) {
    resultsSnakeState.score += 1;
    resultsSnakeScore.textContent = String(resultsSnakeState.score);
    spawnResultsSnakeFood();
  } else {
    resultsSnakeState.snake.pop();
  }

  drawResultsSnake();
}

function setResultsSnakeDirection(direction) {
  if (!isResultsViewActive()) return;
  if (resultsSnakeState.isGameOver) return;

  const opposite =
    resultsSnakeState.direction.x === -direction.x &&
    resultsSnakeState.direction.y === -direction.y &&
    (resultsSnakeState.direction.x !== 0 || resultsSnakeState.direction.y !== 0);
  if (opposite) return;

  resultsSnakeState.nextDirection = direction;
  if (!resultsSnakeState.isRunning) {
    resultsSnakeMessage.textContent = "";
    startResultsSnakeGame();
  }
}

function handleResultsSnakeKey(event) {
  if (!isResultsViewActive()) return;
  const key = event.key.toLowerCase();
  let direction = null;
  if (key === "arrowup" || key === "w") direction = { x: 0, y: -1 };
  if (key === "arrowdown" || key === "s") direction = { x: 0, y: 1 };
  if (key === "arrowleft" || key === "a") direction = { x: -1, y: 0 };
  if (key === "arrowright" || key === "d") direction = { x: 1, y: 0 };
  if (!direction) return;
  event.preventDefault();
  setResultsSnakeDirection(direction);
}

function handleResultsSnakeTap(event) {
  if (!isResultsViewActive() || !resultsSnakeCanvas) return;
  const rect = resultsSnakeCanvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  if (Math.abs(dx) > Math.abs(dy)) {
    setResultsSnakeDirection({ x: dx > 0 ? 1 : -1, y: 0 });
  } else {
    setResultsSnakeDirection({ x: 0, y: dy > 0 ? 1 : -1 });
  }
}

courseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedCourse = button.dataset.course;
    renderCourseCards();
    showStudentView("courseView");
  });
});

backHomeBtn.addEventListener("click", () => {
  showStudentView("homeView");
});

continueBtn.addEventListener("click", () => {
  if (!state.quiz || !state.selectedReview) return;
  if (!state.quiz.answered) return;
  if (allQuestionsAnswered()) {
    endQuiz();
    return;
  }
  state.quiz.index = getNextUnansweredIndex();
  renderQuestion();
});

homeBtnQuiz.addEventListener("click", () => {
  goHomeFromQuiz();
});

retryBtn.addEventListener("click", () => {
  if (state.selectedReview) {
    startQuiz(state.selectedReview.id);
  }
});

backTopicsBtn.addEventListener("click", () => {
  showStudentView("courseView");
});

teacherAdminBtn.addEventListener("click", () => {
  if (state.isAdmin) {
    exitAdmin();
  } else {
    openAdminLogin();
  }
});

adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = adminPassword.value.trim();
  if (!value) {
    adminLoginError.textContent = "Enter a password.";
    return;
  }

  const storedHash = getStoredAdminHash();
  const inputKey = await computePasswordKey(value);

  if (!storedHash) {
    setStoredAdminHash(inputKey);
    closeAdminLogin();
    enterAdmin();
    return;
  }

  if (storedHash === inputKey) {
    closeAdminLogin();
    enterAdmin();
  } else {
    adminLoginError.textContent = "Incorrect password.";
  }
});

adminCancelBtn.addEventListener("click", () => {
  closeAdminLogin();
});

createReviewBtn.addEventListener("click", () => openEditor());

createSimulatorBtn.addEventListener("click", () => openSimulatorEditor());

exportBtn.addEventListener("click", exportReviews);

importBtn.addEventListener("click", () => importInput.click());

importInput.addEventListener("change", handleImportFile);

exportSimBtn.addEventListener("click", exportSimulators);

importSimBtn.addEventListener("click", () => importSimInput.click());

importSimInput.addEventListener("change", handleImportSimulators);

editorForm.addEventListener("submit", handleEditorSave);

editorModeInputs.forEach((input) => {
  input.addEventListener("change", () => setEditorMode(input.value));
});

if (jsonFileInput) {
  jsonFileInput.addEventListener("change", handleJsonFileInput);
}

cancelEditorBtn.addEventListener("click", () => {
  showAdminView("adminDashboard");
});

simulatorForm.addEventListener("submit", handleSimulatorSave);

cancelSimulatorBtn.addEventListener("click", () => {
  showAdminView("adminDashboard");
});

clearLocalBtn.addEventListener("click", () => {
  const confirmed = window.confirm("Clear all reviews and simulators on this computer?");
  if (!confirmed) return;
  state.reviews = [];
  state.simulators = [];
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SIMULATOR_KEY);
  saveReviews();
  saveSimulators();
  renderAdminList();
  renderSimulatorAdminList();
  renderSimulatorGrid();
  if (state.selectedCourse) {
    renderCourseCards();
  }
  alert("Local data cleared on this computer.");
});

snakeRestartBtn.addEventListener("click", () => {
  initSnakeGame();
});

if (resultsSnakeRestartBtn) {
  resultsSnakeRestartBtn.addEventListener("click", () => {
    initResultsSnakeGame();
  });
}

closeSnakeBtn.addEventListener("click", () => {
  closeSnakeGame();
});

snakeControls.forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.dataset.dir;
    if (dir === "up") setSnakeDirection({ x: 0, y: -1 });
    if (dir === "down") setSnakeDirection({ x: 0, y: 1 });
    if (dir === "left") setSnakeDirection({ x: -1, y: 0 });
    if (dir === "right") setSnakeDirection({ x: 1, y: 0 });
  });
});

resultsSnakeControls.forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.dataset.dir;
    if (dir === "up") setResultsSnakeDirection({ x: 0, y: -1 });
    if (dir === "down") setResultsSnakeDirection({ x: 0, y: 1 });
    if (dir === "left") setResultsSnakeDirection({ x: -1, y: 0 });
    if (dir === "right") setResultsSnakeDirection({ x: 1, y: 0 });
  });
});

window.addEventListener("keydown", handleSnakeKey);
window.addEventListener("keydown", handleResultsSnakeKey);

snakeCanvas.addEventListener("click", handleSnakeTap);

snakeCanvas.addEventListener(
  "touchstart",
  (event) => {
    event.preventDefault();
    handleSnakeTap(event);
  },
  { passive: false }
);

if (resultsSnakeCanvas) {
  resultsSnakeCanvas.addEventListener("click", handleResultsSnakeTap);
  resultsSnakeCanvas.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      handleResultsSnakeTap(event);
    },
    { passive: false }
  );
}

window.addEventListener("resize", () => {
  if (snakeModal.classList.contains("open")) {
    resizeSnakeCanvas();
    drawSnake();
  }
  if (isResultsViewActive()) {
    resizeResultsSnakeCanvas();
    drawResultsSnake();
  }
});

async function initApp() {
  await loadReviews();
  await loadSimulators();
  renderSimulatorGrid();
  updateTeacherButton();
  showStudentView("homeView");
}

async function bootstrapApp() {
  await requireSiteAccess();
  await initApp();
}

bootstrapApp();
