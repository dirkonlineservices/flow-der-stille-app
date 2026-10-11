#!/bin/sh
set -e

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE

echo ">>> Xcode Cloud post-clone starting..."

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo ">>> Installing Node.js via Homebrew..."
    brew install node@20
    brew link --overwrite --force node@20
fi

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 2. Move to project root
# If running from ios/App/ci_scripts:
if [ -f "../../package.json" ]; then
    cd ../..
elif [ -f "package.json" ]; then
    echo "Already in root"
elif [ -f "../package.json" ]; then
    cd ..
fi

echo "Current dir: $(pwd)"

# 3. Install NPM dependencies
echo ">>> Installing npm dependencies..."
npm install --legacy-peer-deps

# 4. Build web app
echo ">>> Building web assets..."
npm run build

# 5. Sync Capacitor iOS
echo ">>> Syncing Capacitor iOS..."
npx cap sync ios

echo ">>> Xcode Cloud post-clone completed successfully!"
