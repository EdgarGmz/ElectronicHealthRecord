#!/usr/bin/env python3
"""
Genera Plan-Trabajo-EHR.xml (MS Project XML / MSPDI) desde Plan-Trabajo-EHR.csv,
y Plan-Trabajo-EHR.pod (mismo contenido que el XML).

ProjectLibre abre .csv como si fuera Microsoft Project vía MPXJ UniversalProjectReader,
que no reconoce CSV plano; el XML con xmlns de MSPDI sí se acepta.

El .pod nativo suele ser binario + XML; aquí el .pod es solo el MSPDI UTF-8 sin BOM.
Al abrirlo, LocalFileImporter falla en ObjectInputStream y recupera el proyecto vía XML
(mismo flujo que un .pod guardado: cola MSPDI).
"""
from __future__ import annotations

import csv
import shutil
import sys
import xml.sax.saxutils as xml_esc
from datetime import date, datetime, timedelta
from pathlib import Path

NS = "http://schemas.microsoft.com/project"

CALENDAR_STANDARD = """        <Calendar>
            <UID>1</UID>
            <Name>Standard</Name>
            <IsBaseCalendar>1</IsBaseCalendar>
            <WeekDays>
                <WeekDay>
                    <DayType>1</DayType>
                    <DayWorking>0</DayWorking>
                </WeekDay>
                <WeekDay>
                    <DayType>2</DayType>
                    <DayWorking>1</DayWorking>
                    <WorkingTimes>
                        <WorkingTime>
                            <FromTime>08:00:00</FromTime>
                            <ToTime>12:00:00</ToTime>
                        </WorkingTime>
                        <WorkingTime>
                            <FromTime>13:00:00</FromTime>
                            <ToTime>17:00:00</ToTime>
                        </WorkingTime>
                    </WorkingTimes>
                </WeekDay>
                <WeekDay>
                    <DayType>3</DayType>
                    <DayWorking>1</DayWorking>
                    <WorkingTimes>
                        <WorkingTime>
                            <FromTime>08:00:00</FromTime>
                            <ToTime>12:00:00</ToTime>
                        </WorkingTime>
                        <WorkingTime>
                            <FromTime>13:00:00</FromTime>
                            <ToTime>17:00:00</ToTime>
                        </WorkingTime>
                    </WorkingTimes>
                </WeekDay>
                <WeekDay>
                    <DayType>4</DayType>
                    <DayWorking>1</DayWorking>
                    <WorkingTimes>
                        <WorkingTime>
                            <FromTime>08:00:00</FromTime>
                            <ToTime>12:00:00</ToTime>
                        </WorkingTime>
                        <WorkingTime>
                            <FromTime>13:00:00</FromTime>
                            <ToTime>17:00:00</ToTime>
                        </WorkingTime>
                    </WorkingTimes>
                </WeekDay>
                <WeekDay>
                    <DayType>5</DayType>
                    <DayWorking>1</DayWorking>
                    <WorkingTimes>
                        <WorkingTime>
                            <FromTime>08:00:00</FromTime>
                            <ToTime>12:00:00</ToTime>
                        </WorkingTime>
                        <WorkingTime>
                            <FromTime>13:00:00</FromTime>
                            <ToTime>17:00:00</ToTime>
                        </WorkingTime>
                    </WorkingTimes>
                </WeekDay>
                <WeekDay>
                    <DayType>6</DayType>
                    <DayWorking>1</DayWorking>
                    <WorkingTimes>
                        <WorkingTime>
                            <FromTime>08:00:00</FromTime>
                            <ToTime>12:00:00</ToTime>
                        </WorkingTime>
                        <WorkingTime>
                            <FromTime>13:00:00</FromTime>
                            <ToTime>17:00:00</ToTime>
                        </WorkingTime>
                    </WorkingTimes>
                </WeekDay>
                <WeekDay>
                    <DayType>7</DayType>
                    <DayWorking>0</DayWorking>
                </WeekDay>
            </WeekDays>
        </Calendar>"""


def weekdays_between_inclusive(a: date, b: date) -> int:
    n = 0
    d = a
    while d <= b:
        if d.weekday() < 5:
            n += 1
        d += timedelta(days=1)
    return max(n, 0)


def parse_duration_hours(s: str) -> tuple[int, bool]:
    """Returns (hours, is_empty_summary_style)."""
    t = (s or "").strip()
    if not t:
        return 0, True
    low = t.lower()
    if low.endswith("d") and low[:-1].strip().isdigit():
        return int(low[:-1]) * 8, False
    return 0, True


def to_dt_start(d: str) -> str:
    return f"{d.strip()}T08:00:00"


def to_dt_finish(d: str) -> str:
    return f"{d.strip()}T17:00:00"


def outline_wbs(csv_outline_level: int, counters: list[int]) -> str:
    idx = csv_outline_level - 1
    counters[idx] += 1
    for j in range(idx + 1, len(counters)):
        counters[j] = 0
    return ".".join(str(counters[i]) for i in range(idx + 1))


