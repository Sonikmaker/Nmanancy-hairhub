const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "CHANGE_THIS_ADMIN_KEY";

const db = new Database("salon.db");
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1
);
`);

const count = db.prepare("SELECT COUNT(*) AS n FROM services").get().n;
if (!count) {
  const add = db.prepare("INSERT INTO services (name, price, duration) VALUES (?, ?, ?)");
  [
    ["Hair Styling", "", ""],
    ["Braids & Protective Styles", "", ""],
    ["Hair Treatment", "", ""],
    ["Wig Services", "", ""],
    ["Makeup & Beauty", "", ""],
    ["Custom Requests", "", ""]
  ].forEach(x => add.run(...x));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function admin(req, res, next) {
  const key = req.get("x-admin-key");
  if (!key || key !== ADMIN_KEY) return res.status(401).json({error:"Unauthorized"});
  next();
}

app.post("/api/appointments", (req, res) => {
  const {name, phone, service, date, time, notes=""} = req.body || {};
  if (!name || !phone || !service || !date || !time)
    return res.status(400).json({error:"Name, phone, service, date and time are required."});

  const result = db.prepare(`
    INSERT INTO appointments (name, phone, service, date, time, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name.trim(), phone.trim(), service.trim(), date, time, notes.trim());

  res.status(201).json({id: result.lastInsertRowid, message:"Appointment request received."});
});

app.get("/api/appointments", admin, (req, res) => {
  const rows = db.prepare("SELECT * FROM appointments ORDER BY date ASC, time ASC, id DESC").all();
  res.json(rows);
});

app.patch("/api/appointments/:id", admin, (req, res) => {
  const {status} = req.body || {};
  const allowed = ["pending","confirmed","completed","cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({error:"Invalid status."});
  const result = db.prepare("UPDATE appointments SET status=? WHERE id=?").run(status, req.params.id);
  if (!result.changes) return res.status(404).json({error:"Appointment not found."});
  res.json({message:"Updated."});
});

app.delete("/api/appointments/:id", admin, (req, res) => {
  const result = db.prepare("DELETE FROM appointments WHERE id=?").run(req.params.id);
  if (!result.changes) return res.status(404).json({error:"Appointment not found."});
  res.json({message:"Deleted."});
});

app.get("/api/services", (req, res) => {
  res.json(db.prepare("SELECT * FROM services WHERE active=1 ORDER BY id").all());
});

app.get("/api/services/all", admin, (req, res) => {
  res.json(db.prepare("SELECT * FROM services ORDER BY id").all());
});

app.post("/api/services", admin, (req, res) => {
  const {name, price="", duration=""} = req.body || {};
  if (!name) return res.status(400).json({error:"Service name is required."});
  const result = db.prepare("INSERT INTO services (name, price, duration) VALUES (?, ?, ?)")
    .run(name.trim(), price.trim(), duration.trim());
  res.status(201).json({id: result.lastInsertRowid});
});

app.patch("/api/services/:id", admin, (req, res) => {
  const {name, price="", duration="", active=1} = req.body || {};
  if (!name) return res.status(400).json({error:"Service name is required."});
  db.prepare("UPDATE services SET name=?, price=?, duration=?, active=? WHERE id=?")
    .run(name.trim(), price.trim(), duration.trim(), active ? 1 : 0, req.params.id);
  res.json({message:"Updated."});
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.listen(PORT, () => {
  console.log(`NmaNancy Hairhub running on http://localhost:${PORT}`);
});
