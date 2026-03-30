document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("title");
  const contentEl = document.getElementById("content");
  const speechBtn = document.getElementById("speech-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const backdrop = document.getElementById("backdrop");
  const printBtn = document.getElementById("print-btn");

  let lang = localStorage.getItem("appLang") || (navigator.language.startsWith("fr") ? "fr" : "de");
  let dataGlobal = null;

  // -------------------------
  // Sprachwechsel
  // -------------------------
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
    return `${vehicle.type}, ${vehicle.brand}, ${vehicle.model}, ${
      vehicle.plate || "(kein Kontrollschild)"
    }, VIN: ${vehicle.vin || "(keine VIN)"}`;
  }

  function formatObjectEntryValues(obj) {
    if (!obj || typeof obj !== "object") return "";
    const { firstname, lastname, ...rest } = obj;
    const firstPart = [firstname, lastname].filter(Boolean).join(" ");
    const otherParts = Object.values(rest).filter(Boolean).join(", ");
    return [firstPart, otherParts].filter(Boolean).join(", ");
  }

  function hasContent(item) {
    if (!item) return false;
    if (typeof item === "string") return item.trim() !== "";
    if (typeof item === "object") {
      return Object.values(item).some(v => v && v.toString().trim() !== "");
    }
    return false;
  }

  function formatItem(key, item) {
    if (typeof item === "object") {
      return key === "MOFIS"
        ? formatMofisEntry(item)
        : formatObjectEntryValues(item);
    }
    return item;
  }

  // -------------------------
  // Render
  // -------------------------
  function render() {
    if (!dataGlobal) return;

    titleEl.innerText =
      lang === "fr" ? "Vue d’ensemble des données" : "Datenübersicht";

    contentEl.innerHTML = "";

    Object.entries(dataGlobal.steckbriefe).forEach(([id, steckbrief]) => {
      const card = document.createElement("div");
      card.style.marginBottom = "1rem";

      // Überschrift Ausweis
      const h3 = document.createElement("h3");
      h3.style.cursor = "pointer";
      h3.innerText =
        lang === "fr" ? `Fichier / Pièce d'identité ${id}` : `Datensatz / Ausweis ${id}`;
      card.appendChild(h3);

      const sectionsDivs = [];
      const sections = steckbrief[lang];

      Object.entries(sections).forEach(([key, items]) => {
        // Nur Items mit Inhalt anzeigen
        const validItems = items.filter(hasContent);
        if (validItems.length === 0) return;

        // Section-Container
        const sectionDiv = document.createElement("div");
        sectionDiv.style.marginLeft = "1rem";
        sectionDiv.style.marginBottom = "0.3rem";

        // Section-Überschrift
        const sectionTitle = document.createElement("p");
        sectionTitle.innerHTML = `<strong>${key}:</strong>`;
        sectionDiv.appendChild(sectionTitle);

        // Liste aller Items (immer mit Aufzählungszeichen)
        const ul = document.createElement("ul");
        validItems.forEach(item => {
          const li = document.createElement("li");
          li.textContent = formatItem(key, item);
          ul.appendChild(li);
        });

        sectionDiv.appendChild(ul);
        card.appendChild(sectionDiv);
        sectionsDivs.push(sectionDiv);
      });

      // Ein-/Ausklappen
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
