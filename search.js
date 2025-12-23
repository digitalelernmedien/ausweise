let dataGlobal = null;
let currentLang = navigator.language.startsWith("fr") ? "fr" : "de";

/* ---------------------------
   Geburtsdatum normalisieren
--------------------------- */
function normalizeDob(input) {
  if (!input) return null;
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(input)) {
    const [d, m, y] = input.split(".");
    return `${d.padStart(2, "0")}.${m.padStart(2, "0")}.${y}`;
  }
  if (/^\d{8}$/.test(input)) {
    const d = input.slice(0, 2);
    const m = input.slice(2, 4);
    const y = input.slice(4);
    return `${d}.${m}.${y}`;
  }
  return null;
}

/* ---------------------------
   UI Texte für Sprache
--------------------------- */
const uiText = {
  de: {
    lastname: "Nachname",
    firstname: "Vorname (optional)",
    dob: "Geburtsdatum (DD.MM.YYYY)",
    searchBtn: "Suchen",
    subtitle: "Name und Geburtsdatum eingeben",
    errorNoData: "Daten nicht geladen",
    errorRequired: "Nachname und Geburtsdatum sind erforderlich",
    errorInvalidDob: "Ungültiges Geburtsdatum (z. B. 12.03.1980 oder 12031980)",
    errorNoMatch: "Kein Treffer gefunden"
  },
  fr: {
    lastname: "Nom",
    firstname: "Prénom (facultatif)",
    dob: "Date de naissance (JJ.MM.AAAA)",
    searchBtn: "Rechercher",
    subtitle: "Saisir le nom et la date de naissance",
    errorNoData: "Données non chargées",
    errorRequired: "Nom et date de naissance requis",
    errorInvalidDob: "Date de naissance invalide (ex. 12.03.1980 ou 12031980)",
    errorNoMatch: "Aucun résultat trouvé"
  }
};

function updateUIText() {
  const t = uiText[currentLang];

  // Labels über Textnodes ersetzen
  document.querySelector('label[for="lastname"]').firstChild.textContent = t.lastname;
  document.querySelector('label[for="firstname"]').firstChild.textContent = t.firstname;
  document.querySelector('label[for="dob"]').firstChild.textContent = t.dob;

  // Suchbutton
  document.querySelector('#search-form button[type="submit"]').textContent = t.searchBtn;

  // Untertitel
  document.querySelector('.subtitle').textContent = t.subtitle;

  // Fehlertexte zurückgeben
  return t;
}

/* ---------------------------
   Daten laden
--------------------------- */
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    dataGlobal = data;
    setupFooter();
    updateUIText();
  })
  .catch(err => console.error("Fehler beim Laden der Daten:", err));

/* ---------------------------
   Suche
--------------------------- */
document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  const t = updateUIText();

  const lastname = document.getElementById("lastname").value.trim().toLowerCase();
  const firstname = document.getElementById("firstname").value.trim().toLowerCase();
  const dobInput = document.getElementById("dob").value.trim();
  const errorEl = document.getElementById("error");
  errorEl.innerText = "";

  if (!dataGlobal) return errorEl.innerText = t.errorNoData;
  if (!lastname || !dobInput) return errorEl.innerText = t.errorRequired;

  const normalizedDob = normalizeDob(dobInput);
  if (!normalizedDob) return errorEl.innerText = t.errorInvalidDob;

  let found = false;
  for (const [karteId, steckbriefId] of Object.entries(dataGlobal.zuordnung)) {
    const steckbrief = dataGlobal.steckbriefe[steckbriefId];
    const sections = steckbrief[currentLang];
    if (!sections) continue;

    for (const key of ["GERES", "ISA", "ZEMIS"]) {
      const entries = sections[key] || [];
      for (const entry of entries) {
        const eLower = entry.toLowerCase();
        const hasLastname = eLower.includes(lastname);
        const hasFirstname = firstname === "" || eLower.includes(firstname);
        const hasDob = entry.includes(normalizedDob);
        if (hasLastname && hasDob && hasFirstname) {
          found = true;
          window.location.href = `index.html?karte=${karteId}`;
          break;
        }
      }
      if (found) break;
    }
    if (found) break;
  }

  if (!found) errorEl.innerText = t.errorNoMatch;
});

/* ---------------------------
   Footer-Funktionen
--------------------------- */
function setupFooter() {
  const infoBtn = document.getElementById("info-btn");
  const speechBtn = document.getElementById("speech-btn");
  const resetBtn = document.getElementById("reset-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const backdrop = document.getElementById("backdrop");
  const infoModal = document.getElementById("info-modal");
  const infoCloseBtn = document.getElementById("info-close-btn");

  infoBtn?.addEventListener("click", () => {
    if (!dataGlobal) return;
    const infoData = dataGlobal.info_text[currentLang];
    document.getElementById("modal-title").innerHTML = infoData.title;
    document.getElementById("modal-body").innerHTML = infoData.body;
    document.getElementById("modal-functions-title").innerHTML = infoData.functions_title;

    const ul = document.getElementById("modal-functions-list");
    ul.innerHTML = "";
    infoData.functions.forEach(fn => {
      const li = document.createElement("li");
      li.innerHTML = fn;
      ul.appendChild(li);
    });

    document.getElementById("modal-warning").innerHTML = infoData.warning;
    document.getElementById("modal-credits").innerHTML = infoData.credits;

    infoModal.style.display = "flex";
  });

  infoCloseBtn?.addEventListener("click", () => infoModal.style.display = "none");
  infoModal?.addEventListener("click", e => { if(e.target === infoModal) infoModal.style.display = "none"; });

  // Sprachwechsel
  speechBtn?.addEventListener("click", () => {
    settingsMenu.style.display = "flex";
    backdrop.style.display = "block";
  });

  settingsMenu?.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      settingsMenu.style.display = "none";
      backdrop.style.display = "none";
      updateUIText(); // Texte sofort aktualisieren
      feather.replace(); // Icons neu rendern
    });
  });

  backdrop?.addEventListener("click", () => {
    settingsMenu.style.display = "none";
    backdrop.style.display = "none";
  });

  resetBtn?.addEventListener("click", () => {
    document.getElementById("lastname").value = "";
    document.getElementById("firstname").value = "";
    document.getElementById("dob").value = "";
    document.getElementById("error").innerText = "";
  });
}
