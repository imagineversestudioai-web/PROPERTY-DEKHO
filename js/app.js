const STORAGE_KEY = "lucknow-scr-demands";

const FACINGS = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

const DOCUMENTS = [
  "Registry",
  "Agreement",
  "Freehold",
  "Leasehold",
  "Power of attorney",
  "Approved map",
];

const SEED = [
  {
    id: "seed-1",
    location: "Gomti Nagar",
    city: "Gomti Nagar",
    type: "house",
    intent: "buy",
    locality: "Gomti Nagar",
    landmark: "Near Phoenix Palassio",
    area: "1200 sq ft",
    frontArea: "30 ft",
    backArea: "28 ft",
    facing: "East",
    document: "Registry",
    caste: "",
    rate: "₹ 6,500 / sq ft",
    budget: "₹ 80 lakh",
    bhk: "3 BHK",
    floor: "2nd",
    note: "Quiet street, parking for one car.",
    contact: "98100 11111",
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "seed-2",
    location: "Aliganj",
    city: "Aliganj",
    type: "land",
    intent: "buy",
    locality: "Aliganj",
    landmark: "Near Engineering College",
    area: "200 gaj",
    frontArea: "40 ft",
    backArea: "45 ft",
    facing: "North",
    document: "Registry",
    caste: "",
    rate: "₹ 22,000 / gaj",
    budget: "₹ 45 lakh",
    bhk: "",
    floor: "",
    note: "Need clear title and road access.",
    contact: "98100 22222",
    createdAt: "2026-08-03T09:00:00.000Z",
  },
  {
    id: "seed-3",
    location: "Hazratganj",
    city: "Hazratganj",
    type: "house",
    intent: "rent",
    locality: "Hazratganj",
    landmark: "Near Novelty Cinema",
    area: "1450 sq ft",
    frontArea: "22 ft",
    backArea: "20 ft",
    facing: "North",
    document: "Agreement",
    caste: "",
    rate: "₹ 25,000 / mo",
    budget: "₹ 25,000 / mo",
    bhk: "3 BHK",
    floor: "1st",
    note: "Family only, prefer first or second floor.",
    contact: "98100 33333",
    createdAt: "2026-08-08T14:00:00.000Z",
  },
  {
    id: "seed-4",
    location: "Sushant Golf City",
    city: "Sushant Golf City",
    type: "land",
    intent: "buy",
    locality: "Sushant Golf City",
    landmark: "Near Shaheed Path",
    area: "300 gaj",
    frontArea: "50 ft",
    backArea: "54 ft",
    facing: "South-East",
    document: "Freehold",
    caste: "",
    rate: "₹ 18,000 / gaj",
    budget: "₹ 55 lakh",
    bhk: "",
    floor: "",
    note: "Looking for a corner plot.",
    contact: "98100 44444",
    createdAt: "2026-08-10T11:30:00.000Z",
  },
];

function loadDemands() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

function saveDemands(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function addDemand(demand) {
  const list = loadDemands();
  list.unshift(demand);
  saveDemands(list);
  return list;
}

function deleteDemand(id) {
  const list = loadDemands().filter((item) => item.id !== id);
  saveDemands(list);
  return list;
}

function demandTitle(demand) {
  const written = String(demand.location || demand.city || "").trim();
  if (written && written.toLowerCase() !== "lucknow") return written;
  if (demand.locality) return demand.locality;
  return written || "Untitled";
}

function filterPlaces(demands) {
  const extra = (demands || []).map((item) => item.locality).filter(Boolean);
  return [...new Set([...LOCALITIES, ...extra])].sort((a, b) => a.localeCompare(b, "en"));
}

function fillDatalist(id, values) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
}

