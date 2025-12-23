let dataGlobal = null;
let lang = navigator.language.startsWith("fr") ? "fr" : "de";

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

  return null;
}

/* ---------------------------
   Daten laden
   --------------------------- */
fetch("data.json")
  .then(res => res.json())
  .then(data => dataGlobal = data);

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

  // Pflichtfelder (Vorname optional)
  if (!lastname || !dobInput) {
    errorEl.innerText = lang === "fr"
      ? "Nom et date de naissance requis"
      : "Nachname und Geburtsdatum sind erforderlich";
    return;
  }

  const normalizedDob = normalizeDob(dobInput);
  if (!normalizedDob) {
    errorEl.innerText = lang === "fr"
      ? "Date invalide (ex. 12.03.1980 ou 12031980)"
      : "Ungültiges Geburtsdatum (z. B. 12.03.1980 oder 12031980)";
    return;
  }

  // Alle Karten durchsuchen
  for (const [karteId, steckbriefId] of Object.entries(dataGlobal.zuordnung)) {
    const steckbrief = dataGlobal.steckbriefe[steckbriefId];

    for (const l of ["de", "fr"]) {
      const sections = steckbrief[l];
      if (!sections) continue;

      for (const key of ["GERES", "ISA", "ZEMIS"]) {
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

  errorEl.innerText = lang === "fr"
    ? "Aucun résultat trouvé"
    : "Kein Treffer gefunden";
});

/* ---------------------------
   FOOTER: Reset-Button
   --------------------------- */
const resetBtn = document.getElementById("reset-btn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    document.getElementById("lastname").value = "";
    document.getElementById("firstname").value = "";
    document.getElementById("dob").value = "";
    document.getElementById("error").innerText = "";
    document.getElementById("lastname").focus();
  });
}

/* ---------------------------
   FOOTER: Info Modal
   --------------------------- */
const infoBtn = document.getElementById("info-btn");
const infoModal = document.getElementById("info-modal");
const infoCloseBtn = document.getElementById("info-close-btn");

if (infoBtn && infoModal && infoCloseBtn) {
  infoBtn.addEventListener("click", () => {
    infoModal.style.display = "flex";
  });

  infoCloseBtn.addEventListener("click", () => {
    infoModal.style.display = "none";
  });

  infoModal.addEventListener("click", e => {
    if (e.target === infoModal) {
      infoModal.style.display = "none";
    }
  });
}

/* ---------------------------
   FOOTER: Sprache wechseln
   --------------------------- */
const speechBtn = document.getElementById("speech-btn");
const settingsMenu = document.getElementById("settings-menu");
const backdrop = document.getElementById("backdrop");

if (speechBtn && settingsMenu && backdrop) {
  speechBtn.addEventListener("click", () => {
    settingsMenu.style.display = "flex";
    backdrop.style.display = "block";
  });

  settingsMenu.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      settingsMenu.style.display = "none";
      backdrop.style.display = "none";
    });
  });

  backdrop.addEventListener("click", () => {
    settingsMenu.style.display = "none";
    backdrop.style.display = "none";
  });
}
