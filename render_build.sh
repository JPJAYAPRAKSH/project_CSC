#!/usr/bin/env bash
# exit on error
set -o errexit

# Build Frontend
cd frontend
npm install
npm run build
cd ..

# Build Backend
pip install -r backend/requirements.txt # Ensure using backend/requirements.txt or just requirements.txt if synced

python backend/manage.py collectstatic --no-input
python backend/manage.py migrate
