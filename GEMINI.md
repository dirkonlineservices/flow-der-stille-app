# Flow der Stille – Projektregeln & Richtlinien

## 0. SICHERHEITSBLOCK: GERÄTE-SYNCHRONISATION (MAC <-> WINDOWS)
> ### 🔒 AKTUELLER SYNCHRONISATIONS-STATUS
> - **Zuletzt bearbeiteter Rechner**: 🍏 Apple Mac (MacBook)
> - **Letzter Stand**: 03.10.2026, 11:15 Uhr
> - **Branch**: `main`
> - **Status**: iOS In-App-Purchase Dynamisierung, Restore Purchases Button (Shop + Settings), Background Audio in Info.plist & AppDelegate integriert und nativer Xcode-Build erfolgreich. Vor Beginn auf dem Windows-PC muss zwingend `git pull origin main` ausgeführt werden!
>
> ### 📦 ZULETZT ERFOLGREICH UMGESETZT (STAND: 03.10.2026, 11:20 UHR):
> 1. **Sicherheitsblock & Workflow-Regeln**: Geräte-Synchronisation zwischen MacBook und Windows-PC verbindlich an oberster Stelle in `GEMINI.md` integriert.
> 2. **iOS Background Audio**: In `ios/App/App/Info.plist` den Modus `UIBackgroundModes` mit `audio` ergänzt und Sprache auf `de` gesetzt.
> 3. **iOS AppDelegate Audio-Session**: In `ios/App/App/AppDelegate.swift` `AVAudioSession` mit Kategorie `.playback` aktiviert (Audios laufen bei gesperrtem Bildschirm und Stummschaltung weiter).
> 4. **In-App-Kauf Dynamisierung**: In `src/components/PremiumDashboard.tsx` (`GooglePlayCheckoutButton`) alle Store-Texte dynamisch über `getStoreName()` (App Store / Google Play) formatiert.
> 5. **"Käufe wiederherstellen" (Restore Purchases)**:
>    - Im Ruhe-Shop (`PremiumDashboard.tsx`) Button *„Bereits gekauft? Käufe wiederherstellen“* direkt unter dem Kaufbutton integriert.
>    - In den Kontoeinstellungen (`src/pages/Settings.tsx`) eigene Karte *„In-App-Käufe wiederherstellen ({getStoreName()})“* eingebaut.
> 6. **Rechtliche Zahlungsarten**: In `src/pages/AGB.tsx` und `src/pages/Versand.tsx` Apple App Store In-App-Kauf als offizielle Zahlungsart ergänzt.
> 7. **Build & Verifikation**: Web-Build (`vite build`), Capacitor-Sync (`npx cap sync ios`) und nativer Xcode-Simulator-Build (`xcodebuild`) erfolgreich und fehlerfrei validiert (`BUILD SUCCEEDED`).
>
> ### 🎯 NÄCHSTE SCHRITTE FÜR DIE NÄCHSTE SESSION:
> 1. **„Sign in with Apple“ einrichten** (App Store Guideline 4.8):
>    - Services ID & Private Key (.p8) im Apple Developer Portal erstellen.
>    - Supabase Auth Provider für Apple konfigurieren.
>    - Xcode Capability „Sign in with Apple“ aktivieren und UI-Buttons (`QuickSocialUnlockBox.tsx`, `Login.tsx`, `Register.tsx`) integrieren.
> 2. **App Store Connect Setup**:
>    - App `app.flowderstille.de` in App Store Connect registrieren.
>    - Non-Consumable IAP-Produkte (`fds_...`) und Sandbox-Test-Nutzer anlegen.
> 3. **Test auf echtem iPhone / TestFlight**.

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
