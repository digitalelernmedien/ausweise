document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("footer");

  if (!footer) return;

  // Welche Buttons auf dieser Seite angezeigt werden sollen
  // Definiere in jeder Seite vor dem Einbinden von footer.js:
  // window.footerButtons = ['info','speech','back','reset','home'];
  const buttons = window.footerButtons || [];

  footer.innerHTML = "";

  buttons.forEach(btn => {
    const button = document.createElement("button");
    button.classList.add("icon-btn");
    button.setAttribute("aria-label", btn);

    // Icon setzen
    let iconName;
    switch(btn){
      case "info": iconName = "info"; break;
      case "speech": iconName = "globe"; break;
      case "back": iconName = "arrow-left"; break;
      case "reset": iconName = "refresh-cw"; break;
      case "home": iconName = "home"; break;
      default: iconName = "circle"; 
    }

    const icon = document.createElement("i");
    icon.setAttribute("data-feather", iconName);
    button.appendChild(icon);

    // Eventlistener
    switch(btn){
      case "info":
        button.addEventListener("click", () => {
          const modal = document.getElementById("info-modal");
          if(modal) modal.style.display = "flex";
        });
        break;
      case "speech":
        button.addEventListener("click", () => {
          const menu = document.getElementById("settings-menu");
          const backdrop = document.getElementById("backdrop");
          if(menu && backdrop){
            menu.style.display = "flex";
            backdrop.style.display = "block";
          }
        });
        break;
      case "back":
        button.addEventListener("click", () => window.history.back());
        break;
      case "reset":
        button.addEventListener("click", () => location.reload());
        break;
      case "home":
        button.addEventListener("click", () => window.location.href = "start.html");
        break;
    }

    footer.appendChild(button);
  });

  feather.replace();

  // Modal schließen
  const infoClose = document.getElementById("info-close-btn");
  if(infoClose) infoClose.addEventListener("click", () => {
    const modal = document.getElementById("info-modal");
    if(modal) modal.style.display = "none";
  });

  // Settings-Menü schließen
  const backdrop = document.getElementById("backdrop");
  if(backdrop) backdrop.addEventListener("click", () => {
    const menu = document.getElementById("settings-menu");
    if(menu) menu.style.display = "none";
    backdrop.style.display = "none";
  });

  // Sprachauswahl
  document.querySelectorAll('#settings-menu button').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      console.log('Sprache gewählt:', lang);
      const menu = document.getElementById("settings-menu");
      if(menu) menu.style.display = "none";
      if(backdrop) backdrop.style.display = "none";
      // Optional: in localStorage speichern
      localStorage.setItem("appLang", lang);
    });
  });

  // Initiale Sprache aus Gerätesprache oder localStorage
  const savedLang = localStorage.getItem("appLang");
  const lang = savedLang || (navigator.language.startsWith("fr") ? "fr" : "de");
  console.log("Aktuelle Sprache:", lang);
});
