const params = new URLSearchParams(window.location.search);
const karte = params.get("karte") || "K001";

let lang = navigator.language.startsWith("fr") ? "fr" : "de";

const btnDE = document.getElementById("btn-de");
const btnFR = document.getElementById("btn-fr");

btnDE.addEventListener("click", () => { lang = "de"; render(); });
btnFR.addEventListener("click", () => { lang = "fr"; render(); });

function setActiveButton() {
  btnDE.classList.remove("active");
  btnFR.classList.remove("active");
  if(lang === "de") btnDE.classList.add("active");
  else btnFR.classList.add("active");
}

let dataGlobal = null;

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
  setActiveButton();

  const container = document.getElementById("text");
  container.innerHTML = ""; // reset

  const sections = steckbrief[lang];

  Object.keys(sections).forEach(key => {
    const items = sections[key];
    const sectionDiv = document.createElement("div");

    // Überschrift mit Anzahl
    const header = document.createElement("h3");
    header.style.cursor = "pointer";
    header.style.marginBottom = "0.2rem";
    header.innerText = `${key} (${items.length})`;
    
    // Inhalt, versteckt
    const contentDiv = document.createElement("div");
    contentDiv.style.display = "none";
    contentDiv.style.marginBottom = "1rem";

    if(items.length > 0) {
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

    // Klick-Event für Toggle
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
