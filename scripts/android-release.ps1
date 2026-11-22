# =============================================================================
# FLOW DER STILLE – Android-Release (.aab) bauen – Windows / PowerShell
# -----------------------------------------------------------------------------
# Baut das signierte App Bundle für Google Play aus dem aktuellen Stand von main.
#
# Voraussetzungen (einmalig):
#   - Node.js 22 oder neuer, Git, Android Studio (bringt Java und das SDK mit)
#   - Keystore-Datei (.jks) auf diesem Rechner
#   - android\key.properties mit den Zugangsdaten (nie ins Git, ist ignoriert):
#       storeFile=C:/Pfad/zu/deinem/keystore.jks
#       storePassword=...
#       keyAlias=...
#       keyPassword=...
#
# Aufruf im Projektordner (PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts\android-release.ps1
# =============================================================================
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host ">>> 1/6 Aktuellen Stand holen (git pull origin main)"
git pull origin main

if (-not (Test-Path "android\key.properties")) {
    Write-Host ""
    Write-Host "FEHLT: android\key.properties (Keystore-Pfad und Passwoerter)." -ForegroundColor Red
    Write-Host "Vorlage steht oben in diesem Skript. Ohne die Datei wird das Bundle nicht signiert."
    exit 1
}

Write-Host ">>> 2/6 Abhaengigkeiten installieren (npm install)"
npm install --legacy-peer-deps --ignore-scripts

Write-Host ">>> 3/6 Web-App bauen (npm run build)"
npm run build

Write-Host ">>> 4/6 Web-App ins Android-Projekt kopieren (npx cap sync android)"
npx cap sync android

Write-Host ">>> 5/6 Java aus Android Studio verwenden"
$jbr = @(
    "$env:ProgramFiles\Android\Android Studio\jbr",
    "$env:LOCALAPPDATA\Programs\Android Studio\jbr"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($jbr) { $env:JAVA_HOME = $jbr; Write-Host "JAVA_HOME = $jbr" }
elseif (-not $env:JAVA_HOME) { Write-Host "Java nicht gefunden. Bitte JAVA_HOME setzen." -ForegroundColor Red; exit 1 }

Write-Host ">>> 6/6 Signiertes App Bundle bauen (gradlew bundleRelease)"
Push-Location android
.\gradlew.bat bundleRelease
Pop-Location

$aab = "android\app\build\outputs\bundle\release\app-release.aab"
if (Test-Path $aab) {
    $version = (Select-String -Path "android\app\build.gradle" -Pattern 'versionName "(.+)"').Matches[0].Groups[1].Value
    $code = (Select-String -Path "android\app\build.gradle" -Pattern 'versionCode (\d+)').Matches[0].Groups[1].Value
    $target = "android\app\build\outputs\bundle\release\flow-der-stille-$version-$code.aab"
    Copy-Item $aab $target -Force
    Write-Host ""
    Write-Host "FERTIG: $target" -ForegroundColor Green
    Write-Host "Diese Datei in der Google Play Console als neues Release hochladen."
} else {
    Write-Host "Kein Bundle gefunden. Bitte die Ausgabe oben pruefen." -ForegroundColor Red
    exit 1
}
