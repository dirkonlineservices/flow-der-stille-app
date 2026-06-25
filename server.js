var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_path = __toESM(require("path"), 1);
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_genai = require("@google/genai");
var app = (0, import_express.default)();
var PORT = 3e3;
var JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
var db = new import_better_sqlite3.default("database.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    is_premium BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS weekly_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_number INTEGER,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS user_tasks (
    user_id INTEGER,
    task_id INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, task_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(task_id) REFERENCES weekly_tasks(id)
  );
  CREATE TABLE IF NOT EXISTS weekly_recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_number INTEGER,
    translation_key_base TEXT,
    category_key TEXT,
    icon_type TEXT
  );
`);
try {
  db.exec("ALTER TABLE users ADD COLUMN first_name TEXT;");
} catch (e) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN last_name TEXT;");
} catch (e) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN email TEXT;");
} catch (e) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN newsletter BOOLEAN DEFAULT 0;");
} catch (e) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN dsgvo BOOLEAN DEFAULT 0;");
} catch (e) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN message_count INTEGER DEFAULT 0;");
} catch (e) {
}
var taskCount = db.prepare("SELECT count(*) as count FROM weekly_tasks").get();
if (taskCount.count === 0) {
  const stmt = db.prepare("INSERT INTO weekly_tasks (week_number, description) VALUES (?, ?)");
  stmt.run(1, "task.week1");
  stmt.run(2, "task.week2");
  stmt.run(3, "task.week3");
} else {
  const stmt = db.prepare("UPDATE weekly_tasks SET description = ? WHERE week_number = ?");
  stmt.run("task.week1", 1);
  stmt.run("task.week2", 2);
  stmt.run("task.week3", 3);
}
var recipeCount = db.prepare("SELECT count(*) as count FROM weekly_recipes").get();
if (recipeCount.count === 0) {
  const stmt = db.prepare("INSERT INTO weekly_recipes (week_number, translation_key_base, category_key, icon_type) VALUES (?, ?, ?, ?)");
  stmt.run(1, "recipes.card.golden", "category.drink", "Coffee");
  stmt.run(1, "recipes.card.salad", "category.meal", "Leaf");
  stmt.run(1, "recipes.card.omega", "category.meal", "Utensils");
  stmt.run(1, "recipes.card.tea", "category.drink", "Coffee");
  stmt.run(2, "recipes.card.smoothie", "category.drink", "Coffee");
  stmt.run(2, "recipes.card.soup", "category.meal", "Utensils");
  stmt.run(2, "recipes.card.oats", "category.meal", "Leaf");
  stmt.run(2, "recipes.card.water", "category.drink", "Coffee");
}
app.use(import_express.default.json());
app.use((0, import_cookie_parser.default)());
var authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  import_jsonwebtoken.default.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
app.post("/api/register", async (req, res) => {
  const { first_name, last_name, email, password, newsletter, dsgvo } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "Vorname, Nachname, E-Mail und Passwort sind Pflichtfelder." });
  }
  if (!dsgvo) {
    return res.status(400).json({ error: "Sie m\xFCssen die Datenschutzerkl\xE4rung akzeptieren." });
  }
  try {
    const hashedPassword = await import_bcryptjs.default.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (username, email, first_name, last_name, password, newsletter, dsgvo, message_count) VALUES (?, ?, ?, ?, ?, ?, ?, 0)");
    const info = stmt.run(email, email, first_name, last_name, hashedPassword, newsletter ? 1 : 0, dsgvo ? 1 : 0);
    const token = import_jsonwebtoken.default.sign({ id: info.lastInsertRowid, username: email, is_premium: 0 }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
    res.json({ user: { id: info.lastInsertRowid, username: email, first_name, last_name, email, is_premium: false } });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(400).json({ error: "Diese E-Mail-Adresse wird bereits verwendet." });
    }
    res.status(500).json({ error: "Serverfehler bei der Registrierung." });
  }
});
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(username, username);
  if (!user || !await import_bcryptjs.default.compare(password, user.password)) {
    return res.status(401).json({ error: "Ung\xFCltige Anmeldedaten" });
  }
  const token = import_jsonwebtoken.default.sign({ id: user.id, username: user.username, is_premium: user.is_premium }, JWT_SECRET);
  res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
  res.json({ user: { id: user.id, username: user.username, first_name: user.first_name, last_name: user.last_name, email: user.email, is_premium: !!user.is_premium } });
});
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});
app.get("/api/me", authenticateToken, (req, res) => {
  const user = db.prepare("SELECT id, username, first_name, last_name, email, is_premium FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.sendStatus(401);
  res.json({ user: { ...user, is_premium: !!user.is_premium } });
});
app.post("/api/user/delete", authenticateToken, (req, res) => {
  try {
    const deleteTasks = db.prepare("DELETE FROM user_tasks WHERE user_id = ?");
    const deleteUser = db.prepare("DELETE FROM users WHERE id = ?");
    db.transaction(() => {
      deleteTasks.run(req.user.id);
      deleteUser.run(req.user.id);
    })();
    res.clearCookie("token");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});
app.get("/api/user/export", authenticateToken, (req, res) => {
  try {
    const user = db.prepare("SELECT id, username, created_at, is_premium FROM users WHERE id = ?").get(req.user.id);
    const tasks = db.prepare(`
      SELECT t.description, ut.completed_at 
      FROM user_tasks ut 
      JOIN weekly_tasks t ON ut.task_id = t.id 
      WHERE ut.user_id = ?
    `).all(req.user.id);
    res.json({ user, tasks });
  } catch (err) {
    res.status(500).json({ error: "Failed to export data" });
  }
});
app.post("/api/user/upgrade", authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare("UPDATE users SET is_premium = 1 WHERE id = ?");
    stmt.run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to upgrade" });
  }
});
app.get("/api/tasks/current", (req, res) => {
  const currentWeek = Math.ceil((/* @__PURE__ */ new Date() - new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1)) / 864e5 / 7);
  const totalTasks = db.prepare("SELECT count(*) as count FROM weekly_tasks").get();
  const taskIndex = currentWeek % totalTasks.count || 1;
  const task = db.prepare("SELECT * FROM weekly_tasks WHERE id = ?").get(taskIndex);
  res.json(task);
});
app.get("/api/tasks/status/:taskId", authenticateToken, (req, res) => {
  const { taskId } = req.params;
  const status = db.prepare("SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ?").get(req.user.id, taskId);
  res.json({ completed: !!status });
});
app.post("/api/tasks/complete", authenticateToken, (req, res) => {
  const { taskId } = req.body;
  try {
    const stmt = db.prepare("INSERT OR IGNORE INTO user_tasks (user_id, task_id) VALUES (?, ?)");
    stmt.run(req.user.id, taskId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to complete task" });
  }
});
app.get("/api/recipes/current", (req, res) => {
  const currentWeek = Math.ceil((/* @__PURE__ */ new Date() - new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1)) / 864e5 / 7);
  const weekIndex = currentWeek % 2 || 1;
  const recipes = db.prepare("SELECT * FROM weekly_recipes WHERE week_number = ?").all(weekIndex);
  res.json(recipes);
});
app.post("/api/chat", authenticateToken, async (req, res) => {
  const { messages } = req.body;
  const userId = req.user.id;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Fehlende Chat-Daten." });
  }
  try {
    const user = db.prepare("SELECT is_premium, message_count FROM users WHERE id = ?").get(userId);
    if (!user.is_premium && user.message_count >= 3) {
      return res.status(403).json({ error: "Limit reached", limitReached: true });
    }
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "user") {
      db.prepare("UPDATE users SET message_count = message_count + 1 WHERE id = ?").run(userId);
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
    const SYSTEM_INSTRUCTION = `Deine Rolle:
