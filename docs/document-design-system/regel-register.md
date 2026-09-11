# Regel-Register

> Letzte Aktualisierung: 2026-09-09

## Statusdefinitionen

- **Bestätigt:** durch Ann ausdrücklich festgelegt oder direkt aus einer eindeutigen Quelle belegt.
- **Sichtbar belegt:** wiederholt und messbar in den Designquellen, aber noch nicht als bewusste Regel von Ann bestätigt.
- **Abgeleitet:** starke Interpretation aus mehreren Beobachtungen.
- **Offen:** Quelle oder Entscheidung fehlt; keine Implementierung als feste Regel.

## Bestätigte Regeln

| ID | Bereich | Regel | Quelle |
| --- | --- | --- | --- |
| R-001 | Seite | A4 Hochformat, 210 × 297 mm | Designquelle + Generatoransicht |
| R-002 | Grid | Underlay mit 12 Spalten und 13-pt-Grundraster | Designquelle + Generatoransicht |
| R-003 | Grid | Oberer, linker und rechter Rand jeweils 15 mm | Generatoransicht |
| R-004 | Grid | Unterer Mindestrand 0 mm; tatsächlicher Rasterrest 2,247 mm | Generatoransicht |
| R-005 | Grid | Cyan/magenta Raster ist Underlay und kein Dokumentinhalt | Ann, 2026-09-09 |
| R-006 | Architektur | Globales Designsystem und dokumentabhängige Templates werden getrennt | Projektbrief |
| R-007 | Typografie | Schriftgrößen nur 10 pt oder 8 pt; Rota Light/Medium/Bold; Zeilenabstand 13 pt | Ann, 2026-09-09 → DECISION-003, [[typografie]] |
| R-008 | Linien | Alle Linien 0,5 pt in `#8C8C8C` (Brand `--color-gray-600`) | Ann, 2026-09-09 → DECISION-004 |
| R-009 | Header | Ort editierbar, Standard `Berlin`; Datum `TT.MM.JJJJ`; Footer-Seitenwort `Page` | Ann, 2026-09-09 → DECISION-005 |
| R-010 | Rhythmus | Vertikale Abstände sind Vielfache von 13 pt: 1 BL Zeile, 2 BL Abschnitt/Tabellenzeile, 3 BL Header→Body, 4 BL Metadaten→Body | Vermessung, [[abstaende-und-raster]] |
| R-011 | Wiederholung | Header und Footer stehen vollständig und positionsgleich auf jeder Seite | Ann, 2026-09-09 (bestätigt R-201) |

## Sichtbar belegte Regeln

| ID | Bereich | Beobachtung | Quelle |
| --- | --- | --- | --- |
| R-101 | Header | Wortmarke links, Logo rechts, Identitätsblock rechts darunter | alle elf A4-Seiten |
| R-102 | Header | Wortmarke Rota Light 8 pt auf 13 pt Zeilenabstand | alle elf A4-Seiten |
| R-103 | Header | Dokumentbezeichnung und Ort/Datum Rota Medium 10 pt, rechtsbündig | alle elf A4-Seiten |
| R-104 | Linien | Headerlinien 0,5 pt, ungefähr `#A7A9AC` | Designquelle |
| R-105 | Footer | Zweizeiliger Footer, Rota Light 8 pt, 13 pt Zeilenabstand | alle elf A4-Seiten |
| R-106 | Footer | Vier Informationsblöcke plus rechtsbündige Seitenangabe | alle elf A4-Seiten |
| R-107 | Pagination | Darstellung `Page` und `aktuelle Seite/Gesamtseiten` | vollständige Angebotsfolge |

## Abgeleitete Regeln

| ID | Bereich | Ableitung | Begründung |
| --- | --- | --- | --- |
| R-201 | Wiederholung | Header und Footer wiederholen sich vollständig auf Fortsetzungsseiten | vollständige Angebotsfolge und gleiche Positionen in mehreren Dokumenttypen |
| R-202 | Daten | Footer-Inhalte kommen aus einem zentralen Büroprofil | global identische Inhalte; Duplikate wären fehleranfällig |
| R-203 | Pagination | Gesamtseitenzahl wird nach abgeschlossener Layoutberechnung eingesetzt | dynamische Dokumentlänge und `aktuell/gesamt`-Format |

## Offene Regeln

| ID | Bereich | Frage | Status |
| --- | --- | --- | --- |
| O-001 | Header | Verhalten bei zu langer Dokumentbezeichnung | offen |
| O-002 | Header | `Berlin` fest oder variabel | **geklärt** — editierbar, Standard `Berlin` (DECISION-005) |
| O-003 | Header | Zusammensetzung des Titels (`Anlage 01_Stundennachweis`) | offen — „intelligent" + editierbar, Herleitung pro Dokumenttyp |
| O-004 | Footer | `Page` oder `Seite` | **geklärt** — `Page` (DECISION-005) |
| O-005 | Footer | Ausnahmen, bei denen der Footer entfallen darf | offen |
| O-006 | Wiederholung | Exakte Headerregeln auf Seite 2+ | **geklärt** — voller Header/Footer auf jeder Seite (R-011) |
| O-007 | System | Ein oder mehrere Büro-/Absenderprofile | offen |
| O-008 | Farbe | `#A7A9AC` vs. Quellwert | **geklärt** — `#8C8C8C` Brand-Grau (DECISION-004) |
| O-009 | Rhythmus | Fließtext-Einrückung global: Spalte 1 oder Spalte 3 | offen |
| O-010 | Typografie | Laufweite (Tracking) für VERSALIEN-Stile | **geklärt** — `0,02em` |
| O-011 | Typografie | Welche Dokumenttypen nutzen Blocksatz, welche Flattersatz | offen |
| O-012 | Body | „Gesamt"/Summe: fixe Position unten, nur letzte Seite? Zwischensummen? | **geklärt (Grundfall)** — steht nur auf der letzten Seite, mind. 2 Rastereinheiten Abstand zur Fußzeile; Zwischensummen je Seite weiter offen |

## Verknüpfte Dokumentation

- [[grid-system]]
- [[header-footer]]
