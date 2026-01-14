let data = null;
let currentKey = null;
let currentLang = "de";
let currentSection = null;

const recordSelect = document.getElementById("recordSelect");
const tabsEl = document.getElementById("tabs");
const editorEl = document.getElementById("editor");

// ================================
// JSON laden
// ================================
fetch("data.json")
  .then(res => {
    if (!res.ok) throw new Error("JSON konnte nicht geladen werden");
    return res.json();
  })
  .then(json => {
    data = json;
    initApp();
  })
  .catch(err => {
    console.error("Fehler beim Laden der JSON:", err);
    alert("data.json konnte nicht geladen werden");
  });

// ================================
// Init App
// ================================
function initApp() {
  // Dropdown füllen
  recordSelect.innerHTML = "";
  Object.keys(data.steckbriefe).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    recordSelect.appendChild(opt);
  });

  currentKey = recordSelect.value || Object.keys(data.steckbriefe)[0];

  recordSelect.addEventListener("change", () => {
    currentKey = recordSelect.value;
    buildTabs();
  });

  // Sprachumschaltung
  document.querySelectorAll(".lang-switch button").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      document.querySelectorAll(".lang-switch button")
        .forEach(b => b.classList.toggle("active", b === btn));
      buildTabs(); // neue Sprache, neue Tabs
    });
  });

  buildTabs();
}

// ================================
// Tabs bauen
// ================================
function buildTabs() {
  if (!data || !currentKey) return;

  tabsEl.innerHTML = "";

  const person = data.steckbriefe[currentKey][currentLang];
  if (!person) {
    editorEl.innerHTML = "<p>Daten für diese Sprache nicht vorhanden</p>";
    return;
  }

  const sections = Object.keys(person);
  sections.forEach((section, i) => {
    const btn = document.createElement("button");
    btn.textContent = section;
    btn.classList.toggle("active", i === 0);
    btn.onclick = () => openTab(section);
    tabsEl.appendChild(btn);
  });

  openTab(sections[0]);
}

function openTab(section) {
  currentSection = section;
  document.querySelectorAll(".tabs button").forEach(btn =>
    btn.classList.toggle("active", btn.textContent === section)
  );
  renderSection(section);
}

// ================================
// Editor Rendering
// ================================
function renderSection(section) {
  editorEl.innerHTML = "";

  const entries = data.steckbriefe[currentKey][currentLang][section];
  if (!Array.isArray(entries)) return;

  entries.forEach(entry => {
    const div = document.createElement("div");
    div.className = "entry";

    Object.keys(entry).forEach(field => {
      const label = document.createElement("label");
      label.textContent = field;
      const input = document.createElement("input");
      input.value = entry[field];
      input.oninput = e => entry[field] = e.target.value;
      div.appendChild(label);
      div.appendChild(input);
    });

    editorEl.appendChild(div);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ Eintrag hinzufügen";
  addBtn.className = "add-btn";
  addBtn.onclick = () => addEntry(section);
  editorEl.appendChild(addBtn);
}

function addEntry(section) {
  const entries = data.steckbriefe[currentKey][currentLang][section];
  const template = entries[0]
    ? Object.fromEntries(Object.keys(entries[0]).map(k => [k, ""]))
    : {};
  entries.push(template);
  renderSection(section);
}

// ================================
// Download
// ================================
document.getElementById("downloadBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "steckbriefe.json";
  a.click();
  URL.revokeObjectURL(a.href);
};
