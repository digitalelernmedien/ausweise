document.addEventListener("DOMContentLoaded", () => {
  // HTML-Elemente
  const titleEl = document.getElementById("title");
  const textEl = document.getElementById("text");
  const settingsBtn = document.getElementById("settings-btn");
  const settingsMenu = document.getElementById("settings-menu");

  let lang = navigator.language.startsWith("fr") ? "fr" : "de";

  // Karte aus URL-Parameter
  const params = new URLSearchParams(window.location.search);
  const karte = params.get("karte") || "K001";

  let dataGlobal = null;

  // Footer-Button klick
 settingsBtn.addEventListener("click", () => {
  settingsMenu.style.display = "flex";
  document.getElementById("backdrop").style.display = "block";
});

  // Sprachumschaltung
settingsMenu.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    lang = btn.dataset.lang;
    render();
    settingsMenu.style.display = "none";
    document.getElementById("backdrop").style.display = "none";
  });
});

  document.getElementById("backdrop").addEventListener("click", () => {
  settingsMenu.style.display = "none";
  document.getElementById("backdrop").style.display = "none";
});


  // Render-Funktion
  function render() {
    if (!dataGlobal) return;

    const steckbriefId = dataGlobal.zuordnung[karte];
    const steckbrief = dataGlobal.steckbriefe[steckbriefId];

    if (!steckbrief) {
      titleEl.innerText = "Fehler";
      textEl.innerText = "Keine Daten für diese Karte gefunden";
      return;
    }

    // sections absichern
    const sections = steckbrief[lang];
    if (!sections) {
      titleEl.innerText = "Fehler";
      textEl.innerText = `Keine Inhalte für Sprache "${lang}" gefunden`;
      return;
    }

    // Name des Steckbriefes
    titleEl.innerText = steckbrief.name;
    textEl.innerHTML = "";

    Object.keys(sections).forEach(key => {
      const items = sections[key];

      const header = document.createElement("h3");
      const arrow = document.createElement("span");
      arrow.classList.add("arrow");
      arrow.innerText = "▶";
      arrow.style.color = items.length > 0 ? "#000" : "#999";
      arrow.style.marginRight = "5px";
      header.appendChild(arrow);
      header.appendChild(document.createTextNode(`${key} (${items.length})`));

      const contentDiv = document.createElement("div");
      contentDiv.style.display = "none";
      contentDiv.style.marginBottom = "10px";

      if (items.length > 0) {
        const ul = document.createElement("ul");
        items.forEach(i => {
          const li = document.createElement("li");
          li.innerText = i;
          ul.appendChild(li);
        });
        contentDiv.appendChild(ul);

        // Klick-Event nur bei Inhalten
        header.addEventListener("click", () => {
          const isVisible = contentDiv.style.display === "block";
          contentDiv.style.display = isVisible ? "none" : "block";
          arrow.style.transform = isVisible ? "rotate(0deg)" : "rotate(90deg)";
        });
      } else {
        contentDiv.innerText = "(keine Einträge)";
        contentDiv.style.fontStyle = "italic";
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
      console.log("Daten geladen:", data);
      dataGlobal = data;
      render();
    })
    .catch(err => {
      console.error("Fehler beim Laden der Daten:", err);
      titleEl.innerText = "Fehler";
      textEl.innerText = "Daten konnten nicht geladen werden";
    });
});
