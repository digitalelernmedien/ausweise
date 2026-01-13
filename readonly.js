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

    titleEl.innerText = lang === "fr" ? "Vue d’ensemble des données" : "Datenübersicht";

    contentEl.innerHTML = "";

    Object.entries(dataGlobal.steckbriefe).forEach(([id, steckbrief]) => {
      const card = document.createElement("div");
      card.style.marginBottom = "1rem";

      const h3 = document.createElement("h3");
      h3.style.cursor = "pointer";
      const ausweisText = document.createElement("span");
      ausweisText.innerText = lang === "fr" ? `Pièce d'identité ${id}` : `Ausweis ${id}`;
      h3.appendChild(ausweisText);
      card.appendChild(h3);

      const sectionsDivs = [];
      const sections = steckbrief[lang];

      Object.entries(sections).forEach(([key, items]) => {
        if (!Array.isArray(items)) return;
        const nonEmptyItems = items.filter(item => {
          if (!item) return false;
          if (typeof item === "string") return item.trim() !== "";
          if (typeof item === "object") return Object.values(item).some(v => v && v.toString().trim() !== "");
          return false;
        });

        if (nonEmptyItems.length > 0) {
          const p = document.createElement("p");
          p.style.margin = "0.2rem 0 0.2rem 1rem";

          const textContent = nonEmptyItems.map(item => {
            if (typeof item === "string") return item;
            else if (key === "MOFIS") return formatMofisEntry(item);
            else return formatObjectEntryValues(item);
          }).join(", ");

          p.innerHTML = `<strong>${key}:</strong> ${textContent}`;
          card.appendChild(p);
          sectionsDivs.push(p);
        }
      });

      h3.addEventListener("click", () => {
        sectionsDivs.forEach(p => {
          p.style.display = p.style.display === "none" ? "block" : "none";
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
