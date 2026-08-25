#!/bin/zsh
set -euxo pipefail

# Xcode Cloud clones the repo without node_modules (gitignored), but
# ios/App/CapApp-SPM/Package.swift declares a local SPM dependency on
# node_modules/@capacitor-community/sqlite. Install deps and build the
# Capacitor web bundle here, before Xcode resolves packages, so that path
# exists. Xcode Cloud runs this script from its own directory
# (ios/App/ci_scripts), so derive the repo root from that instead of
# relying on a specific CI env var name.
cd "$(dirname "$0")/../../.."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found, installing via Homebrew"
  brew install node
fi

node --version
npm --version

npm ci
npm run build:capacitor
npx cap sync ios
