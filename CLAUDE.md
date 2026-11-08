# Flow der Stille – Projektregeln & Richtlinien für Claude

## 0. AKTUELLER PROJEKT- & LAUNCH-STATUS (STAND: 08.11.2026)
> ### 🚀 LIVE-STATUS: MEILENSTEIN ERREICHT!
> - **App Store Status**: **Version 1.0 ist OFFIZIELL GENEHMIGT & LIVE IM APPLE APP STORE!**
>   - **Live-URL**: https://apps.apple.com/us/app/flow-der-stille-selbsthypnose/id6821544372
>   - **App Apple-ID**: `6821544372`
>   - **Bundle-ID**: `app.flowderstille.de`
> - **Aktuelles Update (Version 1.0.1, Build 28)**:
>   - Befindet sich in der **Apple-Prüfung (Warten auf Prüfung)**.
>   - Enthält das neue maßgeschneiderte Marken-AppIcon (warmer Beige-Hintergrund `#F5F5F0` & Salbeigrün-Linien).
>   - Enthält serverseitige Kaufprüfung über Apple App Store Server API (`verify-apple-purchase`), natives StoreKit „Käufe wiederherstellen“ und DSGVO „Konto löschen“.
> - **Xcode Cloud**: Automatische Startbedingung („Zweigänderungen“) in App Store Connect wurde **erfolgreich entfernt**. Pushes auf GitHub (`main`) lösen **keine automatischen Fehl-Builds** mehr aus! Builds werden ausschließlich manuell vom User im Web gestartet.
> - **Typografie & SEO**: Vollständige Bereinigung aller sichtbaren `&` und `&amp;` durch das ausgeschriebene deutsche Wort **„und“** abgeschlossen. Wichtige SEO-Keywords werden gestärkt.
> - **Geschäftliches & Verträge**:
>   - Bankkonto für Auszahlungen (EUR / USD) aktiv.
>   - Vertrag für gebührenpflichtige Apps aktiv.
>   - US-Steuerformulare (Form W-8BEN & Foreign Status) vollständig übermittelt & aktiv (0 % US-Quellensteuer gem. Doppelbesteuerungsabkommen).
> - **EU-DSA-Händlerverifizierung übermittelt.**
> - **🎄 24-Tage Adventskalender („24 Tage Innehalten“)**:
>   - Komplett überarbeitet: Traditionelles 24-Türchen-Raster ohne inhaltliche Vorschau im geschlossenen Zustand.
>   - Zeitbasierte Sperre (öffnet sich erst am jeweiligen Tag im Dezember oder rückwirkend; freundlicher Hinweis für zukünftige Tage; Admin-Testschalter zum Testen aller Tage).
>   - Resend E-Mail-Erinnerung (`AdventEmailReminder`) mit DSGVO-konformem Double-Opt-In für morgendliche Benachrichtigungen.
>   - Plattformweiche für iOS/Android App im Pop-Up (`AdventskalenderPromo` leitet App-Nutzer sauber mit „Im Browser öffnen“ auf die mobile Webansicht).
>   - Aktuell geschützt im internen Admin-Vorschaumodus.
> - **Branch**: `main` (immer up to date mit `origin/main`).

---

## 1. RECHTLICHE TERMINOLOGIE: AUSSCHLIESSLICH "SELBSTHYPNOSE"
- **STRIKTE PFLICHT**: Es darf überall (Webseite, App, Shop, Metadaten, FAQ, Produktbeschreibungen, SEO, Social Media) **NUR "Selbsthypnose" bzw. "Selbsthypnosen"** heißen.
- **ABSOLUTES VERBOT**: Niemals das Wort "Hypnose" oder "Hypnosen" isoliert verwenden.
- **Rechtlicher Hintergrund**: Flow der Stille bietet **keine** therapeutischen oder medizinischen Hypnosen an, sondern ausschließlich geführte Selbsthypnosen zur Eigenanwendung zur mentalen Entspannung, Schlaf- und Stressreduktion für gesunde Menschen.

## 2. AUDIO-NUTZUNG: REINES STREAMING (KEIN MP3-DOWNLOAD)
- Sämtliche Produkte werden ausschließlich zum **Streaming im Web-Player oder in den nativen Apps (iOS & Android)** angeboten.
- Nahtlose Hintergrund-Wiedergabe bei gesperrtem Bildschirm (Lockscreen-Controls).
- Niemals von "MP3-Download", "Download auf die Festplatte" oder "Offline-Download als MP3" sprechen.

## 3. KEIN SLEEPTIMER
- Die App und der Web-Player besitzen keinen Sleeptimer (Schlaf-Timer). Dies niemals bewerben oder implementieren.

