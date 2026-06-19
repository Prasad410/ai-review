#!/bin/sh
set -e

CONFIG_FILE="/usr/share/nginx/html/config.json"

API_BASE_URL="${API_BASE_URL:-https://aireview.com}"
API_RANK_PATH="${API_RANK_PATH:-/v1/rank}"
USE_MOCK_API="${USE_MOCK_API:-false}"

cat > "$CONFIG_FILE" <<EOF
{
  "apiBaseUrl": "${API_BASE_URL}",
  "apiRankPath": "${API_RANK_PATH}",
  "useMockApi": ${USE_MOCK_API}
}
EOF

exec "$@"
