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
    header.innerText = `${key} (${items.length})`;
    header.style.cursor = "pointer";
    header.style.marginBottom = "0.2rem";

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

    header.addEventListener("click", () => {
      contentDiv.style.display = contentDiv.style.display === "none" ? "block" : "none";
    });

    sectionDiv.appendChild(header);
    sectionDiv.appendChild(contentDiv);
    container.appendChild(sectionDiv);
  });
}

// Daten laden
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    dataGlobal = data;
    render();
  })
  .catch(() => {
    document.getElementById("title").innerText = "Fehler";
    document.getElementById("text").innerText = "Daten konnten nicht geladen werden.";
  });
