const categories = [
  "Cleaning",
  "Cooking",
  "Laundry",
  "Pets",
  "Errands",
  "Yard Work",
  "Home Maintenance",
  "Bills/Finances",
  "Scheduling",
  "Emotional Labor",
  "Family/Admin",
  "Other"
];

const dailyReceiptMessages = [
  "Because \"someone\" isn't a person's name.",
  "Still waiting for the dishwasher to load itself.",
  "Household mysteries solved, one receipt at a time.",
  "Today's chores: mysteriously not done... until now.",
  "Another day, another \"I was just about to do that.\"",
  "The official archive of things that definitely didn't happen by magic.",
  "Laundry still refuses to fold itself.",
  "Apparently the trash was waiting for permission.",
  "The sink called. It misses being empty.",
  "Dust continues to arrive uninvited.",
  "Your future self appreciates today's receipt.",
  "Chores don't disappear - they just change owners.",
  "The to-do list has excellent memory.",
  "Home ownership: the gift that keeps assigning chores.",
  "Keeping receipts, not grudges.",
  "If only good intentions cleaned bathrooms.",
  "Every clean room has a story.",
  "Some assembly required. Every day.",
  "Today's accomplishments are now officially documented.",
  "Another mystery solved: the house didn't clean itself."
];

const storageKey = "householdReceipts.v2";
const dailyReceiptStorageKey = "householdReceipts.dailyReceipt";
const receiptRollStorageKey = "householdReceipts.receiptRollCollapsed";
const state = {
  receipts: [],
  report: "daily",
  receiptRollCollapsed: false
};

