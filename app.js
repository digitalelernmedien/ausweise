document.addEventListener("DOMContentLoaded", () => {
  // HTML-Elemente
  const titleEl = document.getElementById("title");
  const textEl = document.getElementById("text");
  //const settingsBtn = document.getElementById("settings-btn");
  const speechBtn = document.getElementById("speech-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const backdrop = document.getElementById("backdrop");

  // Info Modal Elemente
  const infoBtn = document.getElementById("info-btn");
  const infoModal = document.getElementById("info-modal");
  const infoCloseBtn = document.getElementById("info-close-btn");

  let lang = navigator.language.startsWith("fr") ? "fr" : "de";

  const pageTitles = {
  de: "Abfrageergebnis",
  fr: "Résultat de la requête"
  };

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

  // --- RENDER FUNKTION ---
 function render() {
  if (!dataGlobal) return;

  titleEl.innerText = pageTitles[lang];

  const subtitleEl = document.getElementById("subtitle");

  // 🔹 Karte & Steckbrief EINMAL ermitteln
  const steckbriefId = dataGlobal.zuordnung[karte];
  const steckbrief = dataGlobal.steckbriefe[steckbriefId];

  // 🔹 Untertitel setzen (optional)
  if (subtitleEl && steckbrief && steckbrief.subtitle && steckbrief.subtitle[lang]) {
    subtitleEl.innerText = steckbrief.subtitle[lang];
    subtitleEl.style.display = "block";
  } else if (subtitleEl) {
    subtitleEl.style.display = "none";
  }

  // --- 1. MODAL-TEXTE ---
  const infoData = dataGlobal.info_text ? dataGlobal.info_text[lang] : null;

  if (infoData) {
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalFunctionsTitle = document.getElementById("modal-functions-title");
    const modalFunctionsList = document.getElementById("modal-functions-list");
    const modalWarning = document.getElementById("modal-warning");
    const modalCredits = document.getElementById("modal-credits");
    const infoCloseBtn = document.getElementById("info-close-btn");

    if (modalTitle) modalTitle.innerText = infoData.title;
    if (modalBody) modalBody.innerHTML = infoData.body;
    if (modalFunctionsTitle) modalFunctionsTitle.innerText = infoData.functions_title;

    if (modalFunctionsList) {
      modalFunctionsList.innerHTML = "";
      infoData.functions.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        modalFunctionsList.appendChild(li);
      });
    }

    if (modalWarning) modalWarning.innerHTML = infoData.warning;
    if (modalCredits && infoData.credits) modalCredits.innerHTML = infoData.credits;
    if (infoCloseBtn) infoCloseBtn.innerText = lang === "fr" ? "Fermer" : "OK";
  }

  // --- 2. STECKBRIEF-INHALT ---
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

      items.forEach(i => {
        const li = document.createElement("li");
        li.innerText = i;
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
