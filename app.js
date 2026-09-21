'use strict';

const TOTAL_TASKS = 10;
const BEST_TIME_KEY = 'klammern-bruch:bestzeit-ms';
const CORRECT_DELAY_MS = 550;
const WRONG_DELAY_MS = 450;
const STREAK_THRESHOLD = 3;

const PRAISE_MESSAGES = [
  'Stark!',
  'Läuft bei dir!',
  'Sauber gerechnet!',
  'Nice!',
  'Genau richtig!',
  'Weiter so!',
  'Punktlandung!',
  'Bleib dran!',
  'Sitzt!',
  'Sehr gut!',
];

const screens = {
  start: document.getElementById('screen-start'),
  game: document.getElementById('screen-game'),
  error: document.getElementById('screen-error'),
  success: document.getElementById('screen-success'),
};

const progressEl = document.getElementById('progress');
const streakBadgeEl = document.getElementById('streak-badge');
const timerEl = document.getElementById('timer');
const taskBoxEl = document.querySelector('.task-box');
const instructionEl = document.getElementById('task-instruction');
const exprEl = document.getElementById('task-expr');
const inputAreaEl = document.getElementById('task-input-area');
const inlineMessageEl = document.getElementById('inline-message');
const praiseToastEl = document.getElementById('praise-toast');
const checkBtn = document.getElementById('btn-check');
const errorSolutionEl = document.getElementById('error-solution');
const finalTimeEl = document.getElementById('final-time');
const bestTimeNoteEl = document.getElementById('best-time-note');
const confettiContainerEl = document.getElementById('confetti-container');

let state = {
  tasks: [],
  currentIndex: 0,
  startTime: null,
  timerHandle: null,
  selection: null, // Set (multi) oder Zahl (choice) der ausgewählten Option(en)
};

function showScreen(name) {
  Object.values(screens).forEach((s) => (s.hidden = true));
  screens[name].hidden = false;
}

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function startTimer() {
  state.startTime = Date.now();
  stopTimer();
  state.timerHandle = setInterval(() => {
    timerEl.textContent = formatElapsed(Date.now() - state.startTime);
  }, 500);
  timerEl.textContent = '00:00';
}

function stopTimer() {
  if (state.timerHandle) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
}

function startGame() {
  state.tasks = generateTaskSet(TOTAL_TASKS);
  state.currentIndex = 0;
  confettiContainerEl.innerHTML = '';
  streakBadgeEl.hidden = true;
  showScreen('game');
  startTimer();
  renderTask();
}

function clearInlineMessage() {
  inlineMessageEl.hidden = true;
  inlineMessageEl.textContent = '';
}

function showInlineMessage(text) {
  inlineMessageEl.textContent = text;
  inlineMessageEl.hidden = false;
}

function clearPraiseToast() {
  praiseToastEl.hidden = true;
  praiseToastEl.textContent = '';
}

function showPraiseToast() {
  praiseToastEl.textContent = choice(PRAISE_MESSAGES);
  praiseToastEl.hidden = false;
}

function updateStreakBadge(streak) {
  if (streak >= STREAK_THRESHOLD) {
    streakBadgeEl.textContent = `🔥 Serie: ${streak}`;
    streakBadgeEl.hidden = false;
  }
}

function setControlsEnabled(enabled) {
  checkBtn.disabled = !enabled;
  inputAreaEl.classList.toggle('disabled', !enabled);
}

function renderTask() {
  clearInlineMessage();
  clearPraiseToast();
  setControlsEnabled(true);
  if (state.currentIndex === 0) streakBadgeEl.hidden = true;
  const task = state.tasks[state.currentIndex];
  state.selection = task.kind === 'multi' ? new Set() : null;

  progressEl.textContent = `Aufgabe ${state.currentIndex + 1} / ${TOTAL_TASKS}`;

  const lines = task.prompt.split('\n');
  instructionEl.textContent = lines[0];
  exprEl.textContent = lines.slice(1).join('\n');

  inputAreaEl.innerHTML = '';

  if (task.kind === 'input') {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'answer-input';
    input.id = 'answer-input';
    input.autocomplete = 'off';
    input.placeholder = 'Antwort eingeben';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkAnswer();
    });
    const hint = document.createElement('p');
    hint.className = 'answer-hint';
    hint.textContent = 'Ganze Zahl, Dezimalzahl (z. B. 3,5) oder Bruch (z. B. 3/4) eingeben.';
    inputAreaEl.appendChild(input);
    inputAreaEl.appendChild(hint);
    input.focus();
  } else {
    const container = document.createElement('div');
    container.className = 'options';
    task.options.forEach((opt, idx) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'option-tile';
      tile.textContent = opt.label;
      tile.dataset.index = String(idx);
      tile.addEventListener('click', () => toggleOption(task, idx, tile));
      container.appendChild(tile);
    });
    inputAreaEl.appendChild(container);
    if (task.kind === 'multi') {
      const hint = document.createElement('p');
      hint.className = 'answer-hint';
      hint.textContent = 'Wähle alle passenden Ausdrücke aus (auch mehrere möglich).';
      inputAreaEl.appendChild(hint);
    }
  }
}

