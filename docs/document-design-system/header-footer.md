# Header und Footer

> Letzte Aktualisierung: 2026-09-09

## Status

Erste Quellenanalyse. Die geometrischen Beobachtungen sind in den vorhandenen Dokumentfamilien wiederholt sichtbar. Inhaltliche und dynamische Regeln werden mit Ann bestätigt, bevor sie als verbindliche Implementierungsregeln gelten.

**Teil-eingefroren am 2026-09-09** — siehe Abschnitt „Eingefroren" unten.

---

## Eingefroren (bestätigt von Ann, 2026-09-09)

Gilt global für **alle** Dokumenttypen.

### Header

| Element | Regel |
| --- | --- |
| Wortmarke | `AN(N) ARCHITECTURE` / `SOLUTION`, Rota **Light 8 pt**, VERSALIEN, linksbündig an Spalte 1 (15 mm), 2 Zeilen im 13-pt-Raster |
| Monogramm | Vektor `design-sources/_assets/monogram.svg`, **31,2 × 13,5 mm**, rechte Kante an 195 mm, Oberkante an 15 mm. Kein Bleed |
| Titelzeile (`doc-title`) | Rota **Medium 10 pt**, **rechtsbündig** an 195 mm, Grundlinie `bl(5,5)` |
| Ort/Datum (`doc-place-date`) | Rota **Medium 10 pt**, rechtsbündig an 195 mm, Grundlinie `bl(7,5)`. Format **`Berlin, TT.MM.JJJJ`** |
| Ort | Feld ist **editierbar**, Standardwert **`Berlin`** (Büro derzeit überwiegend Berlin) |
| Datum | Format **`TT.MM.JJJJ`** |
| Graue Linien | 3 Stück, **0,5 pt**, Farbe **`#8C8C8C`** (Brand `--color-gray-600`), bei `bl(5) / bl(7) / bl(9)` |
| Wiederholung | Header steht **vollständig auf jeder Seite** (auch Folgeseiten), positionsgleich |

### Footer

| Element | Regel |
| --- | --- |
| Schrift | Rota **Light 8 pt**, 2 Zeilen bei `bl(57) / bl(58)` |
| Blöcke | 5: Straße/Ort `colX(1)` · E-Mail/Web `colX(3)` · Tel./USt-IdNr. `colX(6)` · Name/Berufsbez. `colX(8)` · Seitenangabe rechtsbündig 195 mm |
| Seitenangabe | Wort **`Page`** (Zeile 1) + **`n/m`** ohne Leerzeichen (Zeile 2). `m` erst nach vollständiger Pagination |
| Inhalt | aus zentralem Büroprofil (`Company Info`), **nie** pro Template dupliziert |
| Wiederholung | Footer steht **auf jeder Dokumentseite** |
| Keine Trennlinie | zwischen Body und Footer |

### Noch offen (auch im eingefrorenen Rahmen)

- Titelzeile: „intelligent" herleiten (aus Dokumenttyp + laufender Nummer o. Ä.), **zusätzlich
  editierbar**. Herleitungsquelle pro Dokumenttyp später festlegen (Ann, 2026-09-09).
- Verhalten bei zu langem Titel (umbrechen / verkleinern / kürzen).
- Farbe `#8C8C8C` ersetzt den Messwert `#A7A9AC` (Ann-Entscheidung 2026-09-09).

## Quellenbasis

Analysiert wurden die elf A4-Seiten aus `design-sources/PAPER Templates_ A4_vertical.pdf`: Angebot, Rechnung, Baustellendokumentation und Stundennachweis.

## Header

### Sichtbar wiederkehrender Aufbau

Der Header besteht aus drei Bereichen:

1. zweizeilige Wortmarke links oben;
2. Bildmarke/Logo rechts oben;
3. zweizeiliger Dokumentidentitätsblock darunter rechts.

### Wortmarke

- Inhalt im Beispiel: `AN(N) ARCHITECTURE` / `SOLUTION`.
- Ausrichtung an der linken 15-mm-Rasterkante.
- Schrift: Rota Light, 8 pt.
- Zeilenabstand: 13 pt, entsprechend einer Grundrastereinheit.

### Logo

