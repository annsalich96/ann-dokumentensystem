# Typografie

> Letzte Aktualisierung: 2026-09-09
> Verknüpft: [[grid-system]] · [[abstaende-und-raster]] · [[header-footer]] · [[regel-register]]

## Status

**Eingefroren** in den Grundwerten (Schrift, Größenskala, Gewichte) — bestätigt von Ann am 2026-09-09:
„Schriftgröße immer 10 oder 8. Von Rota Light bis Bold."
Die Zuordnung einzelner Stile zu Dokumentbestandteilen ist aus der Designquelle belegt; wo eine
bewusste Regel noch fehlt, ist sie als **offen** markiert.

---

## 1. Schriftfamilie

- **Rota** (René Bieder). Einzige Textschrift im gesamten System.
- Dateien: `design-sources/_fonts/` (`Rota-Light.otf`, `Rota-Regular.otf`, `Rota-Medium.otf`, `Rota-SemiBold.otf`, `Rota-Bold.otf`).
- Verwendete Schnitte: **Light · Medium · Bold** (Regular/SemiBold liegen bereit, kommen in den
  Quellen aber nicht vor).
- Fallback-Stack bis Web-Fonts (woff2) erzeugt sind: `"Rota", "Helvetica Neue", Arial, sans-serif`.
- Textfarbe immer **Schwarz** (`#0A0A0A`, Brand-`--color-black`). Kein Grau in Textkörpern.

## 2. Größenskala — nur zwei Grade

| Grad | Größe | Zeilenabstand | Verwendung |
| --- | ---: | ---: | --- |
| **T10** | 10 pt | 13 pt (1 Grundraster) | Fließtext, Überschriften, Header-Titel, Metadaten-Werte, Aufzählungen |
| **T8** | 8 pt | 13 pt (1 Grundraster) | Wortmarke, Footer, Tabellen (Kopf + Zellen), Metadaten-Labels, Summenzeile |

> In der PDF-Quelle gemessene Zwischengrößen (9,64 pt / 7,71 pt) sind ein in Illustrator auf
> 96,4 % skalierter Rahmen, **keine eigene Stufe**. Kanonisch gilt: **10 pt oder 8 pt, sonst nichts.**

Alle Zeilen sitzen auf dem **13-pt-Grundraster** (= 4,586 mm), siehe [[abstaende-und-raster]].
Zeilenabstand ist damit für T10 = 1,3× und für T8 = 1,625× — beide rasten auf dieselbe Grundlinie.

## 3. Gewichte

| Gewicht | OTF | CSS `font-weight` | Rolle |
| --- | --- | ---: | --- |
| **Light** | Rota-Light | 300 | Leises Beiwerk: Wortmarke, Footer |
| **Medium** | Rota-Medium | 500 | Standard: Fließtext, Metadaten, Tabellenzellen, Header-Titel |
| **Bold** | Rota-Bold | 700 | Betonung: Abschnittsüberschriften, Summenzeile, Schlüsselbeträge |

Regular (400) und SemiBold (600) sind **nicht** Teil der Dokumentregeln.

## 4. Absatz- und Textstile (Katalog)

Namen sind implementierungsstabil. „Ausrichtung Basislinie" heißt: die erste Grundlinie des
Stils rastet auf das 13-pt-Raster.

| Stil-ID | Schrift | Größe/ZA | Auszeichnung | Ausrichtung | Wo |
| --- | --- | --- | --- | --- | --- |
| `wordmark` | Rota Light | T8 / 13 | VERSALIEN | linksbündig, Rasterkante links (15 mm) | Header links, 2 Zeilen |
| `doc-title` | Rota Medium | T10 / 13 | — | **rechtsbündig** an Rasterkante rechts (195 mm) | Header, Titelzeile |
| `doc-place-date` | Rota Medium | T10 / 13 | — | rechtsbündig (195 mm) | Header, Zeile darunter |
| `meta-label` | Rota Medium | T8 / 13 | VERSALIEN, endet mit `:` | linksbündig | Metadaten-Block, Spaltentitel |
| `meta-value` | Rota Medium | T10 / 13 | — | linksbündig | Metadaten-Block, Werte |
| `body` | Rota Medium | T10 / 13 | — | linksbündig (Standard) · Blocksatz optional pro Dokument | Fließtext |
| `body-lead` | Rota Medium | T10 / 13 | — | wie `body` | Einleitungsabsatz (kein visueller Unterschied, nur Rolle) |
| `section-heading` | Rota Bold | T10 / 13 | Nummer inline vorangestellt (`01: …`) | linksbündig | Abschnittsüberschrift |
| `list-item` | Rota Medium | T10 / 13 | Aufzählungszeichen `•` in eigener Spalte | linksbündig | Aufzählung |
| `table-head` | Rota Medium | T8 / 13 | VERSALIEN | je Spalte links **oder** rechts (siehe Template) | Tabellenkopf |
| `table-cell` | Rota Medium | T8 / 13 | — | Text links · Zahlen/Beträge/Stunden **rechts** | Tabellenzelle |
| `table-total` | Rota Bold | T8 / 13 | — | Label links im Wertblock · Wert rechtsbündig | Summenzeile |
| `footer` | Rota Light | T8 / 13 | — | linksbündig je Block · Seitenangabe rechtsbündig | Footer, 2 Zeilen |

### Regeln zu einzelnen Stilen

- **Nummerierung / Titelhierarchie** (aus Brand `design-rules.md` übernommen):
  Nummern (`01`, `02` …) stehen **inline vor dem Titel**, in gleicher Größe, gleichem Gewicht,
  gleicher Farbe. **Nie** eine kleine graue Zahl über dem Titel.
- **Blocksatz:** In der Baustellendokumentation ist der Fließtext als Blocksatz mit
  Silbentrennung gesetzt. **Standard ist linksbündig (Flattersatz).** Blocksatz ist eine
  Option pro Dokumenttyp, kein globaler Zwang. → *offen: welche Dokumenttypen nutzen Blocksatz?*
- **VERSALIEN** (`text-transform: uppercase`) gilt für: `wordmark`, `meta-label`, `table-head`.
  Laufweite (Tracking) **bestätigt: `0,02em`**.
- **Zahlen** in Tabellen und Summen sind **rechtsbündig** an der jeweiligen Spaltenkante.
  Format Stunden: `0,00 Std.` · Beträge: `0.000,00 €` (deutsche Schreibweise).
- **Waisen/Hurenkinder:** Eine allein umgebrochene Zeile am Seitenanfang/-ende wird vermieden;
  Regel wird in [[pagination-regeln]] festgelegt.

## 5. Offene Punkte

1. ~~Laufweite (Letter-Spacing) für VERSALIEN-Stile~~ — **geklärt, `0,02em`** (s. o.).
2. Welche Dokumenttypen setzen Fließtext im Blocksatz, welche linksbündig?
3. Silbentrennung: aktiv (de) mit welchen Mindestlängen?
4. Gibt es einen kursiven Einsatz (Rota Italic) irgendwo? In den Quellen bisher nicht.
5. Umgang mit sehr langen Header-Titeln (umbrechen / verkleinern / kürzen) — siehe [[header-footer]] O-001.
