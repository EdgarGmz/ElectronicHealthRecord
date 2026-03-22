#!/usr/bin/env python3
"""
Comprueba con el MPXJ embebido en projectlibre.jar (mismo lector que usa la app al importar)
que Plan-Trabajo-EHR.mpx / .xml tienen 53 tareas.

Para el .xml usa además MSPDIReader (igual que MspImporter con ImprovedMSPDIReader) y detecta BOM UTF-8,
que provoca SAXParseException «contenido no permitido en el prólogo» en Java.

Uso:
  python3 verificar_plan_leible_mpxj.py
  PROJECTLIBRE_JAR=/ruta/a/projectlibre.jar python3 verificar_plan_leible_mpxj.py

Requiere: pip install jpype1
"""
from __future__ import annotations

import os
import sys
from pathlib import Path


def _xml_has_utf8_bom(path: Path) -> bool:
    with path.open("rb") as f:
        return f.read(3) == b"\xef\xbb\xbf"


def main() -> int:
    try:
        import jpype  # type: ignore[import-untyped]
    except ImportError:
        print("Instala jpype1: pip install jpype1", file=sys.stderr)
        return 2

    here = Path(__file__).resolve().parent
    mpx = here / "Plan-Trabajo-EHR.mpx"
    xml = here / "Plan-Trabajo-EHR.xml"
    jar = os.environ.get(
        "PROJECTLIBRE_JAR",
        "/snap/projectlibre/current/projectlibre/projectlibre.jar",
    )

    if not Path(jar).is_file():
        print(f"No existe projectlibre.jar en: {jar}", file=sys.stderr)
        print("Define PROJECTLIBRE_JAR con la ruta al JAR de tu instalación.", file=sys.stderr)
        return 3

    jpype.startJVM(jpype.getDefaultJVMPath(), classpath=jar)
    try:
        UPR = jpype.JClass("net.sf.mpxj.reader.UniversalProjectReader")
        MSPDI = jpype.JClass("net.sf.mpxj.mspdi.MSPDIReader")

        results: dict[str, object] = {"jar": jar}

        if xml.is_file():
            results["xml_utf8_bom"] = _xml_has_utf8_bom(xml)

        r = UPR()
        for label, path in (("mpx", mpx), ("xml", xml)):
            if not path.is_file():
                results[label] = {"error": "missing_file"}
                continue
            try:
                pf = r.read(str(path))
                n = 0 if pf is None else pf.getTasks().size()
                results[label] = {"tasks": int(n), "ok": pf is not None and n > 0}
            except Exception as e:
                results[label] = {"error": f"{type(e).__name__}: {e}"}

        if xml.is_file():
            try:
                pf = MSPDI().read(str(xml))
                n = 0 if pf is None else pf.getTasks().size()
                results["xml_mspdi_reader"] = {"tasks": int(n), "ok": pf is not None and n > 0}
            except Exception as e:
                results["xml_mspdi_reader"] = {"error": f"{type(e).__name__}: {e}"}

        if xml.is_file():
            try:
                IMP = jpype.JClass("com.projectlibre.core.pm.exchange.ImprovedMSPDIReader")
                pf = IMP().read(str(xml))
                n = 0 if pf is None else pf.getTasks().size()
                results["xml_improved_mspdi"] = {"tasks": int(n), "ok": pf is not None and n > 0}
            except Exception as e:
                results["xml_improved_mspdi"] = {"error": f"{type(e).__name__}: {e}"}

        print(f"JAR: {jar}")
        for key in ("mpx", "xml", "xml_mspdi_reader", "xml_improved_mspdi"):
            v = results.get(key)
            if v is None:
                continue
            if isinstance(v, dict) and "error" in v:
                print(f"  {key}: ERROR {v['error']}")
            elif isinstance(v, dict) and "tasks" in v:
                print(f"  {key}: {v['tasks']} tasks")
            else:
                print(f"  {key}: {v}")
        if "xml_utf8_bom" in results:
            print(f"  xml_utf8_bom: {results['xml_utf8_bom']}")

        m_ok = results.get("mpx", {}).get("tasks") == 53
        x_ms = results.get("xml_mspdi_reader") or {}
        x_ok = x_ms.get("tasks") == 53
        x_imp = results.get("xml_improved_mspdi") or {}
        x_imp_ok = x_imp.get("tasks") == 53
        bom = results.get("xml_utf8_bom") is True
        return 0 if m_ok and x_ok and x_imp_ok and not bom else 1
    finally:
        if jpype.isJVMStarted():
            jpype.shutdownJVM()


if __name__ == "__main__":
    raise SystemExit(main())
