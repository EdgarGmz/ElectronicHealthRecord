#!/usr/bin/env bash
# Regenera los archivos de intercambio para Microsoft Project a partir de Plan-Trabajo-EHR.csv.
#
# Salida principal: Plan-Trabajo-EHR.xml (MSPDI, UTF-8 sin BOM). Abre ese archivo en
# Project Desktop con Archivo → Abrir (o Importar proyecto, según versión).
# Opcional: Plan-Trabajo-EHR.mpx si python3 tiene mpxj + jpype1 (entornos muy antiguos).

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD="$DIR/build_plan_mspdi.py"
XML="$DIR/Plan-Trabajo-EHR.xml"
MPX="$DIR/Plan-Trabajo-EHR.mpx"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Se necesita python3 en PATH para ejecutar build_plan_mspdi.py" >&2
  exit 1
fi

if [[ ! -f "$BUILD" ]]; then
  echo "No se encontró $BUILD" >&2
  exit 1
fi

python3 "$BUILD"

echo ""
echo "=== Exportación para Microsoft Project ==="
echo "Archivo recomendado (MSPDI / XML de MS Project):"
echo "  $XML"
echo ""
echo "En Microsoft Project (escritorio): Archivo → Abrir → elige el .xml"
echo "(en algunas versiones: Archivo → Nuevo → Proyecto desde archivo / Importar)."
echo ""
echo "Importante: si editas el XML, guárdalo en UTF-8 sin BOM; un BOM delante de"
echo "<?xml puede hacer fallar el lector MSPDI."
echo ""

if [[ -f "$MPX" ]]; then
  echo "MPX opcional en disco (formato antiguo; se actualiza solo si python3 tiene mpxj+jpype1):"
  echo "  $MPX"
  echo ""
fi
