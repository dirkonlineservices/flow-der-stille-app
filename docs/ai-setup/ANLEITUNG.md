# Token sparen: Skill, Agenten und Regel

Dieses Repository bringt eine Einrichtung mit, damit KI-Assistenten weniger Tokens verbrauchen.

| Datei | Für | Wirkt |
|---|---|---|
| `.claude/skills/modellwahl/SKILL.md` | Claude Code | automatisch, sobald Claude Code in diesem Projekt gestartet wird |
| `.claude/agents/suche-abgleich.md` | Claude Code | günstiger Such-Agent (Haiku) |
| `.claude/agents/zusammenfassung.md` | Claude Code | günstiger Zusammenfassungs-Agent (Haiku) |
| `.claude/agents/analyse.md` | Claude Code | Analyse-Agent (Sonnet) |
| `.agent/rules/token-sparen-regel.md` | Antigravity | als Projekt-Regel, sobald der Projektordner geöffnet ist |

## Nur in diesem Projekt oder überall?

Die Dateien im Repository gelten **nur für dieses Projekt**. Für alle Projekte auf einem Rechner:

- **Claude Code:** die Dateien zusätzlich in den Benutzerordner kopieren.
  - Windows: `%USERPROFILE%\.claude\skills\modellwahl\SKILL.md` und `%USERPROFILE%\.claude\agents\*.md`
  - macOS: `~/.claude/skills/modellwahl/SKILL.md` und `~/.claude/agents/*.md`
  - Danach Claude Code neu starten. `/agents` zeigt die drei Agenten.
- **Antigravity:** den Inhalt von `.agent/rules/token-sparen-regel.md` in den Einstellungen als globale Regel anlegen. Die Menüpunkte können je nach Version anders heißen.

## Grenzen

- Antigravity kennt die Claude-Modelle Haiku und Sonnet nicht als Unter-Agenten. Dort spart die Regel über gezieltes Lesen und knappe Antworten. Das günstige Modell (z. B. Gemini Flash) wählst du für Such- und Zusammenfassungsaufgaben selbst.
- Die Agenten `suche-abgleich` und `analyse` sind auf Gmail, Slack, ClickUp und Drive ausgelegt. Ohne diese Verbindungen arbeiten sie mit dem, was vorhanden ist.
- `.claude/settings.local.json` ist von Git ausgeschlossen und wird nie geteilt.
