const params = new URLSearchParams(window.location.search);
const karte = params.get("karte") || "K001";

let lang = navigator.language.startsWith("fr") ? "fr" : "de";

// Buttons
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
    document.getElementById("text").innerText = "Keine Daten gefunden.";
    return;
  }
  document.getElementById("title").innerText = steckbrief.name;
  document.getElementById("text").innerText = steckbrief[lang];
  setActiveButton();
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
