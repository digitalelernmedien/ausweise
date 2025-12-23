let dataGlobal = null;
let currentLang = navigator.language.startsWith("fr") ? "fr" : "de";

/* ---------------------------
   Geburtsdatum normalisieren
--------------------------- */
function normalizeDob(input) {
  if (!input) return null;

  // Format: D.M.YYYY oder DD.MM.YYYY
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(input)) {
    const [d, m, y] = input.split(".");
    return `${d.padStart(2, "0")}.${m.padStart(2, "0")}.${y}`;
  }

  // Format: DDMMYYYY
  if (/^\d{8}$/.test(input)) {
    const d = input.slice(0, 2);
    const m = input.slice(2, 4);
    const y = input.slice(4);
    return `${d}.${m}.${y}`;
  }

  return null; // ungültiges / uneindeutiges Format
}

/* ---------------------------
   Daten laden
--------------------------- */
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    dataGlobal = data;
    setupFooter(); // Footer-Funktionen erst nachdem die Daten geladen sind
  })
  .catch(err => console.error("Fehler beim Laden der Daten:", err));

/* ---------------------------
   Suche
--------------------------- */
document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();

  const lastname = document.getElementById("lastname").value.trim().toLowerCase();
  const firstname = document.getElementById("firstname").value.trim().toLowerCase();
  const dobInput = document.getElementById("dob").value.trim();

  const errorEl = document.getElementById("error");
  errorEl.innerText = "";

  if (!dataGlobal) {
    errorEl.innerText = "Daten nicht geladen";
    return;
  }

  // Pflichtfelder prüfen (Vorname optional)
  if (!lastname || !dobInput) {
    errorEl.innerText = "Nachname und Geburtsdatum sind erforderlich";
    return;
  }

  const normalizedDob = normalizeDob(dobInput);
  if (!normalizedDob) {
    errorEl.innerText = "Ungültiges Geburtsdatum (z. B. 12.03.1980 oder 12031980)";
    return;
  }

  // Alle Karten durchsuchen
  for (const [karteId, steckbriefId] of Object.entries(dataGlobal.zuordnung)) {
    const steckbrief = dataGlobal.steckbriefe[steckbriefId];

    for (const lang of ["de", "fr"]) {
      const sections = steckbrief[lang];
      if (!sections) continue;

      for (const key of ["GERES", "ISA", "ZEMIS"]) {
        const entries = sections[key] || [];

        for (const entry of entries) {
          const eLower = entry.toLowerCase();

          const hasLastname = eLower.includes(lastname);
          const hasFirstname = firstname === "" || eLower.includes(firstname);
          const hasDob = entry.includes(normalizedDob);

          if (hasLastname && hasDob && hasFirstname) {
            // Treffer → weiterleiten
            window.location.href = `index.html?karte=${karteId}`;
            return;
          }
        }
      }
    }
  }

  errorEl.innerText = "Kein Treffer gefunden";
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

  /* --- Info-Modal öffnen --- */
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

  /* --- Info-Modal schließen --- */
  infoCloseBtn?.addEventListener("click", () => {
    infoModal.style.display = "none";
  });
  infoModal?.addEventListener("click", e => {
    if (e.target === infoModal) infoModal.style.display = "none";
  });

  /* --- Sprachwechsel --- */
  speechBtn?.addEventListener("click", () => {
    settingsMenu.style.display = "flex";
    backdrop.style.display = "block";
  });

  settingsMenu?.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      settingsMenu.style.display = "none";
      backdrop.style.display = "none";
    });
  });

  backdrop?.addEventListener("click", () => {
    settingsMenu.style.display = "none";
    backdrop.style.display = "none";
  });

  /* --- Reset Button --- */
  resetBtn?.addEventListener("click", () => {
    document.getElementById("lastname").value = "";
    document.getElementById("firstname").value = "";
    document.getElementById("dob").value = "";
    document.getElementById("error").innerText = "";
  });
}
