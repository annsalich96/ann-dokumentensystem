# STEP 2 — Reverse-Engineering der Rechnung/Angebot-Vorlage

> Stand: 2026-09-11
> Quellen: `design-sources/rechnung/Template_Rechnung.pdf` + `..._grid.pdf` (identischer Inhalt,
> zweite Datei mit Grid-Underlay zur Kontrolle)
> Methode: PyMuPDF, exakte Text- und Linien-Koordinaten aus der PDF extrahiert (kein Augenmaß),
> in mm und Rastereinheiten (k = Grundlinie, `bl(k) = 15 + k·4,5861mm`) umgerechnet.
> Verknüpft: [[grid-system]] · [[typografie]] · [[abstaende-und-raster]] · [[header-footer]] ·
> [[layout-technik]] (Beispiel B) · [[regel-register]]

---

## 0. Kurzfassung

Grid, Header, Footer, Linienfarbe/-stärke und Text-Größenskala sind **identisch** zum
Stundennachweis (gleiches globales Grid, siehe [[grid-system]]). Neu bei diesem Dokumenttyp:
Empfänger-Adresse, Brieftext (Anrede/Absätze), Positionstabelle mit 6 statt 4 Spalten,
Summenblock mit 3 Zeilen (netto/MwSt/brutto), Signatur- und Bankverbindungsblock. Alles
**vollständig gemessen**, nur wenige Punkte sind noch offen (siehe §6).

---

## 1. Was bestätigt global aus dem Stundennachweis übernommen ist

| Element | Messwert Rechnung | Referenz |
| --- | --- | --- |
| Wortmarke | `bl(0)`/`bl(1)`, Rota Light 8pt, `colX(1)` | identisch, R-013 |
| Monogramm | rechte Kante 195mm, Oberkante 15mm | identisch |
| Kopf-Linien | 3 Stück bei **`bl(5)`, `bl(7)`, `bl(9)`**, x = 122,7–195,1mm, 0,5pt, `#a7a9ac` | identisch zu Stundennachweis (R-008) |
| Titelzeile (rechtsbündig) | `Rechnungsnr.: OFF_GUN_02_260908` bei `bl(5,5)`, rechtsbündig 195mm | Slot wie `doc-title`, aber **anderer Feldname** (s. §6.1) |
| Ort/Datum | `Berlin, 08.09.2026` bei `bl(7,5)`, rechtsbündig 195mm | identisch |
| Footer | Zeile 1 bei **`bl(57)`** (277,72mm), Zeile 2 bei **`bl(58)`** (282,31mm) | identisch, R-015 |
| Linienfarbe/-stärke | alle Linien 0,5pt, RGB (167,169,172) = `#a7a9ac` | identisch, R-008 |
| Grid | 12 Spalten, `colX(n) = 15 + (n-1)·15,3818mm`, Satzspiegel 15–195mm | identisch |

**Fazit:** Header/Footer/Grid/Linien brauchen keine neue Regel — direkt aus dem bestehenden
Design-System übernehmbar, keine Abweichung gefunden.

---

## 2. Empfänger-Adresse (neu bei diesem Dokumenttyp)

```
Robert Bräunlin                      bl(10)
Bräunlin Kolb Architekten GmbH       bl(11)
Burgfelderstrasse 211                bl(12)
4055 Basel                           bl(13)
```

- **Linksbündig an `colX(1)` (15mm)** — **nicht** an `colX(3)` wie der Stundennachweis-
  Metadatenblock. Klassische Brief-Empfängeradresse an der Satzspiegelkante.
- Rota Medium 10pt, 1 BL Zeilenabstand.
- Beginnt bei `bl(10)` = 1 BL unter der letzten Kopf-Linie (`bl(9)`) — **enger** als beim
  Stundennachweis (dort 3 BL, R-014-Nachbarregel). Zu klären, siehe §6.2.

## 3. Brieftext

