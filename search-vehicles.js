let dataGlobal = null;
let currentLang =
  localStorage.getItem("appLang") ||
  (navigator.language.startsWith("fr") ? "fr" : "de");

/* ---------------------------
   UI Texte für Sprache
--------------------------- */
const uiText = {
  de: {
    plate: "Kontrollschild",
    vin: "VIN",
    searchBtn: "Suchen",
    subtitle: "Kontrollschild und/oder VIN eingeben",
    pageTitle: "Fahrzeugabfrage",
    errorNoData: "Daten nicht geladen",
    errorRequired: "Kontrollschild oder VIN erforderlich",
    errorNoMatch: "Kein Treffer gefunden"
  },
  fr: {
    plate: "Plaque d’immatriculation",
    vin: "VIN",
    searchBtn: "Rechercher",
    subtitle: "Entrez la plaque et/ou le VIN",
    pageTitle: "Recherche de véhicule",
    errorNoData: "Données non chargées",
    errorRequired: "Plaque ou VIN requis",
    errorNoMatch: "Aucun résultat trouvé"
  }
};

/* ---------------------------
   UI Texte aktualisieren
--------------------------- */
function updateUIText() {
  const t = uiText[currentLang];
  document.getElementById("label-plate").textContent = t.plate;
  document.getElementById("label-vin").textContent = t.vin;
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
    .catch(err =>
      console.error("Fehler beim Laden der Daten:", err)
    );
});

/* ---------------------------
   Suche (MOFIS + RIPOL)
--------------------------- */
document
  .getElementById("search-form")
  .addEventListener("submit", e => {
    e.preventDefault();
    const t = updateUIText();

    const plateInput = document
      .getElementById("plate")
      .value.trim()
      .toLowerCase();

    const vinInput = document
      .getElementById("vin")
      .value.trim()
      .toLowerCase();

    const errorEl = document.getElementById("error");
    errorEl.innerText = "";

    // Mindestens ein Feld erforderlich
    if (!plateInput && !vinInput) {
      errorEl.innerText = t.errorRequired;
      return;
    }

    if (!dataGlobal) {
      errorEl.innerText = t.errorNoData;
      return;
    }

    const foundKarten = [];

    for (const [karteId, steckbriefId] of Object.entries(
      dataGlobal.zuordnung
    )) {
      const steckbrief =
        dataGlobal.steckbriefe[steckbriefId];
      if (!steckbrief) continue;

      const sections = steckbrief[currentLang];
      if (!sections) continue;

      const searchItems = [];

      // Fahrzeuge
      if (Array.isArray(sections.MOFIS)) {
        searchItems.push(...sections.MOFIS);
      }

      // Fahndungen (auch Fahrzeuge)
      if (Array.isArray(sections.RIPOL)) {
        searchItems.push(...sections.RIPOL);
      }

      for (const item of searchItems) {
        if (!item || typeof item !== "object") continue;

        const plateValue =
          item.plate?.toLowerCase() || "";
        const vinValue =
          item.vin?.toLowerCase() || "";

        const plateMatch =
          !plateInput ||
          plateValue
            .replace(/\s+/g, "")
            .includes(
              plateInput.replace(/\s+/g, "")
            );

        const vinMatch =
          !vinInput || vinValue.includes(vinInput);

        if (plateMatch && vinMatch) {
          if (!foundKarten.includes(karteId)) {
            foundKarten.push(karteId);
          }
          break;
        }
      }
    }

    // Auswertung
    if (foundKarten.length === 1) {
      window.location.href = `index.html?karte=${
        foundKarten[0]
      }&query=${encodeURIComponent(
        plateInput || vinInput
      )}`;
    } else if (foundKarten.length > 1) {
      errorEl.innerText =
        currentLang === "fr"
          ? "Plusieurs véhicules trouvés – veuillez affiner la recherche"
          : "Mehrere Fahrzeuge gefunden – bitte Suche präzisieren";
    } else {
      errorEl.innerText = t.errorNoMatch;
    }
  });
