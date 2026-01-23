let data = null;
let currentKey = null;
let currentSection = null;

// ================================
// Section Mapping DE → FR
// ================================
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
// JSON laden
// ================================
fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    initApp();
    initZuordnung();
  });

// ================================
// App Init
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
  recordSelect.onchange = () => {
    currentKey = recordSelect.value;
    buildTabs();
  };

  buildTabs();
}

// ================================
// Tabs
// ================================
function buildTabs() {
  tabsEl.innerHTML = "";
  const sections = Object.keys(data.steckbriefe[currentKey].de);

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
// Rendering DE / FR
// ================================
function renderSection(deSection) {
  const frSection = sectionMap[deSection] || deSection;

  editorDE.innerHTML = `<h3>${deSection}</h3>`;
  editorFR.innerHTML = `<h3>${frSection}</h3>`;

  const entriesDE = data.steckbriefe[currentKey].de[deSection];
  const entriesFR = data.steckbriefe[currentKey].fr[frSection];

  // ---------- DE ----------
  entriesDE.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";

    Object.keys(entry).forEach(field => {
      const label = document.createElement("label");
      label.textContent = field;

      const input = document.createElement("input");
      input.value = entry[field];

      input.oninput = e => {
        const value = e.target.value;
        entry[field] = value;

        const frEntry = entriesFR[index];
        if (!frEntry) return;

        const frDiv = editorFR.querySelectorAll(".entry")[index];
        if (!frDiv) return;

        frDiv.querySelectorAll("input").forEach(frInput => {
          if (frInput.previousSibling.textContent !== field) return;

          // 👉 nur synchronisieren, wenn FR nicht manuell geändert wurde
          if (frInput.dataset.locked !== "true") {
            frEntry[field] = value;
            frInput.value = value;
          }
        });
      };

      div.appendChild(label);
      div.appendChild(input);
    });

    editorDE.appendChild(div);
  });

  const addBtnDE = document.createElement("button");
  addBtnDE.textContent = "+ Eintrag hinzufügen";
  addBtnDE.className = "add-btn";
  addBtnDE.onclick = () => addEntry(deSection);
  editorDE.appendChild(addBtnDE);

  // ---------- FR ----------
  entriesFR.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";

    Object.keys(entry).forEach(field => {
      const label = document.createElement("label");
      label.textContent = field;

      const input = document.createElement("input");
      input.value = entry[field];
      input.dataset.locked = entry[field] ? "true" : "false";

      input.oninput = e => {
        entry[field] = e.target.value;
        input.dataset.locked = "true"; // FR ist jetzt manuell
      };

      div.appendChild(label);
      div.appendChild(input);
    });

    editorFR.appendChild(div);
  });

  const addBtnFR = document.createElement("button");
  addBtnFR.textContent = "+ Eintrag hinzufügen";
  addBtnFR.className = "add-btn";
  addBtnFR.onclick = () => addEntry(deSection);
  editorFR.appendChild(addBtnFR);
}

// ================================
// Eintrag hinzufügen
// ================================
function addEntry(deSection) {
  const frSection = sectionMap[deSection] || deSection;

  const entriesDE = data.steckbriefe[currentKey].de[deSection];
  const entriesFR = data.steckbriefe[currentKey].fr[frSection];

  const templateDE = Object.fromEntries(Object.keys(entriesDE[0]).map(k => [k, ""]));
  const templateFR = Object.fromEntries(Object.keys(entriesFR[0]).map(k => [k, ""]));

  entriesDE.push(templateDE);
  entriesFR.push(templateFR);

  renderSection(deSection);
}

// ================================
// Neuen Steckbrief + Zuordnung
// ================================
function addNewSteckbrief() {
  const keys = Object.keys(data.steckbriefe).sort();
  const next = String(parseInt(keys.at(-1).slice(1)) + 1).padStart(3, "0");
  const newKey = `S${next}`;

  const base = data.steckbriefe[keys[0]];
  data.steckbriefe[newKey] = JSON.parse(JSON.stringify(base));

  Object.values(data.steckbriefe[newKey].de).forEach(arr =>
    arr.forEach(obj => Object.keys(obj).forEach(k => obj[k] = ""))
  );
  Object.values(data.steckbriefe[newKey].fr).forEach(arr =>
    arr.forEach(obj => Object.keys(obj).forEach(k => obj[k] = ""))
  );

  const kKeys = Object.keys(data.zuordnung).sort();
  const nextK = String(parseInt(kKeys.at(-1).slice(1)) + 1).padStart(3, "0");
  data.zuordnung[`K${nextK}`] = newKey;

  const opt = document.createElement("option");
  opt.value = newKey;
  opt.textContent = newKey;
  recordSelect.appendChild(opt);

  recordSelect.value = newKey;
  currentKey = newKey;
  buildTabs();
  renderZuordnung();
}

// ================================
// Zuordnung
// ================================
function renderZuordnung() {
  const div = document.getElementById("zuordnungDiv");
  div.innerHTML = "<h3>Karten-Steckbrief-Zuordnung</h3>";

  Object.keys(data.zuordnung).forEach(k => {
    const row = document.createElement("div");

    const label = document.createElement("label");
    label.textContent = k;

    const select = document.createElement("select");
    Object.keys(data.steckbriefe).forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (data.zuordnung[k] === s) opt.selected = true;
      select.appendChild(opt);
    });

    select.onchange = e => data.zuordnung[k] = e.target.value;

    row.append(label, select);
    div.appendChild(row);
  });
}

function initZuordnung() {
  renderZuordnung();
}

// ================================
// Buttons
// ================================
document.getElementById("toggleZuordnungBtn").onclick = () => {
  const div = document.getElementById("zuordnungDiv");
  div.style.display = div.style.display === "none" ? "block" : "none";
};

const newBtn = document.createElement("button");
newBtn.textContent = "Neuen Steckbrief erstellen";
newBtn.className = "download-btn";
newBtn.onclick = addNewSteckbrief;
document.querySelector("main").insertBefore(newBtn, document.getElementById("downloadBtn"));

document.getElementById("downloadBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "steckbriefe.json";
  a.click();
};
