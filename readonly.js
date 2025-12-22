document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("title");
  const contentEl = document.getElementById("content");
  const speechBtn = document.getElementById("speech-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const backdrop = document.getElementById("backdrop");

  let lang = "de";
  let dataGlobal = null;

  // Sprache wechseln
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

  function render() {
    if (!dataGlobal) return;

    titleEl.innerText =
      lang === "fr" ? "Vue d’ensemble des données" : "Datenübersicht";

    contentEl.innerHTML = "";

    Object.entries(dataGlobal.steckbriefe).forEach(([id, steckbrief]) => {
      const card = document.createElement("div");
      card.style.marginBottom = "1rem";

      const h3 = document.createElement("h3");
      h3.innerText = id;
      card.appendChild(h3);

      const sections = steckbrief[lang];
      Object.entries(sections).forEach(([key, items]) => {
        if (items.length > 0) { // nur anzeigen, wenn mindestens ein Eintrag
          const p = document.createElement("p");
          p.style.margin = "0.2rem 0 0.2rem 1rem";
          p.innerHTML = `<strong>${key}:</strong> ${items.join(", ")}`;
          card.appendChild(p);
        }
      });

      contentEl.appendChild(card);
    });
  }

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
