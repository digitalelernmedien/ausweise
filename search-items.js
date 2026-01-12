let dataGlobal = null;
let currentLang = localStorage.getItem("appLang") ||
  (navigator.language.startsWith("fr") ? "fr" : "de");

const uiText = {
  de: {
    label: "Seriennummer",
    searchBtn: "Suchen",
    subtitle: "Seriennummer eingeben",
    pageTitle: "Sachabfrage",
    errorRequired: "Seriennummer erforderlich",
    errorNoMatch: "Kein Treffer gefunden",
    errorMultiple: "Mehrere Objekte gefunden – bitte Suche präzisieren",
    errorNoData: "Daten nicht geladen"
  },
  fr: {
    label: "Numéro de série",
    searchBtn: "Rechercher",
    subtitle: "Entrez le numéro de série",
    pageTitle: "Recherche d’objet",
    errorRequired: "Numéro de série requis",
    errorNoMatch: "Aucun résultat trouvé",
    errorMultiple: "Plusieurs objets trouvés – veuillez affiner la recherche",
    errorNoData: "Données non chargées"
  }
};
