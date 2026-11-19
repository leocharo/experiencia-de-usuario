#!/usr/bin/env bash
# =============================================================
#  Mis Manos Hablarán - Generación del entorno de liberación
#  Verifica herramientas, instala la CLI de Netlify y prepara
#  la carpeta de liberación (dist/).
#  Uso:  bash scripts/setup-env.sh
# =============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> [1/4] Verificando herramientas requeridas"
for tool in node npm git; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "ERROR: '$tool' no está instalado." >&2
    exit 1
  fi
  echo "    $tool: $($tool --version | head -n 1)"
done

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "ERROR: se requiere Node.js 20 o superior (actual: $(node -v))." >&2
  exit 1
fi

echo "==> [2/4] Instalando la CLI de Netlify (herramienta de despliegue)"
if ! command -v netlify >/dev/null 2>&1; then
  npm install --global netlify-cli@17 --no-audit --no-fund
fi
echo "    netlify-cli: $(netlify --version)"

echo "==> [3/4] Verificando variables del entorno de despliegue"
missing=0
for var in NETLIFY_AUTH_TOKEN NETLIFY_SITE_ID; do
  if [ -z "${!var:-}" ]; then
    echo "    AVISO: $var no está definida (requerida solo para desplegar)."
    missing=1
  else
    echo "    $var: definida"
  fi
done

echo "==> [4/4] Preparando carpeta de liberación"

mkdir -p dist   # no se borra: puede contener el artefacto descargado del pipeline

if [ "$missing" -eq 1 ]; then
  echo "Entorno listo para pruebas y construcción (faltan secretos para desplegar)."
else
  echo "Entorno de liberación listo."
fi
