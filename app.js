document.addEventListener("DOMContentLoaded", () => {
  // HTML-Elemente
  const titleEl = document.getElementById("title");
  const textEl = document.getElementById("text");
  const settingsBtn = document.getElementById("settings-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const backdrop = document.getElementById("backdrop");

  // Info Modal Elemente
  const infoBtn = document.getElementById("info-btn");
  const infoModal = document.getElementById("info-modal");
  const infoCloseBtn = document.getElementById("info-close-btn");

  let lang = navigator.language.startsWith("fr") ? "fr" : "de";

  // Karte aus URL-Parameter
  const params = new URLSearchParams(window.location.search);
  const karte = params.get("karte") || "K001";

  let dataGlobal = null;

  // --- MODAL LOGIK ---
  if (infoBtn && infoModal && infoCloseBtn) {
    infoBtn.addEventListener("click", () => {
      infoModal.style.display = "flex";
    });

    infoCloseBtn.addEventListener("click", () => {
      infoModal.style.display = "none";
    });

    infoModal.addEventListener("click", (e) => {
      if (e.target === infoModal) {
        infoModal.style.display = "none";
      }
    });
  }

  // --- SETTINGS LOGIK ---
  settingsBtn.addEventListener("click", () => {
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

  // --- RENDER FUNKTION ---
  function render() {
    if (!dataGlobal) return;
    const steckbriefId = dataGlobal.zuordnung[karte];
    const steckbrief = dataGlobal.steckbriefe[steckbriefId];

    if (!steckbrief) {
      titleEl.innerText = "Fehler";
      textEl.innerText = "Keine Daten für diese Karte gefunden";
      return;
    }

    const sections = steckbrief[lang];
    if (!sections) {
      titleEl.innerText = "Fehler";
      textEl.innerText = `Keine Inhalte für Sprache "${lang}" gefunden`;
      return;
    }

    titleEl.innerText = steckbrief.name[lang];
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

        header.addEventListener("click", () => {
          const isVisible = contentDiv.style.display === "block";
          contentDiv.style.display = isVisible ? "none" : "block";
          arrow.style.transform = isVisible ? "rotate(0deg)" : "rotate(90deg)";
        });
      } else {
        contentDiv.innerText = "(keine Einträge)";
        contentDiv.style.fontStyle = "italic";
        contentDiv.style.paddingLeft = "25px";
      }

      textEl.appendChild(header);
      textEl.appendChild(contentDiv);
    });
  }

  // --- DATEN LADEN ---
  fetch("data.json")
    .then(res => {
      if (!res.ok) throw new Error("HTTP-Fehler " + res.status);
      return res.json();
    })
    .then(data => {
      dataGlobal = data;
      render();
    })
    .catch(err => {
      console.error("Fehler:", err);
      titleEl.innerText = "Fehler";
      textEl.innerText = "Daten konnten nicht geladen werden";
    });
});
