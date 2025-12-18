const params = new URLSearchParams(window.location.search);
const karte = params.get("karte") || "K001";

const lang = navigator.language.startsWith("fr") ? "fr" : "de";

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    const steckbriefId = data.zuordnung[karte];
    const steckbrief = data.steckbriefe[steckbriefId];

    document.getElementById("title").innerText = steckbrief.name;
    document.getElementById("text").innerText = steckbrief[lang];
  })
  .catch(() => {
    document.getElementById("title").innerText = "Fehler";
    document.getElementById("text").innerText = "Daten konnten nicht geladen werden.";
  });
