const CLOUD_API = "https://crudcrud.com/api/211e3cc6aba346419bd466117fef8c32";

let localApi = null;

async function hasLocalApi() {
  if (localApi !== null) return localApi;
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    localApi = res.ok;
  } catch {
    localApi = false;
  }
  return localApi;
}

function withId(item) {
  if (!item || typeof item !== "object") return item;
  return { ...item, id: item.id || item._id };
}

async function cloudList(resource) {
  const res = await fetch(`${CLOUD_API}/${resource}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.map(withId) : [];
}

async function cloudAdd(resource, item) {
  const payload = { ...item };
  delete payload._id;
  const res = await fetch(`${CLOUD_API}/${resource}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Could not save");
  return withId(await res.json());
}

async function cloudDelete(resource, id) {
  await fetch(`${CLOUD_API}/${resource}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function loadDemands() {
  if (await hasLocalApi()) {
    const res = await fetch("/api/demands", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }
  return cloudList("demands");
}

async function addDemand(demand) {
  if (await hasLocalApi()) {
    const res = await fetch("/api/demands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(demand),
    });
    if (!res.ok) throw new Error("Could not post demand");
    return res.json();
  }
  return cloudAdd("demands", demand);
}

async function deleteDemand(id) {
  if (await hasLocalApi()) {
    await fetch(`/api/demands/${encodeURIComponent(id)}`, { method: "DELETE" });
    return;
  }
  await cloudDelete("demands", id);
}

async function loadClients() {
  if (await hasLocalApi()) {
    const res = await fetch("/api/clients", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }
  return cloudList("clients");
}

async function addClient(client) {
  if (await hasLocalApi()) {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    if (!res.ok) throw new Error("Could not post requirement");
    return res.json();
  }
  return cloudAdd("clients", client);
}

async function deleteClient(id) {
  if (await hasLocalApi()) {
    await fetch(`/api/clients/${encodeURIComponent(id)}`, { method: "DELETE" });
    return;
  }
  await cloudDelete("clients", id);
}

function listenLive(kind, onChange) {
  hasLocalApi().then((ok) => {
    if (!ok || !window.EventSource) return;
    const path = kind === "clients" ? "/api/clients/stream" : "/api/demands/stream";
    const stream = new EventSource(path);
    stream.onmessage = () => onChange();
  });
}
