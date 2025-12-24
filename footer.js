document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("footer");
  if(!footer) return;

  const buttons = window.footerButtons || [];
  footer.innerHTML = "";

  // JSON-Inhalt vorbereiten
  let infoDataCache = null;
  const lang = localStorage.getItem('appLang') || (navigator.language.startsWith('fr') ? 'fr' : 'de');
  fetch('infomodal.json')
    .then(res => res.json())
    .then(data => {
      infoDataCache = data.info_text[lang];
    })
    .catch(err => console.error("Fehler beim Laden von infomodal.json:", err));

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
          if(!modal || !infoDataCache) return;

          document.getElementById("modal-title").innerHTML = infoDataCache.title;
          document.getElementById("modal-body").innerHTML = infoDataCache.body;
          document.getElementById("modal-functions-title").innerHTML = infoDataCache.functions_title;

          const list = document.getElementById("modal-functions-list");
          list.innerHTML = "";
          infoDataCache.functions.forEach(f => {
            const li = document.createElement("li");
            li.innerHTML = f;
            list.appendChild(li);
          });

          document.getElementById("modal-warning").innerHTML = infoDataCache.warning;
          document.getElementById("modal-credits").innerHTML = infoDataCache.credits;

          modal.style.display = "flex";
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
      localStorage.setItem("appLang", lang);
      const menu = document.getElementById("settings-menu");
      if(menu) menu.style.display = "none";
      if(backdrop) backdrop.style.display = "none";
      location.reload();
    });
  });
});
