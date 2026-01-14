let data;
let currentKey;

fetch("data.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    initSelect();
  });

function initSelect() {
  const select = document.getElementById("personSelect");

  Object.keys(data.steckbriefe).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    select.appendChild(option);
  });

  select.onchange = () => loadPerson(select.value);
  loadPerson(select.value);
}

function loadPerson(key) {
  currentKey = key;
  const person = data.steckbriefe[key].de;

  const container = document.getElementById("editor");
  container.innerHTML = "";

  Object.entries(person.GERES[0]).forEach(([field, value]) => {
    const label = document.createElement("label");
    label.textContent = `GERES – ${field}`;

    const input = document.createElement("input");
    input.value = value;
    input.oninput = e => {
      person.GERES[0][field] = e.target.value;
    };

    label.appendChild(input);
    container.appendChild(label);
  });
}

function downloadJSON() {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.json";
  a.click();
}
