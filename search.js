let dataGlobal = null;

fetch("data.json")
  .then(res => res.json())
  .then(data => dataGlobal = data);

document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();

  const lastname = document.getElementById("lastname").value.trim().toLowerCase();
  const firstname = document.getElementById("firstname").value.trim().toLowerCase();
  const dob = document.getElementById("dob").value.trim();

  const errorEl = document.getElementById("error");
  errorEl.innerText = "";

  if (!dataGlobal) {
    errorEl.innerText = "Daten nicht geladen";
    return;
  }

  const fullName = `${lastname} ${firstname}`;

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

          if (
            eLower.includes(fullName) &&
            entry.includes(dob)
          ) {
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