- Ausrichtung an der rechten 15-mm-Rasterkante.
- Gemessene Begrenzung auf der Stundennachweis-Seite: ca. 31,2 × 13,5 mm.
- Das Logo muss später aus einer freigegebenen Vektordatei übernommen werden; keine Rekonstruktion aus einem Screenshot.

### Dokumentidentitätsblock

- Lage ungefähr über den Rasterspalten 8 bis 12.
- Ungefähre horizontale Begrenzung: 122,7 bis 195 mm.
- Drei horizontale graue Linien bilden zwei Zeilen.
- Jede Zeile ist ungefähr 26 pt beziehungsweise zwei Grundrastereinheiten hoch.
- Zeile 1: Dokumentbezeichnung, Dokumentnummer oder Dokumenttitel.
- Zeile 2: Ort und Dokumentdatum.
- Schrift: Rota Medium, 10 pt.
- Ausrichtung: rechtsbündig an der äußeren Rasterkante.
- Linien: 0,5 pt, hellgrau; aus der Quelle gemessen ungefähr `#A7A9AC`.

### Komponentenmodell

```text
header
├── wortmarke
├── logo
└── dokumentidentitaet
    ├── dokumentbezeichnung
    └── ort-und-datum
```

## Footer

### Sichtbar wiederkehrender Aufbau

- Feste Position auf allen elf untersuchten Seiten.
- Zwei Textzeilen.
- Schrift: Rota Light, 8 pt.
- Zeilenabstand: 13 pt.
- Erste Zeile beginnt ungefähr 278,1 mm von oben.
- Zweite Zeile beginnt ungefähr 282,6 mm von oben.
- Keine sichtbare Trennlinie zwischen Inhalt und Footer.

### Informationsblöcke

| Rasterposition | Beispielinhalt | Ausrichtung |
| --- | --- | --- |
| Spalte 1 | Straße / Ort | linksbündig |
| Spalte 3 | E-Mail / Website | linksbündig |
| Spalte 6 | Telefon / Umsatzsteuer-ID | linksbündig |
| Spalte 8 | Name / Berufsbezeichnung | linksbündig |
| rechte Rasterkante | `Page` / `aktuelle Seite/Gesamtseiten` | rechtsbündig |

Die Bürodaten sind globale Systemdaten. Sie dürfen nicht als voneinander abweichende Textkopien in jedem Dokumenttemplate gepflegt werden.

### Seitennummerierung

- In der vollständigen sechsseitigen Angebotsfolge läuft die Nummerierung korrekt von `1/6` bis `6/6`.
- Die Bezeichnung `Page` steht in der ersten Footerzeile.
- `aktuelle Seite/Gesamtseiten` steht ohne Leerzeichen in der zweiten Footerzeile.
- Andere Beispielseiten enthalten widersprüchliche Platzhalter: Rechnung `1/6`, Baustellendokumentation zweimal `2/3`, Stundennachweis `1/2` ohne vorhandene Seite 2.
- Diese widersprüchlichen Werte werden nicht als Paginationregeln übernommen.

## Stark belegte, aber noch zu bestätigende Regeln

1. Header und Footer werden auf jeder Fortsetzungsseite vollständig wiederholt.
2. Der Dokumentidentitätsblock behält auch auf Fortsetzungsseiten seine feste Position.
3. Footer-Inhalte werden aus einem zentralen Büroprofil geladen.
4. Seitenzahlen werden erst nach abgeschlossener Pagination berechnet.

## Offene Entscheidungen mit Ann

1. Bleibt die Seitenbezeichnung `Page` oder soll sie `Seite` heißen?
2. Ist `Berlin` ein festes Bürofeld oder pro Dokument veränderbar?
3. Ist das Datumsformat immer `TT.MM.JJJJ`?
4. Darf eine lange Dokumentbezeichnung im Header umbrechen, wird sie verkleinert oder begrenzt?
5. Ist `Anlage 01_Stundennachweis` ein einziges Feld oder eine Kombination aus Anlagennummer und Dokumenttyp?
6. Gilt der vollständige Header auf jeder Stundennachweis-Fortsetzungsseite?
7. Muss der Footer ausnahmslos auf allen Dokumentseiten erscheinen?
8. Soll das System langfristig mehrere Büro-/Absenderprofile unterstützen?

## Verknüpfte Dokumentation

- [[grid-system]]
- [[regel-register]]
