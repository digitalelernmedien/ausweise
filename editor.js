let data = null;
let currentKey = null;
let currentSection = null;

const recordSelect = document.getElementById("recordSelect");
const tabsEl = document.getElementById("tabs");
const editorDE = document.getElementById("editor-de");
const editorFR = document.getElementById("editor-fr");

// Daten laden
fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    initApp();
  })
  .catch(err => {
    console.error("JSON konnte nicht geladen werden:", err);
    alert("data.json konnte nicht geladen werden");
  });

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

// Tabs aufbauen
function buildTabs() {
  tabsEl.innerHTML = "";
  const personDE = data.steckbriefe[currentKey]["de"];
  const sections = Object.keys(personDE);

  sections.forEach((section, i) => {
    const btn = document.createElement("button");
    btn.textContent = section;
    btn.classList.toggle("active", i===0);
    btn.onclick = () => openTab(section);
    tabsEl.appendChild(btn);
  });

  openTab(sections[0]);
}

function openTab(section) {
  currentSection = section;
  document.querySelectorAll(".tabs button").forEach(btn =>
    btn.classList.toggle("active", btn.textContent===section)
  );
  renderSection(section);
}

// Editor rendern für DE und FR nebeneinander
function renderSection(section) {
  editorEl.innerHTML = "";

  // Absicherung: Section in DE und FR muss existieren
  const personDE = data.steckbriefe[currentKey]?.de || {};
  const personFR = data.steckbriefe[currentKey]?.fr || {};

  const entriesDE = Array.isArray(personDE[section]) ? personDE[section] : [];
  const entriesFR = Array.isArray(personFR[section]) ? personFR[section] : [];

  const maxLen = Math.max(entriesDE.length, entriesFR.length);

  for (let i = 0; i < maxLen; i++) {
    // DE
    const divDE = document.createElement("div");
    divDE.className = "entry";
    const entryDE = entriesDE[i] || {};
    Object.keys(entryDE).forEach(f => {
      const label = document.createElement("label");
      label.textContent = f;
      const input = document.createElement("input");
      input.value = entryDE[f];
      input.oninput = e => entryDE[f] = e.target.value;
      divDE.appendChild(label);
      divDE.appendChild(input);
    });
    editorEl.appendChild(divDE);

    // FR
    const divFR = document.createElement("div");
    divFR.className = "entry";
    const entryFR = entriesFR[i] || {};
    Object.keys(entryFR).forEach(f => {
      const label = document.createElement("label");
      label.textContent = f;
      const input = document.createElement("input");
      input.value = entryFR[f];
      input.oninput = e => entryFR[f] = e.target.value;
      divFR.appendChild(label);
      divFR.appendChild(input);
    });
    editorEl.appendChild(divFR);
  }

  // + Eintrag hinzufügen
  const addBtn = document.createElement("button");
  addBtn.textContent = "+ Eintrag hinzufügen";
  addBtn.className = "add-btn";
  addBtn.onclick = () => addEntry(section);
  editorEl.appendChild(addBtn);
}


function addEntry(section) {
  const entriesDE = data.steckbriefe[currentKey]["de"][section];
  const entriesFR = data.steckbriefe[currentKey]["fr"][section];

  const templateDE = entriesDE[0] ? Object.fromEntries(Object.keys(entriesDE[0]).map(k=>[k,""])) : {};
  const templateFR = entriesFR[0] ? Object.fromEntries(Object.keys(entriesFR[0]).map(k=>[k,""])) : {};

  entriesDE.push(templateDE);
  entriesFR.push(templateFR);

  renderSection(section);
}

// Download JSON
document.getElementById("downloadBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "steckbriefe.json";
  a.click();
  URL.revokeObjectURL(a.href);
};