function fillSelect(id, values, placeholder) {
  const el = document.getElementById(id);
  if (!el) return;
  const options = values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`);
  el.innerHTML = placeholder
    ? `<option value="">${escapeHtml(placeholder)}</option>${options.join("")}`
    : options.join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function syncHouseFields() {
  const type = document.getElementById("type");
  const bhkField = document.getElementById("bhk-field");
  const floorField = document.getElementById("floor-field");
  const bhk = document.getElementById("bhk");
  const floor = document.getElementById("floor");
  if (!type) return;
  const isHouse = type.value === "house";
  if (bhkField) bhkField.hidden = !isHouse;
  if (floorField) floorField.hidden = !isHouse;
  if (!isHouse) {
    if (bhk) bhk.value = "";
    if (floor) floor.value = "";
  }
}

function initListPage() {
  const form = document.getElementById("demand-form");
  if (!form) return;

  fillDatalist("locality-list", LOCALITIES);
  fillSelect("facing", FACINGS, "Optional");
  fillSelect("document", DOCUMENTS, "Optional");
  const typeField = document.getElementById("type");
  typeField?.addEventListener("change", syncHouseFields);
  typeField?.addEventListener("input", syncHouseFields);
  syncHouseFields();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const type = String(data.get("type") || "house");
    const location = String(data.get("location") || "").trim();
    const demand = {
      id: crypto.randomUUID ? crypto.randomUUID() : `d-${Date.now()}`,
      location,
      city: location,
      type,
      intent: String(data.get("intent") || ""),
      locality: String(data.get("locality") || "").trim(),
      landmark: String(data.get("landmark") || "").trim(),
      area: String(data.get("area") || "").trim(),
      frontArea: String(data.get("frontArea") || "").trim(),
      backArea: String(data.get("backArea") || "").trim(),
      facing: String(data.get("facing") || ""),
      document: String(data.get("document") || ""),
      caste: String(data.get("caste") || "").trim(),
      rate: String(data.get("rate") || "").trim(),
      budget: String(data.get("budget") || "").trim(),
      bhk: type === "house" ? String(data.get("bhk") || "").trim() : "",
      floor: type === "house" ? String(data.get("floor") || "").trim() : "",
      note: String(data.get("note") || "").trim(),
      contact: String(data.get("contact") || "").trim(),
      createdAt: new Date().toISOString(),
    };

    addDemand(demand);
    window.location.href = "view.html?posted=1";
  });
}

function fact(label, value) {
  if (!value) return "";
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function renderCard(demand) {
  const title = demandTitle(demand);
  const tag = [demand.type, demand.intent].filter(Boolean).join(" · ");
  const bhk = demand.bhk || (demand.bedrooms ? `${demand.bedrooms} BHK` : "");
  const sub = [bhk, demand.floor, demand.landmark, demand.area, demand.facing]
    .filter(Boolean)
    .join(" · ");
  const localityLine =
    demand.locality && demand.locality !== title ? fact("Locality", demand.locality) : "";
  return `
    <article class="card" data-id="${escapeHtml(demand.id)}">
      <div class="card-top">
        <div>
          ${tag ? `<p class="tag">${escapeHtml(tag)}</p>` : ""}
          <h2>${escapeHtml(title)}</h2>
          ${sub ? `<p class="sub">${escapeHtml(sub)}</p>` : ""}
        </div>
        <button class="btn btn-danger" type="button" data-delete="${escapeHtml(demand.id)}">Remove</button>
      </div>
      <dl class="facts">
        ${localityLine}
        ${fact("Budget", demand.budget)}
        ${fact("Rate", demand.rate)}
        ${fact("Front", demand.frontArea)}
        ${fact("Back", demand.backArea)}
        ${fact("Document", demand.document)}
        ${fact("Caste", demand.caste)}
        ${fact("Contact", demand.contact)}
      </dl>
      ${demand.note ? `<p class="note">${escapeHtml(demand.note)}</p>` : ""}
    </article>
  `;
}

function initViewPage() {
  const listEl = document.getElementById("demand-list");
  if (!listEl) return;

  const countEl = document.getElementById("result-count");
  const emptyEl = document.getElementById("empty-state");
  const localitySelect = document.getElementById("filter-locality");
  const posted = document.getElementById("posted-note");
  const params = new URLSearchParams(window.location.search);
  if (posted && params.get("posted") === "1") posted.hidden = false;

  let typeFilter = "all";
  let localityFilter = "";

  function apply() {
    const all = loadDemands();
    const localities = filterPlaces(all);
    const current = localitySelect.value;
    localitySelect.innerHTML =
      `<option value="">All localities</option>` +
      localities.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
    if (localities.includes(current)) localitySelect.value = current;
    else localityFilter = localitySelect.value;

    const filtered = all.filter((item) => {
      const typeOk = typeFilter === "all" || item.type === typeFilter;
      const locOk =
        !localityFilter ||
        item.locality === localityFilter ||
        item.location === localityFilter ||
        item.city === localityFilter;
      return typeOk && locOk;
    });

    if (countEl) {
      countEl.textContent = `${filtered.length} demand${filtered.length === 1 ? "" : "s"} in this browser`;
    }

    if (!filtered.length) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    listEl.innerHTML = filtered.map(renderCard).join("");
  }

  document.querySelectorAll("[data-type-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      typeFilter = chip.getAttribute("data-type-filter") || "all";
      document.querySelectorAll("[data-type-filter]").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn === chip));
      });
      apply();
    });
  });

  localitySelect.addEventListener("change", () => {
    localityFilter = localitySelect.value;
    apply();
  });

  listEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete]");
    if (!button) return;
    deleteDemand(button.getAttribute("data-delete"));
    apply();
  });

  apply();
}

document.addEventListener("DOMContentLoaded", () => {
  initListPage();
  initViewPage();
});
