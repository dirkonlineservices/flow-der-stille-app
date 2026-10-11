# Flow der Stille – Projektregeln & Richtlinien

## 0. SICHERHEITSBLOCK: GERÄTE-SYNCHRONISATION (MAC <-> WINDOWS)
> ### 🔒 AKTUELLER SYNCHRONISATIONS-STATUS
> - **Zuletzt bearbeiteter Rechner**: 🍏 Apple Mac (MacBook)
> - **Letzter Stand**: 11.10.2026, 10:20 Uhr
> - **Branch**: `main`
> - **Status**: 🚀 Meilenstein erreicht! TestFlight Build 1.0 (6) ist live, verarbeitet und steht für interne Tester bereit („Im Test • Läuft in 90 Tagen ab“). Xcode Cloud CI/CD baut und deployt vollautomatisch aus GitHub. „Sign in with Apple“ voll integriert.
>
> ### 📦 ZULETZT ERFOLGREICH UMGESETZT (STAND: 11.10.2026, 10:20 UHR):
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
>
> ### 🎯 NÄCHSTE SCHRITTE:
> 1. **TestFlight auf iPhone testen**:
>    - TestFlight-App auf beliebigem iPhone/iPad öffnen und Flow der Stille installieren & testen.
> 2. **In-App-Käufe im App Store Connect (Ruhe-Shop)**:
>    - Produkte (`fds_...`) im App Store Connect eintragen.

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
