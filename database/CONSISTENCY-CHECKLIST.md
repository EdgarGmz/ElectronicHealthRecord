# Consistency Checklist - Database Design

Date: 2026-02-07

## Scope
- database/schemas/schema.sql
- database/design/ER-DIAGRAM.dbml
- database/design/ER-DIAGRAM.md
- database/design/DATA-DICTIONARY.md
- database/design/RELATIONSHIPS-AND-CONSTRAINTS.md
- database/design/INDEXES-AND-OPTIMIZATION.md
- database/design/VISUAL-DIAGRAM.md
- database/EXECUTIVE-SUMMARY.md
- database/README.md

## Status
- OK: Counts updated to 22 tables in summaries and diagrams.
- OK: Patients use `trimester` consistently (schema, ER, data dictionary, DBML).
- OK: `therapy_type` removed; `mood` added with full allowed list.
- OK: Careers and psychologist assignments documented and linked.
- OK: Patients use `career_id` (FK) instead of free-text career.
- OK: Psychologist access by career documented.

## Open Items
- None.

## Notes
- If you introduce a new table or rename a column, update: schema, DBML, ER text, data dictionary, relationships, indexes, summary, and README.