const els = {
  form: document.querySelector("#taskForm"),
  logDate: document.querySelector("#logDate"),
  todayBtn: document.querySelector("#todayBtn"),
  previousDayBtn: document.querySelector("#previousDayBtn"),
  nextDayBtn: document.querySelector("#nextDayBtn"),
  person: document.querySelector("#person"),
  taskName: document.querySelector("#taskName"),
  category: document.querySelector("#category"),
  minutes: document.querySelector("#minutes"),
  notes: document.querySelector("#notes"),
  photo: document.querySelector("#photo"),
  myTaskCount: document.querySelector("#myTaskCount"),
  partnerTaskCount: document.querySelector("#partnerTaskCount"),
  myTime: document.querySelector("#myTime"),
  partnerTime: document.querySelector("#partnerTime"),
  timeDifference: document.querySelector("#timeDifference"),
  taskDifference: document.querySelector("#taskDifference"),
  reportEyebrow: document.querySelector("#reportEyebrow"),
  reportTitle: document.querySelector("#reportTitle"),
  reportRange: document.querySelector("#reportRange"),
  reportTasks: document.querySelector("#reportTasks"),
  reportHours: document.querySelector("#reportHours"),
  reportMine: document.querySelector("#reportMine"),
  reportPartner: document.querySelector("#reportPartner"),
  reportChildren: document.querySelector("#reportChildren"),
  reportFriend: document.querySelector("#reportFriend"),
  reportFamily: document.querySelector("#reportFamily"),
  categoryBreakdown: document.querySelector("#categoryBreakdown"),
  receiptRollPanel: document.querySelector("#receiptRollPanel"),
  receiptList: document.querySelector("#receiptList"),
  toggleReceiptRollBtns: document.querySelectorAll(".toggle-receipt-roll-btn"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  exportPdfBtn: document.querySelector("#exportPdfBtn"),
  exportBackupBtn: document.querySelector("#exportBackupBtn"),
  importBackupBtn: document.querySelector("#importBackupBtn"),
  importBackupInput: document.querySelector("#importBackupInput"),
  clearDataBtn: document.querySelector("#clearDataBtn"),
  dailyReceipt: document.querySelector("#dailyReceipt"),
  tabs: document.querySelectorAll(".tab")
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value) {
  return parseLocalDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function shiftDate(days) {
  const date = parseLocalDate(els.logDate.value || todayKey());
  date.setDate(date.getDate() + days);
  els.logDate.value = date.toISOString().slice(0, 10);
  renderAll();
}

function jumpToToday() {
  els.logDate.value = todayKey();
  renderAll();
}

function minutesLabel(minutes) {
  if (!minutes) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function personLabel(person) {
  if (person === "partner") return "Partner";
  if (person === "children") return "Kids / helpers";
  if (person === "friend") return "Friend";
  if (person === "family") return "Family";
  return "Me";
}

function loadReceipts() {
  try {
    state.receipts = JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    state.receipts = [];
  }
}

function saveReceipts() {
  localStorage.setItem(storageKey, JSON.stringify(state.receipts));
}

function loadReceiptRollPreference() {
  state.receiptRollCollapsed = localStorage.getItem(receiptRollStorageKey) === "true";
}

function saveReceiptRollPreference() {
  localStorage.setItem(receiptRollStorageKey, String(state.receiptRollCollapsed));
}

function renderReceiptRollVisibility() {
  els.receiptRollPanel.classList.toggle("is-collapsed", state.receiptRollCollapsed);
  els.receiptList.hidden = state.receiptRollCollapsed;
  els.receiptList.setAttribute("aria-hidden", String(state.receiptRollCollapsed));
  els.toggleReceiptRollBtns.forEach((button) => {
    button.textContent = state.receiptRollCollapsed ? "Show roll" : "Hide roll";
    button.setAttribute("aria-expanded", String(!state.receiptRollCollapsed));
  });
}

function toggleReceiptRoll() {
  state.receiptRollCollapsed = !state.receiptRollCollapsed;
  saveReceiptRollPreference();
  renderReceiptRollVisibility();
}

function chooseDailyReceiptMessage() {
  const previous = localStorage.getItem(dailyReceiptStorageKey);
  const choices = dailyReceiptMessages.filter((message) => message !== previous);
  const pool = choices.length ? choices : dailyReceiptMessages;
  const message = pool[Math.floor(Math.random() * pool.length)];
  localStorage.setItem(dailyReceiptStorageKey, message);
  return message;
}

function renderDailyReceipt() {
  els.dailyReceipt.textContent = chooseDailyReceiptMessage();
}

function readPhoto(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function getRange(report, selectedDate) {
  const start = parseLocalDate(selectedDate);
  const end = parseLocalDate(selectedDate);

  if (report === "weekly") {
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
  }

  if (report === "monthly") {
    start.setDate(1);
    end.setMonth(start.getMonth() + 1, 0);
  }

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

function receiptsInRange(range) {
  return state.receipts.filter((receipt) => receipt.date >= range.start && receipt.date <= range.end);
}

function summarize(receipts) {
  return receipts.reduce(
    (summary, receipt) => {
      summary.tasks += 1;
      summary.minutes += receipt.minutes;
      const person = summary.people[receipt.person] ? receipt.person : "me";
      summary.people[person].tasks += 1;
      summary.people[person].minutes += receipt.minutes;
      summary.categories[receipt.category] = summary.categories[receipt.category] || { tasks: 0, minutes: 0 };
      summary.categories[receipt.category].tasks += 1;
      summary.categories[receipt.category].minutes += receipt.minutes;
      return summary;
    },
    {
      tasks: 0,
      minutes: 0,
      people: {
        me: { tasks: 0, minutes: 0 },
        partner: { tasks: 0, minutes: 0 },
        children: { tasks: 0, minutes: 0 },
        friend: { tasks: 0, minutes: 0 },
        family: { tasks: 0, minutes: 0 }
      },
      categories: {}
    }
  );
}

function differenceLabel(myValue, partnerValue, unit) {
  const diff = myValue - partnerValue;
  if (diff === 0) return "Even";
  const owner = diff > 0 ? "Me" : "Partner";
  const amount = Math.abs(diff);
  return unit === "time" ? `${owner} +${minutesLabel(amount)}` : `${owner} +${amount}`;
}

function renderDashboard() {
  const selectedDate = els.logDate.value;
  const todayReceipts = state.receipts.filter((receipt) => receipt.date === selectedDate);
  const summary = summarize(todayReceipts);

  els.myTaskCount.textContent = summary.people.me.tasks;
  els.partnerTaskCount.textContent = summary.people.partner.tasks;
  els.myTime.textContent = minutesLabel(summary.people.me.minutes);
  els.partnerTime.textContent = minutesLabel(summary.people.partner.minutes);
  els.timeDifference.textContent = differenceLabel(summary.people.me.minutes, summary.people.partner.minutes, "time");
  els.taskDifference.textContent = differenceLabel(summary.people.me.tasks, summary.people.partner.tasks, "tasks");
}

function renderReport() {
  const range = getRange(state.report, els.logDate.value);
  const reportReceipts = receiptsInRange(range);
  const summary = summarize(reportReceipts);
  const titles = {
    daily: ["Daily summary", "What Got Done"],
    weekly: ["Weekly report", "The week in household labor"],
    monthly: ["Monthly summary", "The monthly receipt stack"]
  };

  els.reportEyebrow.textContent = titles[state.report][0];
  els.reportTitle.textContent = titles[state.report][1];
  els.reportRange.textContent = range.start === range.end ? formatDate(range.start) : `${formatDate(range.start)} - ${formatDate(range.end)}`;
  els.reportTasks.textContent = summary.tasks;
  els.reportHours.textContent = (summary.minutes / 60).toFixed(1);
  els.reportMine.textContent = minutesLabel(summary.people.me.minutes);
  els.reportPartner.textContent = minutesLabel(summary.people.partner.minutes);
  els.reportChildren.textContent = minutesLabel(summary.people.children.minutes);
  els.reportFriend.textContent = minutesLabel(summary.people.friend.minutes);
  els.reportFamily.textContent = minutesLabel(summary.people.family.minutes);

  const categoryRows = Object.entries(summary.categories).sort((a, b) => b[1].minutes - a[1].minutes);
  const maxMinutes = Math.max(...categoryRows.map(([, item]) => item.minutes), 1);

  els.categoryBreakdown.innerHTML = categoryRows.length
    ? categoryRows.map(([category, item]) => `
        <div class="category-row">
          <div class="category-meta">
            <span>${escapeHtml(category)}</span>
            <span>${item.tasks} tasks · ${minutesLabel(item.minutes)}</span>
          </div>
          <div class="bar"><span style="width: ${(item.minutes / maxMinutes) * 100}%"></span></div>
        </div>
      `).join("")
    : `<div class="empty-state">No receipts in this range yet. Future you remains curious.</div>`;
}

function renderReceipts() {
  const sorted = [...state.receipts].sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));
  const visible = sorted.slice(0, 12);

  els.receiptList.innerHTML = visible.length
    ? visible.map((receipt) => `
        <article class="receipt-card">
          <div class="receipt-top">
            <div>
              <h4>${escapeHtml(receipt.taskName)}</h4>
              <p>${escapeHtml(receipt.notes || "Logged. Counted. No confetti required.")}</p>
            </div>
            <span class="person-badge ${receipt.person === "partner" ? "partner" : ["children", "friend", "family"].includes(receipt.person) ? receipt.person : ""}">${personLabel(receipt.person)}</span>
          </div>
          <div class="receipt-meta">
            <span>${formatDate(receipt.date)}</span>
            <span>${escapeHtml(receipt.category)}</span>
            <span>${minutesLabel(receipt.minutes)}</span>
          </div>
          ${receipt.photo ? `<img class="receipt-photo" src="${receipt.photo}" alt="Photo proof for ${escapeHtml(receipt.taskName)}">` : ""}
        </article>
      `).join("")
    : `<div class="empty-state">No receipts yet. Log the first tiny miracle that kept the household moving.</div>`;
}

function renderAll() {
  renderDashboard();
  renderReport();
  renderReceipts();
  renderReceiptRollVisibility();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function populateCategories() {
  els.category.innerHTML = categories.map((category) => `<option value="${category}">${category}</option>`).join("");
}

async function handleSubmit(event) {
  event.preventDefault();
  const photo = await readPhoto(els.photo.files[0]);
  const receipt = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: els.logDate.value,
    person: els.person.value,
    taskName: els.taskName.value.trim(),
    category: els.category.value,
    minutes: Number(els.minutes.value),
    notes: els.notes.value.trim(),
    photo,
    createdAt: new Date().toISOString()
  };

  state.receipts.push(receipt);
  saveReceipts();
  els.form.reset();
  els.logDate.value = receipt.date;
  els.minutes.value = 15;
  renderAll();
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportCsv() {
  const headers = ["Date", "Person", "Task", "Category", "Minutes", "Hours", "Notes", "Has Photo"];
  const rows = state.receipts.map((receipt) => [
    receipt.date,
    personLabel(receipt.person),
    receipt.taskName,
    receipt.category,
    receipt.minutes,
    (receipt.minutes / 60).toFixed(2),
    receipt.notes,
    receipt.photo ? "Yes" : "No"
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  downloadFile(`household-receipts-${todayKey()}.csv`, "text/csv;charset=utf-8", csv);
}

function exportBackup() {
  const backup = {
    app: "Household Receipts",
    version: 2,
    exportedAt: new Date().toISOString(),
    receipts: state.receipts
  };

  downloadFile(
    `household-receipts-backup-${todayKey()}.json`,
    "application/json;charset=utf-8",
    JSON.stringify(backup, null, 2)
  );
}

function normalizeImportedReceipts(data) {
  const receipts = Array.isArray(data) ? data : data?.receipts;
  if (!Array.isArray(receipts)) return [];

  return receipts
    .map((receipt) => ({
      id: receipt.id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      date: receipt.date,
      person: ["partner", "children", "friend", "family"].includes(receipt.person) ? receipt.person : "me",
      taskName: String(receipt.taskName || "").trim(),
      category: categories.includes(receipt.category) ? receipt.category : "Other",
      minutes: Number(receipt.minutes),
      notes: String(receipt.notes || "").trim(),
      photo: typeof receipt.photo === "string" ? receipt.photo : "",
      createdAt: receipt.createdAt || new Date().toISOString()
    }))
    .filter((receipt) => receipt.date && receipt.taskName && Number.isFinite(receipt.minutes) && receipt.minutes > 0);
}

function mergeReceipts(importedReceipts) {
  const existingIds = new Set(state.receipts.map((receipt) => receipt.id));
  const merged = [...state.receipts];

  importedReceipts.forEach((receipt) => {
    if (!existingIds.has(receipt.id)) {
      merged.push(receipt);
      existingIds.add(receipt.id);
    }
  });

  return merged;
}

async function importBackupFile(file) {
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const importedReceipts = normalizeImportedReceipts(data);

    if (!importedReceipts.length) {
      alert("That backup did not include any receipts I could import.");
      return;
    }

    const mergedReceipts = mergeReceipts(importedReceipts);
    const addedCount = mergedReceipts.length - state.receipts.length;
    const message = addedCount
      ? `Import ${addedCount} new receipts from this backup? Existing receipts will stay on this device.`
      : "This backup does not contain any new receipts to add.";

    if (!addedCount || !confirm(message)) return;

    state.receipts = mergedReceipts;
    saveReceipts();
    renderAll();
    alert(`Imported ${addedCount} receipts.`);
  } catch {
    alert("I could not read that backup file. Please choose a Household Receipts JSON backup.");
  } finally {
    els.importBackupInput.value = "";
  }
}

function exportPdf() {
  const range = getRange("monthly", els.logDate.value);
  const summary = summarize(receiptsInRange(range));
  const popup = window.open("", "_blank");
  if (!popup) {
    alert("Please allow popups to create the PDF report.");
    return;
  }

  const categoryRows = Object.entries(summary.categories)
    .sort((a, b) => b[1].minutes - a[1].minutes)
    .map(([category, item]) => `<tr><td>${escapeHtml(category)}</td><td>${item.tasks}</td><td>${minutesLabel(item.minutes)}</td></tr>`)
    .join("");

  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Household Receipts Monthly Report</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; padding: 32px; color: #27231f; }
          h1 { margin-bottom: 0; font-size: 34px; }
          .tagline { color: #cf6f4a; font-weight: 800; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
          .card { border: 1px solid #e8dfd2; border-radius: 14px; padding: 14px; }
          .card span { color: #746d64; display: block; font-size: 12px; font-weight: 700; }
          .card strong { font-size: 22px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border-bottom: 1px solid #e8dfd2; padding: 10px; text-align: left; }
          th { color: #746d64; font-size: 12px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <h1>Household Receipts</h1>
        <p class="tagline">Because someone has to keep the receipts.</p>
        <p>${formatDate(range.start)} - ${formatDate(range.end)}</p>
        <div class="grid">
          <div class="card"><span>Tasks completed</span><strong>${summary.tasks}</strong></div>
          <div class="card"><span>Hours spent</span><strong>${(summary.minutes / 60).toFixed(1)}</strong></div>
          <div class="card"><span>My work</span><strong>${minutesLabel(summary.people.me.minutes)}</strong></div>
          <div class="card"><span>Partner work</span><strong>${minutesLabel(summary.people.partner.minutes)}</strong></div>
        </div>
        <h2>Categories</h2>
        <table>
          <thead><tr><th>Category</th><th>Tasks</th><th>Time</th></tr></thead>
          <tbody>${categoryRows || "<tr><td colspan='3'>No receipts in this month yet.</td></tr>"}</tbody>
        </table>
        <script>window.print();</script>
      </body>
    </html>
  `);
  popup.document.close();
}

function downloadFile(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function clearData() {
  if (!state.receipts.length) return;
  if (confirm("Clear all locally stored receipts?")) {
    state.receipts = [];
    saveReceipts();
    renderAll();
  }
}

function bindEvents() {
  els.form.addEventListener("submit", handleSubmit);
  els.logDate.addEventListener("change", renderAll);
  els.todayBtn.addEventListener("click", jumpToToday);
  els.previousDayBtn?.addEventListener("click", () => shiftDate(-1));
  els.nextDayBtn?.addEventListener("click", () => shiftDate(1));
  els.exportCsvBtn.addEventListener("click", exportCsv);
  els.exportPdfBtn.addEventListener("click", exportPdf);
  els.exportBackupBtn.addEventListener("click", exportBackup);
  els.importBackupBtn.addEventListener("click", () => els.importBackupInput.click());
  els.importBackupInput.addEventListener("change", () => importBackupFile(els.importBackupInput.files[0]));
  els.toggleReceiptRollBtns.forEach((button) => button.addEventListener("click", toggleReceiptRoll));
  els.clearDataBtn.addEventListener("click", clearData);
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.report = tab.dataset.report;
      els.tabs.forEach((item) => item.classList.toggle("active", item === tab));
      renderReport();
    });
  });
}

function init() {
  els.logDate.value = todayKey();
  populateCategories();
  loadReceipts();
  loadReceiptRollPreference();
  bindEvents();
  renderDailyReceipt();
  renderAll();
}

init();
