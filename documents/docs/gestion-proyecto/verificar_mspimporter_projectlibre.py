#!/usr/bin/env python3
"""
Importación COMPLETA como ProjectLibre: MspImporter.importProject → com.projectlibre.pm.tasks.Project.

MPXJ cuenta 53 tareas (incluye la raíz resumen id=0 «Electronic Health Record…»).
Project.getTasks().size() suele ser 52 (el modelo interno no expone esa fila igual).

Requiere: pip install jpype1
Rutas JAR por defecto: snap projectlibre (ajusta PROJECTLIBRE_DIR si instalaste en otro sitio).
"""
from __future__ import annotations

import os
import sys
from pathlib import Path


def _classpath() -> str:
    base = os.environ.get(
        "PROJECTLIBRE_DIR",
        "/snap/projectlibre/current/projectlibre",
    )
    lib = Path(base)
    jars = [str(lib / "projectlibre.jar")] + sorted(str(p) for p in (lib / "lib").glob("*.jar"))
    return ":".join(jars)


def main() -> int:
    try:
        import jpype  # type: ignore[import-untyped]
    except ImportError:
        print("pip install jpype1", file=sys.stderr)
        return 2

    here = Path(__file__).resolve().parent
    mpx = here / "Plan-Trabajo-EHR.mpx"
    if not mpx.is_file():
        print(f"No existe {mpx}", file=sys.stderr)
        return 3

    cp = _classpath()
    jpype.startJVM(jpype.getDefaultJVMPath(), classpath=cp)

    @jpype.JImplements("com.projectlibre.core.pm.exchange.MspImporter$ProgressClosure")
    class PC:
        @jpype.JOverride
        def updateProgress(self, progress, label):
            return None

    try:
        UPR = jpype.JClass("net.sf.mpxj.reader.UniversalProjectReader")
        pf = UPR().read(str(mpx))
        mpxj_n = int(pf.getTasks().size())

        pc = PC()
        mi = jpype.JClass("com.projectlibre.core.pm.exchange.MspImporter")()
        proj = mi.importProject(str(mpx), pc)
        n = int(proj.getTasks().size())

        print(f"MPXJ (UniversalProjectReader): {mpxj_n} tasks")
        print(f"MspImporter.importProject → getTasks().size(): {n}")
        print(
            "(MPXJ suele contar la raíz resumen id=0; getTasks() del Project interno suele ser n-1.)"
        )
        return 0 if n >= 50 and mpxj_n == 53 else 1
    finally:
        if jpype.isJVMStarted():
            jpype.shutdownJVM()


if __name__ == "__main__":
    raise SystemExit(main())
