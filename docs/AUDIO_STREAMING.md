# Geschütztes Audio-Streaming und Offline-Speicher

Stand: 10.11.2026 · Commits `19d3345`, `e154a42`, `7ee6a5a` auf `main`

## Ziel

Niemand soll sich Produkte selbst freischalten oder Vollversionen über einen öffentlichen Link herunterladen können. Gleichzeitig bleibt alles erhalten, was Hörer brauchen: Streaming im Web-Player und in den Apps, Wiedergabe bei gesperrtem Bildschirm und der Offline-Speicher in der App.

## Wie es funktioniert

Die Audiodateien liegen im Cloudflare-R2-Bucket `fds-audio`. Ein Cloudflare Worker gibt sie nur an berechtigte Hörer heraus. Ob jemand Zugriff hat, prüft der Worker in Supabase über die RPC `audio_zugang(p_produkt_id)`.

| Produkt | Zugriff |
|---|---|
| Gratis-Produkte (`preis = 0`): Atemübung, PMR, Herzöffnung, Schlaf-Selbsthypnose | für alle, auch ohne Login |
| Bezahlprodukte | nur mit Login und einem Eintrag in `kaeufe` (auch über ein Konto mit derselben E-Mail), VIP oder Admin |

Der Haftungsausschluss erscheint wie bisher vor dem ersten Abspielen.

### Ablauf beim Klick auf Play

1. Ist das Audio offline gespeichert, spielt der Player die lokale Datei. Dafür braucht es kein Netz und keinen Worker.
2. Sonst holt die App einen Kurzzeit-Link: `POST {AUDIO_BASE_URL}/link/{produkt_id}`. Mit Login wird `Authorization: Bearer <access_token>` mitgeschickt, ohne Login fehlt der Header.
3. Die Antwort des Workers entscheidet, was passiert:

| Antwort | Reaktion |
|---|---|
| `200` | Die `url` aus der Antwort ist 10 Minuten gültig und wird direkt als Player-Quelle gesetzt. |
| `401` | Mit Session: einmal erneuern und neu versuchen. Ohne Session: Login-Dialog. |
| `403` | Dialog „Noch nicht freigeschaltet“ mit Weg zum Ruhe-Shop. |
| `404` oder `5xx` | Hinweis „Audio gerade nicht verfügbar“. |

4. Ist der Link nach einer langen Pause abgelaufen, holt der Player automatisch einen neuen und spielt an derselben Stelle weiter. Das passiert vor dem Weiterspielen, wenn der Link älter als 9 Minuten ist, und bei jedem Fehler des Audio-Elements.

Spulen funktioniert über Teilanfragen (Range-Requests, Antwort `206`). Manipulierte Links lehnt der Worker mit `403` ab.

### Offline-Speicher

- Der Button „Offline speichern“ lädt die Datei über einen frischen Kurzzeit-Link vom Worker. Speichern kann also nur, wer das Audio auch abspielen darf.
- Die Datei liegt im geschützten App-Speicher (CacheStorage) unter einem festen internen Namen je Produkt. Der signierte Link wird nie gespeichert.
- Downloads aus früheren Versionen bleiben abspielbar.
- In den Einstellungen gibt es weiterhin die Speicherverwaltung.

## Wichtige Dateien

| Datei | Aufgabe |
|---|---|
| `src/config/audio.ts` | `AUDIO_BASE_URL` (Worker) und `HOERPROBEN_BASE_URL` (öffentliche Hörproben), beide per Umgebungsvariable überschreibbar |
| `src/lib/audioStream.ts` | `getAudioStreamUrl()` sowie die Fehlertypen `LoginRequiredError`, `NoAccessError` und `AudioUnavailableError` |
| `src/hooks/useProtectedStream.tsx` | gemeinsame Abspiel-Logik für alle Player: offline zuerst, dann Worker, automatisches Neuladen, Dialoge |
| `src/lib/offlineAudioService.ts` | Offline-Speicher und lokaler Kaufstatus |
| `src/components/OfflineDownloadButton.tsx` | Button „Offline speichern“ |
| `src/components/NoAccessModal.tsx` | Dialog bei `403` |
| `src/lib/offlineProductsService.ts` | `PRODUKT_COLUMNS`: Spaltenliste für alle Abfragen auf `produkte` (ohne `audio_path`) |

