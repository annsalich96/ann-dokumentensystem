# Grid-System

> Letzte Aktualisierung: 2026-09-09

## Status

Das Underlay Grid ist durch die Illustrator-/PDF-Quelle und die von Ann bereitgestellte Generatoransicht bestätigt.

## Quellen

- `design-sources/PAPER Templates_ A4_vertical.pdf`
- `design-sources/Bildschirmfoto 2026-09-09 um 21.08.49.png`
- Bestätigung von Ann am 2026-09-09: „das ist der underlay grid“

## Bestätigte Parameter

| Parameter | Wert |
| --- | ---: |
| Seitenformat | A4 Hochformat |
| Seitenbreite | 210 mm |
| Seitenhöhe | 297 mm |
| Oberer Rand | 15 mm |
| Linker Rand | 15 mm |
| Rechter Rand | 15 mm |
| Unterer Mindestrand | 0 mm |
| Tatsächlicher unterer Rasterrand | 2,247 mm |
| Spalten | 12 |
| Grundraster | 13 pt |

## Aus der Quelle gemessene Geometrie

Die PDF-Messungen weichen durch normale Rundung geringfügig von den Generatorwerten ab.

| Element | PDF-Messung | Kanonischer Wert |
| --- | ---: | ---: |
| Linke Rasterkante | ca. 15,028 mm | 15 mm |
| Rechte Rasterkante | ca. 195,028 mm | 195 mm |
| Rasterbreite | 180 mm | 180 mm |
| Spaltenbreite | ca. 10,796 mm | aus Generatorraster abgeleitet |
| Spaltenzwischenraum | 13 pt / ca. 4,586 mm | 13 pt |
| Horizontale Rasterteilung | 13 pt / ca. 4,586 mm | 13 pt |
| Letzte Rasterlinie | ca. 294,76 mm von oben | ca. 2,24 mm Rest bis Seitenende |

## Systemregeln

1. Das Raster ist ein globales Layoutsystem für alle A4-Hochformat-Dokumente.
2. Dokumentelemente werden am Raster ausgerichtet, aber das Raster selbst ist kein Dokumentinhalt.
3. Im normalen Live Preview und im finalen PDF bleibt das Underlay unsichtbar.
4. Eine optionale Diagnoseansicht darf das Underlay einblenden.
5. Das Ein- oder Ausblenden darf Positionen, Textfluss und Pagination nicht verändern.
6. Maßgeblich sind die kanonischen Generatorwerte; kleine PDF-Rundungsabweichungen erzeugen keine eigenen Seitentokens.

## Noch nicht interpretiert

In der Generatoransicht sind zwei weitere Werte `1` sichtbar, deren Symbole allein keine eindeutige Benennung erlauben. Dafür wird keine Regel erfunden. Falls diese Einstellungen für das codierte Raster relevant sind, benötigen wir die Feldbezeichnungen oder einen erklärenden Screenshot.

## Verknüpfte Dokumentation

- [[header-footer]]
- [[regel-register]]
