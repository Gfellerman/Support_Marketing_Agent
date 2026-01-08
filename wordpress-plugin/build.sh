#!/bin/bash

# Define paths
PLUGIN_DIR="wordpress-plugin/support-marketing-agent"
BUILD_DIR="wordpress-plugin/build"
ZIP_NAME="support-marketing-agent.zip"
TARGET_FOLDER_NAME="Support Marketing Agent"

# Clean previous build
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/$TARGET_FOLDER_NAME"

# Copy files
cp -r "$PLUGIN_DIR"/* "$BUILD_DIR/$TARGET_FOLDER_NAME/"

# Zip the folder
cd "$BUILD_DIR"
zip -r "$ZIP_NAME" "$TARGET_FOLDER_NAME"

echo "Build complete: $BUILD_DIR/$ZIP_NAME"