## 4. RUHE-SHOP STATT "PREMIUM" / KEIN ABO
- Die frühere Bezeichnung "Premium" wurde durch **"Ruhe-Shop"** ersetzt.
- **Faires Modell**: Einmalkäufe ab 1,99 €, kein Abonnement, keine versteckten Kosten.
- Die App selbst ist kostenlos (0 €) mit sofort nutzbaren Vollversionen (Herzöffnung, Tiefer Schlaf, Atemübung, PMR).

## 5. PRODUKTKATALOG & MAPPING (11 IN-APP-KÄUFE)
Alle Store-IDs sind 1:1 identisch zwischen iOS App Store, Google Play und Supabase-Datenbank (`billing.ts`):
1. `fds_selbsthypnose_selbstbewusstsein` (1,99 €) – Mehr Selbstbewusstsein und Inneres Vertrauen
2. `fds_selbsthypnose_fokus_absolute_konzentration` (1,99 €) – Fokus und Absolute Konzentration
3. `fds_selbsthypnose_gesunde_ernaehrung` (1,99 €) – Gesunde Ernährung und Aktiver Lebensstil
4. `fds_meditation_innere_ruhe` (1,99 €) – Meditation Innere Ruhe
5. `fds_meditation_inneres_kind` (1,99 €) – Meditation Inneres Kind
6. `fds_herzkompass_meditation` (1,99 €) – Meditation Herzkompass
7. `fds_meditation_loslassen` (1,99 €) – Meditation Loslassen
8. `fds_schmetterling` (4,99 €) – Hörbuch: Der Tag, an dem der Schmetterling erwachte (Teil 1)
9. `fds_seele_wind` (4,99 €) – Hörbuch: Wo die Seele den Wind berührt (Teil 2)
10. `fds_mensch_sein` (4,99 €) – Hörbuch: Mut zum Echtsein
11. `fds_rauhnaechte` (9,99 €) – Meditationszyklus: Yggdrasils Atem | 12 Rauhnächte auf der Schwelle (13 Seelenreisen)

## 6. MAGIC LINK EXPRESS-KAUF & KAUFOPTIONEN
- Auf allen Produkt-, Audio-, Hörproben- und Hörbuch-Detailseiten (`AudioSessionPage`, `AudiobookPage`, `SoundSamplesLanding`) ist der Magic Link Express-Kauf einheitlich integriert:
  1. **Hero/Badge-Bereich**: Neben dem Preis-Badge (`Einmalig 1,99 € • Kein Abo`) befindet sich der Button `[🔑 Express-Kauf mit Magic Link (1,99 €)]`, der direkt zum Ruhe-Shop (`/ruhe-shop#product-...`) führt.
  2. **Für Gäste (`!user`)**: Transparente Zwei-Wege-Wahl im Freischaltbereich:
     - **Option 1: Express-Kauf mit Magic Link**: Ohne Passwort, ohne Registrierung, sofortige Freischaltung im Web-Player + Magic Link per E-Mail für alle weiteren Endgeräte.
     - **Option 2: Kostenloses Hörer-Konto (0 €)**: 1-Klick-Registrierung über Google, Apple, Meta (Facebook) oder E-Mail.
  3. **Für eingeloggte Nutzer (`user`)**: Kompakter Hinweis über den Express-Kauf mit Magic Link (sofortige Freischaltung im bestehenden Mediathek-Konto + E-Mail-Zugangslink für weitere Endgeräte).
- **Preise & Währung**: Beträge und Euro-Zeichen müssen immer zusammenhängend formatiert sein (`&nbsp;€` und `whitespace-nowrap`), damit das Euro-Zeichen niemals umbricht.

## 7. WORKFLOW-REGELN ZUR DATENSICHERHEIT & BUILDS
1. **Bei Arbeitsbeginn**: Stets prüfen, ob der lokale Branch `main` mit `git pull origin main` aktuell ist.
2. **Web-Build**: Für die Hostinger-Webseite ist `npm run build` (`dist/`) in Ordnung, damit die Webseite live sofort funktioniert.
3. **App-Builds (iOS & Android) – REIN MANUELL**:
   - In Xcode Cloud (App Store Connect) ist die automatische Startbedingung („Zweigänderungen“) deaktiviert.
   - iOS-Builds (Xcode Cloud / TestFlight) werden **ausschließlich manuell vom User im App Store Connect** („Build starten“) oder lokal in Xcode angestoßen.
   - Führe **NIEMALS automatisch Capacitor-Syncs (`npx cap sync`, `npx cap copy`) oder native App-Builds** für iOS oder Android aus!
4. **Vor Arbeitsende**: Änderungen committen und mit `git push origin main` zu GitHub übertragen.

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

