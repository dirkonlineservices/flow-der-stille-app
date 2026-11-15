# Android Release Workflow – Flow der Stille (Antigravity Guide)

Dieses Dokument beschreibt den exakten Ablauf, um für **Flow der Stille** ein neues Android-Release (App Bundle `.aab` für den Google Play Store) zu erstellen – sowohl manuell über Android Studio als auch automatisiert über Antigravity CLI.

---

## ⚠️ Die wichtigste Regel: Der Keystore (Upload-Key)

> [!WARNING]
> **NIEMALS einen neuen Keystore erzeugen!**  
> Google Play akzeptiert Updates für eine bestehende App **ausschließlich mit demselben Signaturschlüssel**, mit dem Version 1.0 signiert wurde. Wird ein neuer Key erstellt, schlägt der Upload in der Play Console fehl.

- **Bisheriger Speicherort:** Dein Release-Keystore liegt auf deinem **Windows-PC** (Dateiendung `.jks` oder `.keystore`, z. B. `flow-der-stille.jks`, `upload-key.jks` o. ä.).
- **Übertragung auf den Mac:**
  1. Kopiere deine `.jks`-Datei vom Windows-PC auf den Mac (z. B. nach `~/android-keystore/flow-der-stille.jks`).
  2. **Wichtig:** Diese Datei darf **niemals in Git committed werden** (liegt außerhalb des Repos oder ist durch `.gitignore` geschützt).

---

## 🚀 Der Release-Ablauf in 4 Schritten

### Schritt 1: Web-Code kompilieren & in Android einbinden
In Antigravity (Terminal im Projekt `flow-der-stille-app`):
```bash
npm run build
npx cap sync android
```
*Was passiert:* Vite baut die neuesten Web-Assets (inkl. aller Komponenten, Bilder und Fixes wie dem Weltenbaum-Cover und der 2 Std. 59 Min. Laufzeit) und kopiert sie direkt in `android/app/src/main/assets/public/`.

---

### Schritt 2: Versionsnummer für Google Play erhöhen
Vor jedem Upload in die Google Play Console **muss** der `versionCode` in der Datei `android/app/build.gradle` um 1 erhöht werden:

```groovy
// android/app/build.gradle (Zeile ~13)
defaultConfig {
    applicationId "app.flowderstille.de"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    
    versionCode 106        // <-- HIER: Jedes Release +1 (z.B. von 105 auf 106)
    versionName "5.3.7"    // <-- Optionale sichtbare Version
```

*Antigravity-Befehl zum Prüfen / Setzen:*
Du kannst Antigravity einfach sagen: *„Erhöhe den versionCode in build.gradle für das nächste Release.“*

---

### Schritt 3: Signed App Bundle (.aab) erzeugen

Es gibt zwei Wege:

#### Weg A: Über Android Studio (GUI – empfohlen für den Anfang)
1. Android Studio öffnen (`/Applications/Android Studio.app`).
2. Projekt öffnen: Ordner `flow-der-stille-app/android`.
3. Menüleiste: **Build $\rightarrow$ Generate Signed Bundle / APK...**
4. **Android App Bundle (.aab)** auswählen $\rightarrow$ *Next*.
5. Bei **Key store path**: Auf **Choose existing...** klicken und deine vom Windows-PC übertragene `.jks`-Datei auswählen.
6. Keystore-Passwort, Key-Alias und Key-Passwort eingeben $\rightarrow$ *Next*.
7. Destination Folder wählen, Build-Variante **release** anhaken $\rightarrow$ *Create*.
8. Fertig! Android Studio meldet: *„App bundle(s) generated successfully“*.

#### Weg B: Vollautomatisch über Antigravity CLI (ohne GUI)
Sobald du einmalig eine Datei `android/key.properties` angelegt hast:
```properties
storePassword=DEIN_KEYSTORE_PASSWORT
keyPassword=DEIN_KEY_PASSWORT
keyAlias=DEIN_KEY_ALIAS
storeFile=/Users/dirkrianthis/android-keystore/flow-der-stille.jks
```
Kann Antigravity den Build künftig mit einem einzigen Befehl bauen:
```bash
cd android && ./gradlew bundleRelease
```
Das fertige Bundle liegt dann automatisch unter:  
`android/app/build/outputs/bundle/release/app-release.aab`

---

### Schritt 4: In der Google Play Console hochladen
1. Browser öffnen: [Google Play Console](https://play.google.com/console)
2. App **Flow der Stille** auswählen.
3. Links im Menü auf **Produktion** (oder *Geschlossener Test* / *Interner Test*) $\rightarrow$ **Neuen Release erstellen**.
4. Die erzeugte `.aab`-Datei (`app-release.aab`) per Drag & Drop hochladen.
5. Versionshinweise eingeben (z. B. *„Optimierung der Hörbuch-Vorschau und Laufzeitanzeige für die Rauhnächte“*).
6. Auf **Release prüfen und veröffentlichen** klicken.

---

## 📋 Antigravity-Prompt zum Wiederverwenden

Wenn du beim nächsten Mal Antigravity bitten möchtest, das Release vorzubereiten, kannst du folgenden Prompt verwenden:

```text
Bereite bitte das nächste Android-Release für Flow der Stille vor:
1. Erhöhe den versionCode in android/app/build.gradle um 1.
2. Führe npm run build und npx cap sync android aus.
3. Zeige mir den Pfad an, wo ich das fertige Projekt in Android Studio öffnen oder bauen kann.
```
