document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // Checkbox → Sektion ein/ausklappen
  // ===============================
  document.querySelectorAll(
    ".db-toggle input[type='checkbox']"
  ).forEach(checkbox => {

    const targetId = checkbox.dataset.target;
    const section = document.getElementById(targetId);

    if (!section) return;

    // Initial: ausgeblendet
    section.hidden = !checkbox.checked;

    checkbox.addEventListener("change", () => {
      section.hidden = !checkbox.checked;
    });
  });

});
