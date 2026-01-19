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
      setupFooter();
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

/* ---------------------------
   Footer-Funktionen
--------------------------- */
function setupFooter() {
  const infoBtn =
    document.getElementById("info-btn");
  const speechBtn =
    document.getElementById("speech-btn");
  const resetBtn =
    document.getElementById("reset-btn");
  const backBtn =
    document.getElementById("back-btn");
  const settingsMenu =
    document.getElementById("settings-menu");
  const backdrop =
    document.getElementById("backdrop");
  const infoModal =
    document.getElementById("info-modal");
  const infoCloseBtn =
    document.getElementById("info-close-btn");

  infoBtn?.addEventListener("click", () => {
    if (!dataGlobal) return;
    const infoData =
      dataGlobal.info_text[currentLang];

    document.getElementById("modal-title").innerHTML =
      infoData.title;
    document.getElementById("modal-body").innerHTML =
      infoData.body;
    document.getElementById(
      "modal-functions-title"
    ).innerHTML = infoData.functions_title;

    const ul = document.getElementById(
      "modal-functions-list"
    );
    ul.innerHTML = "";
    infoData.functions.forEach(fn => {
      const li = document.createElement("li");
      li.innerHTML = fn;
      ul.appendChild(li);
    });

    document.getElementById(
      "modal-warning"
    ).innerHTML = infoData.warning;
    document.getElementById(
      "modal-credits"
    ).innerHTML = infoData.credits;

    infoModal.style.display = "flex";
  });

  infoCloseBtn?.addEventListener(
    "click",
    () => (infoModal.style.display = "none")
  );

  infoModal?.addEventListener("click", e => {
    if (e.target === infoModal)
      infoModal.style.display = "none";
  });

  speechBtn?.addEventListener("click", () => {
    settingsMenu.style.display = "flex";
    backdrop.style.display = "block";
  });

  settingsMenu
    ?.querySelectorAll("button")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        currentLang = btn.dataset.lang;
        localStorage.setItem(
          "appLang",
          currentLang
        );
        settingsMenu.style.display = "none";
        backdrop.style.display = "none";
        updateUIText();
        feather.replace();
      });
    });

  backdrop?.addEventListener("click", () => {
    settingsMenu.style.display = "none";
    backdrop.style.display = "none";
  });

  resetBtn?.addEventListener("click", () => {
    document.getElementById("plate").value = "";
    document.getElementById("vin").value = "";
    document.getElementById("error").innerText = "";
  });

  backBtn?.addEventListener("click", () =>
    window.history.back()
  );
}
