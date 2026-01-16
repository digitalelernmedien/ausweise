document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // Checkbox → Sektion ein/ausklappen
  // ===============================
  document.querySelectorAll(".db-toggle input[type='checkbox']").forEach(cb => {
    const targetId = cb.dataset.target;
    const section = document.getElementById(targetId);
    if (!section) return;

    section.hidden = !cb.checked;

    cb.addEventListener("change", () => {
      section.hidden = !cb.checked;
    });
  });

  // ===============================
  // Export JSON
  // ===============================
  const exportBtn = document.getElementById("exportBtn");
  if (!exportBtn) {
    console.error("Export-Button nicht gefunden");
    return;
  }

  exportBtn.addEventListener("click", () => {

    const textareas = document.querySelectorAll("textarea");

    const result = {
      scenario: textareas[0]?.value || "",
      person: {},
      datenbanken: {},
      ausschluss: textareas[1]?.value || ""
    };

    // -------------------------------
    // Ausweis
    // -------------------------------
    document.querySelectorAll("fieldset input").forEach(input => {
      const label = input.previousElementSibling?.innerText || "";
      const key = label.match(/\((.*?)\)/)?.[1];
      if (key) result.person[key] = input.value;
    });

    // -------------------------------
    // Datenbanken
    // -------------------------------
    document.querySelectorAll(".db-toggle").forEach(toggle => {
      const checkbox = toggle.querySelector("input");
      if (!checkbox.checked) return;

      const dbName = toggle.querySelector(".db-title").innerText;
      const entry = document.getElementById(checkbox.dataset.target);
      if (!entry) return;

      const data = {};
      entry.querySelectorAll("input").forEach(input => {
        const label = input.previousElementSibling?.innerText || "";
        const key = label.match(/\((.*?)\)/)?.[1];
        if (key) data[key] = input.value;
      });

      result.datenbanken[dbName] = [data];
    });

    // -------------------------------
    // Download
    // -------------------------------
    const blob = new Blob(
      [JSON.stringify(result, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "antrag_steckbrief.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

});
