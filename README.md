# Dokumenten-System

> Letzte Aktualisierung: 2026-09-09
> Siehe auch: [[ich]], [[current-priorities]], [[PROJECT-MANAGEMENT-TOOL]], [[APPSHEET-TIMETRACKER]]

## Ziel

Custom, web-basiertes Dokumentensystem fürs Büro. Die Illustrator-Dateien sind die **Design Source of Truth**; sie werden in ein codiertes **Document Design System** übersetzt — globale Regeln (Grid, Typografie, Farben, Header, Footer, Pagination) plus dokument-spezifische Templates darauf (Stundennachweis, Rechnung, Angebot, Nachtragsangebot, Projekt-/Bau-/Baustellendokumentation …).

Kernprinzipien: **DATA ≠ DOCUMENT**. Google Sheets bleibt bewusst das Phase-1-Backend (bestehendes AppSheet-Modell zuerst verstehen, nicht duplizieren). Saubere Data-Access-Layer, damit später eine echte DB tauschbar ist. Mensch **und** KI-Agent arbeiten über dieselben strukturierten Actions/APIs. Manueller Override immer möglich. AI-first, aber nie AI-abhängig.

## Status

**Erster Dokumenttyp gebaut und in Nutzung:** Stundennachweis (`tool/stundennachweis.html`,
Backend `tool/apps-script/Code.gs`) — inkl. KI-Aufbereitung der Tätigkeitstexte, Abbuchen ins
Sheet, Tage-Modus, Projekt-Autofüllung (DECISION-008). Feste, für jeden Dokumenttyp geltende
Design-Grundwerte (Schriftgrößen, Liniendicke, Farben, Mindestabstände) stehen in
[[typografie]] und [[abstaende-und-raster]]; Layout/Grid ist pro Dokumenttyp eigen.

**Zweiter Dokumenttyp gestartet:** Rechnung — Layout-Quelle liegt in
`design-sources/rechnung/`, STEP 1 (Illustrator-Analyse) steht aus.

Die verbindliche Projektablage ist dieser Drive-Ordner. Frühere Codex-Arbeitsstände außerhalb des ANN Workspace sind nur Zwischenstände und werden nicht als parallele Hauptdokumentation weitergeführt.

## Aktueller Analyse-Stand

- Das A4-Underlay ist als globales Konstruktionsraster bestätigt: [[grid-system]].
- Header und Footer sind erstmals quellenbasiert beschrieben: [[header-footer]].
- Bestätigte, sichtbar belegte, abgeleitete und offene Regeln werden getrennt geführt: [[regel-register]].
- Speicherort, Tabellenbeziehungen und Ermittlungsablauf der Stundennachweis-Daten sind dokumentiert: [[stundennachweis-datenquellen]].
- Die Quelle `design-sources/PAPER Templates_ A4_vertical.pdf` und der Underlay-Screenshot wurden ausgewertet.
- Es wurde kein Anwendungscode erstellt.

## Naechste Schritte

- [ ] Ann legt Stundennachweis-Quellen in `design-sources/stundennachweis/` ab (SVG + 1:1-PDF; Fonts in `design-sources/_fonts/`)
- [ ] STEP 1 — Layout analysieren, Regel-Register erstellen (bestätigt / abgeleitet / unklar)
- [x] STEP 1A — Underlay Grid analysieren und von Dokumentinhalt trennen
- [x] STEP 1B — Header und Footer erstmals quellenbasiert erfassen
- [ ] STEP 2 — Rückfragen zu unklaren Regeln
- [ ] STEP 3 — erste Doku in `docs/document-design-system/` + `docs/templates/TIME_SHEET.md`
- [ ] STEP 4 — AppSheet-/Sheets-Datenmodell mappen → `docs/data/` (Quellen: `../APPSHEET-ANN-ARCHITECTURE/`, `../APPSHEET-TIMETRACKER/`, `../PROJECT-MANAGEMENT-TOOL/`)
- [x] STEP 4A — Datenquellen und Ermittlungsablauf für den Stundennachweis dokumentieren
- [ ] STEP 5 — minimale neue Sheets-Strukturen vorschlagen
- [ ] STEP 6 — MVP-Architektur → `docs/development/MVP_TIME_SHEET.md`
- [ ] STEP 7 — Review, dann Entscheidung über Implementierung (hier / Claude Code / Codex)

## Ordnerstruktur

```text
DOKUMENTEN-SYSTEM/
├── design-sources/        ← DESIGN SOURCE OF TRUTH (von Ann befüllt)
│   ├── stundennachweis/   ← zuerst: PDF (1:1 A4, vektorbasiert) + SVG-Export mit sichtbaren Guides/Raster
│   ├── rechnung/ · angebot/ · nachtragsangebot/
│   ├── projektdokumentation/ · baudokumentation/ · baustellenbericht/
│   └── _fonts/            ← Schriftdateien oder FONTS.md mit exakten Namen + Schnitten
├── data-exports/          ← optionale Exporte aus AppSheet / Google Sheets (falls kein Direktzugriff)
├── reference-output/      ← echte fertige Dokumente als Referenz (ein ausgefülltes + ein leeres, gern anonymisiert)
└── docs/                  ← implementierungsreife Markdown-Spec (Claude, ab STEP 3)
    ├── 00_PROJECT_OVERVIEW.md · 01_SYSTEM_ARCHITECTURE.md
    ├── document-design-system/  02_… 03_GRID · 04_TYPOGRAPHY · 05_COLORS_AND_LINES · 06_COMPONENTS · 07_PAGINATION_RULES
    ├── templates/               TIME_SHEET · INVOICE · OFFER · PROJECT_DOCUMENTATION · CONSTRUCTION_DOCUMENTATION
    ├── data/                    DATA_MODEL · GOOGLE_SHEETS_MODEL · EXISTING_APPSHEET_MODEL · DATA_ACCESS_LAYER
    ├── ai/                      AI_AGENT_INTERFACE · AVAILABLE_ACTIONS
    └── development/             MVP_TIME_SHEET · ROADMAP · DECISIONS
```

## Notizen

- Erster MVP: **Stundennachweis**. Nicht vorab alle Dokumententypen bauen, nicht vorab das ganze Office-OS.
- Bestehende AppSheet-Doku im Vault: `../APPSHEET-ANN-ARCHITECTURE/`, `../APPSHEET-TIMETRACKER/`, `../APPSHEET-FINANCE/`, `../PROJECT-MANAGEMENT-TOOL/` — vor STEP 4 lesen.
- Verwandte offene Aufgabe: `../MARKETING-STRATEGIE/OPEN-TASK_VISUAL-GRID-DESIGN-SYSTEM.md` (Grid-Design-System) — prüfen, ob es dasselbe Design-System betrifft.
- Memory-Eintrag: `project_document_engine.md`.
