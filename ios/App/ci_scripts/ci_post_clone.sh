#!/bin/zsh
set -euo pipefail

# Xcode Cloud clones the repo without node_modules (gitignored), but
# ios/App/CapApp-SPM/Package.swift declares a local SPM dependency on
# node_modules/@capacitor-community/sqlite. Install deps and build the
# Capacitor web bundle here, before Xcode resolves packages, so that path
# exists. $CI_WORKSPACE is the repo root, provided by Xcode Cloud.
cd "$CI_WORKSPACE"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found, installing via Homebrew"
  brew install node
fi

npm ci
npm run build:capacitor
npx cap sync ios
