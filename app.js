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

const storageKey = "householdReceipts.v2";
const state = {
  receipts: [],
  report: "daily"
};

const els = {
  form: document.querySelector("#taskForm"),
  logDate: document.querySelector("#logDate"),
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
  categoryBreakdown: document.querySelector("#categoryBreakdown"),
  receiptList: document.querySelector("#receiptList"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  exportPdfBtn: document.querySelector("#exportPdfBtn"),
  clearDataBtn: document.querySelector("#clearDataBtn"),
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

function minutesLabel(minutes) {
  if (!minutes) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function personLabel(person) {
  return person === "partner" ? "Partner" : "Me";
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
      summary.people[receipt.person].tasks += 1;
      summary.people[receipt.person].minutes += receipt.minutes;
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
        partner: { tasks: 0, minutes: 0 }
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
    daily: ["Daily summary", "What got done"],
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
            <span class="person-badge ${receipt.person === "partner" ? "partner" : ""}">${personLabel(receipt.person)}</span>
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
  els.exportCsvBtn.addEventListener("click", exportCsv);
  els.exportPdfBtn.addEventListener("click", exportPdf);
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
  bindEvents();
  renderAll();
}

init();
