const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 4173;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "demands.json");

app.use(express.json({ limit: "200kb" }));
app.use(express.static(__dirname));

function readDemands() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDemands(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

const clients = new Set();

function broadcast() {
  const payload = `data: ${JSON.stringify({ ok: true, at: Date.now() })}\n\n`;
  for (const res of clients) {
    res.write(payload);
  }
}

app.get("/api/demands", (_req, res) => {
  res.json(readDemands());
});

app.get("/api/demands/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ ok: true })}\n\n`);
  clients.add(res);
  req.on("close", () => clients.delete(res));
});

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
  const list = readDemands();
  list.unshift(demand);
  writeDemands(list);
  broadcast();
  res.status(201).json(demand);
});

app.delete("/api/demands/:id", (req, res) => {
  writeDemands(readDemands().filter((item) => item.id !== req.params.id));
  broadcast();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) writeDemands([]);
  console.log(`PROPERTY DEKHO listening on ${PORT}`);
});
