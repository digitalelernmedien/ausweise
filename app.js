const params = new URLSearchParams(window.location.search);
const karte = params.get("karte") || "K001";

let lang = navigator.language.startsWith("fr") ? "fr" : "de";

let dataGlobal = null;

// Footer-Menü
const settingsBtn = document.getElementById("settings-btn");
const settingsMenu = document.getElementById("settings-menu");

settingsBtn.addEventListener("click", () => {
  settingsMenu.style.display = settingsMenu.style.display === "none" ? "flex" : "none";
});

settingsMenu.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    lang = btn.dataset.lang;
    render();
    settingsMenu.style.display = "none";
  });
});

// Sanftes Auf-/Zuklappen
function slideToggle(element, duration = 300) {
  if (window.getComputedStyle(element).display === "none") {
    element.style.display = "block";
    let height = element.scrollHeight;
    element.style.height = "0px";
    setTimeout(() => { element.style.transition = `height ${duration}ms`; element.style.height = height + "px"; }, 10);
    setTimeout(() => { element.style.height = "auto"; element.style.transition = ""; }, duration + 10);
  } else {
    let height = element.scrollHeight;
    element.style.height = height + "px";
    setTimeout(() => { element.style.transition = `height ${duration}ms`; element.style.height = "0px"; }, 10);
    setTimeout(() => { element.style.display = "none"; element.style.transition = ""; element.style.height = ""; }, duration + 10);
  }
}

function render() {
  if(!dataGlobal) return;
  const steckbriefId = dataGlobal.zuordnung[karte];
  const steckbrief = dataGlobal.steckbriefe[steckbriefId];
  if(!steckbrief) {
    document.getElementById("title").innerText = "Fehler";
    document.getElementById("text").innerHTML = "Keine Daten gefunden.";
    return;
  }

  document.getElementById("title").innerText = steckbrief.name;
  const container = document.getElementById("text");
  container.innerHTML = "";

  const sections = steckbrief[lang];

  Object.keys(sections).forEach(key => {
    const items = sections[key];
    const sectionDiv = document.createElement("div");

    const header = document.createElement("h3");

    const arrow = document.createElement("span");
    arrow.classList.add("arrow");
    arrow.innerText = "▶";

    // Pfeilfarbe: schwarz wenn Inhalt, grau wenn leer
    arrow.style.color = items.length > 0 ? "#000" : "#999";

    header.appendChild(arrow);
    header.appendChild(document.createTextNode(` ${key} (${items.length})`));

    const contentDiv = document.createElement("div");
    contentDiv.style.display = "none";
    contentDiv.style.marginBottom = "1rem";

    if(items.length > 0){
      const ul = document.createElement("ul");
      items.forEach(i => {
        const li = document.createElement("li");
        li.innerText = i;
        ul.appendChild(li);
      });
      contentDiv.appendChild(ul);
    } else {
      contentDiv.innerText = "(keine Einträge)";
      contentDiv.style.fontStyle = "italic";
    }

    // Nur klickbar / Pfeil drehbar, wenn Inhalt vorhanden
    if(items.length > 0){
      header.addEventListener("click", () => {
        slideToggle(contentDiv, 300);
        arrow.style.transform = (arrow.style.transform === "rotate(90deg)" ? "rotate(0deg)" : "rotate(90deg)");
      });
    }

    sectionDiv.appendChild(header);
    sectionDiv.appendChild(contentDiv);
    container.appendChild(sectionDiv);
  });
}

// Daten laden
fetch("data.json")
  .then(res => res.json())
  .then(data => { dataGlobal = data; render(); })
  .catch(() => {
    document.getElementById("title").innerText = "Fehler";
    document.getElementById("text").innerText = "Daten konnten nicht geladen werden.";
  });
