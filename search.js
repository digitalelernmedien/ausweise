let dataGlobal = null;
let currentLang = "de"; // Standard-Sprache

/* ---------------------------
   Geburtsdatum normalisieren
---------------------------- */
function normalizeDob(input) {
  if (!input) return null;

  // Format: D.M.YYYY oder DD.MM.YYYY
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(input)) {
    const [d, m, y] = input.split(".");
    return `${d.padStart(2,"0")}.${m.padStart(2,"0")}.${y}`;
  }

  // Format: DDMMYYYY
  if (/^\d{8}$/.test(input)) {
    const d = input.slice(0,2);
    const m = input.slice(2,4);
    const y = input.slice(4);
    return `${d}.${m}.${y}`;
  }

  return null;
}

/* ---------------------------
   Daten laden
---------------------------- */
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    dataGlobal = data;
    updateLanguage(currentLang); // Initial Labels setzen
  });

/* ---------------------------
   Suche
---------------------------- */
document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();

  const lastname = document.getElementById("lastname").value.trim().toLowerCase();
  const firstname = document.getElementById("firstname").value.trim().toLowerCase();
  const dobInput = document.getElementById("dob").value.trim();

  const errorEl = document.getElementById("error");
  errorEl.innerText = "";

  if (!dataGlobal) {
    errorEl.innerText = currentLang === "de" ? "Daten nicht geladen" : "Données non chargées";
    return;
  }

  if (!lastname || !dobInput) {
    errorEl.innerText = currentLang === "de" 
      ? "Nachname und Geburtsdatum sind erforderlich" 
      : "Nom de famille et date de naissance requis";
    return;
  }

  const normalizedDob = normalizeDob(dobInput);
  if (!normalizedDob) {
    errorEl.innerText = currentLang === "de"
      ? "Ungültiges Geburtsdatum (z. B. 12.03.1980 oder 12031980)"
      : "Date de naissance invalide (ex: 12.03.1980 ou 12031980)";
    return;
  }

  // Alle Karten durchsuchen
  for (const [karteId, steckbriefId] of Object.entries(dataGlobal.zuordnung)) {
    const steckbrief = dataGlobal.steckbriefe[steckbriefId];

    for (const lang of ["de","fr"]) {
      const sections = steckbrief[lang];
      if (!sections) continue;

      for (const key of ["GERES","ISA","ZEMIS"]) {
        const entries = sections[key] || [];

        for (const entry of entries) {
          const eLower = entry.toLowerCase();
          const hasLastname = eLower.includes(lastname);
          const hasFirstname = firstname === "" || eLower.includes(firstname);
          const hasDob = entry.includes(normalizedDob);

          if (hasLastname && hasDob && hasFirstname) {
            window.location.href = `index.html?karte=${karteId}`;
            return;
          }
        }
      }
    }
  }

  errorEl.innerText = currentLang === "de" ? "Kein Treffer gefunden" : "Aucun résultat trouvé";
});

/* ---------------------------
   Footer-Funktionen
---------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const infoBtn = document.getElementById("info-btn");
  const speechBtn = document.getElementById("speech-btn");
  const resetBtn = document.getElementById("reset-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const backdrop = document.getElementById("backdrop");

  // Info-Modal öffnen
  if (infoBtn) {
    infoBtn.addEventListener("click", () => {
      const infoModal = document.getElementById("info-modal");
      if (infoModal && dataGlobal) {
        const infoText = dataGlobal.info_text[currentLang];
        document.getElementById("modal-title").innerHTML = infoText.title;
        document.getElementById("modal-body").innerHTML = infoText.body;
        document.getElementById("modal-functions-title").innerHTML = infoText.functions_title;
        const ul = document.getElementById("modal-functions-list");
        ul.innerHTML = "";
        infoText.functions.forEach(fn => {
          const li = document.createElement("li");
          li.innerHTML = fn;
          ul.appendChild(li);
        });
        document.getElementById("modal-warning").innerHTML = infoText.warning;
        document.getElementById("modal-credits").innerHTML = infoText.credits;
        infoModal.style.display = "flex";
      }
    });
  }

  const infoCloseBtn = document.getElementById("info-close-btn");
  if (infoCloseBtn) {
    infoCloseBtn.addEventListener("click", () => {
      const infoModal = document.getElementById("info-modal");
      if (infoModal) infoModal.style.display = "none";
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      settingsMenu.style.display = "none";
      backdrop.style.display = "none";
      const infoModal = document.getElementById("info-modal");
      if (infoModal) infoModal.style.display = "none";
    });
  }

  // Sprache / Settings
  if (speechBtn) {
    speechBtn.addEventListener("click", () => {
      settingsMenu.style.display = "flex";
      backdrop.style.display = "block";
    });
  }

  settingsMenu.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      currentLang = lang;
      updateLanguage(lang);
      settingsMenu.style.display = "none";
      backdrop.style.display = "none";
    });
  });

  // Reset-Button
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      document.getElementById("lastname").value = "";
      document.getElementById("firstname").value = "";
      document.getElementById("dob").value = "";
      document.getElementById("error").innerText = "";
    });
  }
});

/* ---------------------------
   Labels / Platzhalter aktualisieren
---------------------------- */
function updateLanguage(lang) {
  const labels = {
    de: {
      lastname: "Nachname",
      firstname: "Vorname (optional)",
      dob: "Geburtsdatum (DD.MM.YYYY)",
      dobPlaceholder: "DD.MM.YYYY",
      submit: "Suchen",
      errorRequired: "Nachname und Geburtsdatum sind erforderlich",
      errorInvalidDob: "Ungültiges Geburtsdatum (z. B. 12.03.1980 oder 12031980)",
      errorNotFound: "Kein Treffer gefunden"
    },
    fr: {
      lastname: "Nom de famille",
      firstname: "Prénom (optionnel)",
      dob: "Date de naissance (JJ.MM.AAAA)",
      dobPlaceholder: "JJ.MM.AAAA",
      submit: "Rechercher",
      errorRequired: "Nom de famille et date de naissance requis",
      errorInvalidDob: "Date de naissance invalide (ex: 12.03.1980 ou 12031980)",
      errorNotFound: "Aucun résultat trouvé"
    }
  };

  document.querySelector("label[for='lastname']")?.childNodes[0].textContent = labels[lang].lastname;
  document.querySelector("label[for='firstname']")?.childNodes[0].textContent = labels[lang].firstname;
  document.querySelector("label[for='dob']")?.childNodes[0].textContent = labels[lang].dob;
  document.getElementById("dob").placeholder = labels[lang].dobPlaceholder;
  document.querySelector("#search-form button[type='submit']").textContent = labels[lang].submit;
}
