# Flow der Stille – Projektregeln & Richtlinien

## 0. SICHERHEITSBLOCK: GERÄTE-SYNCHRONISATION (MAC <-> WINDOWS)
> ### 🔒 AKTUELLER SYNCHRONISATIONS-STATUS
> - **Zuletzt bearbeiteter Rechner**: 🍏 Apple Mac (MacBook)
> - **Letzter Stand**: 17.10.2026, 13:18 Uhr (SEO-Vorrendern live, Konto-Löschen, Kauf-Speicherung PayPal/Google repariert, Telegram-Alerts repariert)
> - **Branch**: `main`
> - **Status**: 🚀 Meilenstein erreicht! TestFlight Build 1.0 (6) ist live und verarbeitet („Im Test • Läuft in 90 Tagen ab“). Xcode Cloud CI/CD baut und deployt vollautomatisch aus GitHub. „Sign in with Apple“ voll integriert. Erstes In-App-Kauf Produkt vorbereitet.
>
> ### 📦 ZULETZT ERFOLGREICH UMGESETZT (STAND: 11.10.2026, 10:40 UHR):
> 1. **TestFlight Release 1.0 (6) Live**:
>    - Build 1.0 (6) erfolgreich in Apple TestFlight veröffentlicht.
>    - Interne Testgruppe „Dirk Test“ mit Dirk Schmetzer angelegt und verknüpft.
>    - Export Compliance gelöst und mit `<key>ITSAppUsesNonExemptEncryption</key><false/>` in `Info.plist` für künftige Builds automatisiert.
> 2. **Vollautomatisches Xcode Cloud CI/CD**:
>    - Xcode Cloud mit GitHub verbunden.
>    - `ci_scripts/ci_post_clone.sh` optimiert: Node 22+ via Homebrew, `npm install --legacy-peer-deps --ignore-scripts` (keine Server-C++-Kompilierung von better-sqlite3 nötig), automatischer Vite Web-Build und Capacitor iOS Sync.
>    - Workflow auf „Archivieren (TestFlight)“ umgestellt.
> 3. **"Sign in with Apple" Vollintegration**:
>    - Live verifiziert (HTTP 302 Redirect zu Apple ID Servern).
>    - `App.entitlements` mit `com.apple.developer.applesignin` eingebunden.
> 4. **App Store Connect Voll-Setup**:
>    - App `Flow der Stille` (`app.flowderstille.de`, Apple ID `6821544372`) eingerichtet.
>    - Altersfreigabe auf 9+ (Wellness/Gesundheit) festgelegt.
>    - Preise auf Kostenlos (0 €) mit In-App-Käufen eingestellt.
>    - App-Datenschutz vollständig veröffentlicht.
> 5. **In-App-Käufe (Ruhe-Shop)**:
>    - Erstes Produkt `fds_selbsthypnose_selbstbewusstsein` vorbereitet (Typ: Nicht-verbrauchsartikel, 1,99 €).
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
- **Hoher Kontrast**: Stets auf WCAG-AA-konformen Kontrast für Text und Buttons achten (keine zu hellen Grautöne auf weiß/hellen Hintergründen).
- **1-Klick-Registrierung**: Immer beide Social-Login-Anbieter und E-Mail transparent benennen: *„Über Google, Meta (Facebook) oder E-Mail – garantiert 0 € und kein Abo“*.

## 6. MAGIC LINK EXPRESS-KAUF & KAUFOPTIONEN
- Auf allen Produkt-, Audio-, Hörproben- und Hörbuch-Detailseiten (`AudioSessionPage`, `AudiobookPage`, `SoundSamplesLanding`) muss der Magic Link Express-Kauf einheitlich integriert sein:
  1. **Hero/Badge-Bereich**: Neben dem Preis-Badge (`Einmalig 1,99 € • Kein Abo`) befindet sich der Button `[🔑 Express-Kauf mit Magic Link (1,99 €)]`, der direkt zum Ruhe-Shop (`/ruhe-shop#product-...`) führt.
  2. **Für Gäste (`!user`)**: Transparente Zwei-Wege-Wahl im Freischaltbereich:
     - **Option 1: Express-Kauf mit Magic Link**: Ohne Passwort, ohne Registrierung, sofortige Freischaltung im Web-Player + Magic Link per E-Mail für alle weiteren Endgeräte.
     - **Option 2: Kostenloses Hörer-Konto (0 €)**: 1-Klick-Registrierung über Google, Meta (Facebook) oder E-Mail.
  3. **Für eingeloggte Nutzer (`user`)**: Kompakter Hinweis über den Express-Kauf mit Magic Link (sofortige Freischaltung im bestehenden Mediathek-Konto + E-Mail-Zugangslink für weitere Endgeräte).

## 7. SEO: BUILD MIT VORRENDERN & SERVER-REGELN
- **Web-Build immer mit `npm run build:web`** (= `npm run build` + `scripts/prerender.mjs`). Das Skript rendert jede Adresse aus `public/sitemap.xml` mit dem lokalen Chrome vor, legt das fertige HTML in `public/prerender/` ab und trägt pro Seite eine Regel in `public/.htaccess` ein. **Ergebnis immer mitcommitten** – Hostinger baut nach jedem Push selbst neu (`npm run build`) und übernimmt nur, was in `public/` liegt. Ohne diesen Schritt sieht Google wieder nur eine leere Seite.
  - Nach Text-/Layout-Änderungen an Seiten aus der Sitemap neu vorrendern, sonst zeigt Google den alten Stand (Nutzer sehen immer den aktuellen).
  - Auf dem Mac läuft es am zuverlässigsten mit `caffeinate -dimsu npm run build:web` (sonst friert der Ruhezustand den Chrome-Lauf ein).
  - Kein Chrome gefunden? `CHROME_PATH` setzen.
- **Neue Seite für Google** → in `public/sitemap.xml` eintragen (wird automatisch vorgerendert).
- **Neue Top-Level-Route in `src/index.tsx`** → zusätzlich in `public/.htaccess` (Schritt 4, Routen-Liste) eintragen. Unbekannte Pfade antworten bewusst mit echtem 404-Status (verhindert „Soft 404“ in der Search Console).
- **Alias-/Alt-Adressen** werden in `public/.htaccess` (Schritt 1) per 301 auf die kanonische Adresse umgeleitet. Interne Links immer auf die kanonische Adresse setzen (`/uebungen`, `/hoerproben`, `/ruhe-shop`, `/kontakt` …), nie auf Aliase.
- **Live läuft kein Node-/Express-Server** (Hostinger baut per `npm run build` und liefert nur das statische `dist/` aus). Weiterleitungen gehören daher in die `.htaccess`, nicht in `server.ts`.
