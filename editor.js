// ================================
// Beispiel-Daten (hier später ersetzen)
// ================================
let data = {
  steckbriefe: {
    S001: {
      de: {
        Vorgangsbearbeitung: [
          { ESW: "Diebstahl", year: "2024", description: "" }
        ],
        GERES: [
          { firstname: "Thomas", lastname: "Meier", dob: "12.03.1980" }
        ]
      },
      fr: {
        "Traitement des processus": [
          { ESW: "Vol", year: "2024", description: "" }
        ],
        GERES: [
          { firstname: "Thomas", lastname: "Meier", dob: "12.03.1980" }
        ]
      }
    }
  }
};

// ================================
// State
// ================================
let currentKey = null;
let currentLang = "de";
let currentSection = null;

// ================================
// Init
// ================================
const recordSelect = document.getElementById("recordSelect");
const tabsEl = document.getElementById("tabs");
const editorEl = document.getElementById("editor");

// Records laden
Object.keys(data.steckbriefe).forEach(key => {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = key;
  recordSelect.appendChild(opt);
});

recordSelect.addEventListener("change", () => {
  currentKey = recordSelect.value;
  buildTabs();
});

currentKey = recordSelect.value;
buildTabs();

// ================================
// Sprache
// ================================
document.querySelectorAll(".lang-switch button").forEach(btn => {
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.lang;
    document.querySelectorAll(".lang-switch button")
      .forEach(b => b.classList.toggle("active", b === btn));
    renderSection(currentSection);
  });
});

// ================================
// Tabs
// ================================
function buildTabs() {
  tabsEl.innerHTML = "";
  const person = data.steckbriefe[currentKey][currentLang];
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

  entries.forEach((entry, index) => {
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

    editorEl.appendChild(div);
  });

  // + Eintrag hinzufügen
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
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "steckbriefe.json";
  a.click();
  URL.revokeObjectURL(a.href);
};
