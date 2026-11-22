---
name: modellwahl
description: Spart Tokens, indem Arbeit an das günstigste passende Modell delegiert wird. Immer verwenden bei Tageschecks, Mail-/Slack-/ClickUp-/Drive-Abgleichen, Suchen, Auflisten, Zusammenfassen langer Texte oder Notizen, Prüfen von Dateien und beim Start jedes Subagenten. Legt fest, welche Aufgabe haiku, sonnet oder das Hauptmodell bekommt, und wie Ergebnisse knapp zurückkommen.
---

# Modellwahl: günstig delegieren, teuer nur entscheiden

Ziel: Tokens sparen, ohne Qualität bei Kundentexten, Entscheidungen und Code zu verlieren. Das Hauptgespräch (teures Modell) plant, entscheidet und schreibt das, was Dirk oder Kunden lesen. Sammel-, Such- und Lesearbeit geht an günstige Subagenten.

## Welches Modell wofür

| Aufgabe | Modell | Wie |
|---|---|---|
| Mails, Slack, ClickUp, Drive, Kalender durchsuchen und auflisten (Tagescheck, „was ist neu“, Abgleich Mail ↔ ClickUp) | **haiku** | Agent `suche-abgleich` |
| Lange Texte zusammenfassen: Gemini-Notizen, Huddle-Notizen, PDFs, Mail-Threads, Exporte | **haiku** | Agent `zusammenfassung` |
| Webseiten lesen, Doku nachschlagen | **haiku** | Agent `web-fetch` mit `model: haiku` |
| Dateien oder Code durchsuchen („wo steht …“) | **haiku** | Agent `Explore` mit `model: haiku` |
| Analyse mit Abwägung: Konzept, Prüfbericht, Vergleich, Fehlersuche, Prompt für Claude Desktop entwerfen | **sonnet** | Agent `analyse` |
| Viele Dateien gleichartig bearbeiten: übersetzen, Stil überarbeiten, Perspektive umstellen | **sonnet** | Agent `general-purpose` mit `model: sonnet` |
| Texte, die Kunden oder Kollegen lesen (Mails, Slack, Tasks mit Anleitung, Akten-Einträge), Entscheidungen, Theme-Code, alles mit Live-Wirkung | **Hauptmodell** | selbst im Hauptgespräch, nicht delegieren |

Faustregel: **Finden und Lesen = haiku. Abwägen = sonnet. Schreiben für Menschen und Entscheiden = Hauptmodell.**

## So delegierst du

1. Aufgabe klar abgrenzen: Was genau suchen, in welchem Zeitraum, welche Quellen, welches Format zurück.
2. Agent starten mit passendem Modell (Agent-Tool, Parameter `model` oder einer der eigenen Agenten unten).
3. **Knappes Rückgabeformat verlangen**, z. B. „Tabelle: Quelle · Datum · Kunde · Inhalt in 1 Satz · Link/ID, höchstens 30 Zeilen“. Keine Volltexte, keine Rohdaten.
4. Unabhängige Suchen parallel starten (mehrere Agenten in einer Nachricht).
5. Ergebnis im Hauptgespräch prüfen und daraus Antwort, Tasks oder Entwürfe machen. Fakten, auf die eine Kundenmail oder ein Task aufbaut (Codes, Preise, Termine, IDs), stichprobenartig selbst nachprüfen.

## Was nicht delegiert wird

- Entwürfe an Kunden und Kollegen, Task-Beschreibungen mit Schritt-für-Schritt-Anleitung, Einträge in Projektakten.
- Alles, was etwas verändert: ClickUp-Status, Zuweisungen, Drive-Dateien, Shopify, Theme, Slack-Kanäle. Subagenten **lesen nur**.
- Kurze Einzelabfragen (1–2 Tool-Aufrufe): selbst machen, ein Agent kostet mehr.

## Tokens sparen im Hauptgespräch

- Gmail: `THREAD_VIEW_SUMMARY` oder `MINIMAL` statt Volltext; Volltext nur für die 1–3 Mails, die wirklich gelesen werden müssen.
- ClickUp `filter_tasks`: immer `fields` setzen und auf die relevanten `list_ids` eingrenzen (Siebenrock-Massen-Updates von Florian sonst im Ergebnis).
- Große Ergebnisse, die in einer Datei landen: mit `jq`/Python nur die nötigen Felder ausgeben.
- Google Docs: erst `read_file_content` (klein), `read_doc` nur für Positionen beim Bearbeiten.
- Keine Dateien oder Mails zweimal lesen; Ergebnisse aus dem Gespräch wiederverwenden.

## Eigene Agenten (in `~/.claude/agents/`)

- `suche-abgleich` (haiku): sucht und listet aus Gmail, Slack, ClickUp, Drive, Kalender. Nur lesen.
- `zusammenfassung` (haiku): fasst lange Texte knapp und strukturiert zusammen.
- `analyse` (sonnet): Analysen, Konzepte, Prüfberichte, Prompt-Entwürfe.
