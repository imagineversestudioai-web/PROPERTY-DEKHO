const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 4173;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");

app.use(express.json({ limit: "200kb" }));

function filePath(name) {
  return path.join(DATA_DIR, name);
}

function readList(name) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath(name), "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(name, list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(name), JSON.stringify(list, null, 2));
}

const streams = {
  demands: new Set(),
  clients: new Set(),
};

function broadcast(kind) {
  const payload = `data: ${JSON.stringify({ ok: true, at: Date.now() })}\n\n`;
  for (const res of streams[kind]) {
    res.write(payload);
  }
}

function attachStream(kind) {
  return (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    res.write(`data: ${JSON.stringify({ ok: true })}\n\n`);
    streams[kind].add(res);
    req.on("close", () => streams[kind].delete(res));
  };
}

app.get("/api/demands", (_req, res) => {
  res.json(readList("demands.json"));
});

app.get("/api/demands/stream", attachStream("demands"));

app.post("/api/demands", (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const demand = {
    location: String(body.location || "").trim(),
    city: String(body.city || body.location || "").trim(),
    type: String(body.type || "").trim(),
    intent: String(body.intent || "").trim(),
    locality: String(body.locality || "").trim(),
    landmark: String(body.landmark || "").trim(),
    area: String(body.area || "").trim(),
    frontArea: String(body.frontArea || "").trim(),
    backArea: String(body.backArea || "").trim(),
    facing: String(body.facing || "").trim(),
    document: String(body.document || "").trim(),
    caste: String(body.caste || "").trim(),
    rate: String(body.rate || "").trim(),
    budget: String(body.budget || "").trim(),
    bhk: String(body.bhk || "").trim(),
    floor: String(body.floor || "").trim(),
    note: String(body.note || "").trim(),
    contact: String(body.contact || "").trim(),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const list = readList("demands.json");
  list.unshift(demand);
  writeList("demands.json", list);
  broadcast("demands");
  res.status(201).json(demand);
});

app.delete("/api/demands/:id", (req, res) => {
  writeList(
    "demands.json",
    readList("demands.json").filter((item) => item.id !== req.params.id)
  );
  broadcast("demands");
  res.json({ ok: true });
});

app.get("/api/clients", (_req, res) => {
  res.json(readList("clients.json"));
});

app.get("/api/clients/stream", attachStream("clients"));

app.post("/api/clients", (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const client = {
    name: String(body.name || "").trim(),
    contact: String(body.contact || "").trim(),
    location: String(body.location || "").trim(),
    requirement: String(body.requirement || "").trim(),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const list = readList("clients.json");
  list.unshift(client);
  writeList("clients.json", list);
  broadcast("clients");
  res.status(201).json(client);
});

app.delete("/api/clients/:id", (req, res) => {
  writeList(
    "clients.json",
    readList("clients.json").filter((item) => item.id !== req.params.id)
  );
  broadcast("clients");
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "property-dekho" });
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath("demands.json"))) writeList("demands.json", []);
  if (!fs.existsSync(filePath("clients.json"))) writeList("clients.json", []);
  console.log(`PROPERTY DEKHO listening on ${PORT}`);
});
