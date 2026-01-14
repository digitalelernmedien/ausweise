let data = null;
let currentKey = null;
let currentSection = null;

const recordSelect = document.getElementById("recordSelect");
const tabsEl = document.getElementById("tabs");
const editorDE = document.getElementById("editor-de");
const editorFR = document.getElementById("editor-fr");
const downloadBtn = document.getElementById("downloadBtn");

// ================================
// JSON laden
// ================================
fetch("data.json")
  .then(res => {
    if (!res.ok) throw new Error("data.json konnte nicht geladen werden");
    return res.json();
  })
  .then(json => {
    data = json;
    initApp();
  })
  .catch(err => {
    console.error("JSON konnte nicht geladen werden:", err);
    alert("data.json konnte nicht geladen werden. Prüfe Pfad und Syntax.");
  });

// ================================
// App initialisieren
// ================================
function initApp() {
  recordSelect.innerHTML = "";

  Object.keys(data.steckbriefe).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    recordSelect.appendChild(opt);
  });

  currentKey = recordSelect.value;

  recordSelect.addEventListener("change", () => {
    currentKey = recordSelect.value;
    buildTabs();
  });

  buildTabs();
}

// ================================
// Tabs erstellen
// ================================
function buildTabs() {
  tabsEl.innerHTML = "";
  if (!currentKey || !data) return;

  // DE oder FR nur für Tab-Namen prüfen, wir nehmen DE als Referenz
  const sections = Object.keys(data.steckbriefe[currentKey].de || {});
  if (sections.length === 0) {
    editorDE.innerHTML = "<p>Keine Daten vorhanden</p>";
    editorFR.innerHTML = "<p>Keine Daten vorhanden</p>";
    return;
  }

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
// Editor rendern (DE + FR nebeneinander)
// ================================
function renderSection(section) {
  editorDE.innerHTML = `<h3>Deutsch</h3>`;
  editorFR.innerHTML = `<h3>Französisch</h3>`;

  const entriesDE = data.steckbriefe[currentKey].de[section] || [];
  const entriesFR = data.steckbriefe[currentKey].fr[section] || [];

  // DE
  entriesDE.forEach((entry, index) => {
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
    editorDE.appendChild(div);
  });

  const addBtnDE = document.createElement("button");
  addBtnDE.className = "add-btn";
  addBtnDE.textContent = "+ Eintrag hinzufügen";
  addBtnDE.onclick = () => addEntry(section, "de");
  editorDE.appendChild(addBtnDE);

  // FR
  entriesFR.forEach((entry, index) => {
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
    editorFR.appendChild(div);
  });

  const addBtnFR = document.createElement("button");
  addBtnFR.className = "add-btn";
  addBtnFR.textContent = "+ Ajouter une entrée";
  addBtnFR.onclick = () => addEntry(section, "fr");
  editorFR.appendChild(addBtnFR);
}

// ================================
// Neue Einträge hinzufügen
// ================================
function addEntry(section, lang) {
  const entries = data.steckbriefe[currentKey][lang][section];
  const template = entries[0]
    ? Object.fromEntries(Object.keys(entries[0]).map(k => [k, ""]))
    : {};
  entries.push(template);
  renderSection(section);
}

// ================================
// JSON herunterladen
// ================================
downloadBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "steckbriefe.json";
  a.click();
  URL.revokeObjectURL(a.href);
};
