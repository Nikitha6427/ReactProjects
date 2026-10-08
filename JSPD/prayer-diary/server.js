const express = require("express");
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const PORT = 7390;
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, "diary.db");
const BACKUP_DIR = path.join(ROOT, "backup");
const BACKUP_FILE = path.join(BACKUP_DIR, "diary-backup.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const JESUS_ASSET_DIR = path.join(PUBLIC_DIR, "assets", "jesus");

const app = express();
app.use(express.json({ limit: "8mb" }));
app.use(express.static(PUBLIC_DIR));

const db = new Database(DB_PATH);

initDatabase();
ensureDirectories();
ensureMascotAssets().catch((error) => {
  console.warn("Mascot download skipped:", error.message);
});
writeBackup();

app.get("/api/entries", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM diary_entries ORDER BY date DESC")
    .all();
  res.json(rows);
});

app.get("/api/entries/:date", (req, res) => {
  const row = db
    .prepare("SELECT * FROM diary_entries WHERE date = ?")
    .get(req.params.date);
  if (!row) return res.status(404).json({ error: "Entry not found" });
  return res.json(row);
});

app.post("/api/entries", (req, res) => {
  const payload = req.body || {};
  if (!payload.date || typeof payload.date !== "string") {
    return res.status(400).json({ error: "date is required (YYYY-MM-DD)" });
  }

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO diary_entries (
      date, mood, productivity, time_with_god, time_with_family, diary_text, created_at, updated_at
    ) VALUES (
      @date, @mood, @productivity, @time_with_god, @time_with_family, @diary_text,
      COALESCE((SELECT created_at FROM diary_entries WHERE date = @date), @created_at),
      @updated_at
    )
    ON CONFLICT(date) DO UPDATE SET
      mood = excluded.mood,
      productivity = excluded.productivity,
      time_with_god = excluded.time_with_god,
      time_with_family = excluded.time_with_family,
      diary_text = excluded.diary_text,
      updated_at = excluded.updated_at
  `);

  const normalized = {
    date: payload.date,
    mood: payload.mood || null,
    productivity: Number.isFinite(payload.productivity)
      ? payload.productivity
      : null,
    time_with_god: Number.isFinite(payload.timeWithGod)
      ? payload.timeWithGod
      : null,
    time_with_family: Number.isFinite(payload.timeWithFamily)
      ? payload.timeWithFamily
      : null,
    diary_text: typeof payload.diaryText === "string" ? payload.diaryText : "",
    created_at: payload.createdAt || now,
    updated_at: now,
  };

  stmt.run(normalized);
  writeBackup();

  const saved = db
    .prepare("SELECT * FROM diary_entries WHERE date = ?")
    .get(payload.date);
  return res.json(saved);
});

app.delete("/api/entries/:date", (req, res) => {
  const info = db
    .prepare("DELETE FROM diary_entries WHERE date = ?")
    .run(req.params.date);
  writeBackup();
  res.json({ deleted: info.changes > 0 });
});

app.get("/api/prayers", (_req, res) => {
  const rows = db
    .prepare(
      "SELECT * FROM prayers ORDER BY datetime(created_at) DESC, id DESC",
    )
    .all();
  res.json(rows);
});

app.get("/api/prayers/:id", (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM prayers WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Prayer not found" });
  return res.json(row);
});

app.post("/api/prayers", (req, res) => {
  const { title, body, createdAt } = req.body || {};
  if (!title || !body) {
    return res.status(400).json({ error: "title and body are required" });
  }

  const now = createdAt || new Date().toISOString();
  const info = db
    .prepare(
      "INSERT INTO prayers (title, body, status, created_at, answered_at, notes) VALUES (?, ?, 'pending', ?, NULL, NULL)",
    )
    .run(String(title).trim(), String(body).trim(), now);

  writeBackup();

  const created = db
    .prepare("SELECT * FROM prayers WHERE id = ?")
    .get(info.lastInsertRowid);
  return res.status(201).json(created);
});

app.patch("/api/prayers/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status, notes } = req.body || {};
  const valid = new Set(["pending", "answered", "denied"]);

  if (!valid.has(status)) {
    return res
      .status(400)
      .json({ error: "status must be pending, answered, or denied" });
  }

  const exists = db.prepare("SELECT id FROM prayers WHERE id = ?").get(id);
  if (!exists) {
    return res.status(404).json({ error: "Prayer not found" });
  }

  const answeredAt = status === "pending" ? null : new Date().toISOString();

  db.prepare(
    "UPDATE prayers SET status = ?, notes = ?, answered_at = ? WHERE id = ?",
  ).run(status, notes || null, answeredAt, id);

  writeBackup();

  const updated = db.prepare("SELECT * FROM prayers WHERE id = ?").get(id);
  return res.json(updated);
});

app.delete("/api/prayers/:id", (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("DELETE FROM prayers WHERE id = ?").run(id);
  writeBackup();
  res.json({ deleted: info.changes > 0 });
});

app.get("/api/settings", (_req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  const obj = rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
  res.json(obj);
});

app.post("/api/settings", (req, res) => {
  const { key, value } = req.body || {};
  if (!key) return res.status(400).json({ error: "key is required" });

  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(String(key), value == null ? "" : String(value));

  writeBackup();
  res.json({ ok: true, key, value: value == null ? "" : String(value) });
});

app.get("/api/export", (_req, res) => {
  res.json(exportSnapshot());
});

app.post("/api/import", (req, res) => {
  const payload = req.body || {};
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  const prayers = Array.isArray(payload.prayers) ? payload.prayers : [];

  let settings = payload.settings;
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    settings = {};
  }

  const importTx = db.transaction(() => {
    db.prepare("DELETE FROM diary_entries").run();
    db.prepare("DELETE FROM prayers").run();
    db.prepare("DELETE FROM settings").run();

    const insertEntry = db.prepare(
      `INSERT INTO diary_entries
      (date, mood, productivity, time_with_god, time_with_family, diary_text, created_at, updated_at)
      VALUES (@date, @mood, @productivity, @time_with_god, @time_with_family, @diary_text, @created_at, @updated_at)`,
    );

    for (const e of entries) {
      if (!e || typeof e.date !== "string") continue;
      insertEntry.run({
        date: e.date,
        mood: e.mood || null,
        productivity: Number.isFinite(e.productivity) ? e.productivity : null,
        time_with_god: Number.isFinite(e.time_with_god)
          ? e.time_with_god
          : Number.isFinite(e.timeWithGod)
            ? e.timeWithGod
            : null,
        time_with_family: Number.isFinite(e.time_with_family)
          ? e.time_with_family
          : Number.isFinite(e.timeWithFamily)
            ? e.timeWithFamily
            : null,
        diary_text: e.diary_text || e.diaryText || "",
        created_at: e.created_at || e.createdAt || new Date().toISOString(),
        updated_at: e.updated_at || e.updatedAt || new Date().toISOString(),
      });
    }

    const insertPrayer = db.prepare(
      `INSERT INTO prayers
      (id, title, body, status, created_at, answered_at, notes)
      VALUES (@id, @title, @body, @status, @created_at, @answered_at, @notes)`,
    );

    for (const p of prayers) {
      if (!p || !p.title || !p.body) continue;
      insertPrayer.run({
        id: Number.isFinite(p.id) ? p.id : null,
        title: String(p.title),
        body: String(p.body),
        status: ["pending", "answered", "denied"].includes(p.status)
          ? p.status
          : "pending",
        created_at: p.created_at || p.createdAt || new Date().toISOString(),
        answered_at: p.answered_at || p.answeredAt || null,
        notes: p.notes || null,
      });
    }

    const insertSetting = db.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?)",
    );
    for (const [key, value] of Object.entries(settings)) {
      insertSetting.run(String(key), value == null ? "" : String(value));
    }
  });

  importTx();
  writeBackup();
  res.json({ ok: true });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Prayer Diary running at http://localhost:${PORT}`);
  console.log(`SQLite DB: ${DB_PATH}`);
  console.log(`Backup file: ${BACKUP_FILE}`);
});

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      date TEXT PRIMARY KEY,
      mood TEXT,
      productivity INTEGER,
      time_with_god INTEGER,
      time_with_family INTEGER,
      diary_text TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS prayers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      answered_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

