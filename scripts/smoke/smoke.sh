#!/usr/bin/env bash
# MMX smoke tests — valida produção (API Azure + Frontend Vercel) após cada deploy.
# Uso:  bash scripts/smoke/smoke.sh
# Env:  API_URL, WEB_URL (default: produção alpha)
# Exit: 0 se tudo OK, 1 se qualquer check falhar

set -uo pipefail

API_URL="${API_URL:-https://ca-mmx-api-alpha.happymushroom-aaae7c9b.eastus.azurecontainerapps.io}"
WEB_URL="${WEB_URL:-https://mmx-platform.vercel.app}"

PASSED=0
FAILED=0
RESULTS=()

# Cores (apenas se TTY)
if [[ -t 1 ]]; then
  GREEN="\033[0;32m"; RED="\033[0;31m"; YELLOW="\033[1;33m"; RESET="\033[0m"
else
  GREEN=""; RED=""; YELLOW=""; RESET=""
fi

# check NAME COMMAND...   → executa COMMAND e captura saída + exit
# Compara saída com expectativas via grep/regex/exit code.
check() {
  local name="$1"; shift
  local description="$1"; shift
  printf "  %-50s " "$name"

  if "$@" >/dev/null 2>&1; then
    printf "${GREEN}✓${RESET} %s\n" "$description"
    PASSED=$((PASSED+1))
    RESULTS+=("PASS: $name")
  else
    printf "${RED}✗${RESET} %s\n" "$description"
    FAILED=$((FAILED+1))
    RESULTS+=("FAIL: $name")
  fi
}

# Helpers de assertion
expect_status() {
  local url="$1" expected="$2"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" -L --max-redirs 0 "$url" 2>/dev/null || echo "000")
  [[ "$actual" == "$expected" ]]
}

expect_status_no_follow() {
  local url="$1" expected="$2"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  [[ "$actual" == "$expected" ]]
}

expect_post_status() {
  local url="$1" expected="$2" body="${3:-}"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" --data "$body" "$url" 2>/dev/null || echo "000")
  [[ "$actual" == "$expected" ]]
}

expect_redirect_to() {
  local url="$1" expected_host="$2"
  local location
  location=$(curl -s -o /dev/null -D - "$url" 2>/dev/null | tr -d '\r' | awk '/^[Ll]ocation:/ {print $2}')
  [[ "$location" == *"$expected_host"* ]]
}

expect_body_contains() {
  local url="$1" expected_text="$2"
  curl -s "$url" 2>/dev/null | grep -q "$expected_text"
}

expect_envelope_data_present() {
  local url="$1"
  local body
  body=$(curl -s "$url" 2>/dev/null)
  echo "$body" | grep -q '"data"' && echo "$body" | grep -qE '"error"\s*:\s*null'
}

# ======================================================================
echo
echo "================================================================"
echo "MMX Smoke Tests"
echo "  API: $API_URL"
echo "  Web: $WEB_URL"
echo "================================================================"
echo

echo "🟢 API health"
check "api.health.200"               "/health retorna 200" \
  expect_status "$API_URL/health" "200"
check "api.health.envelope"          "/health envelope {data,error:null}" \
  expect_envelope_data_present "$API_URL/health"
check "api.health.ready.200"         "/health/ready retorna 200" \
  expect_status "$API_URL/health/ready" "200"

echo
echo "🔐 API auth — endpoints públicos"
check "api.me.401"                   "/auth/me sem cookie retorna 401" \
  expect_status "$API_URL/auth/me" "401"
check "api.refresh.400"              "/auth/refresh sem token retorna 400" \
  expect_post_status "$API_URL/auth/refresh" "400" "{}"
check "api.oauth.google.302"         "/auth/oauth/google redireciona 302" \
  expect_status_no_follow "$API_URL/auth/oauth/google" "302"
check "api.oauth.google.target"      "redirect aponta para accounts.google.com" \
  expect_redirect_to "$API_URL/auth/oauth/google" "accounts.google.com"
check "api.oauth.microsoft.302"      "/auth/oauth/microsoft redireciona 302" \
  expect_status_no_follow "$API_URL/auth/oauth/microsoft" "302"
check "api.oauth.microsoft.target"   "redirect aponta para login.microsoftonline.com" \
  expect_redirect_to "$API_URL/auth/oauth/microsoft" "login.microsoftonline.com"

echo
echo "🛡️  API CORS + segurança"
check "api.cors.preflight"           "OPTIONS responde 204 com origem permitida" \
  bash -c 'curl -s -o /dev/null -w "%{http_code}" -X OPTIONS -H "Origin: '"$WEB_URL"'" -H "Access-Control-Request-Method: POST" "'"$API_URL"'/auth/login" | grep -qE "^(204|200)$"'
check "api.cors.rejects-unknown"     "Origem não permitida retorna 403" \
  bash -c 'curl -s -o /dev/null -w "%{http_code}" -H "Origin: https://evil.example.com" "'"$API_URL"'/auth/me" | grep -q "^403$"'

echo
echo "🌐 Vercel frontend"
check "web.root.200"                 "/ retorna 200" \
  expect_status "$WEB_URL/" "200"
check "web.auth.200"                 "/auth retorna 200" \
  expect_status "$WEB_URL/auth" "200"
check "web.auth.has-google"          "/auth contém botão Google" \
  expect_body_contains "$WEB_URL/auth" "Continuar com Google"
check "web.auth.has-microsoft"       "/auth contém botão Microsoft" \
  expect_body_contains "$WEB_URL/auth" "Continuar com Microsoft"
check "web.auth.no-password-form"    "/auth NÃO contém input de senha" \
  bash -c '! curl -s "'"$WEB_URL"'/auth" | grep -qE "type=\"password\"|placeholder=\"Sua senha\"|placeholder=\"Mínimo 8 caracteres\""'
check "web.auth.oauth-callback.200"  "/auth/oauth-callback retorna 200" \
  expect_status "$WEB_URL/auth/oauth-callback" "200"

echo
echo "================================================================"
TOTAL=$((PASSED + FAILED))
if [[ $FAILED -eq 0 ]]; then
  printf "${GREEN}✅ %d/%d smoke tests passaram${RESET}\n" "$PASSED" "$TOTAL"
  echo "================================================================"
  exit 0
else
  printf "${RED}❌ %d/%d falharam (%d passaram)${RESET}\n" "$FAILED" "$TOTAL" "$PASSED"
  echo
  echo "Falhas:"
  for r in "${RESULTS[@]}"; do
    [[ "$r" == FAIL:* ]] && echo "  - ${r#FAIL: }"
  done
  echo "================================================================"
  exit 1
fi
