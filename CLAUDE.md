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
1. `fds_selbsthypnose_selbstbewusstsein` (1,99 €) – Mehr Selbstbewusstsein & Inneres Vertrauen
2. `fds_selbsthypnose_fokus_absolute_konzentration` (1,99 €) – Fokus & Absolute Konzentration
3. `fds_selbsthypnose_gesunde_ernaehrung` (1,99 €) – Gesunde Ernährung & Aktiver Lebensstil
4. `fds_meditation_innere_ruhe` (1,99 €) – Meditation Innere Ruhe
5. `fds_meditation_inneres_kind` (1,99 €) – Meditation Inneres Kind
6. `fds_herzkompass_meditation` (1,99 €) – Meditation Herzkompass
7. `fds_meditation_loslassen` (1,99 €) – Meditation Loslassen
8. `fds_schmetterling` (4,99 €) – Hörbuch: Der Tag, an dem der Schmetterling erwachte (Teil 1)
9. `fds_seele_wind` (4,99 €) – Hörbuch: Wo die Seele den Wind berührt (Teil 2)
10. `fds_mensch_sein` (4,99 €) – Hörbuch: Mut zum Echtsein
11. `fds_rauhnaechte` (9,99 €) – Meditationszyklus: Yggdrasils Atem – 12 Rauhnächte auf der Schwelle (13 Seelenreisen)

## 6. WORKFLOW-REGELN ZUR DATENSICHERHEIT
1. **Bei Arbeitsbeginn**: Stets prüfen, ob der lokale Branch `main` mit `git pull origin main` aktuell ist.
2. **Vor Arbeitsende**: Änderungen committen und mit `git push origin main` zu GitHub übertragen.