function ensureDirectories() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.mkdirSync(JESUS_ASSET_DIR, { recursive: true });
}

function exportSnapshot() {
  const entries = db
    .prepare("SELECT * FROM diary_entries ORDER BY date DESC")
    .all();
  const prayers = db
    .prepare(
      "SELECT * FROM prayers ORDER BY datetime(created_at) DESC, id DESC",
    )
    .all();
  const settingRows = db.prepare("SELECT key, value FROM settings").all();
  const settings = settingRows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  return {
    app: "prayer-diary",
    version: 1,
    exported_at: new Date().toISOString(),
    entries,
    prayers,
    settings,
  };
}

function writeBackup() {
  const snapshot = exportSnapshot();
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(snapshot, null, 2), "utf8");
}

async function ensureMascotAssets() {
  const files = [
    {
      name: "jesus-wave.png",
      url: "https://openmoji.org/data/color/png/1F64B.png",
    },
    {
      name: "jesus-pray.png",
      url: "https://openmoji.org/data/color/png/1F64F.png",
    },
    {
      name: "jesus-think.png",
      url: "https://openmoji.org/data/color/png/1F914.png",
    },
    {
      name: "jesus-celebrate.png",
      url: "https://openmoji.org/data/color/png/1F64C.png",
    },
  ];

  for (const item of files) {
    const target = path.join(JESUS_ASSET_DIR, item.name);
    if (fs.existsSync(target)) continue;

    try {
      await downloadFile(item.url, target);
      console.log(`Downloaded mascot asset: ${item.name}`);
    } catch (error) {
      console.warn(
        `Failed to download ${item.name}. Inline SVG fallback will be used.`,
      );
    }
  }
}

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const transport = url.startsWith("https") ? https : http;

    const request = transport.get(url, (response) => {
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        response.resume();
        return resolve(downloadFile(response.headers.location, destination));
      }

      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }

      const file = fs.createWriteStream(destination);
      response.pipe(file);

      file.on("finish", () => {
        file.close(resolve);
      });

      file.on("error", (error) => {
        file.close(() => {
          fs.unlink(destination, () => reject(error));
        });
      });
    });

    request.on("error", reject);
    request.setTimeout(12000, () => {
      request.destroy(new Error("Request timed out"));
    });
  });
}