Du bist "Aura", der empathische Stress-Begleiter f\xFCr die App "Flow der Stille". Deine Aufgabe ist es, Nutzern in Momenten von Stress, \xDCberforderung oder Angst einen sicheren, ruhigen und bewertungsfreien Raum zu bieten.

Deine Pers\xF6nlichkeit & Tonalit\xE4t:
- Ruhig & Erdend: Deine Sprache ist sanft, klar und langsam. Nutze kurze S\xE4tze.
- Empathisch & Validierend: Du nimmst die Gef\xFChle des Nutzers ernst.
- Nicht-belehrend: Du dr\xE4ngst keine L\xF6sungen auf. 
- Anrede: Du sprichst den Nutzer h\xF6flich, aber nahbar mit "Sie" an. 

Deine Methodik (Der Ablauf):
1. Zuh\xF6ren & Validieren: Spiegele kurz die Emotion.
2. Erdung anbieten: Biete eine sehr kleine Achtsamkeits\xFCbung an. 
3. Premium-Meditation vorschlagen: Wenn es sinnvoll ist, weise einf\xFChlsam auf die Premium-Meditation hin. Nutze in diesem Fall zwingend am Ende deiner Antwort den Text-Marker '[PREMIUM_OFFER]'.
4. Offene Fragen: Stelle sanfte Fragen, um aus dem Gedankenkarussell zu holen.

Absolute Leitplanken:
- Du bist kein Arzt oder Therapeut. Verweise bei Krisen auf professionelle Hilfe.
- Halte deine Antworten extrem kurz (maximal 3-4 S\xE4tze).
- Niemals mehr als ein Smiley oder Emoji pro Nachricht.`;
    const contents = messages.map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 }
    });
    let replyText = response.text || "Ich bin hier, um Ihnen zuzuh\xF6ren. \u{1F331}";
    let hasPremiumOffer = false;
    if (replyText.includes("[PREMIUM_OFFER]")) {
      hasPremiumOffer = true;
      replyText = replyText.replace("[PREMIUM_OFFER]", "").trim();
    }
    res.json({ text: replyText, hasPremiumOffer });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Serverfehler bei der Kommunikation." });
  }
});
app.get("/api/daily", (req, res) => {
  res.json({ message: "Willkommen beim Flow der Stille. Dein Parasympathikus-Impuls folgt!" });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(__dirname, "dist");
    app.use(import_express.default.static(distPath));
  }
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    if (process.env.NODE_ENV !== "production") {
      res.sendFile(import_path.default.join(__dirname, "index.html"));
    } else {
      res.sendFile(import_path.default.join(__dirname, "dist", "index.html"));
    }
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.js.map
