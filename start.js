document.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("appLang") || (navigator.language.startsWith("fr") ? "fr" : "de");

  const texts = {
    de: {
      title: "Was möchtest du suchen?",
      subtitle: "Bitte wähle eine Kategorie aus.",
      personen: "Personen",
      fahrzeuge: "Fahrzeuge",
      sachen: "Sachen"
    },
    fr: {
      title: "Qu'est-ce que tu cherches?",
      subtitle: "Veuillez sélectionner une catégorie.",
      personen: "Personnes",
      fahrzeuge: "Véhicules",
      sachen: "Objets"
    }
  };

  const t = texts[lang];
  if (!t) return;

  document.getElementById("page-title").textContent = t.title;
  document.getElementById("page-subtitle").textContent = t.subtitle;

  document.querySelector("#tile-personen span").textContent = t.personen;
  document.querySelector("#tile-fahrzeuge span").textContent = t.fahrzeuge;
  document.querySelector("#tile-sachen span").textContent = t.sachen;
});
