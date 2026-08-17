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

async function loadDemands() {
  try {
    const res = await fetch("/api/demands");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function addDemand(demand) {
  const res = await fetch("/api/demands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(demand),
  });
  if (!res.ok) throw new Error("Could not post demand");
  return res.json();
}

async function deleteDemand(id) {
  await fetch(`/api/demands/${encodeURIComponent(id)}`, { method: "DELETE" });
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

    addDemand(demand)
      .then(() => {
        window.location.href = "view.html?posted=1";
      })
      .catch(() => {
        const error = document.getElementById("form-error");
        if (error) {
          error.hidden = false;
          error.textContent = "Demand post nahi ho payi. Server chalu hai na, check karo.";
        }
      });
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
  let cache = [];

  function apply() {
    const all = cache;
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
      countEl.textContent = `${filtered.length} live demand${filtered.length === 1 ? "" : "s"}`;
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
    deleteDemand(button.getAttribute("data-delete")).then(refresh);
  });

  async function refresh() {
    cache = await loadDemands();
    apply();
  }

  if (window.EventSource) {
    const stream = new EventSource("/api/demands/stream");
    stream.onmessage = () => {
      refresh();
    };
  }
  setInterval(refresh, 4000);
  refresh();
}

document.addEventListener("DOMContentLoaded", () => {
  initListPage();
  initViewPage();
});
