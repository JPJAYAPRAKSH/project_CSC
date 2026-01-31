#!/usr/bin/env bash
# exit on error
set -o errexit

# Store the root directory
ROOT_DIR=$(pwd)
echo "Root directory: $ROOT_DIR"

# Build Frontend
echo "Building frontend..."
cd "$ROOT_DIR/frontend"
npm install
npm run build
echo "Frontend build complete. Listing dist contents:"
ls -la dist/

# Copy frontend build to backend templates
echo "Copying index.html to backend/templates..."
mkdir -p "$ROOT_DIR/backend/templates"
cp "$ROOT_DIR/frontend/dist/index.html" "$ROOT_DIR/backend/templates/index.html"
echo "Verifying copy:"
ls -la "$ROOT_DIR/backend/templates/"

# Build Backend
echo "Installing backend dependencies..."
cd "$ROOT_DIR"
pip install -r requirements.txt

echo "Running collectstatic..."
python backend/manage.py collectstatic --no-input

echo "Running migrations..."
python backend/manage.py migrate

echo "Build complete!"
