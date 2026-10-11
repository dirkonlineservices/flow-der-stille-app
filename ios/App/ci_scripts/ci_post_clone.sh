#!/bin/sh
set -e

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo ">>> Xcode Cloud post-clone starting..."

# 1. Install Node.js if not available
if ! command -v node &> /dev/null; then
    echo ">>> Installing Node.js via Homebrew..."
    brew install node@20
    brew link --overwrite --force node@20
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

# 3. Install NPM dependencies
echo ">>> Installing npm dependencies..."
npm install --legacy-peer-deps

# 4. Build web app
echo ">>> Building web assets..."
npm run build

# 5. Sync Capacitor iOS project
echo ">>> Syncing Capacitor iOS..."
npx cap sync ios

echo ">>> Xcode Cloud post-clone completed successfully!"
