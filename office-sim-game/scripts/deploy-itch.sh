#!/usr/bin/env bash
# scripts/deploy-itch.sh
# Automated HTML5 build and Butler deployment script for itch.io
# Usage: ./scripts/deploy-itch.sh [ITCH_USER] [ITCH_GAME] [VERSION]

set -e

ITCH_USER="${1:-triana}"
ITCH_GAME="${2:-sprint-cero-devlife-rpg}"
VERSION="${3:-1.0.0}"
TARGET_CHANNEL="html5"

echo "===================================================="
echo " Packaging & Deploying to Itch.io via Butler"
echo " User: $ITCH_USER | Game: $ITCH_GAME | Version: $VERSION"
echo "===================================================="

# 1. Clean build
echo "--> Compiling TypeScript and bundling Vite..."
npm run build

# 2. Check if butler CLI is installed
if ! command -v butler &> /dev/null; then
    echo "⚠️ Butler CLI not found in PATH."
    echo "To publish, install Butler (https://itch.io/docs/butler/) or run:"
    echo "  butler push ./dist ${ITCH_USER}/${ITCH_GAME}:${TARGET_CHANNEL} --userversion ${VERSION}"
    exit 0
fi

# 3. Butler Push
echo "--> Uploading ./dist to itch.io (${TARGET_CHANNEL})..."
butler push ./dist "${ITCH_USER}/${ITCH_GAME}:${TARGET_CHANNEL}" --userversion "${VERSION}"

echo "✅ Deployment completed successfully! Check your game at: https://${ITCH_USER}.itch.io/${ITCH_GAME}"
