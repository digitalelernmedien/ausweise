Object.keys(sections).forEach(key => {
  const items = sections[key];
  const sectionDiv = document.createElement("div");

  const header = document.createElement("h3");

  const arrow = document.createElement("span");
  arrow.classList.add("arrow");
  arrow.innerText = "▶";

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

  // Einfaches Ein-/Ausblenden
  if(items.length > 0){
    header.addEventListener("click", () => {
      const isVisible = contentDiv.style.display === "block";
      contentDiv.style.display = isVisible ? "none" : "block";
      arrow.style.transform = isVisible ? "rotate(0deg)" : "rotate(90deg)";
    });
  }

  sectionDiv.appendChild(header);
  sectionDiv.appendChild(contentDiv);
  container.appendChild(sectionDiv);
});
