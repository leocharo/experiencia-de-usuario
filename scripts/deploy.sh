#!/usr/bin/env bash
# =============================================================
#  Mis Manos Hablarán - Generación del despliegue
#  Publica dist/ en Netlify y verifica que el sitio responda.
#  Uso:  bash scripts/deploy.sh            -> producción
#        bash scripts/deploy.sh --preview  -> despliegue de vista previa
#  Requiere: NETLIFY_AUTH_TOKEN y NETLIFY_SITE_ID
# =============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

: "${NETLIFY_AUTH_TOKEN:?Falta la variable NETLIFY_AUTH_TOKEN}"
: "${NETLIFY_SITE_ID:?Falta la variable NETLIFY_SITE_ID}"

if [ ! -f dist/index.html ]; then
  echo "dist/ no existe; ejecutando la construcción..."
  node scripts/build.mjs
fi

MESSAGE="Deploy $(git rev-parse --short HEAD 2>/dev/null || echo local) - $(date -u +%Y-%m-%dT%H:%MZ)"

if [ "${1:-}" = "--preview" ]; then
  echo "==> Desplegando vista previa en Netlify"
  OUTPUT="$(netlify deploy --dir=dist --site="$NETLIFY_SITE_ID" --message="$MESSAGE" --json)"
  URL="$(echo "$OUTPUT" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).deploy_url))')"
else
  echo "==> Desplegando a producción en Netlify"
  OUTPUT="$(netlify deploy --prod --dir=dist --site="$NETLIFY_SITE_ID" --message="$MESSAGE" --json)"
  URL="$(echo "$OUTPUT" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).url))')"
fi

echo "==> Verificando el sitio publicado: $URL"
for attempt in 1 2 3 4 5; do
  STATUS="$(curl -s -o /dev/null -w '%{http_code}' "$URL/index.html" || true)"
  if [ "$STATUS" = "200" ]; then
    echo "Despliegue verificado (HTTP 200) en $URL"
    [ -n "${GITHUB_OUTPUT:-}" ] && echo "url=$URL" >> "$GITHUB_OUTPUT"
    exit 0
  fi
  echo "    Intento $attempt: HTTP $STATUS, reintentando en 10 s..."
  sleep 10
done

echo "ERROR: el sitio no respondió con HTTP 200 tras el despliegue." >&2
exit 1
