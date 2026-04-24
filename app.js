(() => {
  "use strict";

  const MAX_HEALTH = 7;
  const TILE_VALUES = Array.from({ length: 10 }, (_, i) => i + 1);
  const gameShell = document.getElementById("gameShell");
  const canvas = document.getElementById("oceanCanvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    modeToggle: document.getElementById("modeToggle"),
    mismatchToggle: document.getElementById("mismatchToggle"),
    pauseOverlay: document.getElementById("pauseOverlay"),
    teacherMessage: document.getElementById("teacherMessage"),
    nextEquationBtn: document.getElementById("nextEquationBtn"),
    showAnswerBtn: document.getElementById("showAnswerBtn"),
    nextBattleBtn: document.getElementById("nextBattleBtn"),
    pauseBtn: document.getElementById("pauseBtn"),
    resumeBtn: document.getElementById("resumeBtn"),
    endGameBtn: document.getElementById("endGameBtn"),
    muteBtn: document.getElementById("muteBtn"),
    redScore: document.getElementById("redScore"),
    blueScore: document.getElementById("blueScore"),
    redCorrect: document.getElementById("redCorrect"),
    blueCorrect: document.getElementById("blueCorrect"),
    redBattles: document.getElementById("redBattles"),
    blueBattles: document.getElementById("blueBattles"),
    redHealth: document.getElementById("redHealth"),
    blueHealth: document.getElementById("blueHealth"),
    redEquation: document.getElementById("equationRed"),
    blueEquation: document.getElementById("equationBlue"),
    redTiles: document.getElementById("tilesRed"),
    blueTiles: document.getElementById("tilesBlue"),
    redFeedback: document.getElementById("feedbackRed"),
    blueFeedback: document.getElementById("feedbackBlue"),
    shipRed: document.getElementById("shipRed"),
    shipBlue: document.getElementById("shipBlue")
  };

  const state = {
    mode: "same",
    paused: false,
    muted: false,
    roundFrozen: false,
    showMismatch: true,
    selectedTapTile: { red: null, blue: null },
    usedEquationIds: [],
    teams: {
      red: { key: "red", score: 0, correct: 0, battleWins: 0, health: MAX_HEALTH, equation: null, slots: [] },
      blue: { key: "blue", score: 0, correct: 0, battleWins: 0, health: MAX_HEALTH, equation: null, slots: [] }
    }
  };

  const audio = {
    ctx: null,
    init() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    tone(freq, duration, type = "sine", gain = 0.12) {
      if (state.muted) return;
      this.init();
      const oscillator = this.ctx.createOscillator();
      const volume = this.ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = freq;
      volume.gain.value = gain;
      oscillator.connect(volume);
      volume.connect(this.ctx.destination);
      oscillator.start();
      oscillator.stop(this.ctx.currentTime + duration);
    },
    cannon() { this.tone(140, 0.12, "sawtooth", 0.25); setTimeout(() => this.tone(90, 0.2, "square", 0.15), 40); },
    impact() { this.tone(280, 0.1, "triangle", 0.18); },
    sink() { this.tone(70, 0.6, "sawtooth", 0.2); },
    click() { this.tone(600, 0.05, "triangle", 0.08); }
  };

  function randomEquation(excludeIds = []) {
    const pool = window.EQUATION_BANK.filter((eq) => !excludeIds.includes(eq.id));
    if (!pool.length) {
      state.usedEquationIds = [];
      return window.EQUATION_BANK[Math.floor(Math.random() * window.EQUATION_BANK.length)];
    }
    const eq = pool[Math.floor(Math.random() * pool.length)];
    state.usedEquationIds.push(eq.id);
    if (state.usedEquationIds.length > 80) state.usedEquationIds.shift();
    return eq;
  }

  function assignEquations() {
    if (state.mode === "same") {
      const eq = randomEquation(state.usedEquationIds);
      setTeamEquation("red", eq);
      setTeamEquation("blue", eq);
    } else {
      const redEq = randomEquation(state.usedEquationIds);
      const blueEq = randomEquation([...state.usedEquationIds, redEq.id]);
      setTeamEquation("red", redEq);
      setTeamEquation("blue", blueEq);
    }
    announce("New equations loaded. Crews ready your cannons!");
  }

  function setTeamEquation(teamKey, equation) {
    const team = state.teams[teamKey];
    team.equation = equation;
    team.slots = Array(equation.reactants.length + equation.products.length).fill(null);
    renderEquation(teamKey);
    renderFeedback(teamKey, "", "");
  }

  function renderEquation(teamKey) {
    const team = state.teams[teamKey];
    const host = teamKey === "red" ? ui.redEquation : ui.blueEquation;
    host.innerHTML = "";
    const compounds = [...team.equation.reactants, "->", ...team.equation.products];

    let slotIndex = 0;
    compounds.forEach((token, index) => {
      if (token === "->") {
        const arrow = document.createElement("span");
        arrow.textContent = "→";
        host.appendChild(arrow);
        return;
      }

      const slot = document.createElement("button");
      slot.className = `coeff-slot ${team.slots[slotIndex] ? "filled" : ""}`;
      slot.dataset.team = teamKey;
      slot.dataset.slot = String(slotIndex);
      slot.textContent = team.slots[slotIndex] || "□";
      slot.addEventListener("click", () => handleSlotTap(teamKey, slotIndex));
      slot.addEventListener("dragover", (e) => e.preventDefault());
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        const value = Number(e.dataTransfer.getData("text/plain"));
        placeValue(teamKey, slotIndex, value);
      });

      const formula = document.createElement("span");
      formula.className = "formula";
      formula.innerHTML = token.replace(/(\d+)/g, "<sub>$1</sub>");

      host.appendChild(slot);
      host.appendChild(formula);

      const plusNeeded = index !== compounds.length - 1 && compounds[index + 1] !== "->";
      if (plusNeeded) {
        const plus = document.createElement("span");
        plus.textContent = "+";
        host.appendChild(plus);
      }
      slotIndex += 1;
    });
  }

  function renderTiles(teamKey) {
    const container = teamKey === "red" ? ui.redTiles : ui.blueTiles;
    container.innerHTML = "";
    TILE_VALUES.forEach((value) => {
      const tile = document.createElement("button");
      tile.className = "coeff-tile";
      tile.textContent = String(value);
      tile.draggable = true;
      tile.dataset.value = String(value);
      tile.dataset.team = teamKey;
      tile.addEventListener("click", () => selectTapTile(teamKey, value, tile));
      tile.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", String(value));
      });
      enablePointerDrag(tile, teamKey, value);
      container.appendChild(tile);
    });
  }

  function selectTapTile(teamKey, value, tileEl) {
    state.selectedTapTile[teamKey] = value;
    const allTiles = (teamKey === "red" ? ui.redTiles : ui.blueTiles).querySelectorAll(".coeff-tile");
    allTiles.forEach((tile) => tile.classList.toggle("selected", tile === tileEl));
    audio.click();
  }

  function handleSlotTap(teamKey, slotIndex) {
    const selected = state.selectedTapTile[teamKey];
    if (!selected || state.paused || state.roundFrozen) return;
    placeValue(teamKey, slotIndex, selected);
  }

  function placeValue(teamKey, slotIndex, value) {
    if (!value || state.paused || state.roundFrozen) return;
    const team = state.teams[teamKey];
    team.slots[slotIndex] = value;
    renderEquation(teamKey);
    audio.click();
  }

  function clearTeam(teamKey) {
    const team = state.teams[teamKey];
    team.slots.fill(null);
    renderEquation(teamKey);
    renderFeedback(teamKey, "", "");
  }

  function compareCounts(team) {
    const counts = tallyAtoms(team.equation, team.slots);
    const allElements = new Set([...Object.keys(counts.left), ...Object.keys(counts.right)]);
    const mismatches = [];
    for (const element of allElements) {
      const l = counts.left[element] || 0;
      const r = counts.right[element] || 0;
      if (l !== r) mismatches.push(`${element}: ${l} vs ${r}`);
    }
    return mismatches;
  }

  function tallyAtoms(equation, coefficients) {
    const left = {};
    const right = {};
    equation.reactants.forEach((formula, i) => applyFormula(left, formula, coefficients[i] || 0));
    equation.products.forEach((formula, i) => {
      const idx = equation.reactants.length + i;
      applyFormula(right, formula, coefficients[idx] || 0);
    });
    return { left, right };
  }

  function applyFormula(bucket, formula, factor) {
    const parsed = window.parseFormulaCounts(formula);
    Object.entries(parsed).forEach(([element, count]) => {
      bucket[element] = (bucket[element] || 0) + count * factor;
    });
  }

  function checkTeam(teamKey) {
    if (state.paused || state.roundFrozen) return;
    const team = state.teams[teamKey];
    if (team.slots.some((slot) => slot === null)) {
      renderFeedback(teamKey, "Fill every coefficient slot first.", "bad");
      return;
    }

    const expected = team.equation.correctCoefficients;
    const isExact = team.slots.length === expected.length && team.slots.every((v, i) => v === expected[i]);
    if (isExact) {
      team.score += 10;
      team.correct += 1;
      const enemyKey = teamKey === "red" ? "blue" : "red";
      damageEnemy(enemyKey, teamKey);
      renderFeedback(teamKey, "Direct Hit! Balanced! +10 Points", "good");
      updateScoreboard();
      fireCannon(teamKey, enemyKey);
      return;
    }

    const mismatches = compareCounts(team);
    let message = "Not balanced yet.";
    if (state.showMismatch && mismatches.length) {
      message += ` Mismatch: ${mismatches.slice(0, 6).join(" | ")}`;
      flashSlots(teamKey);
    }
    renderFeedback(teamKey, message, "bad");
  }

  function flashSlots(teamKey) {
    const slots = (teamKey === "red" ? ui.redEquation : ui.blueEquation).querySelectorAll(".coeff-slot");
    slots.forEach((slot) => {
      slot.classList.remove("hint-wrong");
      requestAnimationFrame(() => slot.classList.add("hint-wrong"));
    });
  }

  function damageEnemy(enemyKey, attackerKey) {
    const enemy = state.teams[enemyKey];
    enemy.health = Math.max(0, enemy.health - 1);
    updateHealthBars();
    if (enemy.health === 0) {
      state.roundFrozen = true;
      state.teams[attackerKey].battleWins += 1;
      updateScoreboard();
      sinkShip(enemyKey);
      announce(`${attackerKey.toUpperCase()} wins the battle! Press Start Next Battle to continue.`);
    }
  }

  function sinkShip(teamKey) {
    const ship = teamKey === "red" ? ui.shipRed : ui.shipBlue;
    ship.classList.add("sinking");
    audio.sink();
  }

  function startNextBattle() {
    state.teams.red.health = MAX_HEALTH;
    state.teams.blue.health = MAX_HEALTH;
    state.roundFrozen = false;
    ui.shipRed.classList.remove("sinking");
    ui.shipBlue.classList.remove("sinking");
    assignEquations();
    updateHealthBars();
    announce("Next battle started. Ship hulls restored.");
  }

  function showAnswer() {
    ["red", "blue"].forEach((teamKey) => {
      const team = state.teams[teamKey];
      team.slots = [...team.equation.correctCoefficients];
      renderEquation(teamKey);
      renderFeedback(teamKey, "Answer revealed by teacher.", "good");
    });
  }

  function endGame() {
    state.paused = true;
    ui.pauseOverlay.classList.remove("hidden");
    const winner = state.teams.red.score === state.teams.blue.score
      ? "Tie session"
      : state.teams.red.score > state.teams.blue.score
        ? "Red Team leads"
        : "Blue Team leads";
    announce(`Session ended by teacher. ${winner}.`);
  }

  function updateScoreboard() {
    ui.redScore.textContent = String(state.teams.red.score);
    ui.blueScore.textContent = String(state.teams.blue.score);
    ui.redCorrect.textContent = String(state.teams.red.correct);
    ui.blueCorrect.textContent = String(state.teams.blue.correct);
    ui.redBattles.textContent = String(state.teams.red.battleWins);
    ui.blueBattles.textContent = String(state.teams.blue.battleWins);
  }

  function updateHealthBars() {
    renderHealth(ui.redHealth, state.teams.red.health, "red");
    renderHealth(ui.blueHealth, state.teams.blue.health, "blue");
  }

  function renderHealth(container, health, teamKey) {
    container.innerHTML = "";
    for (let i = 0; i < MAX_HEALTH; i += 1) {
      const segment = document.createElement("div");
      segment.className = `segment ${i < health ? "active" : ""}`;
      container.appendChild(segment);
    }
    container.closest(".team-banner").classList.toggle(teamKey, true);
  }

  function renderFeedback(teamKey, text, type) {
    const el = teamKey === "red" ? ui.redFeedback : ui.blueFeedback;
    el.textContent = text;
    el.classList.remove("good", "bad");
    if (type) el.classList.add(type);
  }

  function announce(message) {
    ui.teacherMessage.textContent = message;
  }

  function fireCannon(attackerKey, defenderKey) {
    const attackerShip = attackerKey === "red" ? ui.shipRed : ui.shipBlue;
    const defenderShip = defenderKey === "red" ? ui.shipRed : ui.shipBlue;
    attackerShip.classList.add("firing");
    setTimeout(() => attackerShip.classList.remove("firing"), 620);

    const shell = document.createElement("div");
    shell.className = "cannon-ball";
    gameShell.appendChild(shell);

    const aRect = attackerShip.getBoundingClientRect();
    const dRect = defenderShip.getBoundingClientRect();
    const gRect = gameShell.getBoundingClientRect();

    const startX = attackerKey === "red" ? aRect.right - gRect.left : aRect.left - gRect.left;
    const startY = aRect.top - gRect.top + aRect.height * 0.35;
    const endX = defenderKey === "red" ? dRect.right - gRect.left : dRect.left - gRect.left;
    const endY = dRect.top - gRect.top + dRect.height * 0.4;

    const duration = 520;
    const start = performance.now();
    audio.cannon();

    const animate = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const x = startX + (endX - startX) * t;
      const arc = Math.sin(Math.PI * t) * 90;
      const y = startY + (endY - startY) * t - arc;
      shell.style.transform = `translate(${x}px, ${y}px)`;
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        shell.remove();
        impactAt(endX, endY);
      }
    };
    requestAnimationFrame(animate);
  }

  function impactAt(x, y) {
    const flash = document.createElement("div");
    flash.className = "impact-flash";
    flash.style.left = `${x - 36}px`;
    flash.style.top = `${y - 36}px`;
    gameShell.appendChild(flash);
    audio.impact();
    setTimeout(() => flash.remove(), 500);
  }

  function setupTeamButtons() {
    document.querySelectorAll(".action-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const { action, team } = btn.dataset;
        audio.click();
        if (action === "check") checkTeam(team);
        if (action === "clear") clearTeam(team);
      });
    });
  }

  function enablePointerDrag(tile, teamKey, value) {
    tile.addEventListener("pointerdown", (event) => {
      if (state.paused || state.roundFrozen) return;
      const ghost = tile.cloneNode(true);
      ghost.style.position = "fixed";
      ghost.style.pointerEvents = "none";
      ghost.style.zIndex = "100";
      ghost.style.width = `${tile.offsetWidth}px`;
      document.body.appendChild(ghost);

      const move = (clientX, clientY) => {
        ghost.style.left = `${clientX - tile.offsetWidth / 2}px`;
        ghost.style.top = `${clientY - tile.offsetHeight / 2}px`;
      };
      move(event.clientX, event.clientY);

      const onMove = (e) => move(e.clientX, e.clientY);
      const onUp = (e) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target && target.classList.contains("coeff-slot") && target.dataset.team === teamKey) {
          placeValue(teamKey, Number(target.dataset.slot), value);
        }
        ghost.remove();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    });
  }

  function bindTeacherControls() {
    ui.modeToggle.addEventListener("change", () => {
      state.mode = ui.modeToggle.value;
      assignEquations();
      audio.click();
    });

    ui.mismatchToggle.addEventListener("change", () => {
      state.showMismatch = ui.mismatchToggle.checked;
    });

    ui.nextEquationBtn.addEventListener("click", () => {
      if (state.roundFrozen) {
        announce("Finish battle flow first, then start next equation.");
        return;
      }
      assignEquations();
      audio.click();
    });

    ui.showAnswerBtn.addEventListener("click", () => {
      showAnswer();
      audio.click();
    });

    ui.nextBattleBtn.addEventListener("click", () => {
      startNextBattle();
      audio.click();
    });

    ui.pauseBtn.addEventListener("click", () => {
      state.paused = true;
      ui.pauseOverlay.classList.remove("hidden");
      announce("Game paused by teacher.");
      audio.click();
    });

    ui.resumeBtn.addEventListener("click", () => {
      state.paused = false;
      ui.pauseOverlay.classList.add("hidden");
      announce("Game resumed.");
      audio.click();
    });

    ui.endGameBtn.addEventListener("click", () => {
      endGame();
      audio.click();
    });

    ui.muteBtn.addEventListener("click", () => {
      state.muted = !state.muted;
      ui.muteBtn.textContent = `Mute: ${state.muted ? "On" : "Off"}`;
      audio.click();
    });
  }

  function animateOcean() {
    const w = canvas.width;
    const h = canvas.height;
    const t = performance.now() * 0.001;
    ctx.clearRect(0, 0, w, h);

    const horizon = h * 0.42;
    const gradient = ctx.createLinearGradient(0, horizon, 0, h);
    gradient.addColorStop(0, "rgba(76, 173, 230, 0.25)");
    gradient.addColorStop(1, "rgba(9, 43, 84, 0.6)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, horizon, w, h - horizon);

    for (let layer = 0; layer < 3; layer += 1) {
      ctx.beginPath();
      const amp = 8 + layer * 5;
      const speed = 0.8 + layer * 0.35;
      const yBase = horizon + 120 + layer * 62;
      for (let x = 0; x <= w; x += 8) {
        const y = yBase + Math.sin((x * 0.01) + t * speed) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2 + layer;
      ctx.strokeStyle = `rgba(196,236,255,${0.22 - layer * 0.04})`;
      ctx.stroke();
    }

    for (let i = 0; i < 24; i += 1) {
      const sparkleX = (i * 233 + (t * 60) % w) % w;
      const sparkleY = horizon + 20 + (i % 8) * 22 + Math.sin(t + i) * 5;
      ctx.fillStyle = `rgba(255,255,255,${0.08 + (i % 3) * 0.04})`;
      ctx.fillRect(sparkleX, sparkleY, 10, 1.5);
    }

    requestAnimationFrame(animateOcean);
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function init() {
    if (!Array.isArray(window.EQUATION_BANK) || window.EQUATION_BANK.length < 100) {
      announce("Equation bank failed to load.");
      return;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    renderTiles("red");
    renderTiles("blue");
    setupTeamButtons();
    bindTeacherControls();
    assignEquations();
    updateScoreboard();
    updateHealthBars();
    animateOcean();
  }

  init();
})();
