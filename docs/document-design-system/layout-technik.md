# Layout — wie eine Seite technisch aufgebaut wird

> Letzte Aktualisierung: 2026-09-09
> Verknüpft: [[01_SYSTEM_ARCHITECTURE]] · [[grid-system]] · [[abstaende-und-raster]] · [[typografie]]

## Grundprinzip

Eine Seite ist ein `<div class="page">` mit **exakt 210 × 297 mm**. Alles darin wird
**absolut in Millimetern** platziert, gemessen von der oberen linken Ecke. Schriftgrößen in
**pt**. Keine Pixel, keine Umrechnung, kein Rundungsdrift — das Design-Raster ist in mm/pt
definiert, also rechnet der Code auch in mm/pt.

Bildschirm-Vorschau: die `.page` wird per `transform: scale()` in den Viewport skaliert.
PDF: `@page { size: A4; margin: 0 }`, eine `.page` pro Blatt, gedruckt über Headless-Chromium.

## Hilfsfunktionen (aus `design/constants.js`)

```
colX(n)      = 15 + (n-1) * 15.386      // linke Kante von Spalte n, in mm  (1..12)
colRight(n)  = colX(n) + 10.8           // rechte Kante von Spalte n
bl(k)        = 15 + k * 4.586           // Grundlinie Nr. k, in mm  (0..61)
BODY_TOP     = bl(12)                   // Body beginnt bei Grundlinie 12
BODY_BOTTOM  = bl(52)                   // letzter Platz für Body-Inhalt
FOOTER_TOP   = bl(57)
```

## Zwei Arten von Elementen

### 1. Feste Zonen — absolut, nie verschoben
Header, Footer, Metadaten-Block, Tabellenkopf. Sie stehen auf jeder Seite an derselben
mm-Position (Werte aus [[grid-system]] / [[abstaende-und-raster]]). Das garantiert, dass
jede Seite rasteridentisch ist.

### 2. Fließender Body — von der Engine platziert
Der variable Mittelteil. Die Engine läuft die Inhaltsblöcke von oben nach unten durch,
führt einen `cursor` (in Grundlinien) und weist jedem Block ein `top` zu.
Wenn `cursor + blockHöhe > 52` → Seite schließen, neue Seite beginnen.

## Blockmodell

Jeder Inhalt ist ein Block mit bekannter Höhe in Grundlinien (BL):

| Block | Höhe | Regel |
| --- | --- | --- |
| `section-heading` | 1 BL | davor 2 BL Abstand (außer erster Block), danach 1 BL zum Body |
| `paragraph` | `ceil(textHöhe / BL)` BL | Höhe wird **gemessen** (s. u.) |
| `list-item` | wie `paragraph` | `•` in eigener Spalte, Text +1 Modul |
| `table-header` | 2 BL | wird bei Seitenumbruch **wiederholt** |
| `table-row` | 2 BL | 0,5-pt-Graulinie an der Unterkante |
| `image` | `ceil(höhe / BL)` BL | darf **nicht** getrennt werden |
| `spacer` | n BL | expliziter Abstand |

## Texthöhe messen (der einzige knifflige Teil)

Wie viele Zeilen braucht ein Absatz (10 pt / 13 pt) in einer Spalte der Breite W?
- **v1:** Absatz unsichtbar in einer korrekt breiten Box rendern, `offsetHeight` lesen,
  auf volle BL aufrunden. Funktioniert im Browser **und** in Headless-Chromium — also für
  Vorschau und PDF identisch.
- Hinter einer `measure(text, style, width)`-Schnittstelle gekapselt, damit später ein
  reiner JS-Zeilenumbruch (ohne DOM, voll deterministisch) eingesetzt werden kann.

## Seitenumbruch (Engine-Schleife)

