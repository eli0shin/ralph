#!/bin/bash
set -e

REPO="eli0shin/ralph"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
BINARY_NAME="ralph"

# Detect OS and architecture
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS" in
  linux)
    OS="linux"
    ;;
  darwin)
    OS="darwin"
    ;;
  *)
    echo "Unsupported operating system: $OS"
    exit 1
    ;;
esac

case "$ARCH" in
  x86_64)
    ARCH="x64"
    ;;
  arm64|aarch64)
    ARCH="arm64"
    ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

ARTIFACT_NAME="ralph-${OS}-${ARCH}"

# Get latest release
echo "Fetching latest release..."
LATEST_RELEASE=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$LATEST_RELEASE" ]; then
  echo "Failed to fetch latest release"
  exit 1
fi

echo "Latest release: ${LATEST_RELEASE}"

# Download URL
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_RELEASE}/${ARTIFACT_NAME}"

# Create temp directory
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "${TEMP_DIR}"' EXIT

# Download binary
echo "Downloading ${ARTIFACT_NAME}..."
if ! curl -sL -o "${TEMP_DIR}/${BINARY_NAME}" "${DOWNLOAD_URL}"; then
  echo "Failed to download binary"
  exit 1
fi

# Make executable
chmod +x "${TEMP_DIR}/${BINARY_NAME}"

# Install
echo "Installing to ${INSTALL_DIR}/${BINARY_NAME}..."
if [ -w "$INSTALL_DIR" ]; then
  mv "${TEMP_DIR}/${BINARY_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
else
  sudo mv "${TEMP_DIR}/${BINARY_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
fi

echo "Successfully installed ralph to ${INSTALL_DIR}/${BINARY_NAME}"
echo "Run 'ralph --help' to get started"
