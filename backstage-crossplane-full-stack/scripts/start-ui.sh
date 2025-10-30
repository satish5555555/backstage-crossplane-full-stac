#!/bin/bash
set -euo pipefail
pushd ui
if [ ! -d "node_modules" ]; then
  npm install
fi
npm start &
popd
echo "UI started on http://localhost:9090"
