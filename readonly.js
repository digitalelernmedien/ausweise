document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("title");
  const contentEl = document.getElementById("content");
  const speechBtn = document.getElementById("speech-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const backdrop = document.getElementById("backdrop");
  const printBtn = document.getElementById("print-btn");

  let lang = "de";
  let dataGlobal = null;

  // Sprachwechsel
  speechBtn.addEventListener("click", () => {
    settingsMenu.style.display = "flex";
    backdrop.style.display = "block";
  });

  settingsMenu.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      render();
      settingsMenu.style.display = "none";
      backdrop.style.display = "none";
    });
  });

  backdrop.addEventListener("click", () => {
    settingsMenu.style.display = "none";
    backdrop.style.display = "none";
  });

  printBtn.addEventListener("click", () => window.print());

  // -------------------------
  // Helferfunktionen
  // -------------------------
  function formatMofisEntry(vehicle) {
    if (!vehicle || typeof vehicle !== "object") return "";
    return `${vehicle.type}, ${vehicle.brand}, ${vehicle.model}, ${vehicle.plate || "(kein Kontrollschild)"}, VIN: ${vehicle.vin || "(keine VIN)"}`;
  }

  function formatObjectEntryValues(obj) {
    if (!obj || typeof obj !== "object") return "";
    const { firstname, lastname, ...rest } = obj;
    const firstPart = [firstname, lastname].filter(Boolean).join(" ");
    const otherParts = Object.values(rest).filter(Boolean).join(", ");
    return [firstPart, otherParts].filter(Boolean).join(", ");
  }

  // -------------------------
  // Render-Funktion
  // -------------------------
  function render() {
  if (!dataGlobal) return;

  titleEl.innerText =
    lang === "fr" ? "Vue d’ensemble des données" : "Datenübersicht";

  contentEl.innerHTML = "";

  Object.entries(dataGlobal.steckbriefe).forEach(([id, steckbrief]) => {
    const card = document.createElement("div");
    card.style.marginBottom = "1rem";

    const h3 = document.createElement("h3");
    h3.style.cursor = "pointer";
    h3.innerText =
      lang === "fr" ? `Pièce d'identité ${id}` : `Ausweis ${id}`;

    card.appendChild(h3);

    const sectionsDivs = [];
    const sections = steckbrief[lang];

    Object.entries(sections).forEach(([key, items]) => {
      if (!Array.isArray(items) || items.length === 0) return;

      const sectionDiv = document.createElement("div");
      sectionDiv.style.marginLeft = "1rem";
      sectionDiv.style.marginBottom = "0.3rem";

      // 🔹 EIN EINTRAG → eine Zeile
      if (items.length === 1) {
        const p = document.createElement("p");

        const item = items[0];
        let value = "";

        if (typeof item === "object") {
          value =
            key === "MOFIS"
              ? formatMofisEntry(item)
              : formatObjectEntryValues(item);
        } else {
          value = item;
        }

        p.innerHTML = `<strong>${key}:</strong> ${value}`;
        sectionDiv.appendChild(p);
      }

      // 🔹 MEHRERE EINTRÄGE → Aufzählung
      else {
        const pTitle = document.createElement("p");
        pTitle.innerHTML = `<strong>${key}:</strong>`;
        sectionDiv.appendChild(pTitle);

        const ul = document.createElement("ul");
        ul.style.margin = "0 0 0.2rem 1.2rem";

        items.forEach(item => {
          const li = document.createElement("li");

          if (typeof item === "object") {
            li.innerText =
              key === "MOFIS"
                ? formatMofisEntry(item)
                : formatObjectEntryValues(item);
          } else {
            li.innerText = item;
          }

          ul.appendChild(li);
        });

        sectionDiv.appendChild(ul);
      }

      card.appendChild(sectionDiv);
      sectionsDivs.push(sectionDiv);
    });

    // 🔽 Karte ein-/ausklappen
    h3.addEventListener("click", () => {
      sectionsDivs.forEach(div => {
        div.style.display =
          div.style.display === "none" ? "block" : "none";
      });
    });

    contentEl.appendChild(card);
  });
}

  // -------------------------
  // Daten laden
  // -------------------------
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      dataGlobal = data;
      render();
    })
    .catch(() => {
      titleEl.innerText = "Fehler";
      contentEl.innerText = "Daten konnten nicht geladen werden";
    });
});
