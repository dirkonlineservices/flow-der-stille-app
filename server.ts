import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const db = new Database('database.db');

// Initialize Database
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

// Try altering the table to add GDPR, newsletter support AND the new message_count for the Paywall
try { db.exec("ALTER TABLE users ADD COLUMN first_name TEXT;"); } catch(e){}
try { db.exec("ALTER TABLE users ADD COLUMN last_name TEXT;"); } catch(e){}
try { db.exec("ALTER TABLE users ADD COLUMN email TEXT;"); } catch(e){}
try { db.exec("ALTER TABLE users ADD COLUMN newsletter BOOLEAN DEFAULT 0;"); } catch(e){}
try { db.exec("ALTER TABLE users ADD COLUMN dsgvo BOOLEAN DEFAULT 0;"); } catch(e){}
try { db.exec("ALTER TABLE users ADD COLUMN message_count INTEGER DEFAULT 0;"); } catch(e){} // Zähler für die Bezahlschranke

// Seed initial weekly task if empty
const taskCount = db.prepare('SELECT count(*) as count FROM weekly_tasks').get() as { count: number };
if (taskCount.count === 0) {
  const stmt = db.prepare('INSERT INTO weekly_tasks (week_number, description) VALUES (?, ?)');
  stmt.run(1, 'task.week1');
  stmt.run(2, 'task.week2');
  stmt.run(3, 'task.week3');
} else {
  const stmt = db.prepare('UPDATE weekly_tasks SET description = ? WHERE week_number = ?');
  stmt.run('task.week1', 1);
  stmt.run('task.week2', 2);
  stmt.run('task.week3', 3);
}

// Seed recipes if empty
const recipeCount = db.prepare('SELECT count(*) as count FROM weekly_recipes').get() as { count: number };
if (recipeCount.count === 0) {
  const stmt = db.prepare('INSERT INTO weekly_recipes (week_number, translation_key_base, category_key, icon_type) VALUES (?, ?, ?, ?)');
  
  stmt.run(1, 'recipes.card.golden', 'category.drink', 'Coffee');
  stmt.run(1, 'recipes.card.salad', 'category.meal', 'Leaf');
  stmt.run(1, 'recipes.card.omega', 'category.meal', 'Utensils');
  stmt.run(1, 'recipes.card.tea', 'category.drink', 'Coffee');

  stmt.run(2, 'recipes.card.smoothie', 'category.drink', 'Coffee');
  stmt.run(2, 'recipes.card.soup', 'category.meal', 'Utensils');
  stmt.run(2, 'recipes.card.oats', 'category.meal', 'Leaf');
  stmt.run(2, 'recipes.card.water', 'category.drink', 'Coffee');
}

