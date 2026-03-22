#!/usr/bin/env bash
# Diagnóstico cuando los archivos son válidos pero la interfaz "no muestra nada".
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=== 1) Verificación MPXJ (mismo JAR que ProjectLibre) ==="
PY="${VERIFIER_PY:-}"
if [[ -n "$PY" ]] && ! "$PY" -c "import jpype" 2>/dev/null; then
  echo "VERIFIER_PY no tiene jpype1: $PY" >&2
  exit 2
fi
if [[ -z "$PY" ]]; then
  for try in python3 python3.12 python3.11; do
    if command -v "$try" >/dev/null 2>&1 && "$try" -c "import jpype" 2>/dev/null; then
      PY="$try"
      break
    fi
  done
fi
if [[ -z "$PY" ]]; then
  echo "No hay Python con jpype1. Instala: pip install jpype1 o export VERIFIER_PY=/ruta/venv/bin/python" >&2
  exit 2
fi
if "$PY" verificar_plan_leible_mpxj.py; then
  echo "OK: lectores MPXJ / ImprovedMSPDI coinciden con 53 tareas y XML sin BOM."
else
  echo "FALLO: ejecuta pip install jpype1 y regenera con python3 build_plan_mspdi.py" >&2
  exit 1
fi

echo ""
echo "=== 2) Copia en /tmp (por si hubiera problema con la ruta del repo) ==="
cp -f "$DIR/Plan-Trabajo-EHR.mpx" /tmp/ehr-plan-projectlibre.mpx
echo "Copiado a: /tmp/ehr-plan-projectlibre.mpx"
echo "Prueba: projectlibre --fileNames /tmp/ehr-plan-projectlibre.mpx"

echo ""
echo "=== 3) Gantt en 2026 ==="
echo "El plan va del 20 ene 2026 al 10 abr 2026. Si ves filas de tareas a la izquierda"
echo "pero el diagrama de Gantt 'vacío', desplázate en el tiempo o haz zoom hasta esas fechas."

echo ""
echo "=== 4) Log de importación (snap) ==="
echo "En ~/snap/projectlibre/*/.projectlibre/run.conf puedes poner por ejemplo:"
echo '  LOG_FILE="$HOME/projectlibre-import.log"'
echo "(deja LOG_LEVEL=DEBUG) y repetir la apertura; luego revisa el .log."
