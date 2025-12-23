let dataGlobal = null;

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
