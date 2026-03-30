let dataGlobal = null;
let currentLang =
  localStorage.getItem("appLang") ||
  (navigator.language.startsWith("fr") ? "fr" : "de");

/* ---------------------------
   UI Texte für Sprache
--------------------------- */
const uiText = {
  de: {
    label: "Seriennummer",
    searchBtn: "Suchen",
    subtitle: "Seriennummer eingeben",
    pageTitle: "Sachabfrage",
    errorRequired: "Seriennummer erforderlich",
    errorNoMatch: "Kein Treffer gefunden",
    errorMultiple: "Mehrere Objekte gefunden – bitte Suche präzisieren",
    errorNoData: "Daten nicht geladen"
  },
  fr: {
    label: "Numéro de série",
    searchBtn: "Rechercher",
    subtitle: "Entrez le numéro de série",
    pageTitle: "Recherche d’objet",
    errorRequired: "Numéro de série requis",
    errorNoMatch: "Aucun résultat trouvé",
    errorMultiple: "Plusieurs objets trouvés – veuillez affiner la recherche",
    errorNoData: "Données non chargées"
  }
};

/* ---------------------------
   UI Texte aktualisieren
--------------------------- */
function updateUIText() {
  const t = uiText[currentLang];
  document.getElementById("label-serial").textContent = t.label;
  document.getElementById("search-btn").textContent = t.searchBtn;
  document.getElementById("page-subtitle").textContent = t.subtitle;
  document.getElementById("page-title").textContent = t.pageTitle;
  return t;
}

/* ---------------------------
   Daten laden
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  updateUIText();

  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      dataGlobal = data;
    })
    .catch(err => {
      console.error("Fehler beim Laden der Daten:", err);
    });
});

/* ---------------------------
   Suche nach Sachen (Seriennummer)
--------------------------- */
document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  const t = updateUIText();

  const serialInput = document
    .getElementById("serial")
    .value.trim()
    .toLowerCase();

  const errorEl = document.getElementById("error");
  errorEl.textContent = "";

  if (!serialInput) {
    errorEl.textContent = t.errorRequired;
    return;
  }

  if (!dataGlobal) {
    errorEl.textContent = t.errorNoData;
    return;
  }

  const foundKarten = [];

  const searchSections =
    currentLang === "fr"
      ? ["Traitement des processus", "RIPOL"]
      : ["Vorgangsbearbeitung", "RIPOL"];

  for (const [karteId, steckbriefId] of Object.entries(dataGlobal.zuordnung)) {
    const steckbrief = dataGlobal.steckbriefe[steckbriefId];
    if (!steckbrief) continue;

    const sections = steckbrief[currentLang];
    if (!sections) continue;

    for (const sectionName of searchSections) {
      const entries = sections[sectionName];
      if (!Array.isArray(entries)) continue;

      for (const item of entries) {
        if (!item || typeof item !== "object") continue;
        if (!item.serial) continue;

        // ✅ Teiltreffer NUR im Seriennummer-Feld
        if (item.serial.toLowerCase().includes(serialInput)) {
          if (!foundKarten.includes(karteId)) {
            foundKarten.push(karteId);
          }
          break;
        }
      }
    }
  }

  if (foundKarten.length === 1) {
    window.location.href =
  `index.html?karte=${foundKarten[0]}&query=${encodeURIComponent(serialInput)}`;
  } else if (foundKarten.length > 1) {
    errorEl.textContent = t.errorMultiple;
  } else {
    errorEl.textContent = t.errorNoMatch;
  }
});

