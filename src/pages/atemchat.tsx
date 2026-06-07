// Chat Route (abgesichert mit Login-Check, Paywall und Premium-Angebot)
app.post('/api/chat', authenticateToken, async (req: any, res: any) => {
  const { messages } = req.body;
  const userId = req.user.id; 

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Fehlende Chat-Daten." });
  }

  try {
    // 1. Paywall-Prüfung: Darf der Nutzer noch schreiben?
    const user = db.prepare('SELECT is_premium, message_count FROM users WHERE id = ?').get(userId) as any;
    
    if (!user.is_premium && user.message_count >= 3) {
      return res.status(403).json({ error: 'Limit reached', limitReached: true });
    }

    // 2. Zähler hochsetzen (da eine neue Nachricht gesendet wird)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "user") {
        db.prepare('UPDATE users SET message_count = message_count + 1 WHERE id = ?').run(userId);
    }

    // 3. Verbindung zu Google Gemini
    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const SYSTEM_INSTRUCTION = `Deine Rolle:
Du bist der empathische Stress-Begleiter für die App "Flow der Stille". Deine Aufgabe ist es, Nutzern in Momenten von Stress, Überforderung oder Angst einen sicheren, ruhigen und bewertungsfreien Raum zu bieten.

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

    // Filtert den geheimen Code für den UI-Button heraus
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