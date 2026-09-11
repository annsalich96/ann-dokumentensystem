# Layout — wie eine Seite technisch aufgebaut wird

> Letzte Aktualisierung: 2026-09-09
> Verknüpft: [[01_SYSTEM_ARCHITECTURE]] · [[grid-system]] · [[abstaende-und-raster]] · [[typografie]] · [[allgemeine-systemregeln]]

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
- Für einzeilige, breitenbegrenzte Spalten (z. B. TÄTIGKEIT) hat sich im Bau eine leichtere
  Variante bewährt: reale Textbreite per Canvas `measureText` in der Dokumentschrift messen,
  statt Zeichen zu zählen — Zeichenzahl ist höchstens ein grober Richtwert. Details:
  [[allgemeine-systemregeln]] §3.

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
  die nächste Seite geschoben (Mindest­rest 2 Zeilen — Wert in [[pagination-regeln]]).
- **Seitenzahlen** werden erst nach vollständiger Pagination gesetzt (`m` steht erst dann fest).

## Beispiel A — Stundennachweis

| Zone | Platzierung |
| --- | --- |
| Header | fest: Wortmarke `colX(1)` / Monogramm rechtsbündig `colRight(12)` / Titelblock rechtsbündig, Linien bei `bl(5) / bl(7) / bl(9)`, spannen nur unter dem Titelblock (x ≈ 122,65–195 mm), nicht volle Breite |
| Metadaten-Block | fest, Erstseite: Labels bei `bl(12)`. **Korrektur ggü. Erstplanung:** AUFTRAG- und PROJEKT-Block stehen **untereinander** (nicht nebeneinander bei `colX(3)`/`colX(8)`), mit 3 BL Abstand darüber (ab Kopf-Linie) und 3 BL darunter (zur Tabelle) — siehe [[allgemeine-systemregeln]] §5 |
| Tabellenkopf | fest: Erstseite `bl(19)` (= Metadaten + 4 BL), Folgeseite `bl(12)` (= Header + 3 BL). Spalten: DATUM `colX(1)` · TÄTIGKEIT `colX(3)` · BEARBEITER `colX(8)` · ZEITAUFWAND rechtsbündig `colRight(12)` |
| Zeilen | Fluss: je 2 BL, Graulinie unten. Überlauf → neue Seite, Tabellenkopf neu |
| `Gesamt` | **reservierter Platz statt fixem mm-Wert**, nur auf der letzten Seite (Engine hält Summenzeile + Mindestabstand zum Footer frei); Label `colX(8)`, Wert rechtsbündig `colRight(12)` — siehe [[allgemeine-systemregeln]] §5 |
| Footer | fest: 2 Zeilen `bl(57) / bl(58)`, 5 Blöcke bei `colX(1/3/6/8)` + Seitenangabe rechtsbündig |

## Beispiel B — Rechnung

Gleiches Skelett (Header/Footer fest), anderer Body — **im Fluss, nicht unten fixiert**:

1. `spacer` bis Anrede-Position
2. `paragraph` Anrede („Sehr geehrte…")
3. `paragraph` Einleitung
4. `table-header` **POS · LEISTUNG · ABRECHNUNGSART · MENGE · SATZ NETTO · GESAMT NETTO**
   (`colX(1)` · `colX(2)` · `colX(6)` · `colX(8)` · rechtsb. `colX(10)`-Block · rechtsb. `colRight(12)`)
5. `table-row` × n (Beträge rechtsbündig; Fußnoten-Marker `*` / `**` als hochgestellter Zusatz)
6. `totals-block` (Gesamt netto / MwSt. 19 % / Gesamt brutto) — Label `colX(8)`, Wert rechtsbündig;
   **zusammenhalten** mit der letzten Tabellenzeile (kein Umbruch dazwischen)
7. `paragraph` Schlusstext
8. `paragraph` Grußformel + Name
9. `spacer`
10. `block` Bankverbindung (IBAN / BIC), `colX(1)`

Überlauf: dieselbe Engine, Tabellenkopf wiederholen, `totals-block` nie allein auf neuer Seite.

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
