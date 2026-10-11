#!/bin/sh
set -e

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo ">>> Xcode Cloud post-clone starting..."

# 1. Install Node.js (>= 22)
if ! command -v node >/dev/null 2>&1; then
    echo ">>> Installing Node.js via Homebrew..."
    brew install node@22 || brew install node
    brew link --overwrite --force node@22 2>/dev/null || brew link --overwrite --force node 2>/dev/null || true
fi

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 2. Move to project root repository
if [ -n "$CI_PRIMARY_REPOSITORY_PATH" ]; then
    cd "$CI_PRIMARY_REPOSITORY_PATH"
elif [ -n "$CI_WORKSPACE" ]; then
    cd "$CI_WORKSPACE"
elif [ -f "../../package.json" ]; then
    cd ../..
elif [ -f "../package.json" ]; then
    cd ..
fi

echo "Current working dir: $(pwd)"

# 3. Install NPM dependencies (skip native C++ addons like better-sqlite3 with --ignore-scripts)
echo ">>> Installing npm dependencies (with --ignore-scripts)..."
npm install --legacy-peer-deps --ignore-scripts

# 4. Build web app
echo ">>> Building web assets..."
npm run build

# 5. Sync Capacitor iOS project
echo ">>> Syncing Capacitor iOS..."
npx cap sync ios

echo ">>> Xcode Cloud post-clone completed successfully!"
