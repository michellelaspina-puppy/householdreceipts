const defaultCategories = [
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

const defaultPeople = [
  { value: "me", label: "Me" },
  { value: "partner", label: "Partner" },
  { value: "children", label: "Little helpers" },
  { value: "friend", label: "Friend" },
  { value: "family", label: "Family" }
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
const summaryStorageKey = "householdReceipts.summaryCollapsed";
const receiptRollStorageKey = "householdReceipts.receiptRollCollapsed";
const customPeopleStorageKey = "householdReceipts.customPeople";
const customCategoriesStorageKey = "householdReceipts.customCategories";
const state = {
  receipts: [],
  customPeople: [],
  customCategories: [],
  report: "daily",
  receiptSearch: "",
  receiptPersonFilter: "all",
  summaryCollapsed: false,
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
  reportOther: document.querySelector("#reportOther"),
  reportDetails: document.querySelector("#reportDetails"),
  toggleSummaryBtn: document.querySelector("#toggleSummaryBtn"),
  categoryBreakdown: document.querySelector("#categoryBreakdown"),
  receiptRollPanel: document.querySelector("#receiptRollPanel"),
  receiptSearch: document.querySelector("#receiptSearch"),
  receiptPersonFilter: document.querySelector("#receiptPersonFilter"),
  receiptList: document.querySelector("#receiptList"),
  toggleReceiptRollBtn: document.querySelector("#toggleReceiptRollBtn"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  exportPdfBtn: document.querySelector("#exportPdfBtn"),
  exportRange: document.querySelector("#exportRange"),
  exportPerson: document.querySelector("#exportPerson"),
  exportDetail: document.querySelector("#exportDetail"),
  exportStartDate: document.querySelector("#exportStartDate"),
  exportEndDate: document.querySelector("#exportEndDate"),
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
  return getPeopleOptions().find((item) => item.value === person)?.label || "Me";
}

function personClass(person) {
  return defaultPeople.some((item) => item.value === person) ? person : "custom";
}

function customValue(label, prefix) {
  return `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || Date.now()}`;
}

function getPeopleOptions() {
  return [...defaultPeople, ...state.customPeople];
}

function getCategoryOptions() {
  return [...defaultCategories, ...state.customCategories];
}

function loadCustomOptions() {
  try {
    state.customPeople = JSON.parse(localStorage.getItem(customPeopleStorageKey)) || [];
  } catch {
    state.customPeople = [];
  }

  try {
    state.customCategories = JSON.parse(localStorage.getItem(customCategoriesStorageKey)) || [];
  } catch {
    state.customCategories = [];
  }
}

function saveCustomOptions() {
  localStorage.setItem(customPeopleStorageKey, JSON.stringify(state.customPeople));
  localStorage.setItem(customCategoriesStorageKey, JSON.stringify(state.customCategories));
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

function loadCollapsePreferences() {
  state.summaryCollapsed = localStorage.getItem(summaryStorageKey) === "true";
  state.receiptRollCollapsed = localStorage.getItem(receiptRollStorageKey) === "true";
}

function saveSummaryPreference() {
  localStorage.setItem(summaryStorageKey, String(state.summaryCollapsed));
}

function saveReceiptRollPreference() {
  localStorage.setItem(receiptRollStorageKey, String(state.receiptRollCollapsed));
}

function renderSummaryVisibility() {
  els.reportDetails.hidden = state.summaryCollapsed;
  els.reportDetails.setAttribute("aria-hidden", String(state.summaryCollapsed));
  els.toggleSummaryBtn.textContent = state.summaryCollapsed ? "Show details" : "Hide details";
  els.toggleSummaryBtn.setAttribute("aria-expanded", String(!state.summaryCollapsed));
}

function renderReceiptRollVisibility() {
  els.receiptRollPanel.classList.toggle("is-collapsed", state.receiptRollCollapsed);
  els.receiptList.hidden = state.receiptRollCollapsed;
  els.receiptList.setAttribute("aria-hidden", String(state.receiptRollCollapsed));
  els.toggleReceiptRollBtn.textContent = state.receiptRollCollapsed ? "Show roll" : "Hide roll";
  els.toggleReceiptRollBtn.setAttribute("aria-expanded", String(!state.receiptRollCollapsed));
}

function toggleSummary() {
  state.summaryCollapsed = !state.summaryCollapsed;
  saveSummaryPreference();
  renderSummaryVisibility();
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
      const person = summary.people[receipt.person] ? receipt.person : "other";
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
        family: { tasks: 0, minutes: 0 },
        other: { tasks: 0, minutes: 0 }
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
  els.reportOther.textContent = minutesLabel(summary.people.other.minutes);

  const categoryRows = Object.entries(summary.categories).sort((a, b) => b[1].minutes - a[1].minutes);
  const maxMinutes = Math.max(...categoryRows.map(([, item]) => item.minutes), 1);

  els.categoryBreakdown.innerHTML = categoryRows.length
    ? categoryRows.map(([category, item]) => `
        <div class="category-row">
          <div class="category-meta">
            <span>${escapeHtml(category)}</span>
            <span>${item.tasks} tasks - ${minutesLabel(item.minutes)}</span>
          </div>
          <div class="bar"><span style="width: ${(item.minutes / maxMinutes) * 100}%"></span></div>
        </div>
      `).join("")
    : `<div class="empty-state">No receipts in this range yet. Future you remains curious.</div>`;
}

function renderReceipts() {
  const query = state.receiptSearch.trim().toLowerCase();
  const sorted = [...state.receipts]
    .filter((receipt) => {
      if (state.receiptPersonFilter !== "all" && receipt.person !== state.receiptPersonFilter) return false;
      if (!query) return true;

      const searchable = [
        receipt.taskName,
        receipt.notes,
        receipt.category,
        receipt.date,
        personLabel(receipt.person)
      ].join(" ").toLowerCase();

      return searchable.includes(query);
    })
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));
  const visible = sorted.slice(0, 12);

  els.receiptList.innerHTML = visible.length
    ? visible.map((receipt) => `
        <article class="receipt-card" data-receipt-id="${escapeHtml(receipt.id)}">
          <div class="receipt-top">
            <div>
              <h4>${escapeHtml(receipt.taskName)}</h4>
              <p>${escapeHtml(receipt.notes || "Logged. Counted. No confetti required.")}</p>
            </div>
            <span class="person-badge ${personClass(receipt.person)}">${personLabel(receipt.person)}</span>
          </div>
          <div class="receipt-meta">
            <span>${formatDate(receipt.date)}</span>
            <span>${escapeHtml(receipt.category)}</span>
            <span>${minutesLabel(receipt.minutes)}</span>
          </div>
          <div class="receipt-card-actions">
            <button class="text-btn danger" type="button" data-delete-receipt="${escapeHtml(receipt.id)}">Delete</button>
          </div>
          ${receipt.photo ? `<img class="receipt-photo" src="${receipt.photo}" alt="Photo proof for ${escapeHtml(receipt.taskName)}">` : ""}
        </article>
      `).join("")
    : state.receipts.length
      ? `<div class="empty-state">No receipts match that search yet.</div>`
      : `<div class="empty-state">No receipts yet. Log the first tiny miracle that kept the household moving.</div>`;
}

function renderAll() {
  renderDashboard();
  renderReport();
  renderReceipts();
  renderSummaryVisibility();
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

function populatePeople(selected = els.person.value || "me") {
  const peopleOptions = getPeopleOptions()
    .map((person) => `<option value="${escapeHtml(person.value)}">${escapeHtml(person.label)}</option>`)
    .join("");
  els.person.innerHTML = `${peopleOptions}<option value="__add_person__">Add someone...</option>`;
  els.person.value = getPeopleOptions().some((person) => person.value === selected) ? selected : "me";
}

function populatePersonFilter() {
  const peopleOptions = getPeopleOptions()
    .map((person) => `<option value="${escapeHtml(person.value)}">${escapeHtml(person.label)}</option>`)
    .join("");
  els.receiptPersonFilter.innerHTML = `<option value="all">Everyone</option>${peopleOptions}`;
  els.receiptPersonFilter.value = getPeopleOptions().some((person) => person.value === state.receiptPersonFilter)
    ? state.receiptPersonFilter
    : "all";
}

function populateExportPerson() {
  const selected = els.exportPerson.value || "all";
  const peopleOptions = getPeopleOptions()
    .map((person) => `<option value="${escapeHtml(person.value)}">${escapeHtml(person.label)}</option>`)
    .join("");
  els.exportPerson.innerHTML = `<option value="all">Everyone</option>${peopleOptions}`;
  els.exportPerson.value = getPeopleOptions().some((person) => person.value === selected) ? selected : "all";
}

function populateCategories(selected = els.category.value || "Cleaning") {
  const categoryOptions = getCategoryOptions()
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("");
  els.category.innerHTML = `${categoryOptions}<option value="__add_category__">Add category...</option>`;
  els.category.value = getCategoryOptions().includes(selected) ? selected : "Cleaning";
}

function addCustomPerson() {
  const label = prompt("Who should be added to the list?");
  const trimmed = label?.trim();
  if (!trimmed) {
    populatePeople();
    return;
  }

  const exists = getPeopleOptions().some((person) => person.label.toLowerCase() === trimmed.toLowerCase());
  const value = exists ? getPeopleOptions().find((person) => person.label.toLowerCase() === trimmed.toLowerCase()).value : customValue(trimmed, "person");

  if (!exists) {
    state.customPeople.push({ value, label: trimmed });
    saveCustomOptions();
  }

  populatePeople(value);
  populatePersonFilter();
  populateExportPerson();
}

function addCustomCategory() {
  const label = prompt("What category should be added?");
  const trimmed = label?.trim();
  if (!trimmed) {
    populateCategories();
    return;
  }

  const existing = getCategoryOptions().find((category) => category.toLowerCase() === trimmed.toLowerCase());
  const category = existing || trimmed;

  if (!existing) {
    state.customCategories.push(category);
    saveCustomOptions();
  }

  populateCategories(category);
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

function getExportRange() {
  if (els.exportRange.value === "all") {
    return { label: "All receipts", start: "", end: "" };
  }

  if (els.exportRange.value === "custom") {
    const start = els.exportStartDate.value || todayKey();
    const end = els.exportEndDate.value || start;
    return start <= end
      ? { label: `${formatDate(start)} - ${formatDate(end)}`, start, end }
      : { label: `${formatDate(end)} - ${formatDate(start)}`, start: end, end: start };
  }

  const range = getRange(els.exportRange.value, els.logDate.value);
  const labels = {
    daily: "Selected day",
    weekly: "Selected week",
    monthly: "Selected month"
  };

  return {
    ...range,
    label: range.start === range.end ? `${labels[els.exportRange.value]}: ${formatDate(range.start)}` : `${labels[els.exportRange.value]}: ${formatDate(range.start)} - ${formatDate(range.end)}`
  };
}

function getExportReceipts() {
  const range = getExportRange();
  return state.receipts
    .filter((receipt) => {
      const inRange = !range.start || (receipt.date >= range.start && receipt.date <= range.end);
      const personMatches = els.exportPerson.value === "all" || receipt.person === els.exportPerson.value;
      return inRange && personMatches;
    })
    .sort((a, b) => `${a.date}${a.createdAt}`.localeCompare(`${b.date}${b.createdAt}`));
}

function exportFileSuffix() {
  const range = getExportRange();
  const person = els.exportPerson.value === "all" ? "everyone" : personLabel(els.exportPerson.value).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const rangePart = range.start ? `${range.start}-to-${range.end}` : "all";
  return `${rangePart}-${person}`;
}

function renderExportOptions() {
  const isCustom = els.exportRange.value === "custom";
  els.exportStartDate.closest("label").hidden = !isCustom;
  els.exportEndDate.closest("label").hidden = !isCustom;

  if (isCustom) {
    els.exportStartDate.value ||= els.logDate.value || todayKey();
    els.exportEndDate.value ||= els.logDate.value || todayKey();
  }
}

function exportCsv() {
  const exportReceipts = getExportReceipts();
  const headers = ["Date", "Person", "Task", "Category", "Minutes", "Hours", "Notes", "Has Photo"];
  const rows = exportReceipts.map((receipt) => [
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
  downloadFile(`household-receipts-${exportFileSuffix()}.csv`, "text/csv;charset=utf-8", csv);
}

function exportBackup() {
  const backup = {
    app: "Household Receipts",
    version: 2,
    exportedAt: new Date().toISOString(),
    customPeople: state.customPeople,
    customCategories: state.customCategories,
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
      person: getPeopleOptions().some((person) => person.value === receipt.person) ? receipt.person : "me",
      taskName: String(receipt.taskName || "").trim(),
      category: getCategoryOptions().includes(receipt.category) ? receipt.category : "Other",
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

function importCustomOptions(data) {
  const importedPeople = Array.isArray(data?.customPeople) ? data.customPeople : [];
  const importedCategories = Array.isArray(data?.customCategories) ? data.customCategories : [];
  let changed = false;

  importedPeople.forEach((person) => {
    const label = String(person.label || "").trim();
    const value = String(person.value || customValue(label, "person")).trim();
    if (!label || getPeopleOptions().some((item) => item.value === value || item.label.toLowerCase() === label.toLowerCase())) return;
    state.customPeople.push({ value, label });
    changed = true;
  });

  importedCategories.forEach((category) => {
    const label = String(category || "").trim();
    if (!label || getCategoryOptions().some((item) => item.toLowerCase() === label.toLowerCase())) return;
    state.customCategories.push(label);
    changed = true;
  });

  if (changed) {
    saveCustomOptions();
    populatePeople();
    populatePersonFilter();
    populateExportPerson();
    populateCategories();
  }
}

async function importBackupFile(file) {
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    importCustomOptions(data);
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
  const range = getExportRange();
  const exportReceipts = getExportReceipts();
  const summary = summarize(exportReceipts);
  const personLabelText = els.exportPerson.value === "all" ? "Everyone" : personLabel(els.exportPerson.value);
  const includeReceiptList = els.exportDetail.value === "full";
  const popup = window.open("", "_blank");
  if (!popup) {
    alert("Please allow popups to create the PDF report.");
    return;
  }

  const categoryRows = Object.entries(summary.categories)
    .sort((a, b) => b[1].minutes - a[1].minutes)
    .map(([category, item]) => `<tr><td>${escapeHtml(category)}</td><td>${item.tasks}</td><td>${minutesLabel(item.minutes)}</td></tr>`)
    .join("");
  const receiptRows = exportReceipts
    .map((receipt) => `
      <tr>
        <td>${formatDate(receipt.date)}</td>
        <td>${escapeHtml(personLabel(receipt.person))}</td>
        <td>${escapeHtml(receipt.taskName)}</td>
        <td>${escapeHtml(receipt.category)}</td>
        <td>${minutesLabel(receipt.minutes)}</td>
        <td>${escapeHtml(receipt.notes || "")}</td>
      </tr>
    `)
    .join("");

  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Household Receipts Report</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; padding: 32px; color: #27231f; }
          h1 { margin-bottom: 0; font-size: 34px; }
          .tagline { color: #cf6f4a; font-weight: 800; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
          .card { border: 1px solid #e8dfd2; border-radius: 14px; padding: 14px; }
          .card span { color: #746d64; display: block; font-size: 12px; font-weight: 700; }
          .card strong { font-size: 22px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border-bottom: 1px solid #e8dfd2; padding: 10px; text-align: left; vertical-align: top; }
          th { color: #746d64; font-size: 12px; text-transform: uppercase; }
          td { font-size: 13px; line-height: 1.4; }
        </style>
      </head>
      <body>
        <h1>Household Receipts</h1>
        <p class="tagline">Turns out the house wasn't cleaning itself after all.</p>
        <p>${escapeHtml(range.label)} &middot; ${escapeHtml(personLabelText)}</p>
        <div class="grid">
          <div class="card"><span>Tasks completed</span><strong>${summary.tasks}</strong></div>
          <div class="card"><span>Hours spent</span><strong>${(summary.minutes / 60).toFixed(1)}</strong></div>
          <div class="card"><span>My work</span><strong>${minutesLabel(summary.people.me.minutes)}</strong></div>
          <div class="card"><span>Partner work</span><strong>${minutesLabel(summary.people.partner.minutes)}</strong></div>
        </div>
        <h2>Categories</h2>
        <table>
          <thead><tr><th>Category</th><th>Tasks</th><th>Time</th></tr></thead>
          <tbody>${categoryRows || "<tr><td colspan='3'>No receipts in this export yet.</td></tr>"}</tbody>
        </table>
        ${includeReceiptList ? `
          <h2>Who Did What</h2>
          <table>
            <thead><tr><th>Date</th><th>Who</th><th>Task</th><th>Category</th><th>Time</th><th>Notes</th></tr></thead>
            <tbody>${receiptRows || "<tr><td colspan='6'>No receipts in this export yet.</td></tr>"}</tbody>
          </table>
        ` : ""}
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

function deleteReceipt(id) {
  const receipt = state.receipts.find((item) => item.id === id);
  if (!receipt) return;

  if (confirm(`Delete "${receipt.taskName}" from ${formatDate(receipt.date)}?`)) {
    state.receipts = state.receipts.filter((item) => item.id !== id);
    saveReceipts();
    renderAll();
  }
}

function handleReceiptListClick(event) {
  const deleteButton = event.target.closest("[data-delete-receipt]");
  if (!deleteButton) return;
  deleteReceipt(deleteButton.dataset.deleteReceipt);
}

function updateReceiptFilters() {
  state.receiptSearch = els.receiptSearch.value;
  state.receiptPersonFilter = els.receiptPersonFilter.value;
  renderReceipts();
  renderReceiptRollVisibility();
}

function bindEvents() {
  els.form.addEventListener("submit", handleSubmit);
  els.person.addEventListener("change", () => {
    if (els.person.value === "__add_person__") addCustomPerson();
  });
  els.category.addEventListener("change", () => {
    if (els.category.value === "__add_category__") addCustomCategory();
  });
  els.logDate.addEventListener("change", renderAll);
  els.todayBtn.addEventListener("click", jumpToToday);
  els.previousDayBtn?.addEventListener("click", () => shiftDate(-1));
  els.nextDayBtn?.addEventListener("click", () => shiftDate(1));
  els.exportCsvBtn.addEventListener("click", exportCsv);
  els.exportPdfBtn.addEventListener("click", exportPdf);
  els.exportRange.addEventListener("change", renderExportOptions);
  els.exportBackupBtn.addEventListener("click", exportBackup);
  els.importBackupBtn.addEventListener("click", () => els.importBackupInput.click());
  els.importBackupInput.addEventListener("change", () => importBackupFile(els.importBackupInput.files[0]));
  els.toggleSummaryBtn.addEventListener("click", toggleSummary);
  els.toggleReceiptRollBtn.addEventListener("click", toggleReceiptRoll);
  els.receiptSearch.addEventListener("input", updateReceiptFilters);
  els.receiptPersonFilter.addEventListener("change", updateReceiptFilters);
  els.receiptList.addEventListener("click", handleReceiptListClick);
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
  loadCustomOptions();
  populatePeople();
  populatePersonFilter();
  populateExportPerson();
  populateCategories();
  loadReceipts();
  loadCollapsePreferences();
  bindEvents();
  renderExportOptions();
  renderDailyReceipt();
  renderAll();
}

init();