app.use(express.json());
app.use(cookieParser());

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, password, newsletter, dsgvo } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Vorname, Nachname, E-Mail und Passwort sind Pflichtfelder.' });
  }
  if (!dsgvo) {
    return res.status(400).json({ error: 'Sie müssen die Datenschutzerklärung akzeptieren.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, email, first_name, last_name, password, newsletter, dsgvo, message_count) VALUES (?, ?, ?, ?, ?, ?, ?, 0)');
    const info = stmt.run(email, email, first_name, last_name, hashedPassword, newsletter ? 1 : 0, dsgvo ? 1 : 0);
    
    const token = jwt.sign({ id: info.lastInsertRowid, username: email, is_premium: 0 }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
    res.json({ user: { id: info.lastInsertRowid, username: email, first_name, last_name, email, is_premium: false } });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Diese E-Mail-Adresse wird bereits verwendet.' });
    }
    res.status(500).json({ error: 'Serverfehler bei der Registrierung.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, is_premium: user.is_premium }, JWT_SECRET);
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
  res.json({ user: { id: user.id, username: user.username, first_name: user.first_name, last_name: user.last_name, email: user.email, is_premium: !!user.is_premium } });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/api/me', authenticateToken, (req: any, res) => {
  const user = db.prepare('SELECT id, username, first_name, last_name, email, is_premium FROM users WHERE id = ?').get(req.user.id) as any;
  if (!user) return res.sendStatus(401);
  res.json({ user: { ...user, is_premium: !!user.is_premium } });
});

// GDPR Routes
app.post('/api/user/delete', authenticateToken, (req: any, res) => {
  try {
    const deleteTasks = db.prepare('DELETE FROM user_tasks WHERE user_id = ?');
    const deleteUser = db.prepare('DELETE FROM users WHERE id = ?');
    
    db.transaction(() => {
      deleteTasks.run(req.user.id);
      deleteUser.run(req.user.id);
    })();
    
    res.clearCookie('token');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

app.get('/api/user/export', authenticateToken, (req: any, res) => {
  try {
    const user = db.prepare('SELECT id, username, created_at, is_premium FROM users WHERE id = ?').get(req.user.id);
    const tasks = db.prepare(`
      SELECT t.description, ut.completed_at 
      FROM user_tasks ut 
      JOIN weekly_tasks t ON ut.task_id = t.id 
      WHERE ut.user_id = ?
    `).all(req.user.id);
    
    res.json({ user, tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Premium Feature Route
app.post('/api/user/upgrade', authenticateToken, (req: any, res) => {
  try {
    const stmt = db.prepare('UPDATE users SET is_premium = 1 WHERE id = ?');
    stmt.run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upgrade' });
  }
});

// Task & Recipe Routes
app.get('/api/tasks/current', (req, res) => {
  const currentWeek = Math.ceil(((new Date() as any) - (new Date(new Date().getFullYear(), 0, 1) as any)) / 86400000 / 7);
  const totalTasks = db.prepare('SELECT count(*) as count FROM weekly_tasks').get() as { count: number };
  const taskIndex = (currentWeek % totalTasks.count) || 1; 
  
  const task = db.prepare('SELECT * FROM weekly_tasks WHERE id = ?').get(taskIndex);
  res.json(task);
});

app.get('/api/tasks/status/:taskId', authenticateToken, (req: any, res) => {
  const { taskId } = req.params;
  const status = db.prepare('SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ?').get(req.user.id, taskId);
  res.json({ completed: !!status });
});

app.post('/api/tasks/complete', authenticateToken, (req: any, res) => {
  const { taskId } = req.body;
  try {
    const stmt = db.prepare('INSERT OR IGNORE INTO user_tasks (user_id, task_id) VALUES (?, ?)');
    stmt.run(req.user.id, taskId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

app.get('/api/recipes/current', (req, res) => {
  const currentWeek = Math.ceil(((new Date() as any) - (new Date(new Date().getFullYear(), 0, 1) as any)) / 86400000 / 7);
  const weekIndex = (currentWeek % 2) || 1; 
  
  const recipes = db.prepare('SELECT * FROM weekly_recipes WHERE week_number = ?').all(weekIndex);
  res.json(recipes);
});

// --- Chat Route mit Paywall & Aura KI ---
app.post('/api/chat', authenticateToken, async (req: any, res: any) => {
  const { messages } = req.body;
  const userId = req.user.id; 

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Fehlende Chat-Daten." });
  }

  try {
    const user = db.prepare('SELECT is_premium, message_count FROM users WHERE id = ?').get(userId) as any;
    
    if (!user.is_premium && user.message_count >= 3) {
      return res.status(403).json({ error: 'Limit reached', limitReached: true });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "user") {
        db.prepare('UPDATE users SET message_count = message_count + 1 WHERE id = ?').run(userId);
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const SYSTEM_INSTRUCTION = `Deine Rolle:
Du bist "Aura", der empathische Stress-Begleiter für die App "Flow der Stille". Deine Aufgabe ist es, Nutzern in Momenten von Stress, Überforderung oder Angst einen sicheren, ruhigen und bewertungsfreien Raum zu bieten.

Deine Persönlichkeit & Tonalität:
- Ruhig & Erdend: Deine Sprache ist sanft, klar und langsam. Nutze kurze Sätze.
- Empathisch & Validierend: Du nimmst die Gefühle des Nutzers ernst.
- Nicht-belehrend: Du drängst keine Lösungen auf. 
- Anrede: Du sprichst den Nutzer höflich, aber nahbar mit "Sie" an. 

Deine Methodik (Der Ablauf):
1. Zuhören & Validieren: Spiegele kurz die Emotion.
2. Erdung anbieten: Biete eine sehr kleine Achtsamkeitsübung an. 
3. Premium-Meditation vorschlagen: Wenn es sinnvoll ist, weise einfühlsam auf die Premium-Meditation hin. Nutze in diesem Fall zwingend am Ende deiner Antwort den Text-Marker '[PREMIUM_OFFER]'.
4. Offene Fragen: Stelle sanfte Fragen, um aus dem Gedankenkarussell zu holen.

Absolute Leitplanken:
- Du bist kein Arzt oder Therapeut. Verweise bei Krisen auf professionelle Hilfe.
- Halte deine Antworten extrem kurz (maximal 3-4 Sätze).
- Niemals mehr als ein Smiley oder Emoji pro Nachricht.`;

    const contents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 },
    });

    let replyText = response.text || "Ich bin hier, um Ihnen zuzuhören. 🌱";
    let hasPremiumOffer = false;

    if (replyText.includes("[PREMIUM_OFFER]")) {
      hasPremiumOffer = true;
      replyText = replyText.replace("[PREMIUM_OFFER]", "").trim();
    }

    res.json({ text: replyText, hasPremiumOffer });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: 'Serverfehler bei der Kommunikation.' });
  }
});

// Daily Rest / Parasympathetic Impulse Route
app.get('/api/daily', (req, res) => {
  res.json({ message: "Willkommen beim Flow der Stille. Dein Parasympathikus-Impuls folgt!" });
});

// --- Überarbeitete Server-Start-Logik mit globalem Catch-All-Routing ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
  }

  // Das universelle Catch-All-Routing fängt alle F5-Aktualisierungen sicher ab
  app.get('*', (req, res, next) => {
    // Verhindert, dass API-Anfragen fälschlicherweise die index.html zurückbekommen
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Liefert die index.html basierend auf der aktuellen Umgebung aus
    if (process.env.NODE_ENV !== 'production') {
      res.sendFile(path.join(__dirname, 'index.html'));
    } else {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();