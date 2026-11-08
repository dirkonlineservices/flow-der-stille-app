# Flow der Stille – Projektregeln & Richtlinien

## 0. SICHERHEITSBLOCK: GERÄTE-SYNCHRONISATION (MAC <-> WINDOWS)
> ### 🔒 AKTUELLER SYNCHRONISATIONS-STATUS
> - **Zuletzt bearbeiteter Rechner**: 🍏 Apple Mac (MacBook)
> - **Letzter Stand**: 08.11.2026, 14:55 Uhr (🎯 Badge-Harmonisierung & Desktop Header-Fix: Hero-Badge in 'AdventskalenderPage.tsx' von störendem Pop-Up-Button befreit & zentriert; Banner-Dopplung auf /adventskalender eliminiert; Desktop-Banner mit Sicherheitsabstand für feste Action-Buttons abgesichert; Web-Build fehlerfrei)
> - **Branch**: `main` (up to date mit origin/main)
> - **Status**: 🚀 Großer Meilenstein erreicht! 
>   1. **Version 1.0 ist LIVE im App Store**: [https://apps.apple.com/us/app/flow-der-stille-selbsthypnose/id6821544372](https://apps.apple.com/us/app/flow-der-stille-selbsthypnose/id6821544372) (Apple ID `6821544372`).
>   2. **Version 1.0.1 (Build 28)** eingereicht: Neues Marken-AppIcon (warmer Beige-Hintergrund & Salbeigrün-Linien), serverseitige Apple App Store Server API Kaufverifizierung (`verify-apple-purchase`), natives StoreKit „Käufe wiederherstellen“ & DSGVO „Konto löschen“ im Build.
>   3. **Geschäftliches & Finanzen**: Bankkonto (EUR/USD) aktiv, Vertrag für gebührenpflichtige Apps aktiv, US-Steuerformulare W-8BEN & U.S. Certificate of Foreign Status of Beneficial Owner vollständig übermittelt & aktiv, EU-DSA-Händlernachweis übermittelt.
>
> ### 📦 ZULETZT ERFOLGREICH UMGESETZT (STAND: 08.11.2026):
> 1. **Offizieller App Store Launch (Version 1.0)**:
>    - Von Apple am 06.11.2026 geprüft, genehmigt und weltweit veröffentlicht.
> 2. **Version 1.0.1 (Build 28) eingereicht**:
>    - Eigenes maßgeschneidertes 1024x1024 Marken-AppIcon (warmes Beige `#F5F5F0` mit echten Salbeigrün-Vektoren des Flow-Logos).
>    - Xcode Cloud Workflow für reine iOS-Archivierung optimiert (macOS-Fehlkonfiguration entfernt).
>    - Build 28 fehlerfrei gebaut und direkt zur Apple-Prüfung übermittelt.
> 3. **Finanzen, Verträge & Steuern abgeschlossen**:
>    - Bankkonto hinterlegt und verknüpft.
>    - Vertrag für gebührenpflichtige Apps gegengezeichnet.
>    - US-Steuerformulare (Form W-8BEN & Certificate of Foreign Status) mit deutscher Steuer-ID, Claim of Tax Treaty Benefits (0 % US-Quellensteuer) und Titel „Owner“ erfolgreich eingereicht.
>    - EU-DSA-Compliance-Dokumente hochgeladen.
> 4. **Codebase- & Datenkonsistenz**:
>    - Alle 11 In-App-Käufe (inklusive der neuen Rauhnächte `fds_rauhnaechte` ↔ `rauhnaechte`, 9,99 €) sind 1:1 identisch zwischen Supabase-Datenbank, Code (`billing.ts`, `verify-apple-purchase`) und App Store Connect gemappt.
> 5. **🎄 24-Tage Adventskalender („Der Adventskalender – 24 Tage Innehalten“)**:
>    - Eigene interaktive Landing Page unter `/adventskalender` (sowie Aliase `/weihnachtskalender` und `/advent`) mit allen 24 Türchen (Teil 1: Tage 1–12 Verlangsamung & Loslassen; Teil 2: Tage 13–24 Wendepunkt & Weihezeit), den 4 Säulen (5× Meditationen, 3× Gewinnspiele am 06., 13. & 21. Dez, 8× Altes Wissen, 8× Achtsamkeit), Kachel- & Tabellenansicht sowie Brücke zum Rauhnacht-Hörbuch.
>    - Direkt auf der Startseite (`HomeAdminLanding.tsx`) als prominente Sektion eingebunden + wiederverwendbares Pop-Up Modal (`AdventskalenderPopupModal`), das sich einmalig pro Sitzung, per Button oder per `?popup=advent` öffnen lässt.
>
> ### ✅ OFFENE TO-DOS AUS DER SEO-/BACKEND-SESSION (17.10.2026)
> 1. **🔎 Google Search Console – ab 18.10. morgens** (max. ~10× „Indexierung beantragen“ pro Tag; je URL: oben einfügen → *Live-URL testen* → *Indexierung beantragen*):
>    - [x] Einmalig (erledigt 18.10.): *Sitemaps* → `https://flow-der-stille.de/sitemap.xml` neu einreichen.
>    - [ ] Einmalig: *Seiten* → „Gefunden – zurzeit nicht indexiert“, „Seite mit Weiterleitung“, „Alternative Seite mit richtigem kanonischen Tag“ → jeweils *Fehlerbehebung prüfen*.
>    - [x] **Tag 1 – Hauptseiten** (erledigt 18.10.): `/`, `/meditation`, `/selbsthypnose`, `/hoerbuecher`, `/ruhe-shop`, `/hoerproben`, `/ueber-uns`, `/blog`, `/uebungen`, `/faq`
>    - [ ] **Tag 2 – Produkte**: `/audio/selbsthypnose_besser_und_erholsamer_schlaf`, `/audio/selbsthypnose_selbstbewusstsein`, `/audio/selbsthypnose_fokus`, `/audio/selbsthypnose_ernaehrung`, `/audio/meditation_innere_ruhe`, `/audio/meditation_loslassen`, `/audio/meditation_zur_herzoeffnung`, `/audio/pmr_muskelentspannung`, `/hoerbuch/mensch_sein`, `/hoerbuch/schmetterling`
>    - [ ] **Tag 3 – Blog & Inhalte**: `/hoerbuch/wo-die-seele-den-wind-beruehrt`, `/blog/innere-ruhe-im-alltag`, `/blog/parasympathikus-aktivieren`, `/blog/herzkohaerenz-herz-und-verstand`, `/blog/warum-flow-der-stille-kostenlose-meditation-ohne-abo`, `/blog/trauerbegleitung-trauerbewaeltigung-hoerbuch-seele-wind`, `/wissen`, `/morgen`, `/abend`, `/rezepte`
>    - [ ] **Tag 4 – neue Beiträge**: `/blog/ki-mit-herz-kuenstliche-intelligenz-achtsamkeit`, `/blog/selbsthypnose-wirkung-anwendung-qualitaetsanspruch`
>    - (Alle URLs mit `https://flow-der-stille.de` davor.)
> 2. **💶 Käufe seit 28.09.2026 nachtragen**: Bis zum Fix am 17.10. landeten PayPal-Käufe und Google-Play-Gastkäufe nicht in `kaeufe`. In PayPal & Google Play Console echte Zahlungen 28.09.–17.10. prüfen und ggf. über das Admin-Dashboard freischalten.
> 3. **🍏 Apple-Kaufprüfung (Code fertig 23.10., noch nicht deployt)**: Neue Edge Function `verify-apple-purchase` prüft jede iOS-Transaktion über die App Store Server API (Produktion, bei 404 Sandbox/TestFlight) und speichert sie in `kaeufe` (`order_id` = `APPLE.…` bzw. `APPLE.SANDBOX.…`). Der Käufer wird nur aus dem Login-Token bestimmt. Noch zu tun:
>    - [ ] App Store Connect → *Benutzer und Zugriff* → *Integrationen* → *In-App-Kauf* → Schlüssel erzeugen (.p8 herunterladen, nur einmal möglich), Key-ID und Issuer-ID notieren.
>    - [ ] Supabase-Secrets setzen: `APPLE_IAP_KEY_ID`, `APPLE_IAP_ISSUER_ID`, `APPLE_IAP_PRIVATE_KEY` (Inhalt der .p8-Datei).
>    - [ ] `verify-apple-purchase` und `notify-new-purchase` deployen, danach Testkauf in TestFlight (Sandbox-Konto).
> 4. **💬 Atem-Chat „Aura“** – seit 17.10. **ausgeblendet** (antwortete live nicht, `/api/chat` braucht den nicht laufenden Express-Server). Zum Reaktivieren: Edge Function mit Gemini-Secret bauen, dann in `public/.htaccess` die 302-Zeile für `atemchat|chat` entfernen, in `src/index.tsx` `/atemchat` wieder auf `<AtemChat />` stellen, Menüpunkt in `Layout.tsx` zurückholen und `/atemchat` in `public/sitemap.xml` eintragen.
>
> 5. **🔐 Kauf-Sicherheit (Code fertig 23.10.) – Reihenfolge einhalten!**
>    - [x] (23.10.) **Sofort:** `supabase/migrations/20261023_profiles_rollenschutz.sql` im Supabase SQL-Editor ausführen (Nutzer konnten sich über `profiles.rolle` selbst zum Admin machen). Die Kontrollabfrage am Ende zeigt alle Admins → nur bekannte Adressen?
>    - [x] (23.10., Admins geprüft: nur bekannte Adressen; Google-Zugang `GOOGLE_PLAY_SERVICE_ACCOUNT` funktioniert) Prüfen, dass die Secrets `GOOGLE_SERVICE_ACCOUNT` und `PAYPAL_LIVE_CLIENT_ID`/`PAYPAL_LIVE_SECRET` in Supabase gesetzt sind. Ohne sie lehnen die Funktionen jetzt **jeden** Kauf ab (keine Test-/Ersatz-IDs mehr).
>    - [x] (23.10.) Edge Functions deployen: `process-purchase`, `verify-google-play-purchase`, `verify-apple-purchase`, `notify-new-purchase`.
>    - [ ] Echter PayPal-Testkauf (oder Logs eines echten Kundenkaufs in *Edge Functions → process-purchase → Logs*: „von PayPal bestätigt“?).
>    - [ ] Kauf vom 20.10. (`GPA.TEST-selbshypnose…`) in der Play Console prüfen – evtl. falsches Produkt freigeschaltet.
>    - [ ] Push → Web live; neuen Android-Build (Play Store) und iOS-Build veröffentlichen.
>    - [ ] **Zuletzt:** `supabase/migrations/20261023_kaeufe_nur_admin_insert.sql` ausführen (nur noch Server & Admins schreiben in `kaeufe`).
>    - Hinweis: Scheitert die Server-Prüfung bei PayPal, bekommt der Kunde „Zahlung eingegangen, Freischaltung wird geprüft“ und es geht ein Alarm über `send-error-alert` raus → manuell im Admin-Dashboard freischalten.

> ### 🎯 NÄCHSTE SCHRITTE & TO-DO-ROADMAP (ZIEL: LIVE-GANG IM OKTOBER 2026):
> 1. **📱 Sobald das Apple-Testgerät da ist (kommende Woche)**:
>    - Apple TestFlight App auf dem iPhone/iPad installieren.
>    - „Flow der Stille“ Build 1.0 (6) installieren und testen:
>      - Audio-Streaming & Hintergrund-Wiedergabe (bei gesperrtem Bildschirm)
>      - „Sign in with Apple“ Login & Registrierung live verifizieren
>      - Mediathek- & Offline-Funktionen prüfen
> 2. **🛒 In-App-Käufe im App Store Connect (Ruhe-Shop)**:
>    - Alle Store-Produkte aus `billing.ts` als *Nicht-verbrauchsartikel* hinterlegen:
>      - Selbsthypnosen & Meditationen (1,99 €): `fds_selbsthypnose_selbstbewusstsein`, `fds_herzoeffnung_meditation`, `fds_meditation_loslassen`, `fds_selbsthypnose_gesunde_ernaehrung`, `fds_selbsthypnose_fokus_absolute_konzentration`, `fds_herzkompass_meditation`, `fds_meditation_inneres_kind`, `fds_meditation_innere_ruhe`, `fds_pmr_basis`, `fds_gefuehrte_atemuebung`.
>      - Hörbücher (4,99 €, Steuerkategorie Hörbücher): `fds_mensch_sein`, `fds_schmetterling`, `fds_seele_wind`.
>    - Prüfungs-Screenshots für die In-App-Käufe direkt auf dem echten iPhone im Ruhe-Shop aufnehmen und hochladen.
> 3. **🚀 Finaler App Store Release (Oktober 2026)**:
>    - Offizielle App Store Screenshots (iPhone 6.9" / 6.5") erstellen und hochladen.
>    - Werbetext, App-Beschreibung, Suchbegriffe (Keywords) und Support-URL hinterlegen.
>    - TestFlight Build & In-App-Käufe verknüpfen und zur offiziellen Apple-Prüfung (App Review) einreichen.

---

### 🛡️ VERBINDLICHE WORKFLOW-REGELN ZUR VERHINDERUNG VON DATENVERLUST:

1. **BEI JEDEM ARBEITSBEGINN (AUF JEDEM RECHNER – WINDOWS ODER MAC)**:
   - Der Assistent MUSS ZUERST den Sicherheitsblock oben prüfen.
   - **WENN DER RECHNER GEWECHSELT WURDE** (z. B. du bist jetzt am Windows-PC und der letzte Stand war auf dem Mac, oder umgekehrt):
     -> **ZWINGENDER ERSTER SCHRITT**: Sofort `git pull origin main` ausführen!
     -> Erst wenn der Pull erfolgreich durchgelaufen ist, dürfen Dateien analysiert, geändert oder gebaut werden.
   - **WENN DURCHGEHEND AM SELBEN RECHNER GEARBEITET WIRD**:
     -> Kein Pull nötig, direkt weiterarbeiten.

2. **VOR JEDEM RECHNERWECHSEL / ARBEITSENDE (ZWINGENDER PUSH)**:
   - Der Assistent MUSS vor dem Beenden der Session:
     1. Den Sicherheitsblock oben in `GEMINI.md` aktualisieren:
        - `Zuletzt bearbeiteter Rechner`: Aktuellen Rechner eintragen (z. B. `🍏 Apple Mac (MacBook)` oder `💻 Windows-PC`)
        - `Letzter Stand`: Aktuelle Uhrzeit & Datum eintragen
     2. Alle Änderungen committen und zu GitHub pushen:
        `git add .` -> `git commit -m "..."` -> `git push origin main`
   - Dadurch ist lückenlos garantiert, dass der andere Rechner beim nächsten Start sofort die neuesten Dateien erhält und niemals Code überschrieben wird.

---

## 1. RECHTLICHE TERMINOLOGIE: AUSSCHLIESSLICH "SELBSTHYPNOSE"
- **STRIKTE PFLICHT**: Es darf überall (Webseite, App, Shop, Metadaten, FAQ, Produktbeschreibungen, SEO, Social Media) **NUR "Selbsthypnose" bzw. "Selbsthypnosen"** heißen.
- **ABSOLUTES VERBOT**: Niemals das Wort "Hypnose" oder "Hypnosen" isoliert verwenden.
- **Rechtlicher Hintergrund**: Flow der Stille bietet **keine** therapeutischen oder medizinischen Hypnosen an, sondern ausschließlich geführte Selbsthypnosen zur Eigenanwendung zur mentalen Entspannung, Schlaf- und Stressreduktion für gesunde Menschen.

## 2. AUDIO-NUTZUNG: REINES STREAMING (KEIN MP3-DOWNLOAD)
- Sämtliche Produkte werden ausschließlich zum **Streaming im Web-Player oder in der Android App** angeboten.
- Niemals von "MP3-Download", "Download auf die Festplatte" oder "Offline-Download als MP3" sprechen.

## 3. KEIN SLEEPTIMER
- Die App und der Web-Player besitzen keinen Sleeptimer (Schlaf-Timer). Dies niemals bewerben oder implementieren.

## 4. RUHE-SHOP STATT "PREMIUM"
- Die frühere Bezeichnung "Premium" wurde durch **"Ruhe-Shop"** ersetzt (Einmalkauf ab 1,99 €, kein Abo, transparenter Express-Gastkauf mit Magic Link).

## 5. DESIGN & TYPOGRAFIE
- **Preise & Währung**: Beträge und Euro-Zeichen müssen immer zusammenhängend formatiert sein (`&nbsp;€` und `whitespace-nowrap`), damit das Euro-Zeichen niemals umbricht.
- **Hoher Kontrast**: Stets auf WCAG-AA-konformen Kontrast für Text und Buttons achten (keine zu hellen Grautöne auf weiß/hellen Hintergründen). Siehe ausführlich Abschnitt 9.
- **1-Klick-Registrierung**: Immer beide Social-Login-Anbieter und E-Mail transparent benennen: *„Über Google, Meta (Facebook) oder E-Mail – garantiert 0 € und kein Abo“*.

## 6. MAGIC LINK EXPRESS-KAUF & KAUFOPTIONEN
- Auf allen Produkt-, Audio-, Hörproben- und Hörbuch-Detailseiten (`AudioSessionPage`, `AudiobookPage`, `SoundSamplesLanding`) muss der Magic Link Express-Kauf einheitlich integriert sein:
  1. **Hero/Badge-Bereich**: Neben dem Preis-Badge (`Einmalig 1,99 € • Kein Abo`) befindet sich der Button `[🔑 Express-Kauf mit Magic Link (1,99 €)]`, der direkt zum Ruhe-Shop (`/ruhe-shop#product-...`) führt.
  2. **Für Gäste (`!user`)**: Transparente Zwei-Wege-Wahl im Freischaltbereich:
     - **Option 1: Express-Kauf mit Magic Link**: Ohne Passwort, ohne Registrierung, sofortige Freischaltung im Web-Player + Magic Link per E-Mail für alle weiteren Endgeräte.
     - **Option 2: Kostenloses Hörer-Konto (0 €)**: 1-Klick-Registrierung über Google, Meta (Facebook) oder E-Mail.
  3. **Für eingeloggte Nutzer (`user`)**: Kompakter Hinweis über den Express-Kauf mit Magic Link (sofortige Freischaltung im bestehenden Mediathek-Konto + E-Mail-Zugangslink für weitere Endgeräte).

## 7. BUILD-PROZESS: WEB VS. MOBILE APPS (STRIKTE TRENNUNG)
- **Webseite**: Der Web-Build (`npm run build`) für das statische Web-Deployment auf Hostinger (`dist/`) ist in Ordnung und erwünscht, damit die Webseite live aktuell bleibt.
- **Mobile Apps (iOS & Android) – REIN MANUELL**:
  - In Xcode Cloud (App Store Connect) ist die automatische Startbedingung („Zweigänderungen“) deaktiviert.
  - Builds für iOS (TestFlight / App Store) werden **ausschließlich manuell vom User in App Store Connect** („Build starten“) oder lokal in Xcode ausgelöst.
  - Führe **NIEMALS automatisch Capacitor-Syncs (`npx cap sync`, `npx cap copy`) oder native App-Builds** für iOS oder Android aus!
  - Web-Änderungen dürfen die native App-Codebasis (`ios/` und `android/`) nicht ungefragt überschreiben oder anstoßen.
- **Neue Seite für Google** → in `public/sitemap.xml` eintragen.
- **Neue Top-Level-Route in `src/index.tsx`** → zusätzlich in `public/.htaccess` eintragen.
- **Live läuft kein Node-/Express-Server** (Hostinger liefert das statische Frontend aus). Weiterleitungen gehören in die `.htaccess`, nicht in `server.ts`.

## 8. SCHREIBSTIL- UND TYPOGRAFIE-RICHTLINIE (FLOW DER STILLE)
- **Kaufmanns-Und (&) durch „und“ ersetzen**:
  - Niemals das kaufmännische Und-Zeichen (`&` bzw. `&amp;`) in sichtbaren Texten, Überschriften, Badges oder Meta-Feldern verwenden.
  - Immer das deutsche Wort **„und“** ausschreiben (z. B. `Meditation und Achtsamkeit`, `Selbsthypnose und Tiefenentspannung`, `Wissen und Praxis`).
  - Dadurch werden wichtige **SEO-Keywords** natürlicher von Suchmaschinen gewertet und der Lesefluss bleibt ruhig und hochwertig.
- **Verbot von KI-Gedankenstrichen**:
  - Keine langen Striche mitten im Satz: Verwende weder Halbgeviertstriche (`–`) noch Geviertstriche (`—`) als Satzeinschübe.
  - Satzstruktur statt Einschub: Gedanken mit Punkt oder Komma trennen.
  - Bindestriche nur wo nötig: Ausschließlich reguläres Trennzeichen (`-`), sparsam und ohne Leerzeichen davor oder danach.
- **Strukturierung & visuelle Trennung**:
  - Kurze Angaben in Meta-Daten oder Kopfzeilen trennen mit schlichtem senkrechtem Strich (`|`) oder Punkt (`·`) statt Gedankenstrichen (z. B. `12 Minuten | Geführte Meditation` oder `Achtsamkeit · Kostenfrei`).
- **Satzbau & Lesbarkeit**:
  - Punkt vor Schachtelsatz. Echte Kommasetzung. Fließender, ruhiger Atemrhythmus beim Lesen.
- **Tonalität & Wortwahl**:
  - Einladung statt Druck: Formulierungen wie „Wenn du magst“, „Du kannst“ oder „Einladung zu“ bevorzugen. Keine Aufforderungen im Befehlston.
  - Keine leeren Phrasen: Begriffe wie „Tauche ein“, „Hektischer Alltag“, „Transformativ“ oder „Reise zu dir selbst“ konsequent vermeiden.
  - Klare deutsche Worte: Zusammengesetzte Wörter nach Möglichkeit zusammenschreiben.

## 9. KONTRAST- UND BARRIEREFREIHEITS-RICHTLINIE (WCAG-AA)
- **Hoher Kontrast als Kernprinzip**:
  - Alle Überschriften (H1, H2, H3), Fließtexte, Buttons und Badges müssen gestochen scharfen Kontrast bieten und WCAG-AA-konform sein.
  - Überschriften werden in sattem Schwarz / Anthrazit (`text-stone-950` bzw. `#0C0A09` / `#1C1917`) formatiert, niemals in verwaschenen Farben.
  - Fließtexte und Beschreibungen nutzen klares, sattes Dunkelstein (`text-stone-700` bis `text-stone-800`), niemals zu helle Grautöne auf weißem oder beigem Grund.
- **Strikte Vermeidung der Dark-Mode-Invertierungsfalle (`dark:`-Klassen)**:
  - Da das Farbkonzept von Flow der Stille auf warmen, hellen Farbtönen beruht (Hintergrund `#F5F5F0`, Kartenhintergrund `#FFFFFF`), dürfen keine unüberlegten Tailwind `dark:`-Textklassen wie `dark:text-white`, `dark:text-stone-100` oder `dark:text-emerald-300` verwendet werden, wenn der Hintergrund der Komponente hell bleibt.
  - Hintergrund: Betriebssysteme oder Browser im Dark Mode wenden `dark:` automatisch an. Fehlt der entsprechende dunkle Container-Hintergrund, führt dies zu weißer Schrift auf weißem Grund (Text wird komplett unsichtbar).
  - Regel: `dark:text-...` ist NUR erlaubt, wenn der umgebende Container explizit eine dunkle Hintergrundklasse wie `dark:bg-stone-900` besitzt.
- **Akzentfarben & Highlights prüfen**:
  - Auf hellen Karten (z. B. gelblich/beige Bernstein-Boxen wie der Express-Gastkauf) dürfen keine weißen oder hellgelben Texte liegen. Überschriften und Anleitungen dort immer in `text-stone-950 font-bold`.
  - Helle Salbeitöne (z. B. `#8A9A8A`) dürfen nur als dezente Schmuckelemente oder Hintergründe dienen, niemals für kleine Textzahlen oder Untertitel auf hellem Grund (dafür immer dunkle Grüntöne wie `#344034` / `text-emerald-900` oder `text-stone-800` nutzen).
