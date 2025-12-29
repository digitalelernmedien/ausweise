let dataGlobal = null;
let currentLang = localStorage.getItem("appLang") || (navigator.language.startsWith("fr") ? "fr" : "de");


/* ---------------------------
   Geburtsdatum normalisieren
--------------------------- */
function normalizeDob(input) {
  if (!input) return null;
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(input)) {
    const [d, m, y] = input.split(".");
    return `${d.padStart(2,"0")}.${m.padStart(2,"0")}.${y}`;
  }
  if (/^\d{8}$/.test(input)) {
    const d = input.slice(0,2);
    const m = input.slice(2,4);
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
    dob: "DD.MM.YYYY",
    searchBtn: "Suchen",
    subtitle: "Name und Geburtsdatum eingeben",
    pageTitle: "Identitätsabfrage",
    errorNoData: "Daten nicht geladen",
    errorRequired: "Nachname und Geburtsdatum sind erforderlich",
    errorInvalidDob: "Ungültiges Geburtsdatum (z. B. 12.03.1980 oder 12031980)",
    errorNoMatch: "Kein Treffer gefunden"
  },
  fr: {
    lastname: "Nom",
    firstname: "Prénom (facultatif)",
    dob: "JJ.MM.AAAA",
    searchBtn: "Rechercher",
    subtitle: "Entrez le nom et la date de naissance",
    pageTitle: "Identité à vérifier",
    errorNoData: "Données non chargées",
    errorRequired: "Nom et date de naissance requis",
    errorInvalidDob: "Date de naissance invalide (ex. 12.03.1980 ou 12031980)",
    errorNoMatch: "Aucun résultat trouvé"
  }
};

/* ---------------------------
   UI Texte aktualisieren
--------------------------- */
function updateUIText() {
  const t = uiText[currentLang];
  document.getElementById("label-lastname").textContent = t.lastname;
  document.getElementById("label-firstname").textContent = t.firstname;
  document.getElementById("label-dob").textContent = t.dob;
  document.getElementById("search-btn").textContent = t.searchBtn;
  document.getElementById("page-subtitle").textContent = t.subtitle;
  document.getElementById("page-title").textContent = t.pageTitle;

  // DOB Placeholder nach Sprache setzen
  const dobInput = document.getElementById("dob");
  if (dobInput) dobInput.placeholder = t.dob;

  return t;
}

/* ---------------------------
   Daten laden
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // currentLang bereits gesetzt
  updateUIText(); // setzt alle Texte direkt beim Laden

  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      dataGlobal = data;
      setupFooter(); // Footer-Funktionen aktivieren
    })
    .catch(err => console.error("Fehler beim Laden der Daten:", err));
});


/* ---------------------------
   Suche
--------------------------- */
document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  const t = updateUIText(); // aktuelle Sprache

  const lastname = document.getElementById("lastname").value.trim().toLowerCase();
  const firstname = document.getElementById("firstname").value.trim().toLowerCase();
  const dobInput = document.getElementById("dob").value.trim();
  const errorEl = document.getElementById("error");
  errorEl.innerText = "";

  // Pflichtfelder prüfen
  if (!lastname || !dobInput) {
    errorEl.innerText = t.errorRequired; // aus uiText: deutsch oder französisch
    return;
  }

  // Datum validieren
  const normalizedDob = normalizeDob(dobInput);
  if (!normalizedDob) {
    errorEl.innerText = t.errorInvalidDob;
    return;
  }

  // Suche starten
  let found = false;
  for (const [karteId, steckbriefId] of Object.entries(dataGlobal.zuordnung)) {
    const steckbrief = dataGlobal.steckbriefe[steckbriefId];
    const sections = steckbrief[currentLang];
    if (!sections) continue;

    for (const key of ["GERES","ISA","ZEMIS"]) {
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

  if (!found) {
    errorEl.innerText = t.errorNoMatch;
  }
});


/* ---------------------------
   Footer-Funktionen (Info, Sprache, Reset, Zurück)
--------------------------- */
function setupFooter() {
  const infoBtn = document.getElementById("info-btn");
  const speechBtn = document.getElementById("speech-btn");
  const resetBtn = document.getElementById("reset-btn");
  const backBtn = document.getElementById("back-btn"); // falls vorhanden
  const settingsMenu = document.getElementById("settings-menu");
  const backdrop = document.getElementById("backdrop");
  const infoModal = document.getElementById("info-modal");
  const infoCloseBtn = document.getElementById("info-close-btn");

  /* Info-Modal öffnen */
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
  infoModal?.addEventListener("click", e => { if(e.target===infoModal) infoModal.style.display="none"; });

  /* Sprachwechsel */
  speechBtn?.addEventListener("click", () => {
    settingsMenu.style.display="flex";
    backdrop.style.display="block";
  });
  settingsMenu?.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem("appLang", currentLang);
      settingsMenu.style.display="none";
      backdrop.style.display="none";
      updateUIText();
      feather.replace();
    });
  });

  backdrop?.addEventListener("click", () => {
    settingsMenu.style.display="none";
    backdrop.style.display="none";
  });

  /* Reset */
  resetBtn?.addEventListener("click", () => {
    document.getElementById("lastname").value="";
    document.getElementById("firstname").value="";
    document.getElementById("dob").value="";
    document.getElementById("error").innerText="";
  });

  /* Zurück */
  backBtn?.addEventListener("click", () => window.history.back());
}