```
cursor = 12                         // erste Seite: Body-Top; Folgeseiten: bl(12) nach 3-BL-Gap
for block in body.blocks:
    need = block.spaceBefore + block.height
    if cursor + need > 52:
        emitFooterAndHeader(currentPage)
        currentPage = newPage()
        cursor = 12
        if block.partOfTable: emit(table-header); cursor += 2
    place(block, at = bl(cursor + block.spaceBefore))
    cursor += need
emitFooterAndHeader(currentPage)
assignPageNumbers()                 // erst jetzt: n von m in jeden Footer
```

- **Tabellenkopf-Wiederholung:** beim Umbruch mitten in einer Tabelle wird `table-header`
  als erster Block der neuen Seite neu ausgegeben.
- **Kein Waisenkind:** eine einzelne Tabellenzeile oder Überschrift am Seitenende wird auf
  die nächste Seite geschoben (Mindestrest 2 Zeilen vor der Fußzeile — R-014, [[abstaende-und-raster]] §6).
- **Seitenzahlen** werden erst nach vollständiger Pagination gesetzt (`m` steht erst dann fest).

## Beispiel A — Stundennachweis

| Zone | Platzierung |
| --- | --- |
| Header | fest: Wortmarke `colX(1)` / Monogramm rechtsbündig `colRight(12)` / Titelblock rechtsbündig, Linien bei `bl(5) / bl(7) / bl(9)`, spannen nur unter dem Titelblock (x ≈ 122,65–195 mm), nicht volle Breite |
| Metadaten-Block | Erstseite: Labels ab `bl(12)` (= Kopf-Linie `bl(9)` + 3 BL). **Korrektur ggü. Erstplanung:** AUFTRAG- und PROJEKT-Block stehen **untereinander** (nicht nebeneinander bei `colX(3)`/`colX(8)`), beide linksbündig ab `colX(3)`, mit 3 BL Abstand darüber (ab Kopf-Linie `bl(9)`) und 3 BL darunter (zur Tabelle). Gilt nur für dieses Layout — die Rechnung bekommt ihr eigenes Grid, keine automatische Übernahme. |
| Tabellenkopf | Erstseite: **dynamisch** = letzte Metadaten-Zeile + 1 + 3 BL (mind. `bl(19)`) — wächst mit, wenn Bezeichnung/Adresse mehrzeilig sind, damit der 3-BL-Abstand immer stimmt. Folgeseite fest `bl(12)` (= Header + 3 BL). Spalten: DATUM `colX(1)` · TÄTIGKEIT `colX(3)` · BEARBEITER `colX(8)` · ZEITAUFWAND rechtsbündig `colRight(12)` |
| Zeilen | Fluss: je 2 BL, Graulinie unten. Überlauf → neue Seite, Tabellenkopf neu. TÄTIGKEIT-Text darf die Spaltenbreite nicht überschreiten (Breite messen statt Zeichen zählen, s. u.) — **Stundennachweis-spezifisch**, siehe [[regel-register]] O-014 |
| `Gesamt` | steht nur auf der letzten Seite, direkt unter der letzten Tabellenzeile (kein fixer mm-Wert) — **Stundennachweis-spezifisch**, siehe [[abstaende-und-raster]] §6 und [[regel-register]] O-012. Global gilt nur: mind. 2 BL Abstand zur Fußzeile (R-014). Label `colX(8)`, Wert rechtsbündig `colRight(12)` |
| Footer | fest: 2 Zeilen `bl(57) / bl(58)`, 5 Blöcke bei `colX(1/3/6/8)` + Seitenangabe rechtsbündig |

## Beispiel B — Rechnung

Gebaut in `tool/rechnung.html` (2026-09-11), Vermessung in [[STEP2_RECHNUNG_FINDINGS]],
Klärungen mit Ann siehe DECISIONS.md. Gleiches Skelett (Header/Footer fest wie Beispiel A),
anderer Body — **im Fluss, cursorbasiert (`computeLayout()`)**, nicht fest positioniert:

1. Empfänger-Adresse: `colX(1)` (linksbündig, **nicht** `colX(3)` wie der Stundennachweis-
   Metadatenblock), Start `bl(9) + 3 BL` (letzte Kopf-Linie + Blockabstand), 1 BL je Zeile.
