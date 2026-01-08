#!/bin/bash

# Build script for Support Marketing Agent WordPress Plugin

PLUGIN_SLUG="support-marketing-agent"
BUILD_DIR="build"
SOURCE_DIR="support-marketing-agent"
ZIP_NAME="$PLUGIN_SLUG.zip"

echo "🏗️  Building $PLUGIN_SLUG..."

# 1. Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf "wordpress-plugin/$BUILD_DIR"
mkdir -p "wordpress-plugin/$BUILD_DIR"

# 2. Copy files to a temporary staging area
echo "📂 Copying files..."
mkdir -p "wordpress-plugin/$BUILD_DIR/$PLUGIN_SLUG"
cp -r "wordpress-plugin/$SOURCE_DIR/"* "wordpress-plugin/$BUILD_DIR/$PLUGIN_SLUG/"

# 3. Remove development files (if any)
# (e.g., .git, .DS_Store, tests, etc.)
echo "🗑️  Removing dev files..."
find "wordpress-plugin/$BUILD_DIR/$PLUGIN_SLUG" -name ".DS_Store" -delete
find "wordpress-plugin/$BUILD_DIR/$PLUGIN_SLUG" -name ".git*" -exec rm -rf {} +
find "wordpress-plugin/$BUILD_DIR/$PLUGIN_SLUG" -name "*.log" -delete

# 4. Zip the folder
echo "📦 Zipping..."
cd "wordpress-plugin/$BUILD_DIR"
zip -r "$ZIP_NAME" "$PLUGIN_SLUG"

# 5. Copy to Root
echo "🚚 Copying artifact to repository root..."
cp "$ZIP_NAME" ../../"$ZIP_NAME"

echo "✅ Build complete!"
echo "  - Build Artifact: wordpress-plugin/$BUILD_DIR/$ZIP_NAME"
echo "  - Root Artifact:  $ZIP_NAME"