function toggleOption(task, idx, tile) {
  if (task.kind === 'multi') {
    if (state.selection.has(idx)) {
      state.selection.delete(idx);
      tile.classList.remove('selected');
    } else {
      state.selection.add(idx);
      tile.classList.add('selected');
    }
  } else {
    state.selection = idx;
    inputAreaEl.querySelectorAll('.option-tile').forEach((t) => t.classList.remove('selected'));
    tile.classList.add('selected');
  }
}

function checkAnswer() {
  clearInlineMessage();
  const task = state.tasks[state.currentIndex];

  if (task.kind === 'input') {
    const input = document.getElementById('answer-input');
    let userFraction;
    try {
      userFraction = parseAnswer(input.value);
    } catch (err) {
      showInlineMessage(err.message);
      return;
    }
    handleResult(userFraction.equals(task.answer), task, formatFraction(task.answer));
  } else if (task.kind === 'choice') {
    if (state.selection === null) {
      showInlineMessage('Bitte eine Antwort auswählen.');
      return;
    }
    const correct = task.options[state.selection].correct;
    const correctLabels = task.options.filter((o) => o.correct).map((o) => o.label).join(', ');
    handleResult(correct, task, correctLabels);
  } else if (task.kind === 'multi') {
    if (state.selection.size === 0) {
      showInlineMessage('Bitte mindestens eine Antwort auswählen.');
      return;
    }
    const correctIdx = new Set(
      task.options.map((o, i) => (o.correct ? i : null)).filter((i) => i !== null)
    );
    const isCorrect =
      correctIdx.size === state.selection.size &&
      [...correctIdx].every((i) => state.selection.has(i));
    const correctLabels = task.options.filter((o) => o.correct).map((o) => o.label).join(', ');
    handleResult(isCorrect, task, correctLabels);
  }
}

function handleResult(isCorrect, task, correctText) {
  setControlsEnabled(false);
  if (isCorrect) {
    const streak = state.currentIndex + 1;
    taskBoxEl.classList.add('flash-correct');
    showPraiseToast();
    updateStreakBadge(streak);
    setTimeout(() => {
      taskBoxEl.classList.remove('flash-correct');
      if (streak >= TOTAL_TASKS) {
        finishGame();
      } else {
        state.currentIndex++;
        renderTask();
      }
    }, CORRECT_DELAY_MS);
  } else {
    taskBoxEl.classList.add('flash-wrong');
    setTimeout(() => {
      taskBoxEl.classList.remove('flash-wrong');
      gameOver(task, correctText);
    }, WRONG_DELAY_MS);
  }
}

function gameOver(task, correctText) {
  stopTimer();
  let text = `Richtige Lösung: ${correctText}`;
  if (task.hint) text += `\n\n${task.hint}`;
  errorSolutionEl.textContent = text;
  showScreen('error');
}

function getBestTime() {
  try {
    const raw = localStorage.getItem(BEST_TIME_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch (err) {
    return null;
  }
}

function setBestTime(ms) {
  try {
    localStorage.setItem(BEST_TIME_KEY, String(ms));
  } catch (err) {
    // localStorage nicht verfügbar (z. B. privater Modus) – Feature entfällt einfach.
  }
}

function spawnConfetti() {
  const colors = ['#3457d5', '#1e8e5a', '#f5b700', '#e0457b'];
  confettiContainerEl.innerHTML = '';
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.animationDuration = `${2 + Math.random()}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainerEl.appendChild(piece);
  }
  setTimeout(() => {
    confettiContainerEl.innerHTML = '';
  }, 3500);
}

function finishGame() {
  const elapsed = Date.now() - state.startTime;
  stopTimer();
  finalTimeEl.textContent = formatElapsed(elapsed);

  const bestTime = getBestTime();
  if (bestTime === null || elapsed < bestTime) {
    setBestTime(elapsed);
    bestTimeNoteEl.textContent = '🏆 Neue Bestzeit!';
    bestTimeNoteEl.className = 'best-time-note best-time-note--record';
  } else {
    bestTimeNoteEl.textContent = `Bestzeit: ${formatElapsed(bestTime)}`;
    bestTimeNoteEl.className = 'best-time-note';
  }

  showScreen('success');
  spawnConfetti();
}

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-check').addEventListener('click', checkAnswer);
document.getElementById('btn-restart').addEventListener('click', startGame);
document.getElementById('btn-again').addEventListener('click', startGame);

showScreen('start');
