document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // Checkbox → Sektion ein/ausklappen
  // ===============================
  document.querySelectorAll(".db-toggle input[type='checkbox']").forEach(cb => {
    const section = cb.closest(".db-toggle").nextElementSibling;
    if (!section) return;

    section.hidden = !cb.checked;

    cb.addEventListener("change", () => {
      section.hidden = !cb.checked;
    });
  });

  // ===============================
  // Export JSON
  // ===============================
  document.getElementById("exportBtn").addEventListener("click", () => {

    const result = {
      scenario: document.querySelector("textarea").value,
      person: {},
      datenbanken: {},
      ausschluss: document.querySelectorAll("textarea")[1].value
    };

    // -------------------------------
    // Ausweisfelder
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
      const entry = toggle.nextElementSibling;
      const data = {};

      entry.querySelectorAll("input").forEach(input => {
        const label = input.previousElementSibling.innerText;
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

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "antrag_steckbrief.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

});
