@echo off
echo Starting Golden Horse Shipping Backend...
echo Environment: SHIPSGO_FALLBACK_TO_MOCK=false
set SHIPSGO_FALLBACK_TO_MOCK=false
set SHIPSGO_API_URL=https://shipsgo.com/api/v1.1
set SHIPSGO_API_KEY=b0fa5419120c2c74847084a67d1b03be
node dist/main.js
