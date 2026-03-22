#!/usr/bin/env bash
# Abre el plan en ProjectLibre usando el par CLI que entiende extractOpts: --fileNames <ruta>.
# (Main.java reescribe un solo argumento a --fileNames + ruta; aquí lo dejamos explícito.)
# Úsalo si Archivo → Abrir deja el proyecto vacío o el diálogo filtra mal por tipo.

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLAN_MPX="$DIR/Plan-Trabajo-EHR.mpx"
PLAN_XML="$DIR/Plan-Trabajo-EHR.xml"

if [[ -f "$PLAN_MPX" ]]; then
  FILE="$PLAN_MPX"
elif [[ -f "$PLAN_XML" ]]; then
  FILE="$PLAN_XML"
else
  echo "No se encontró Plan-Trabajo-EHR.mpx ni .xml en $DIR" >&2
  exit 1
fi

if command -v projectlibre >/dev/null 2>&1; then
  exec projectlibre --fileNames "$FILE"
fi

echo "No está 'projectlibre' en PATH. Instala el snap o añade el ejecutable al PATH." >&2
exit 1