def task_block(
    uid: int,
    name: str,
    outline_number: str,
    outline_level_xml: int,
    start: str,
    finish: str,
    duration_pt: str,
    remaining_pt: str,
    summary: int,
    pct: int,
    preds: list[int],
    notes_extra: str,
) -> str:
    pred_xml = ""
    for p in preds:
        pred_xml += f"""
            <PredecessorLink>
                <PredecessorUID>{p}</PredecessorUID>
                <Type>1</Type>
            </PredecessorLink>"""
    notes = xml_esc.escape(notes_extra) if notes_extra else ""
    safe_name = xml_esc.escape(name)
    tid = uid - 1
    return f"""        <Task>
            <UID>{uid}</UID>
            <ID>{tid}</ID>
            <Name>{safe_name}</Name>
            <Type>0</Type>
            <IsNull>0</IsNull>
            <CreateDate>2026-01-01T08:00:00</CreateDate>
            <WBS/>
            <OutlineNumber>{outline_number}</OutlineNumber>
            <OutlineLevel>{outline_level_xml}</OutlineLevel>
            <Priority>500</Priority>
            <Start>{start}</Start>
            <Finish>{finish}</Finish>
            <Duration>{duration_pt}</Duration>
            <DurationFormat>7</DurationFormat>
            <Work>PT0H0M0S</Work>
            <ResumeValid>0</ResumeValid>
            <EffortDriven>0</EffortDriven>
            <Recurring>0</Recurring>
            <OverAllocated>0</OverAllocated>
            <Estimated>0</Estimated>
            <Milestone>0</Milestone>
            <Summary>{summary}</Summary>
            <Critical>0</Critical>
            <IsSubproject>0</IsSubproject>
            <IsSubprojectReadOnly>0</IsSubprojectReadOnly>
            <ExternalTask>0</ExternalTask>
            <StartVariance>0</StartVariance>
            <FinishVariance>0</FinishVariance>
            <WorkVariance>0</WorkVariance>
            <FreeSlack>0</FreeSlack>
            <TotalSlack>0</TotalSlack>
            <FixedCost>0</FixedCost>
            <FixedCostAccrual>3</FixedCostAccrual>
            <PercentComplete>{pct}</PercentComplete>
            <PercentWorkComplete>0</PercentWorkComplete>
            <Cost>0</Cost>
            <OvertimeCost>0</OvertimeCost>
            <OvertimeWork>PT0H0M0S</OvertimeWork>
            <ActualDuration>PT0H0M0S</ActualDuration>
            <ActualCost>0</ActualCost>
            <ActualOvertimeCost>0</ActualOvertimeCost>
            <ActualWork>PT0H0M0S</ActualWork>
            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>
            <RegularWork>PT0H0M0S</RegularWork>
            <RemainingDuration>{remaining_pt}</RemainingDuration>
            <RemainingCost>0</RemainingCost>
            <RemainingWork>PT0H0M0S</RemainingWork>
            <RemainingOvertimeCost>0</RemainingOvertimeCost>
            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>
            <ACWP>0</ACWP>
            <CV>0</CV>
            <CalendarUID>-1</CalendarUID>
            <ConstraintDate>1970-01-01T01:00:00</ConstraintDate>
            <LevelAssignments>0</LevelAssignments>
            <LevelingCanSplit>0</LevelingCanSplit>
            <IgnoreResourceCalendar>0</IgnoreResourceCalendar>
            <Notes>{notes}</Notes>
            <HideBar>0</HideBar>
            <Rollup>0</Rollup>
            <BCWS>0</BCWS>
            <BCWP>0</BCWP>
            <EarnedValueMethod>0</EarnedValueMethod>{pred_xml}
            <ActualWorkProtected>PT0H0M0S</ActualWorkProtected>
            <ActualOvertimeWorkProtected>PT0H0M0S</ActualOvertimeWorkProtected>
        </Task>"""