Diese Player nutzen den Hook: `AudioPlayerButton`, `SingleAudioPlayer`, `AudiobookPlayerModal`, `HoerprobenPlayer` sowie die Landingpages für Meditation, Selbsthypnose, Hörbücher und Rauhnächte.

### Umgebungsvariablen

```
VITE_AUDIO_BASE_URL=https://fds-audio.dirk-online-services.workers.dev
VITE_HOERPROBEN_BASE_URL=   # neue öffentliche Adresse der Hörproben, sobald umgezogen
```

Ohne diese Variablen gelten die Standardwerte aus `src/config/audio.ts`.

## Regeln für künftige Änderungen

- `audio_path` nie wieder laden oder als Player-Quelle verwenden. Bei Abfragen auf `produkte` immer `PRODUKT_COLUMNS` nutzen, kein `select('*')`.
- Den Stream-Link nicht ins HTML schreiben, nicht in localStorage speichern und nicht loggen.
- Der Client schreibt nie selbst in `kaeufe`. Bezahlkäufe laufen über `verify-google-play-purchase`, `verify-apple-purchase` und `process-purchase` (PayPal).
- Keine Schlüssel (service_role, Signier-Schlüssel, Google-Service-Account) in App oder Web.
- Den Offline-Speicher nicht entfernen oder einschränken. Hörer nutzen ihn, um Meditationen mit ausgeschaltetem Display oder ohne Netz zu hören.
- Am `<audio>`-Element immer `controlsList="nodownload"` setzen und das Kontextmenü unterbinden.

## Noch offen

1. **CORS am Worker (vor dem nächsten App-Build):** Der Worker erlaubt bisher nur `https://flow-der-stille.de`. Die Apps laufen intern unter `https://localhost` (Android) und `capacitor://localhost` (iOS). Ohne diese Freigabe funktionieren in den Apps weder Streaming noch Offline-Download.
2. **Hörproben umziehen (vor dem Abschalten von r2.dev):** Die beiden öffentlichen Hörproben (Herzöffnung, Besser Schlafen) liegen noch auf r2.dev. Sie brauchen einen neuen öffentlichen Ort. Danach `VITE_HOERPROBEN_BASE_URL` bzw. die Standardadresse in `src/config/audio.ts` und `produkte.hoerprobe_url` in Supabase anpassen.
3. **Hörproben für Bezahlprodukte:** Bezahlprodukte haben keine eigene Hörproben-Datei. Ihre Klangproben fehlen deshalb auf den Landingpages oder verlangen Login und Kauf. Wenn du sie zurück willst, brauchst du eigene Hörproben-Dateien.
4. **Prerender-Skript:** `npm run build:web` bricht ab, weil in `public/.htaccess` die PRERENDER-Markierungen fehlen.
5. **Erst ganz am Ende:** die öffentliche r2.dev-URL abschalten und `audio_path` in Supabase für App-Nutzer sperren.

Die Apps bekommen den neuen Stand erst mit dem nächsten manuellen Build in Xcode Cloud bzw. Android Studio, und zwar erst nach Punkt 1.

## Tests

| Fall | Erwartung |
|---|---|
| Gratis-Audio ohne Login | Haftungsausschluss, danach läuft es |
| Bezahl-Audio ohne Login | Login-Dialog |
| Bezahl-Audio eingeloggt ohne Kauf | Dialog „Noch nicht freigeschaltet“ |
| Bezahl-Audio mit Kauf | Abspielen und Spulen funktionieren |
| Offline speichern, dann Flugmodus | Audio läuft weiter |
| Mehr als 10 Minuten Pause | Weiterspielen ohne Fehler |
| Play-Testkauf | landet über `verify-google-play-purchase` in `kaeufe` und ist abspielbar |
| Suche nach `r2.dev` im Code | nur noch in `src/config/audio.ts` (Hörproben), nach Punkt 2 gar nicht mehr |

Bereits direkt gegen den Worker geprüft: Alle vier Gratis-Produkte liefern ohne Login `200`, ein Bezahlprodukt `401`. Spulen liefert `206`, ein manipulierter Link `403`. Der vollständige Download einer Datei funktioniert.
