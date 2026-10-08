(() => {
  "use strict";

  const VERSES = [
    "John 3:16 — For God so loved the world that He gave His one and only Son...",
    "Psalm 23:1 — The Lord is my shepherd; I shall not want.",
    "Philippians 4:13 — I can do all things through Christ who strengthens me.",
    "Romans 8:28 — In all things God works for the good of those who love Him.",
    "Isaiah 40:31 — Those who hope in the Lord will renew their strength.",
    "Jeremiah 29:11 — For I know the plans I have for you, declares the Lord.",
    "Matthew 11:28 — Come to Me, all you who are weary and burdened.",
    "Psalm 46:1 — God is our refuge and strength, an ever-present help in trouble.",
    "John 14:6 — I am the way and the truth and the life.",
    "Proverbs 3:5-6 — Trust in the Lord with all your heart.",
    "Romans 12:12 — Be joyful in hope, patient in affliction, faithful in prayer.",
    "Psalm 34:8 — Taste and see that the Lord is good.",
    "2 Timothy 1:7 — God gave us a spirit not of fear but of power and love.",
    "Hebrews 11:1 — Faith is confidence in what we hope for.",
    "James 1:5 — If any of you lacks wisdom, ask God.",
    "Psalm 119:105 — Your word is a lamp for my feet.",
    "Joshua 1:9 — Be strong and courageous. Do not be afraid.",
    "1 Peter 5:7 — Cast all your anxiety on Him because He cares for you.",
    "Ephesians 3:20 — He is able to do immeasurably more than all we ask.",
    "Galatians 5:22 — The fruit of the Spirit is love, joy, peace...",
    "Isaiah 26:3 — You will keep in perfect peace those whose minds are steadfast.",
    "Psalm 37:4 — Delight yourself in the Lord.",
    "Lamentations 3:22-23 — His mercies are new every morning.",
    "Micah 6:8 — Act justly, love mercy, walk humbly with your God.",
    "Matthew 6:33 — Seek first His kingdom and His righteousness.",
    "John 16:33 — In this world you will have trouble. But take heart!",
    "Psalm 121:1-2 — My help comes from the Lord.",
    "Colossians 3:15 — Let the peace of Christ rule in your hearts.",
    "Romans 15:13 — May the God of hope fill you with all joy and peace.",
    "Zephaniah 3:17 — The Lord your God is with you, the Mighty Warrior who saves.",
    "Psalm 55:22 — Cast your cares on the Lord and He will sustain you.",
    "Matthew 5:14 — You are the light of the world.",
    "1 Corinthians 10:13 — God is faithful; He will not let you be tempted beyond what you can bear.",
    "Psalm 118:22 — The stone that the builders rejected has become the cornerstone.",
  ];

  const MOODS = [
    { value: "happy", label: "😄 Happy", color: "#C8E6C9" },
    { value: "good", label: "😊 Good", color: "#DCEDC8" },
    { value: "normal", label: "😐 Normal", color: "#FFF9C4" },
    { value: "boring", label: "☹️ Sad", color: "#FFCC80" },
    { value: "very_sad", label: "😢 Very Sad", color: "#FFCDD2" },
  ];

  const PRODUCTIVITY = [
    { value: 100, label: "100%", color: "#2E7D32" },
    { value: 75, label: "75%", color: "#66BB6A" },
    { value: 50, label: "50%", color: "#FFF176" },
    { value: 25, label: "25%", color: "#fa0c0c" },
    { value: 0, label: "0%", color: "#b00000" },
  ];

  const TIME_GOD = [
    { value: 0, label: "0 min", color: "#CFD8DC" },
    { value: 30, label: "30 min", color: "#D6EEF8" },
    { value: 45, label: "45 min", color: "#B3E5FC" },
    { value: 60, label: "1 hr", color: "#81D4FA" },
    { value: 90, label: "1.5 hr", color: "#4FC3F7" },
    { value: 120, label: "2 hr", color: "#42A5F5" },
    { value: 180, label: "3 hr", color: "#7E57C2" },
    { value: 999, label: "3+ hr ✨", color: "#04192f" },
  ];

  const TIME_FAMILY = [
    { value: 0, label: "0 min", color: "#CFD8DC" },
    { value: 15, label: "15 min", color: "#C8E6C9" },
    { value: 30, label: "30 min", color: "#81C784" },
    { value: 60, label: "1 hr", color: "#4DB6AC" },
    { value: 999, label: "1+ hr", color: "#00796B" },
  ];

  const state = {
    view: "home",
    entries: [],
    prayers: [],
    settings: {},
    draft: null,
    step: 1,
    statusPrayerId: null,
    statusValue: null,
    completeTimer: null,
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cache();
    bind();
    renderOptionRows();
    renderStepDots();
    initMascotFallbacks();
    await refreshData();
    navigate("home");
  }

  function cache() {
    els.views = Array.from(document.querySelectorAll(".view"));
    els.nav = Array.from(document.querySelectorAll(".nav-item"));

    els.homeDate = document.getElementById("homeDate");
    els.homeGreeting = document.getElementById("homeGreeting");
    els.todayStatus = document.getElementById("todayStatus");
    els.dailyVerseText = document.getElementById("dailyVerseText");
    els.startCheckinBtn = document.getElementById("startCheckinBtn");

    els.progressDots = document.getElementById("progressDots");
    els.steps = Array.from(document.querySelectorAll(".wizard-step"));
    els.prevStepBtn = document.getElementById("prevStepBtn");
    els.nextStepBtn = document.getElementById("nextStepBtn");
    els.saveEntryBtn = document.getElementById("saveEntryBtn");
    els.diaryText = document.getElementById("diaryText");
    els.charCounter = document.getElementById("charCounter");
    els.checkinDone = document.getElementById("checkinDone");

    els.moodOptions = document.getElementById("moodOptions");
    els.productivityOptions = document.getElementById("productivityOptions");
    els.godTimeOptions = document.getElementById("godTimeOptions");
    els.familyTimeOptions = document.getElementById("familyTimeOptions");

    els.journalSearch = document.getElementById("journalSearch");
    els.journalStart = document.getElementById("journalStart");
    els.journalEnd = document.getElementById("journalEnd");
    els.applyJournalFilter = document.getElementById("applyJournalFilter");
    els.resetJournalFilter = document.getElementById("resetJournalFilter");
    els.journalList = document.getElementById("journalList");

    els.addPrayerBtn = document.getElementById("addPrayerBtn");
    els.pendingPrayers = document.getElementById("pendingPrayers");
    els.answeredPrayers = document.getElementById("answeredPrayers");
    els.deniedPrayers = document.getElementById("deniedPrayers");

    els.moodHeatmap = document.getElementById("moodHeatmap");
    els.productivityHeatmap = document.getElementById("productivityHeatmap");
    els.godHeatmap = document.getElementById("godHeatmap");
    els.familyHeatmap = document.getElementById("familyHeatmap");
    els.statsSummary = document.getElementById("statsSummary");

    els.nameInput = document.getElementById("nameInput");
    els.saveNameBtn = document.getElementById("saveNameBtn");
    els.darkModeToggle = document.getElementById("darkModeToggle");
    els.exportBtn = document.getElementById("exportBtn");
    els.importBtn = document.getElementById("importBtn");
    els.importFile = document.getElementById("importFile");
    els.clearAllBtn = document.getElementById("clearAllBtn");

    els.entryModal = document.getElementById("entryModal");
    els.entryModalContent = document.getElementById("entryModalContent");
    els.closeEntryModal = document.getElementById("closeEntryModal");

    els.prayerModal = document.getElementById("prayerModal");
    els.closePrayerModal = document.getElementById("closePrayerModal");
    els.prayerTitle = document.getElementById("prayerTitle");
    els.prayerBody = document.getElementById("prayerBody");
    els.prayerDate = document.getElementById("prayerDate");
    els.savePrayerBtn = document.getElementById("savePrayerBtn");

    els.statusModal = document.getElementById("statusModal");
    els.statusModalTitle = document.getElementById("statusModalTitle");
    els.statusNotes = document.getElementById("statusNotes");
    els.saveStatusBtn = document.getElementById("saveStatusBtn");
    els.closeStatusModal = document.getElementById("closeStatusModal");
  }

  function bind() {
    els.nav.forEach((item) =>
      item.addEventListener("click", () => navigate(item.dataset.view)),
    );

    els.startCheckinBtn.addEventListener("click", () =>
      openCheckin(todayKey()),
    );
    els.prevStepBtn.addEventListener("click", () => showStep(state.step - 1));
    els.nextStepBtn.addEventListener("click", () => showStep(state.step + 1));
    els.saveEntryBtn.addEventListener("click", saveEntry);

    els.diaryText.addEventListener("input", () => {
      if (state.draft) state.draft.diaryText = els.diaryText.value;
      els.charCounter.textContent = `${els.diaryText.value.length} / 3000`;
    });

    bindOptionClick(els.moodOptions, "mood");
    bindOptionClick(els.productivityOptions, "productivity");
    bindOptionClick(els.godTimeOptions, "timeWithGod");
    bindOptionClick(els.familyTimeOptions, "timeWithFamily");

    els.applyJournalFilter.addEventListener("click", applyJournalFilters);
    els.resetJournalFilter.addEventListener("click", resetJournalFilters);
    els.journalSearch.addEventListener(
      "input",
      debounce(applyJournalFilters, 180),
    );

    els.journalList.addEventListener("click", (event) => {
      const expand = event.target.closest("[data-expand-entry]");
      if (expand) {
        const id = expand.getAttribute("data-expand-entry");
        const full = document.querySelector(`[data-entry-full=\"${id}\"]`);
        if (!full) return;
        const hidden = full.classList.toggle("hidden");
        expand.textContent = hidden ? "Read more" : "Hide";
        return;
      }

      const edit = event.target.closest("[data-edit-entry]");
      if (edit) openCheckin(edit.getAttribute("data-edit-entry"));
    });

    els.addPrayerBtn.addEventListener("click", () => {
      els.prayerTitle.value = "";
      els.prayerBody.value = "";
      els.prayerDate.value = todayKey();
      openDialog(els.prayerModal);
    });

    els.savePrayerBtn.addEventListener("click", createPrayer);
    els.closePrayerModal.addEventListener("click", () =>
      closeDialog(els.prayerModal),
    );

    [els.pendingPrayers, els.answeredPrayers, els.deniedPrayers].forEach(
      (container) => {
        container.addEventListener("click", prayerActions);
      },
    );

    els.saveStatusBtn.addEventListener("click", commitPrayerStatus);
    els.closeStatusModal.addEventListener("click", () =>
      closeDialog(els.statusModal),
    );

    els.saveNameBtn.addEventListener("click", saveName);
    els.darkModeToggle.addEventListener("change", saveDarkMode);
    els.exportBtn.addEventListener("click", exportData);
    els.importBtn.addEventListener("click", () => els.importFile.click());
    els.importFile.addEventListener("change", importData);
    els.clearAllBtn.addEventListener("click", clearAll);

    els.closeEntryModal.addEventListener("click", () =>
      closeDialog(els.entryModal),
    );
    [els.entryModal, els.prayerModal, els.statusModal].forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (!event.target.closest(".modal-card")) closeDialog(dialog);
      });
    });

    [
      els.moodHeatmap,
      els.productivityHeatmap,
      els.godHeatmap,
      els.familyHeatmap,
    ].forEach((heatmap) => {
      heatmap.addEventListener("click", (event) => {
        const cell = event.target.closest("[data-entry-date]");
        if (!cell) return;
        const entry = state.entries.find(
          (e) => e.date === cell.getAttribute("data-entry-date"),
        );
        if (entry) openEntry(entry);
      });
    });
  }

  function initMascotFallbacks() {
    Array.from(document.querySelectorAll(".mascot-image")).forEach((img) => {
      img.addEventListener("load", () => {
        img.classList.remove("hidden");
        const svg = img.parentElement.querySelector("svg");
        if (svg) svg.classList.add("hidden");
      });
      img.addEventListener("error", () => img.classList.add("hidden"));
    });
  }

  async function refreshData() {
    const [entries, prayers, settings] = await Promise.all([
      apiGet("/api/entries"),
      apiGet("/api/prayers"),
      apiGet("/api/settings"),
    ]);

    state.entries = entries || [];
    state.prayers = prayers || [];
    state.settings = settings || {};

    applySettings();
    renderHome();
    renderJournal(state.entries);
    renderPrayers();
    renderStats();
  }

  function navigate(view) {
    state.view = view;
    els.views.forEach((v) =>
      v.classList.toggle("active", v.dataset.view === view),
    );
    els.nav.forEach((n) =>
      n.classList.toggle("active", n.dataset.view === view),
    );

    if (view === "home") renderHome();
    if (view === "journal") applyJournalFilters();
    if (view === "prayers") renderPrayers();
    if (view === "stats") renderStats();
  }

  function applySettings() {
    els.nameInput.value = state.settings.userName || "beloved";
    const dark = String(state.settings.darkMode || "false") === "true";
    els.darkModeToggle.checked = dark;
    document.body.classList.toggle("dark-mode", dark);
  }

  function renderHome() {
    const now = new Date();
    const greet =
      now.getHours() < 12
        ? "Good morning"
        : now.getHours() < 18
          ? "Good afternoon"
          : "Good evening";
    const name = state.settings.userName || "beloved";

    els.homeDate.textContent = formatLongDate(now);
    els.homeGreeting.textContent = `${greet}, ${name}! How are you walking with Me today? 🕊️`;
    els.dailyVerseText.textContent = VERSES[dayOfYear(now) % VERSES.length];

    const hasToday = state.entries.some((e) => e.date === todayKey());
    els.todayStatus.textContent = hasToday ? "Done ✓" : "Not yet";
    els.todayStatus.classList.toggle("done", hasToday);
    els.todayStatus.classList.toggle("pending", !hasToday);
    els.startCheckinBtn.textContent = hasToday
      ? "Edit today's check-in"
      : "Start today's check-in";
  }

  function renderOptionRows() {
    renderOptions(els.moodOptions, MOODS, "mood");
    renderOptions(els.productivityOptions, PRODUCTIVITY, "productivity");
    renderOptions(els.godTimeOptions, TIME_GOD, "timeWithGod");
    renderOptions(els.familyTimeOptions, TIME_FAMILY, "timeWithFamily");
  }

  function renderOptions(container, options, key) {
    container.innerHTML = "";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-btn";
      btn.dataset.key = key;
      btn.dataset.value = String(opt.value);
      btn.style.background = opt.color;
      btn.style.color = isDark(opt.color) ? "#fff" : "#3f3226";
      btn.textContent = opt.label;
      container.appendChild(btn);
    });
  }

  function bindOptionClick(container, key) {
    container.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-key]");
      if (!btn || !state.draft) return;
      state.draft[key] =
        key === "mood" ? btn.dataset.value : Number(btn.dataset.value);
      syncSelections();
      updateStepState();
    });
  }

  function renderStepDots() {
    els.progressDots.innerHTML = "";
    for (let i = 1; i <= 5; i += 1) {
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.dataset.stepDot = String(i);
      els.progressDots.appendChild(dot);
    }
  }

  function openCheckin(date) {
    const entry = state.entries.find((e) => e.date === date);
    state.draft = entry
      ? {
          date: entry.date,
          mood: entry.mood,
          productivity: Number(entry.productivity),
          timeWithGod: Number(entry.time_with_god),
          timeWithFamily: Number(entry.time_with_family),
          diaryText: entry.diary_text || "",
        }
      : {
          date,
          mood: null,
          productivity: null,
          timeWithGod: null,
          timeWithFamily: null,
          diaryText: "",
        };

    els.diaryText.value = state.draft.diaryText;
    els.charCounter.textContent = `${els.diaryText.value.length} / 3000`;
    hideDoneCard();
    showStep(1);
    syncSelections();
    navigate("checkin");
  }

  function showStep(step) {
    state.step = Math.max(1, Math.min(5, step));
    els.steps.forEach((panel) =>
      panel.classList.toggle(
        "active",
        Number(panel.dataset.step) === state.step,
      ),
    );

    Array.from(els.progressDots.querySelectorAll(".dot")).forEach((dot) => {
      dot.classList.toggle("active", Number(dot.dataset.stepDot) <= state.step);
    });

    els.prevStepBtn.disabled = state.step === 1;
    els.nextStepBtn.classList.toggle("hidden", state.step === 5);
    updateStepState();
  }

  function updateStepState() {
    if (!state.draft) return;

    const canProceed =
      state.step === 1
        ? !!state.draft.mood
        : state.step === 2
          ? Number.isFinite(state.draft.productivity)
          : state.step === 3
            ? Number.isFinite(state.draft.timeWithGod)
            : state.step === 4
              ? Number.isFinite(state.draft.timeWithFamily)
              : true;

    els.nextStepBtn.disabled = !canProceed;
  }

  function syncSelections() {
    if (!state.draft) return;
    syncSelection(els.moodOptions, state.draft.mood);
    syncSelection(els.productivityOptions, state.draft.productivity);
    syncSelection(els.godTimeOptions, state.draft.timeWithGod);
    syncSelection(els.familyTimeOptions, state.draft.timeWithFamily);
  }

  function syncSelection(container, value) {
    Array.from(container.querySelectorAll(".option-btn")).forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.value === String(value));
    });
  }

  async function saveEntry() {
    if (!state.draft) return;

    const complete =
      !!state.draft.mood &&
      Number.isFinite(state.draft.productivity) &&
      Number.isFinite(state.draft.timeWithGod) &&
      Number.isFinite(state.draft.timeWithFamily);

    if (!complete) {
      alert("Please complete all steps before saving.");
      return;
    }

    await apiPost("/api/entries", {
      date: state.draft.date,
      mood: state.draft.mood,
      productivity: state.draft.productivity,
      timeWithGod: state.draft.timeWithGod,
      timeWithFamily: state.draft.timeWithFamily,
      diaryText: els.diaryText.value,
      updatedAt: new Date().toISOString(),
    });

    await refreshData();
    showDoneCard();
  }

  function showDoneCard() {
    els.checkinDone.classList.remove("hidden");
    if (state.completeTimer) clearTimeout(state.completeTimer);
    state.completeTimer = setTimeout(() => {
      hideDoneCard();
      navigate("home");
    }, 1600);
  }

  function hideDoneCard() {
    els.checkinDone.classList.add("hidden");
    if (state.completeTimer) {
      clearTimeout(state.completeTimer);
      state.completeTimer = null;
    }
  }

  function applyJournalFilters() {
    const q = (els.journalSearch.value || "").trim().toLowerCase();
    const start = els.journalStart.value || "";
    const end = els.journalEnd.value || "";

    let list = [...state.entries];
    if (start) list = list.filter((e) => e.date >= start);
    if (end) list = list.filter((e) => e.date <= end);

    if (q) {
      list = list.filter((e) => {
        const text =
          `${e.date} ${e.mood} ${e.diary_text || ""} ${e.productivity}`.toLowerCase();
        return text.includes(q);
      });
    }

    renderJournal(list);
  }

  function resetJournalFilters() {
    els.journalSearch.value = "";
    els.journalStart.value = "";
    els.journalEnd.value = "";
    renderJournal(state.entries);
  }

  function renderJournal(entries) {
    els.journalList.innerHTML = "";
    if (!entries.length) {
      els.journalList.innerHTML = `<article class="journal-entry-card">No entries found yet.</article>`;
      return;
    }

    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    sorted.forEach((entry) => {
      const diary = entry.diary_text || "";
      const short = diary.slice(0, 140);
      const more = diary.length > 140;

      const card = document.createElement("article");
      card.className = "journal-entry-card";
      card.innerHTML = `
        <div class="journal-entry-header">
          <div class="journal-entry-date">${formatLongDate(parseDate(entry.date))}</div>
          <div class="journal-entry-badges">
            <span>${moodEmoji(entry.mood)} ${moodLabel(entry.mood)}</span>
            <span>${entry.productivity}%</span>
          </div>
        </div>
        <div class="journal-entry-badges">
          <span>⛪ ${minutesLabel(entry.time_with_god, true)}</span>
          <span>👪 ${minutesLabel(entry.time_with_family, false)}</span>
        </div>
        <hr class="journal-entry-divider" />
        <div class="journal-entry-preview">${escapeHtml(short || "(No diary text)")}${more ? "..." : ""}</div>
        <div class="journal-entry-full hidden" data-entry-full="${entry.date}">${escapeHtml(diary)}</div>
        <div class="journal-entry-actions">
          <button class="btn btn-ghost" data-expand-entry="${entry.date}">${more ? "Read more" : "View"}</button>
          <button class="btn btn-primary" data-edit-entry="${entry.date}">Edit</button>
        </div>
      `;
      els.journalList.appendChild(card);
    });
  }

  async function createPrayer() {
    const title = els.prayerTitle.value.trim();
    const body = els.prayerBody.value.trim();
    if (!title || !body) {
      alert("Please fill both title and prayer text.");
      return;
    }

    const createdAt = new Date(
      `${els.prayerDate.value || todayKey()}T12:00:00`,
    ).toISOString();
    await apiPost("/api/prayers", { title, body, createdAt });
    closeDialog(els.prayerModal);
    state.prayers = await apiGet("/api/prayers");
    renderPrayers();
  }

  function prayerActions(event) {
    const statusBtn = event.target.closest("[data-prayer-status]");
    if (statusBtn) {
      state.statusPrayerId = Number(statusBtn.getAttribute("data-prayer-id"));
      state.statusValue = statusBtn.getAttribute("data-prayer-status");
      els.statusModalTitle.textContent =
        state.statusValue === "answered"
          ? "How did God answer this?"
          : state.statusValue === "denied"
            ? "What happened here?"
            : "Move back to pending";
      els.statusNotes.value = "";
      openDialog(els.statusModal);
      return;
    }

    const delBtn = event.target.closest("[data-delete-prayer]");
    if (delBtn) {
      const id = Number(delBtn.getAttribute("data-delete-prayer"));
      deletePrayer(id);
    }
  }

  async function commitPrayerStatus() {
    if (!state.statusPrayerId || !state.statusValue) return;

    await apiPatch(`/api/prayers/${state.statusPrayerId}/status`, {
      status: state.statusValue,
      notes: els.statusNotes.value.trim(),
    });

    closeDialog(els.statusModal);
    state.statusPrayerId = null;
    state.statusValue = null;
    state.prayers = await apiGet("/api/prayers");
    renderPrayers();
  }

  async function deletePrayer(id) {
    if (!confirm("Delete this prayer?")) return;
    await apiDelete(`/api/prayers/${id}`);
    state.prayers = await apiGet("/api/prayers");
    renderPrayers();
  }

  function renderPrayers() {
    renderPrayerColumn(
      els.pendingPrayers,
      state.prayers.filter((p) => p.status === "pending"),
      "pending",
    );
    renderPrayerColumn(
      els.answeredPrayers,
      state.prayers.filter((p) => p.status === "answered"),
      "answered",
    );
    renderPrayerColumn(
      els.deniedPrayers,
      state.prayers.filter((p) => p.status === "denied"),
      "denied",
    );
  }

  function renderPrayerColumn(container, prayers, mode) {
    container.innerHTML = "";
    if (!prayers.length) {
      container.innerHTML = `<article class="prayer-card">No prayers here yet.</article>`;
      return;
    }

    prayers.forEach((p) => {
      const preview =
        p.body.length > 130 ? `${p.body.slice(0, 130)}...` : p.body;
      const card = document.createElement("article");
      card.className = `prayer-card ${mode}`;
      card.innerHTML = `
        <div class="prayer-card-title">${escapeHtml(p.title)}</div>
        <div class="prayer-meta">${formatLongDate(new Date(p.created_at))}</div>
        <div class="prayer-card-body">${escapeHtml(preview)}</div>
        ${p.notes ? `<div class="prayer-card-body"><strong>Notes:</strong> ${escapeHtml(p.notes)}</div>` : ""}
        ${p.answered_at ? `<div class="prayer-meta">Updated: ${formatLongDate(new Date(p.answered_at))}</div>` : ""}
        ${mode === "denied" ? `<div class="prayer-meta">His ways are higher than our ways. — Isaiah 55:8</div>` : ""}
        <div class="prayer-card-actions">
          ${
            mode === "pending"
              ? `<button class="btn btn-primary" data-prayer-id="${p.id}" data-prayer-status="answered">✅ Mark Answered</button>
                 <button class="btn btn-danger" data-prayer-id="${p.id}" data-prayer-status="denied">❌ Mark Denied</button>`
              : `<button class="btn btn-ghost" data-prayer-id="${p.id}" data-prayer-status="pending">↩ Move to Pending</button>`
          }
        </div>
        <button class="btn btn-ghost" data-delete-prayer="${p.id}">Delete</button>
      `;
      container.appendChild(card);
    });
  }

  function renderStats() {
    const map = new Map(state.entries.map((entry) => [entry.date, entry]));
    const days = buildDays(365);

    drawHeatmap(els.moodHeatmap, days, map, "mood");
    drawHeatmap(els.productivityHeatmap, days, map, "productivity");
    drawHeatmap(els.godHeatmap, days, map, "god");
    drawHeatmap(els.familyHeatmap, days, map, "family");

    const set = new Set(state.entries.map((e) => e.date));
    const current = currentStreak(set);
    const longest = longestStreak(set);
    const total = state.entries.length;
    const avgGod = averageGodMonth(state.entries);

    els.statsSummary.innerHTML = `
      <article class="stat-card"><span class="stat-number">${current}</span><div class="stat-label">Current streak</div></article>
      <article class="stat-card"><span class="stat-number">${longest}</span><div class="stat-label">Longest streak</div></article>
      <article class="stat-card"><span class="stat-number">${total}</span><div class="stat-label">Total entries</div></article>
      <article class="stat-card"><span class="stat-number">${minutesLabel(avgGod, true)}</span><div class="stat-label">Avg time with God this month</div></article>
    `;
  }

  function drawHeatmap(container, days, map, metric) {
    container.innerHTML = "";
    days.forEach((d) => {
      const cell = document.createElement("div");
      cell.className = "heat-cell";
      cell.style.gridRowStart = String(d.row + 1);

      if (!d.inRange) {
        cell.style.background = "transparent";
        container.appendChild(cell);
        return;
      }

      const entry = map.get(d.date);
      const value = metricValue(entry, metric);
      cell.style.background = metricColor(metric, value);
      cell.title = `${formatLongDate(parseDate(d.date))}: ${metricLabel(metric, value)}`;
      if (entry) cell.dataset.entryDate = d.date;
      container.appendChild(cell);
    });
  }

  async function saveName() {
    const name = els.nameInput.value.trim() || "beloved";
    await apiPost("/api/settings", { key: "userName", value: name });
    state.settings.userName = name;
    renderHome();
    alert("Name saved.");
  }

  async function saveDarkMode() {
    const value = els.darkModeToggle.checked ? "true" : "false";
    await apiPost("/api/settings", { key: "darkMode", value });
    state.settings.darkMode = value;
    document.body.classList.toggle("dark-mode", value === "true");
  }

  async function exportData() {
    const data = await apiGet("/api/export");
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prayer-diary-export-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      await apiPost("/api/import", parsed);
      await refreshData();
      alert("Data imported successfully.");
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  }

  async function clearAll() {
    if (
      !confirm("Are you sure? This will clear all diary entries and prayers.")
    )
      return;

    await apiPost("/api/import", {
      entries: [],
      prayers: [],
      settings: {
        userName: state.settings.userName || "beloved",
        darkMode: state.settings.darkMode || "false",
      },
    });

    await refreshData();
    alert("All data cleared.");
  }

  function openEntry(entry) {
    els.entryModalContent.innerHTML = `
      <h3>${formatLongDate(parseDate(entry.date))}</h3>
      <p>
        <strong>Mood:</strong> ${moodEmoji(entry.mood)} ${moodLabel(entry.mood)}<br>
        <strong>Productivity:</strong> ${entry.productivity}%<br>
        <strong>Time with God:</strong> ${minutesLabel(entry.time_with_god, true)}<br>
        <strong>Time with Family:</strong> ${minutesLabel(entry.time_with_family, false)}
      </p>
      <p style="white-space: pre-wrap;">${escapeHtml(entry.diary_text || "")}</p>
    `;
    openDialog(els.entryModal);
  }

  async function apiGet(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return res.json();
  }

  async function apiPost(url, payload) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await getError(res));
    return res.json();
  }

  async function apiPatch(url, payload) {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await getError(res));
    return res.json();
  }

  async function apiDelete(url) {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error(await getError(res));
    return res.json();
  }

  async function getError(res) {
    try {
      const json = await res.json();
      return json.error || `HTTP ${res.status}`;
    } catch {
      return `HTTP ${res.status}`;
    }
  }

  function metricValue(entry, metric) {
    if (!entry) return null;
    if (metric === "mood") return entry.mood;
    if (metric === "productivity") return Number(entry.productivity);
    if (metric === "god") return Number(entry.time_with_god);
    return Number(entry.time_with_family);
  }

  function metricLabel(metric, value) {
    if (value == null) return "No entry";
    if (metric === "mood") return moodLabel(value);
    if (metric === "productivity") return `${value}%`;
    if (metric === "god") return minutesLabel(value, true);
    return minutesLabel(value, false);
  }

  function metricColor(metric, value) {
    if (value == null) return "#EEEEEE";

    if (metric === "mood") {
      return (
        {
          very_sad: "#FFCDD2",
          boring: "#FFCC80",
          normal: "#FFF9C4",
          good: "#C8E6C9",
          happy: "#2E7D32",
        }[value] || "#EEEEEE"
      );
    }

    if (metric === "productivity") {
      return (
        {
          0: "#FFCDD2",
          25: "#FFAB91",
          50: "#FFF176",
          75: "#AED581",
          100: "#2E7D32",
        }[String(value)] || "#EEEEEE"
      );
    }

    if (metric === "god") {
      return (
        {
          0: "#E1F5FE",
          30: "#B3E5FC",
          45: "#81D4FA",
          60: "#4FC3F7",
          90: "#29B6F6",
          120: "#1E88E5",
          180: "#7E57C2",
          999: "#FFC107",
        }[String(value)] || "#EEEEEE"
      );
    }

    return (
      {
        0: "#CFD8DC",
        15: "#C8E6C9",
        30: "#81C784",
        60: "#4DB6AC",
        999: "#00796B",
      }[String(value)] || "#EEEEEE"
    );
  }

  function moodLabel(v) {
    return (
      {
        happy: "Happy",
        good: "Good",
        normal: "Normal",
        boring: "Boring",
        very_sad: "Very Sad",
      }[v] || "Unknown"
    );
  }

  function moodEmoji(v) {
    return (
      {
        happy: "😄",
        good: "😊",
        normal: "😐",
        boring: "😑",
        very_sad: "😢",
      }[v] || "🙂"
    );
  }

  function minutesLabel(minutes, godMode) {
    const value = Number(minutes || 0);
    if (value === 999) return godMode ? "3+ hr" : "1+ hr";
    if (value < 60) return `${value} min`;
    if (value % 60 === 0) return `${value / 60} hr`;
    return `${Math.floor(value / 60)}h ${value % 60}m`;
  }

  function buildDays(count) {
    const end = midnight(new Date());
    const start = new Date(end);
    start.setDate(end.getDate() - (count - 1));
    const anchor = startMonday(start);

    const out = [];
    for (let d = new Date(anchor); d <= end; d.setDate(d.getDate() + 1)) {
      const copy = new Date(d);
      out.push({
        date: toDateKey(copy),
        row: mondayIndex(copy.getDay()),
        inRange: copy >= start,
      });
    }
    return out;
  }

  function currentStreak(set) {
    let streak = 0;
    const cursor = midnight(new Date());
    while (set.has(toDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function longestStreak(set) {
    const dates = Array.from(set).sort();
    if (!dates.length) return 0;

    let max = 1;
    let cur = 1;
    for (let i = 1; i < dates.length; i += 1) {
      const prev = parseDate(dates[i - 1]);
      prev.setDate(prev.getDate() + 1);
      if (toDateKey(prev) === dates[i]) {
        cur += 1;
      } else {
        cur = 1;
      }
      if (cur > max) max = cur;
    }
    return max;
  }

  function averageGodMonth(entries) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const list = entries.filter((e) => {
      const d = parseDate(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    if (!list.length) return 0;
    const sum = list.reduce((acc, e) => {
      const value = Number(e.time_with_god);
      return acc + (value === 999 ? 180 : value);
    }, 0);
    return Math.round(sum / list.length);
  }

  function dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
  }

  function todayKey() {
    return toDateKey(new Date());
  }

  function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function parseDate(v) {
    const [y, m, d] = String(v).split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatLongDate(date) {
    return `${date.toLocaleDateString(undefined, { weekday: "long" })}, ${date.getDate()}${ordinal(date.getDate())} ${date.toLocaleDateString(undefined, { month: "long" })} ${date.getFullYear()}`;
  }

  function ordinal(n) {
    const j = n % 10;
    const k = n % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }

  function midnight(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function startMonday(d) {
    const copy = midnight(d);
    copy.setDate(copy.getDate() - mondayIndex(copy.getDay()));
    return copy;
  }

  function mondayIndex(day) {
    return (day + 6) % 7;
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
  }

  function isDark(hex) {
    const h = hex.replace("#", "");
    const value =
      h.length === 3
        ? h
            .split("")
            .map((x) => x + x)
            .join("")
        : h;
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }
})();