def main() -> int:
    here = Path(__file__).resolve().parent
    csv_path = here / "Plan-Trabajo-EHR.csv"
    out_path = here / "Plan-Trabajo-EHR.xml"
    if not csv_path.is_file():
        print(f"Missing {csv_path}", file=sys.stderr)
        return 1

    rows: list[dict[str, str]] = []
    with csv_path.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            rows.append(row)

    counters = [0] * 12
    task_chunks: list[str] = []

    for row in rows:
        uid = int(row["ID"].strip())
        csv_ol = int(row["Outline Level"].strip())
        ol_xml = csv_ol - 1
        name = row["Task Name"].strip()
        dur_raw = row["Duration"].strip()
        start_d = row["Start"].strip()
        finish_d = row["Finish"].strip()
        pred_raw = row["Predecessors"].strip().strip('"')
        res_raw = row["Resource Names"].strip()
        pct = int(row["Percent Complete"].strip() or "0")

        wbs = outline_wbs(csv_ol, counters)
        dh, empty_dur = parse_duration_hours(dur_raw)
        if empty_dur:
            sdt = datetime.strptime(start_d, "%Y-%m-%d").date()
            fdt = datetime.strptime(finish_d, "%Y-%m-%d").date()
            wd = weekdays_between_inclusive(sdt, fdt)
            dh = max(wd * 8, 8)
            summary = 1
        else:
            summary = 0
        duration_pt = f"PT{dh}H0M0S"

        preds: list[int] = []
        if pred_raw:
            for part in pred_raw.split(","):
                part = part.strip()
                if part.isdigit():
                    preds.append(int(part))

        notes = f"Recursos: {res_raw}" if res_raw else ""

        task_chunks.append(
            task_block(
                uid=uid,
                name=name,
                outline_number=wbs,
                outline_level_xml=ol_xml,
                start=to_dt_start(start_d),
                finish=to_dt_finish(finish_d),
                duration_pt=duration_pt,
                remaining_pt=duration_pt,
                summary=summary,
                pct=pct,
                preds=preds,
                notes_extra=notes,
            )
        )

    tasks_xml = "\n".join(task_chunks)

    doc = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Project xmlns="{NS}">
    <Title>Electronic Health Record (EHR)</Title>
    <ScheduleFromStart>1</ScheduleFromStart>
    <StartDate>2026-01-20T08:00:00</StartDate>
    <FinishDate>2026-04-10T17:00:00</FinishDate>
    <FYStartDate>1</FYStartDate>
    <CriticalSlackLimit>0</CriticalSlackLimit>
    <CurrencyDigits>2</CurrencyDigits>
    <CurrencySymbol>$</CurrencySymbol>
    <CurrencySymbolPosition>0</CurrencySymbolPosition>
    <CalendarUID>1</CalendarUID>
    <DefaultStartTime>08:00:00</DefaultStartTime>
    <DefaultFinishTime>17:00:00</DefaultFinishTime>
    <MinutesPerDay>480</MinutesPerDay>
    <MinutesPerWeek>2400</MinutesPerWeek>
    <DaysPerMonth>20</DaysPerMonth>
    <DefaultTaskType>0</DefaultTaskType>
    <DefaultFixedCostAccrual>2</DefaultFixedCostAccrual>
    <DurationFormat>7</DurationFormat>
    <WorkFormat>2</WorkFormat>
    <EditableActualCosts>0</EditableActualCosts>
    <HonorConstraints>0</HonorConstraints>
    <EarnedValueMethod>0</EarnedValueMethod>
    <NewTasksEffortDriven>0</NewTasksEffortDriven>
    <NewTasksEstimated>1</NewTasksEstimated>
    <WeekStartDay>1</WeekStartDay>
    <AutoAddNewResourcesAndTasks>1</AutoAddNewResourcesAndTasks>
    <CurrentDate>2026-01-20T08:00:00</CurrentDate>
    <ExtendedAttributes></ExtendedAttributes>
    <Calendars>
{CALENDAR_STANDARD}
    </Calendars>
    <Tasks>
{tasks_xml}
    </Tasks>
</Project>
"""

    # Sin BOM: JAXB/MSPDI de ProjectLibre falla con SAXParseException "contenido no permitido
    # en el prólogo" si el archivo empieza por U+FEFF delante de <?xml.
    out_path.write_text(doc, encoding="utf-8", newline="\n")
    print(f"Wrote {out_path} ({len(rows)} tasks, UTF-8 sin BOM)")

    pod_path = here / "Plan-Trabajo-EHR.pod"
    shutil.copyfile(out_path, pod_path)
    print(
        f"Wrote {pod_path} (MSPDI idéntico a {out_path.name}; útil si abres por "
        "extensión .pod / doble clic)"
    )

    mpx_path = here / "Plan-Trabajo-EHR.mpx"
    _try_export_mpx(out_path, mpx_path)
    return 0


def _try_export_mpx(xml_path: Path, mpx_path: Path) -> None:
    """Si están mpxj + jpype1, genera MPX (muy compatible con ProjectLibre antiguo)."""
    try:
        import jpype  # type: ignore[import-untyped]
    except ImportError:
        print(
            "MPX: omitido (opcional: pip install mpxj jpype1 → "
            f"se escribiría {mpx_path.name})"
        )
        return
    try:
        import mpxj  # type: ignore[import-untyped]
    except ImportError:
        print("MPX: omitido (paquete mpxj no encontrado)")
        return

    libdir = Path(mpxj.__file__).resolve().parent / "lib"
    if not libdir.is_dir():
        print("MPX: omitido (sin carpeta lib en mpxj)")
        return

    jars = sorted(libdir.glob("*.jar"))
    cp = ":".join(str(j) for j in jars)
    try:
        if not jpype.isJVMStarted():
            jpype.startJVM(jpype.getDefaultJVMPath(), classpath=cp)
        UPR = jpype.JClass("org.mpxj.reader.UniversalProjectReader")
        MW = jpype.JClass("org.mpxj.mpx.MPXWriter")
        pf = UPR().read(str(xml_path))
        MW().write(pf, str(mpx_path))
        print(f"Wrote {mpx_path} ({pf.getTasks().size()} tasks)")
    except Exception as e:
        print(f"MPX: error al exportar ({type(e).__name__}: {e})")
    finally:
        if jpype.isJVMStarted():
            jpype.shutdownJVM()


if __name__ == "__main__":
    raise SystemExit(main())
