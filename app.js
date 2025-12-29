document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("title");
  const subtitleEl = document.getElementById("subtitle");
  const textEl = document.getElementById("text");

  let lang = localStorage.getItem("appLang") || (navigator.language.startsWith("fr") ? "fr" : "de");

  const pageTitles = {
    de: "Abfrageergebnis",
    fr: "Résultat de la requête"
  };

  const params = new URLSearchParams(window.location.search);
  const karte = params.get("karte") || "K001";

  let dataGlobal = null;

  /* ---------------------------
     MOFIS Eintrag formatieren
  --------------------------- */
  function formatMofisEntry(vehicle, lang) {
    if (!vehicle || typeof vehicle !== "object") return "";

    return `${vehicle.type}, ${vehicle.brand}, ${vehicle.model}, ${vehicle.plate || "(kein Kontrollschild)"}, VIN: ${vehicle.vin || "(keine VIN)"}.`;
  }

  /* ---------------------------
     Generischer Objekt-Renderer
     z.B. GERES, ISA, FABER
  --------------------------- */
  function formatObjectEntry(obj) {
    if (!obj || typeof obj !== "object") return "";

    // Alle Schlüssel des Objekts in "Feld: Wert" darstellen
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  }

  function render() {
    if (!dataGlobal) return;

    titleEl.innerText = pageTitles[lang];

    const steckbriefId = dataGlobal.zuordnung[karte];
    const steckbrief = dataGlobal.steckbriefe[steckbriefId];

    if (!steckbrief) {
      titleEl.innerText = "Fehler";
      textEl.innerText = "Keine Daten für diese Karte gefunden";
      subtitleEl.style.display = "none";
      return;
    }

    // Subtitle
    if (subtitleEl && steckbrief.subtitle && steckbrief.subtitle[lang]) {
      subtitleEl.innerText = steckbrief.subtitle[lang];
      subtitleEl.style.display = "block";
    } else if (subtitleEl) {
      subtitleEl.style.display = "none";
    }

    // Inhalt rendern
    const sections = steckbrief[lang];
    if (!sections) {
      textEl.innerText = `Keine Inhalte für Sprache "${lang}" gefunden`;
      return;
    }

    textEl.innerHTML = "";

    Object.keys(sections).forEach(key => {
      const items = sections[key];
      const header = document.createElement("h3");
      const arrow = document.createElement("span");

      arrow.classList.add("arrow");
      arrow.innerText = "▶";
      arrow.style.marginRight = "5px";

      header.appendChild(arrow);
      header.appendChild(document.createTextNode(`${key} (${items.length})`));

      const contentDiv = document.createElement("div");
      contentDiv.style.display = "none";
      contentDiv.style.marginBottom = "10px";

      if (items.length > 0) {
        const ul = document.createElement("ul");
        ul.style.paddingLeft = "1.8rem";

        items.forEach(item => {
          const li = document.createElement("li");

          if (typeof item === "string") {
            li.innerText = item;
          } else if (key === "MOFIS") {
            li.innerText = formatMofisEntry(item, lang);
          } else {
            li.innerText = formatObjectEntry(item);
          }

          ul.appendChild(li);
        });

        contentDiv.appendChild(ul);

        header.addEventListener("click", () => {
          const open = contentDiv.style.display === "block";
          contentDiv.style.display = open ? "none" : "block";
          arrow.style.transform = open ? "rotate(0deg)" : "rotate(90deg)";
        });
      } else {
        contentDiv.innerText = lang === "fr" ? "(aucune entrée)" : "(keine Einträge)";
        contentDiv.style.fontStyle = "italic";
        contentDiv.style.paddingLeft = "25px";
      }

      textEl.appendChild(header);
      textEl.appendChild(contentDiv);
    });
  }

  // Daten laden
  fetch("data.json")
    .then(res => {
      if (!res.ok) throw new Error("HTTP-Fehler " + res.status);
      return res.json();
    })
    .then(data => {
      dataGlobal = data;
      render();
      feather.replace();
    })
    .catch(err => {
      console.error("Fehler:", err);
      titleEl.innerText = "Fehler";
      textEl.innerText = "Daten konnten nicht geladen werden";
      subtitleEl.style.display = "none";
    });
});
