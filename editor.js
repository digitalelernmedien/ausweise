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
  .then(res => {
    if (!res.ok) throw new Error("JSON konnte nicht geladen werden");
    return res.json();
  })
  .then(json => {
    data = json;
    initApp();
    initZuordnung();
  })
  .catch(err => {
    console.error(err);
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
// Tabs
// ================================
function buildTabs() {
  if (!data || !currentKey) return;

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
// Editor Rendering
// ================================
function renderSection(deSection) {
  const frSection = sectionMap[deSection] || deSection;

  editorDE.innerHTML = `<h3>${deSection}</h3>`;
  editorFR.innerHTML = `<h3>${frSection}</h3>`;

  const entriesDE = data.steckbriefe[currentKey].de[deSection] || [];
  const entriesFR = data.steckbriefe[currentKey].fr[frSection] || [];

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
        const newValue = e.target.value;
        entry[field] = newValue;

        if (entriesFR[index]) {
          const frValue = entriesFR[index][field];
          if (frValue === "" || frValue === null || frValue === undefined) {
            entriesFR[index][field] = newValue;

            const frDiv = editorFR.querySelectorAll(".entry")[index];
            if (frDiv) {
              frDiv.querySelectorAll("input").forEach(inp => {
                if (inp.previousSibling.textContent === field) {
                  inp.value = newValue;
                }
              });
            }
          }
        }
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
  entriesFR.forEach(entry => {
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

  const template = obj =>
    Object.fromEntries(Object.keys(obj).map(k => [k, ""]));

  entriesDE.push(entriesDE[0] ? template(entriesDE[0]) : {});
  entriesFR.push(entriesFR[0] ? template(entriesFR[0]) : {});

  renderSection(deSection);
}

// ================================
// Neuen Steckbrief erstellen
// ================================
function addNewSteckbrief() {
  const keys = Object.keys(data.steckbriefe).sort();
  const last = keys[keys.length - 1];
  const next = `S${String(parseInt(last.slice(1)) + 1).padStart(3, "0")}`;

  const base = data.steckbriefe[keys[0]];
  const clone = obj =>
    Object.fromEntries(Object.entries(obj).map(
      ([k, v]) => [k, v.map(e => Object.fromEntries(Object.keys(e).map(f => [f, ""])))]
    ));

  data.steckbriefe[next] = {
    de: clone(base.de),
    fr: clone(base.fr)
  };

  const kKeys = Object.keys(data.zuordnung).sort();
  const lastK = kKeys[kKeys.length - 1];
  const nextK = `K${String(parseInt(lastK.slice(1)) + 1).padStart(3, "0")}`;
  data.zuordnung[nextK] = next;

  const opt = document.createElement("option");
  opt.value = next;
  opt.textContent = next;
  recordSelect.appendChild(opt);

  recordSelect.value = next;
  currentKey = next;

  buildTabs();
  renderZuordnung();
}

// ================================
// Zuordnung rendern
// ================================
function renderZuordnung() {
  const div = document.getElementById("zuordnungDiv");
  div.innerHTML = "<h3>Karten-Steckbrief-Zuordnung</h3>";

  Object.keys(data.zuordnung).forEach(k => {
    const row = document.createElement("div");

    const label = document.createElement("label");
    label.textContent = k;
    label.style.marginRight = "0.5rem";

    const select = document.createElement("select");
    Object.keys(data.steckbriefe).forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (data.zuordnung[k] === s) opt.selected = true;
      select.appendChild(opt);
    });

    select.onchange = e => data.zuordnung[k] = e.target.value;

    row.appendChild(label);
    row.appendChild(select);
    div.appendChild(row);
  });
}

function initZuordnung() {
  if (data?.zuordnung) renderZuordnung();
}

// ================================
// Buttons
// ================================
document.getElementById("toggleZuordnungBtn").onclick = () => {
  const div = document.getElementById("zuordnungDiv");
  const btn = document.getElementById("toggleZuordnungBtn");

  const open = div.style.display !== "none";
  div.style.display = open ? "none" : "block";
  btn.textContent = open
    ? "Karten-Steckbrief-Zuordnung anzeigen"
    : "Karten-Steckbrief-Zuordnung ausblenden";
};

const newBtn = document.createElement("button");
newBtn.textContent = "Neuen Steckbrief erstellen";
newBtn.className = "download-btn";
newBtn.style.background = "#007AFF";
newBtn.onclick = addNewSteckbrief;
document.querySelector("main").insertBefore(newBtn, document.getElementById("downloadBtn"));

// ================================
// JSON Download
// ================================
document.getElementById("downloadBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "steckbriefe.json";
  a.click();
  URL.revokeObjectURL(a.href);
};
