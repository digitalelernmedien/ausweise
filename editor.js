let data = null;
let currentKey = null;
let currentSection = null;

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
    renderZuordnungen(); // Zuordnung direkt anzeigen
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
// Tabs bauen
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
function renderSection(section) {
  editorDE.innerHTML = `<h3>${section}</h3>`;
  editorFR.innerHTML = `<h3>${section}</h3>`;

  const entriesDE = data.steckbriefe[currentKey].de[section] || [];
  const entriesFR = data.steckbriefe[currentKey].fr[section] || [];

  // ---- DE-Spalte ----
  entriesDE.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";

    Object.keys(entry).forEach(field => {
      const label = document.createElement("label");
      label.textContent = field;
      const input = document.createElement("input");
      input.value = entry[field];

      input.oninput = e => {
        entry[field] = e.target.value;

        if (entriesFR[index]) {
          entriesFR[index][field] = e.target.value;

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
  addBtnDE.onclick = () => addEntry(section);
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

      input.oninput = e => {
        entry[field] = e.target.value;
      };

      div.appendChild(label);
      div.appendChild(input);
    });

    editorFR.appendChild(div);
  });

  // + Eintrag hinzufügen FR (über DE)
  const addBtnFR = document.createElement("button");
  addBtnFR.textContent = "+ Eintrag hinzufügen";
  addBtnFR.className = "add-btn";
  addBtnFR.onclick = () => addEntry(section);
  editorFR.appendChild(addBtnFR);
}

// ================================
// Eintrag hinzufügen DE & FR
// ================================
function addEntry(section) {
  const entriesDE = data.steckbriefe[currentKey].de[section];
  const entriesFR = data.steckbriefe[currentKey].fr[section];

  const templateDE = entriesDE[0]
    ? Object.fromEntries(Object.keys(entriesDE[0]).map(k => [k, ""]))
    : {};
  const templateFR = entriesFR[0]
    ? Object.fromEntries(Object.keys(entriesFR[0]).map(k => [k, ""]))
    : {};

  entriesDE.push(templateDE);
  entriesFR.push(templateFR);

  renderSection(section);
}

// ================================
// Neuen Steckbrief erstellen
// ================================
function addNewSteckbrief() {
  if (!data || !data.steckbriefe) return;

  const keys = Object.keys(data.steckbriefe);
  const lastKey = keys.sort().reverse()[0]; // letzter Steckbrief
  const nextNum = String(parseInt(lastKey.slice(1)) + 1).padStart(3, '0');
  const newKey = `S${nextNum}`;

  // Template von erster Person
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

  data.steckbriefe[newKey] = { de: templateDE, fr: templateFR };

  const opt = document.createElement("option");
  opt.value = newKey;
  opt.textContent = newKey;
  recordSelect.appendChild(opt);

  recordSelect.value = newKey;
  currentKey = newKey;
  buildTabs();
  renderZuordnungen(); // Zuordnungen aktualisieren
}

// ================================
// Zuordnungen K → S anzeigen & bearbeiten
// ================================
function renderZuordnungen() {
  const container = document.getElementById("zuordnungContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!data || !data.zuordnung) return;

  Object.entries(data.zuordnung).forEach(([k, s]) => {
    const div = document.createElement("div");
    div.className = "entry";

    const labelK = document.createElement("label");
    labelK.textContent = "Code (Kxxx)";
    const inputK = document.createElement("input");
    inputK.value = k;

    const labelS = document.createElement("label");
    labelS.textContent = "Steckbrief (Sxxx)";
    const inputS = document.createElement("input");
    inputS.value = s;

    // Änderungen speichern
    inputK.oninput = e => {
      const oldKey = k;
      const newKey = e.target.value;
      if (newKey !== oldKey) {
        data.zuordnung[newKey] = data.zuordnung[oldKey];
        delete data.zuordnung[oldKey];
        renderZuordnungen();
      }
    };
    inputS.oninput = e => {
      data.zuordnung[k] = e.target.value;
    };

    div.appendChild(labelK);
    div.appendChild(inputK);
    div.appendChild(labelS);
    div.appendChild(inputS);
    container.appendChild(div);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ Zuordnung hinzufügen";
  addBtn.className = "add-btn";
  addBtn.onclick = () => {
    const keys = Object.keys(data.zuordnung);
    let nextK = "K001";
    if (keys.length) {
      const lastNum = Math.max(...keys.map(k => parseInt(k.slice(1))));
      nextK = "K" + String(lastNum + 1).padStart(3, "0");
    }
    const lastS = Object.values(data.zuordnung).slice(-1)[0] || "S001";
    const nextS = "S" + String(parseInt(lastS.slice(1)) + 1).padStart(3, "0");
    data.zuordnung[nextK] = nextS;
    renderZuordnungen();
  };
  container.appendChild(addBtn);
}

// ================================
// Button Neuen Steckbrief erstellen
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
