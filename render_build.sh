#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=== Starting Render Build ==="

# Store the root directory
ROOT_DIR=$(pwd)
echo "Root directory: $ROOT_DIR"

# Build Frontend
echo "=== Building Frontend ==="
cd "$ROOT_DIR/frontend"
npm install
npm run build
echo "Frontend build complete."
ls -la dist/

# Go back to root
cd "$ROOT_DIR"

# Install Backend Dependencies
echo "=== Installing Backend Dependencies ==="
pip install -r requirements.txt

# Run collectstatic - this copies frontend/dist/* to backend/staticfiles/
echo "=== Running collectstatic ==="
python backend/manage.py collectstatic --no-input

# IMPORTANT: Copy index.html to staticfiles AFTER collectstatic
echo "=== Copying index.html to staticfiles ==="
cp "$ROOT_DIR/frontend/dist/index.html" "$ROOT_DIR/backend/staticfiles/index.html"

# Verify the copy
echo "=== Verifying staticfiles ==="
ls -la "$ROOT_DIR/backend/staticfiles/" | head -20

# Run migrations
echo "=== Running Migrations ==="
python backend/manage.py migrate

echo "=== Build Complete ==="