```
Sehr geehrter Herr Bräunlin,                         bl(17)  ┐ Anrede
                                                              │ (Lücke 2 BL = 1 Leerzeile)
vielen Dank für Ihr Vertrauen und die Möglichkeit,           bl(19)  Einleitungssatz (1 Zeile)
Ihr Projekt „Gundilitor" in Basel gemeinsam mit
Ihnen weiterzuentwickeln.
```

- Abstand Adressblock-Ende (`bl(13)`, letzte Zeile) → Anrede (`bl(17)`): **4 BL** (3 BL Lücke).
- Abstand Anrede → Einleitungssatz: **2 BL** (1 BL Lücke, klassischer „Leerzeile nach Anrede"-Abstand).
- Linksbündig `colX(1)`, Satzbreite volle 12 Spalten (bis ~195mm, zeilenumbruch bei Bedarf).
- Rota Medium 10pt.
- **Nach der Tabelle folgt ein zweiter Absatz + Grußformel** (siehe §5) — der Brieftext ist
  um die Tabelle „herumgebaut", nicht komplett vor ihr abgeschlossen.

## 4. Positionstabelle

### 4.1 Spalten (gemessen)

| Spalte | Ausrichtung | linke/rechte Kante | Inhalt-Beispiel |
| --- | --- | --- | --- |
| POS. | links | `colX(1)` = 15mm | `01` |
| LEISTUNG | links | `colX(2)` ≈ 30,4mm, Breite ≈ 4 Spalten (bis vor `colX(6)`) | „Phase 02 — Entwurfsausarbeitung" |
| ABRECHNUNGSART | links | `colX(6)` ≈ 91,9mm | „Zeithonorar" / „pauschal" |
| MENGE | **links** (nicht rechtsbündig!) | `colX(8)` ≈ 122,7mm | „400 Std." / „1" |
| SATZ NETTO | rechtsbündig | Kante ≈ **`colX(11)`** = 168,8mm (nicht `colRight(10)`!) | „90,00 €" |
| GESAMT NETTO | rechtsbündig | Kante = rightEdge 195mm (`colRight(12)`) | „6.000,00 €" |

- Tabellenkopf (Versalien, Rota Medium 8pt) bei `bl(22)`, wie beim Stundennachweis in Versalien
  mit `--tshift-caps`.
- MENGE ist bewusst **linksbündig**, weil der Wert Text+Einheit gemischt enthält („400 Std.",
  „1", „2") — anders als beim Stundennachweis, wo ZEITAUFWAND eine reine Zahl+Einheit war und
  rechtsbündig lief. **Zu bestätigen, siehe §6.3.**

### 4.2 Linien / Zeilenraster (gemessen, wichtiger Befund)

Volle-Breite-Linien (`colX(1)`–195mm) bei: `bl(22), bl(23), bl(25), bl(27), bl(29), bl(31),
bl(33), bl(35), bl(37)` — **alle 2 BL, durchgehend**, unabhängig davon, ob dort eine
Position mit Inhalt steht.

Tatsächlicher Inhalt sitzt nur in **4 von 7 möglichen 2-BL-Zeilenbändern**:

| Zeilenband | Inhalt | Abstand zur vorherigen Position |
| --- | --- | --- |
| `bl(23)–bl(25)` | 01 „Phase 02 — Entwurfsausarbeitung" | — (erste Zeile) |
| `bl(25)–bl(27)` | 02 „Phase 03 — Spezifikationsplanung" | **0** — direkt nach 01 |
| `bl(27)–bl(29)` | *(leer, nur Linie gezogen)* | — |
| `bl(29)–bl(31)` | 03 „Phase 01: Konzeptentwicklung" | **1 leeres Zeilenband** (2 BL) vor 03 |
| `bl(31)–bl(33)` | *(leer, nur Linie gezogen)* | — |
| `bl(33)–bl(35)` | 04 „Mieterszenarioplanung" | **1 leeres Zeilenband** (2 BL) vor 04 |
| `bl(35)–bl(37)` | *(leer)* | — |

**Wichtig:** Das könnte zweierlei bedeuten — entweder (a) ein **bewusstes Design**: jede
Position bekommt eine Leerzeile Abstand zur nächsten, außer 01+02 gehören erkennbar
zusammen (beide „Zeithonorar", direkt aufeinanderfolgende Phasen) — oder (b) die Illustrator-
Datei ist ein **liniertes Formularraster** (wie kariertes Papier) mit mehr vorgezogenen
Linien als Inhalt, und die Lücken sind nur, weil die Beispieldaten nicht jede Zeile gefüllt
haben (genau das Problem, das beim Stundennachweis-PDF-Export als Bug behoben wurde —
Zeilen nur für echten Inhalt zeichnen, keine leeren Formularlinien). **Muss Ann klären, siehe §6.4.**

### 4.3 Summenblock

```
                                  Gesamt netto      9.000,00 €     bl(37)  [BOLD]
                                  MwSt. 19%         1.810,00 €     bl(38)
                                  Gesamt brutto    17.810,00 €     bl(39)
                                  ──────────────────────────────   bl(41), x: colX(8)–195mm
```

- Direkt im Anschluss an die letzte Tabellenzeile (deren Trennlinie bei `bl(37)` dient
  zugleich als obere Begrenzung), **kein Extra-Abstand** — passt zur (Stundennachweis-
  spezifischen, hier evtl. übertragbaren) Regel „Summe direkt unter letzter Zeile".
  Genau **das** war beim Stundennachweis als „nicht automatisch global" eingestuft (O-012) —
  hier zeigt sich, dass Rechnung dieselbe Regel offenbar auch will.
- Label-Spalte `colX(8)` (wie beim Stundennachweis `total.labelCol`), Werte rechtsbündig 195mm.
- Zeilenabstand **1 BL** (enger als die 2-BL-Tabellenzeilen — Summenblock ist kompakter gesetzt).
- **Nur „Gesamt netto" ist fett (Rota Bold)** — „MwSt. 19 %" und „Gesamt brutto" sind Rota
  **Medium** (nicht fett). Unerwartet: normalerweise würde man den *Brutto*-Endbetrag
  hervorheben, nicht den Netto-Zwischenwert. **Zu bestätigen, siehe §6.5.**
- Abschlusslinie 0,5pt bei `bl(41)`, x von `colX(8)` bis 195mm — exakt wie
  `DS.total`-Muster im Stundennachweis (nur dort ohne Linie am Ende, hier mit).

## 5. Nach der Tabelle: Schlusstext, Signatur, Bankverbindung

```
Gerne unterbreiten wir Ihnen im Folgenden unser Angebot für die weiterführenden Leistungen.
Das vorliegende Dokument umfasst Angebotspositionen für die Innenraumplanung im Erdgeschoss,
die Gestaltung der Erdgeschossfassaden sowie.                                    bl(44), 2 Zeilen

Mit freundlichen Grüßen,                                                          bl(47)
Ann-Kathrin Salich                                                                bl(48)

────────────────────────────────────────────  Linie, x: colX(1)–colX(8) (122,7mm)  bl(51)
Ann-Kathrin Salich                                                                 bl(51)
IBAN: DE66 1001 1001 2590 9000 54                                                  bl(52)
BIC: NTSBDEB1XXX                                                                   bl(53)
────────────────────────────────────────────  Linie, gleiche x-Breite              bl(54)
```

- Schlusstext + Grußformel: linksbündig `colX(1)`, volle Breite, Rota Medium 10pt — inhaltlich
  wirkt der Text hier wie ein **Angebotstext** („unser Angebot für die weiterführenden
  Leistungen"), nicht wie eine Rechnung. Vermutlich Platzhaltertext aus einer
  Angebotsvorlage, der nicht 1:1 für „Rechnung" übernommen werden soll — **zu klären, siehe §6.1**.
- Signatur-/Bankblock: **eigene Box**, oben und unten von einer 0,5-pt-Linie eingefasst,
  x-Breite `colX(1)`–`colX(8)` (122,7mm) — spiegelt die Breite des Kopf-Titelblocks
  (`colX(8)`–195mm), nur auf der linken Seite. Rota Medium 8pt, 1 BL Zeilenabstand.
- Abstand Signaturzeile (`bl(48)`) → Bankblock-Linie (`bl(51)`): 3 BL — passt zum
  wiederkehrenden „3 BL zwischen Blöcken"-Muster (Ann, 2026-09-11, siehe R-014-Nachbarschaft).

## 6. Offene Punkte — von Ann zu klären, bevor gebaut wird

1. **Titel/Feldname:** Der rechtsbündige Titel-Slot zeigt „Rechnungsnr.: OFF_KHP_N_01_260301"-
   artige Werte — ist das Feld für **Rechnung** immer `Rechnungsnr.: <Nummer>`, oder soll es
   wie beim Stundennachweis ein freier Titel sein? Und: der Fließtext im Dokument spricht
   durchgängig von „Angebot", nicht „Rechnung" — ist das nur Platzhaltertext aus einer
   Angebotsvorlage (dann für den echten Rechnungstext ignorieren), oder ist diese Vorlage in
   Wahrheit eine **Angebotsvorlage**, keine Rechnung? Das würde einiges erklären (z. B. warum
   „Sehr geehrter Herr..." + Leistungsbeschreibung eher zu einem Angebot passt als zu einer
   Rechnung, die eher auf bereits erbrachte Leistungen verweist).
2. **Abstand Kopf → Adresse:** nur 1 BL (Adresse bei `bl(10)`, Kopf-Linie bei `bl(9)`) — bewusst
   enger als beim Stundennachweis-Metadatenblock (3 BL)? Oder soll hier auch 3 BL gelten?
3. **MENGE linksbündig statt rechtsbündig** — Absicht (weil Text+Zahl gemischt, z. B.
   „400 Std.") oder sollte es wie beim Stundennachweis rechtsbündig sein?
4. **Leerzeilen zwischen Positionen in der Tabelle** (§4.2) — bewusstes Gestaltungsmittel
   (Luft zwischen einzelnen Rechnungspositionen) oder Artefakt eines vorgezeichneten
   Formularrasters, das nicht 1:1 übernommen werden soll (so wie die leeren Zeilenlinien im
   ersten Stundennachweis-Entwurf, die später bewusst entfernt wurden)?
5. **Nur „Gesamt netto" ist fett, nicht „Gesamt brutto"** (§4.3) — Absicht oder Formfehler in
   der Vorlage? Für eine Rechnung wäre „Gesamt brutto" (der zu zahlende Endbetrag) der
   naheliegendere Kandidat für die Hervorhebung.
6. **Datenherkunft der Empfänger-Adresse und der Positionen** — kommt der Empfänger aus
   `Clients`/`Collaborators` (siehe `stundennachweis-datenquellen.md`) oder aus einem neuen
   Datenbereich? Die Positionstabelle (LEISTUNG/ABRECHNUNGSART/MENGE/SATZ) hat keine
   offensichtliche 1:1-Entsprechung im bisher bekannten AppSheet-Datenmodell (`Services` hat
   z. B. keinen Satz/Preis) — das ist vermutlich der nächste große Datenmodellierungs-Schritt,
   analog zu `docs/data/stundennachweis-datenquellen.md`.

## 7. Nicht neu vermessen (aus Stundennachweis übernommen, keine Abweichung gefunden)

- 12-Spalten-Grid, Baseline 13pt, Ränder 15mm — [[grid-system]]
- Schriftfamilie/-schnitte, Größenskala 10/8pt — [[typografie]]
- Linienfarbe/-stärke `#a7a9ac` 0,5pt — R-008
- Header-/Footer-Fixpositionen — [[header-footer]]
