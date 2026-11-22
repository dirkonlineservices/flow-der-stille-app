#!/bin/sh
# =============================================================================
# FLOW DER STILLE – Android-Release (.aab) bauen – macOS / Linux
# -----------------------------------------------------------------------------
# Gleicher Ablauf wie scripts/android-release.ps1 (Windows).
# Voraussetzungen: Node.js 22+, Git, Android Studio, Keystore-Datei und
# android/key.properties (storeFile, storePassword, keyAlias, keyPassword).
#
# Aufruf im Projektordner:  sh scripts/android-release.sh
# =============================================================================
set -e
cd "$(dirname "$0")/.."

echo ">>> 1/6 Aktuellen Stand holen (git pull origin main)"
git pull origin main

if [ ! -f android/key.properties ]; then
  echo "FEHLT: android/key.properties (Keystore-Pfad und Passwoerter). Ohne die Datei wird nicht signiert."
  exit 1
fi

echo ">>> 2/6 Abhaengigkeiten installieren"
npm install --legacy-peer-deps --ignore-scripts

echo ">>> 3/6 Web-App bauen"
npm run build

echo ">>> 4/6 Web-App ins Android-Projekt kopieren"
npx cap sync android

echo ">>> 5/6 Java aus Android Studio verwenden"
if [ -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]; then
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
fi
echo "JAVA_HOME = ${JAVA_HOME:-nicht gesetzt}"

echo ">>> 6/6 Signiertes App Bundle bauen"
(cd android && sh ./gradlew bundleRelease)

AAB=android/app/build/outputs/bundle/release/app-release.aab
VERSION=$(sed -n 's/.*versionName "\(.*\)".*/\1/p' android/app/build.gradle)
CODE=$(sed -n 's/.*versionCode \([0-9]*\).*/\1/p' android/app/build.gradle)
TARGET=android/app/build/outputs/bundle/release/flow-der-stille-$VERSION-$CODE.aab
cp "$AAB" "$TARGET"
echo ""
echo "FERTIG: $TARGET"
echo "Diese Datei in der Google Play Console als neues Release hochladen."