2. `+ 3 BL` → Anrede (1 Zeile), `colX(1)`.
3. `+ 1 BL` (Leerzeile nach Anrede) → Einleitung, `colX(1)`, **Wortumbruch** über die volle
   Satzbreite (180 mm) — gemessen per Canvas, gemeinsame Funktion `wrapLines()` für Vorschau
   **und** PDF-Wortumbruch (jsPDF), s. R-012-Prinzip (zwei Renderer, keine Auto-Sync).
4. `+ 2 BL` → `table-header` **POS · LEISTUNG · ABRECHNUNGSART · MENGE · SATZ NETTO ·
   GESAMT NETTO** (`colX(1)` · `colX(2)` · `colX(6)` · `colX(8)` · rechtsb. `colX(11)` ·
   rechtsb. `colRight(12)`/195 mm). MENGE **linksbündig** (nicht rechtsbündig — Ann,
   2026-09-11: „soll so", da Text+Zahl gemischt, z. B. „400 Std.").
5. `table-row` × n, **2 BL, lückenlos direkt aufeinander** — keine Leerzeile zwischen
   Positionen (Ann, 2026-09-11: „da hast du einen Fehler entdeckt, keine Zeile Platz
   dazwischen" — das ursprüngliche Illustrator-Template hatte an zwei Stellen eine leere
   Zeile, das war kein Gestaltungsmittel, sondern ein Fehler in der Vorlage).
6. `totals-block` **direkt** im Anschluss an die letzte Tabellenzeile, kein Extra-Abstand
   (Label `colX(8)`, Wert rechtsbündig 195 mm, 1 BL je Zeile): „Gesamt netto" **fett**,
   „MwSt. n%" und „Gesamt brutto" **nicht fett** (Ann, 2026-09-11: „ja, das soll so sein" —
   bewusst nur die Netto-Zwischensumme hervorgehoben). Abschlusslinie `colX(8)`–195 mm.
   Werte sind **berechnet** (Summe der Positionsbeträge × MwSt.-Satz), nicht aus der Vorlage
   übernommen — die Beispielwerte dort waren rechnerisch inkonsistent.
7. `+ 3 BL` → Schlusstext (Wortumbruch wie Einleitung).
8. `+ 2 BL` → Grußformel, `+ 1 BL` → Absendername.
9. `+ 3 BL` → Bankverbindungs-Block: Linie `colX(1)`–`colX(8)`, 3 Zeilen (Name/IBAN/BIC),
   Linie — spiegelt die Breite des Kopf-Titelblocks (dort `colX(8)`–195 mm) auf der linken Seite.

Überlauf: nur die Tabelle paginiert (dieselbe `paginate()`-Mechanik wie Beispiel A,
Tabellenkopf wird wiederholt); Empfänger/Anrede/Einleitung nur auf Seite 1, Summenblock +
Schlusstext + Bankblock nur auf der letzten Seite — deren Platzbedarf wird vorab berechnet
(`postRows`) und bei der Zeilenkapazität pro Seite mit reserviert, wie die Summenzeile im
Stundennachweis (`reserveTotal`-Parameter in `capFor()`).

## Warum absolute mm statt normalem HTML-Fluss / CSS-Grid

- **Rastertreue:** absolute mm garantiert, dass jede Grundlinie exakt sitzt — auf jeder Seite,
  in Vorschau und PDF gleich.
- **Kontrollierter Umbruch:** die Engine entscheidet, nicht `break-inside` des Browsers
  (unzuverlässig für exakte Raster). Ergebnis ist deterministisch.
- **Vorschau = PDF:** ein Renderer für beides.
- **Preis:** wir rechnen das Layout selbst — das ist die „Engine". Gleiches Prinzip wie der
  Bauzeitenplan, der seinen Gantt selbst zeichnet.

## Verworfene Alternative

Server-seitige PDF-Bibliothek (pdfkit / ReportLab): dann kein „Vorschau = PDF" mehr und
Textumbruch müsste neu implementiert werden. HTML + Chromium liefert WYSIWYG gratis.
