(function () {
  "use strict";

  const MAX_MISSES = 6;
  // Order in which gear flips to Hawkeye gear (one per miss). The corncob hat goes last.
  const GEAR = [
    { id: "shoes",    husker: "Red sneakers",        hawk: "Black & gold sneakers" },
    { id: "bag",      husker: "Clear bag",           hawk: "Hawkeye clear bag" },
    { id: "overalls", husker: "Striped overalls",    hawk: "Black & gold overalls" },
    { id: "shirt",    husker: "Red T-shirt",         hawk: "Black T-shirt" },
    { id: "paint",    husker: "Face paint",          hawk: "Hawkeye face paint" },
    { id: "hat",      husker: "Corncob hat",         hawk: "Hawkeye beanie" },
  ];
  const MOUTHS = {
    happy:   "M143 220 Q150 226 157 220",
    flat:    "M144 222 L156 222",
    worried: "M143 224 Q150 218 157 224",
    grin:    "M142 219 Q150 230 158 219 Z",
    shock:   "M147 222 a3 3.5 0 1 0 6 0 a3 3.5 0 1 0 -6 0",
  };

  const $ = (id) => document.getElementById(id);
  const words = window.HANGMAN_WORDS || [];

  // Strip accents so "Día" is guessed with D-I-A.
  const plain = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
  const isLetter = (ch) => /[A-Z]/.test(plain(ch));

  let state = null;
  let bag = [];

  // ---------- storage (optional) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
  let stats = store.get("huskerHangmanStats", { wins: 0, losses: 0, streak: 0 });

  // ---------- setup ----------
  function buildCategories() {
    const sel = $("categorySelect");
    [...new Set(words.map((w) => w.category))].forEach((c) => {
      const o = document.createElement("option");
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });
    sel.value = store.get("huskerHangmanCategory", "all");
    if (!sel.value) sel.value = "all";
    sel.addEventListener("change", () => {
      store.set("huskerHangmanCategory", sel.value);
      bag = [];
      newGame();
    });
  }

  function buildKeyboard() {
    const kb = $("keyboard");
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((L) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "key";
      b.textContent = L;
      b.dataset.letter = L;
      b.setAttribute("aria-label", "Guess " + L);
      b.addEventListener("click", () => guess(L));
      kb.appendChild(b);
    });
  }

  function buildGearList() {
    $("gearList").innerHTML = GEAR.map(
      (g) => `<li data-for="${g.id}"><span class="dot"></span><span class="name">${g.husker}</span></li>`
    ).join("");
  }

  function pickWord() {
    const cat = $("categorySelect").value;
    const pool = words.map((w, i) => i).filter((i) => cat === "all" || words[i].category === cat);
    if (!bag.length) {
      bag = pool.slice();
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // avoid repeating the last word right after a reshuffle
      if (state && bag.length > 1 && words[bag[bag.length - 1]] === state.entry) bag.unshift(bag.pop());
    }
    return words[bag.pop()];
  }

  // ---------- game ----------
  function newGame() {
    const entry = pickWord();
    state = {
      entry,
      letters: new Set(plain(entry.answer).replace(/[^A-Z]/g, "").split("")),
      guessed: new Set(),
      misses: [],
      over: false,
    };

    $("categoryTag").textContent = entry.category;
    $("hint").textContent = entry.hint;
    $("hint").classList.add("hidden");
    $("hintBtn").classList.remove("hidden");
    $("result").classList.add("hidden");
    $("result").classList.remove("lost");

    document.querySelectorAll(".key").forEach((k) => {
      k.disabled = false;
      k.classList.remove("hit", "miss");
    });

    // reset figure
    document.querySelectorAll("[data-gear]").forEach((g) => g.classList.remove("swapped"));
    buildGearList();
    $("balloon").classList.remove("hidden");
    $("burst").classList.add("hidden");
    $("floater").classList.remove("still");
    $("fan").classList.remove("fallen", "cheer");
    $("eyes").classList.remove("hidden");
    $("xeyes").classList.add("hidden");

    render();
  }

  function guess(L) {
    if (!state || state.over || state.guessed.has(L)) return;
    state.guessed.add(L);
    const key = document.querySelector(`.key[data-letter="${L}"]`);
    key.disabled = true;

    if (state.letters.has(L)) {
      key.classList.add("hit");
    } else {
      key.classList.add("miss");
      state.misses.push(L);
      const g = GEAR[state.misses.length - 1];
      document.querySelector(`[data-gear="${g.id}"]`).classList.add("swapped");
      const li = document.querySelector(`#gearList li[data-for="${g.id}"]`);
      li.classList.add("swapped");
      li.querySelector(".name").textContent = g.hawk;
    }

    const solved = [...state.letters].every((x) => state.guessed.has(x));
    if (solved) finish(true);
    else if (state.misses.length >= MAX_MISSES) finish(false);
    render();
  }

  function finish(won) {
    state.over = true;
    document.querySelectorAll(".key").forEach((k) => (k.disabled = true));
    const answer = state.entry.answer;

    if (won) {
      stats.wins++; stats.streak++;
      $("resultTitle").textContent = "Go Big Red!";
      $("resultText").textContent = `You saved the fan. The answer was “${answer}.”`;
      $("fan").classList.add("cheer");
    } else {
      stats.losses++; stats.streak = 0;
      $("resultTitle").textContent = "Pop! The Hawkeyes got him.";
      $("resultText").textContent = `The answer was “${answer}.” ${state.entry.hint}.`;
      $("result").classList.add("lost");
      $("balloon").classList.add("hidden");
      $("burst").classList.remove("hidden");
      $("floater").classList.add("still");
      $("eyes").classList.add("hidden");
      $("xeyes").classList.remove("hidden");
      requestAnimationFrame(() => $("fan").classList.add("fallen"));
    }
    store.set("huskerHangmanStats", stats);
    $("result").classList.remove("hidden");
    $("hintBtn").classList.add("hidden");
  }

  function render() {
    // phrase tiles, grouped by word so lines wrap between words
    const phrase = $("phrase");
    phrase.innerHTML = "";
    state.entry.answer.split(" ").forEach((word) => {
      const w = document.createElement("span");
      w.className = "word";
      [...word].forEach((ch) => {
        const t = document.createElement("span");
        if (isLetter(ch)) {
          const shown = state.guessed.has(plain(ch));
          t.className = "tile" + (!shown && state.over ? " revealed-miss" : "");
          t.textContent = shown || state.over ? ch : "";
        } else {
          t.className = "tile punct";
          t.textContent = ch;
        }
        w.appendChild(t);
      });
      phrase.appendChild(w);
    });
    const masked = state.entry.answer.split("").map((ch) =>
      isLetter(ch) ? (state.guessed.has(plain(ch)) || state.over ? ch : "blank") : ch === " " ? ", space," : ch
    ).join(" ");
    phrase.setAttribute("aria-label", "Puzzle: " + masked);

    $("missCount").textContent = state.misses.length;
    $("wrongLetters").textContent = state.misses.join(" ");

    // expression
    const m = state.misses.length;
    let mouth = m <= 1 ? "happy" : m <= 3 ? "flat" : "worried";
    if (state.over) mouth = m >= MAX_MISSES ? "shock" : "grin";
    $("mouth").setAttribute("d", MOUTHS[mouth]);
    $("mouth").setAttribute("fill", mouth === "grin" ? "#fff" : "none");

    $("statWins").textContent = stats.wins;
    $("statLosses").textContent = stats.losses;
    $("statStreak").textContent = stats.streak;
  }

  // ---------- events ----------
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.tagName === "SELECT") return;
    const L = e.key.toUpperCase();
    if (/^[A-Z]$/.test(L)) { guess(L); }
    else if (e.key === "Enter" && state && state.over && e.target.tagName !== "BUTTON" && e.target.tagName !== "A") { newGame(); }
  });
  $("newGameBtn").addEventListener("click", newGame);
  $("playAgainBtn").addEventListener("click", () => { newGame(); $("keyboard").querySelector(".key").focus(); });
  $("hintBtn").addEventListener("click", () => {
    $("hint").classList.remove("hidden");
    $("hintBtn").classList.add("hidden");
  });

  buildCategories();
  buildKeyboard();
  buildGearList();
  newGame();
})();
