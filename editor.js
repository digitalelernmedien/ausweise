let data = null;
let currentKey = null;
let currentSection = null;

// Mapping DE → FR
const sectionMap = {
  "Vorgangsbearbeitung": "Traitement des processus",
  "GERES": "GERES",
  "ISA": "ISA",
  "FABER": "FABER",
  "MOFIS": "MOFIS",
  "ZEMIS": "ZEMIS",
  "Hoogan": "Hoogan",
  "RIPOL": "RIPOL"
};

const recordSelect = document.getElementById("recordSelect");
const tabsEl = document.getElementById("tabs");
const editorDE = document.getElementById("editor-de");
const editorFR = document.getElementById("editor-fr");

// ================================
// JSON Laden
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
    console.error("JSON konnte nicht geladen werden:", err);
    alert("data.json konnte nicht geladen werden");
  });

// ================================
// App Initialisierung
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
// Tabs bauen (DE als Basis)
// ================================
function buildTabs() {
  if (!data || !currentKey) return;
  tabsEl.innerHTML = "";

  const deSections = Object.keys(data.steckbriefe[currentKey].de);

  deSections.forEach((section, i) => {
    const btn = document.createElement("button");
    btn.textContent = section;
    btn.classList.toggle("active", i === 0);
    btn.onclick = () => openTab(section);
    tabsEl.appendChild(btn);
  });

  openTab(deSections[0]);
}

function openTab(section) {
  currentSection = section;
  document.querySelectorAll(".tabs button").forEach(btn =>
    btn.classList.toggle("active", btn.textContent === section)
  );
  renderSection(section);
}

// ================================
// Editor Rendering DE/FR
// ================================
function renderSection(deSection) {
  const frSection = sectionMap[deSection] || deSection;

  editorDE.innerHTML = `<h3>${deSection}</h3>`;
  editorFR.innerHTML = `<h3>${frSection}</h3>`;

  const entriesDE = data.steckbriefe[currentKey].de[deSection] || [];
  const entriesFR = data.steckbriefe[currentKey].fr[frSection] || [];

  // ---- DE-Spalte ----
  entriesDE.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";

    Object.keys(entry).forEach(field => {
      const label = document.createElement("label");
      label.textContent = field;
      const input = document.createElement("input");
      input.value = entry[field];

      // DE → FR Synchronisation
      input.oninput = e => {
    entry[field] = e.target.value;

    // Immer DE → FR synchronisieren
    if (entriesFR[index]) {
        entriesFR[index][field] = e.target.value;

        // FR Input sofort aktualisieren
        const frInputs = editorFR.querySelectorAll(".entry")[index].querySelectorAll("input");
        frInputs.forEach(inp => {
            if (inp.previousSibling.textContent === field) inp.value = e.target.value;
        });
    }
};

      div.appendChild(label);
      div.appendChild(input);
    });

    editorDE.appendChild(div);
  });

  // + Eintrag hinzufügen DE
  const addBtnDE = document.createElement("button");
  addBtnDE.textContent = "+ Eintrag hinzufügen";
  addBtnDE.className = "add-btn";
  addBtnDE.onclick = () => addEntry(deSection);
  editorDE.appendChild(addBtnDE);

  // ---- FR-Spalte ----
  entriesFR.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";

    Object.keys(entry).forEach(field => {
      const label = document.createElement("label");
      label.textContent = field;
      const input = document.createElement("input");
      input.value = entry[field];

      // FR Input nur lokal
      input.oninput = e => {
        entry[field] = e.target.value;
      };

      div.appendChild(label);
      div.appendChild(input);
    });

    editorFR.appendChild(div);
  });

  // + Eintrag hinzufügen FR (automatisch über DE)
  const addBtnFR = document.createElement("button");
  addBtnFR.textContent = "+ Eintrag hinzufügen";
  addBtnFR.className = "add-btn";
  addBtnFR.onclick = () => addEntry(deSection);
  editorFR.appendChild(addBtnFR);
}

// ================================
// Eintrag hinzufügen DE & FR
// ================================
function addEntry(deSection) {
  const frSection = sectionMap[deSection] || deSection;

  const entriesDE = data.steckbriefe[currentKey].de[deSection];
  const entriesFR = data.steckbriefe[currentKey].fr[frSection];

  const templateDE = entriesDE[0]
    ? Object.fromEntries(Object.keys(entriesDE[0]).map(k => [k, ""]))
    : {};
  const templateFR = entriesFR[0]
    ? Object.fromEntries(Object.keys(entriesFR[0]).map(k => [k, ""]))
    : {};

  entriesDE.push(templateDE);
  entriesFR.push(templateFR);

  renderSection(deSection);
}

// ================================
// Neuen Steckbrief erstellen
// ================================
function addNewSteckbrief() {
  if (!data || !data.steckbriefe) return;

  // 1. Höchsten Key finden
  const keys = Object.keys(data.steckbriefe);
  const lastKey = keys.sort().reverse()[0]; // S009 z.B.
  const nextNum = String(parseInt(lastKey.slice(1)) + 1).padStart(3, '0');
  const newKey = `S${nextNum}`;

  // 2. Template der ersten Person nehmen (DE + FR)
  const firstKey = keys[0];
  const templateDE = {};
  const templateFR = {};
  Object.keys(data.steckbriefe[firstKey].de).forEach(section => {
    templateDE[section] = data.steckbriefe[firstKey].de[section].map(entry =>
      Object.fromEntries(Object.keys(entry).map(k => [k, ""]))
    );
  });
  Object.keys(data.steckbriefe[firstKey].fr).forEach(section => {
    templateFR[section] = data.steckbriefe[firstKey].fr[section].map(entry =>
      Object.fromEntries(Object.keys(entry).map(k => [k, ""]))
    );
  });

  // 3. Neuen Steckbrief anlegen
  data.steckbriefe[newKey] = {
    de: templateDE,
    fr: templateFR
  };

  // 4. Neuer Key zur Auswahl hinzufügen
  const opt = document.createElement("option");
  opt.value = newKey;
  opt.textContent = newKey;
  recordSelect.appendChild(opt);

  // 5. Direkt auswählen & Editor öffnen
  recordSelect.value = newKey;
  currentKey = newKey;
  buildTabs();
}

// ================================
// Button in HTML einfügen
// ================================
const newBtn = document.createElement("button");
newBtn.textContent = "Neuen Steckbrief erstellen";
newBtn.className = "download-btn";
newBtn.style.background = "#007AFF";
newBtn.onclick = addNewSteckbrief;
document.querySelector("main").insertBefore(newBtn, document.getElementById("downloadBtn"));

// ================================
// JSON herunterladen
// ================================
document.getElementById("downloadBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "steckbriefe.json";
  a.click();
  URL.revokeObjectURL(a.href);
};
