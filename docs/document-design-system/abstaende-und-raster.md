# Abstände und vertikaler Rhythmus

> Letzte Aktualisierung: 2026-09-09
> Verknüpft: [[grid-system]] · [[typografie]] · [[header-footer]] · [[regel-register]] · [[allgemeine-systemregeln]]

## Status

**Aus der Designquelle vermessen** (`STEP1_FINDINGS.md`, alle 5 PDF-Seiten). Die vertikalen
Abstände zwischen Dokumentbausteinen sind fast durchgehend **glatte Vielfache des
13-pt-Grundrasters** — das ist die tragende Regel. Einzelwerte, die nicht glatt aufgehen,
sind unten markiert und mit Ann zu bestätigen.

---

## 1. Die eine Einheit

| Einheit | Wert |
| --- | ---: |
| **1 BL** (Grundraster / Baseline) | **13 pt = 4,586 mm** |
| 2 BL | 26 pt = 9,172 mm |
| 3 BL | 39 pt = 13,758 mm |
| 4 BL | 52 pt = 18,344 mm |

Jede Textgrundlinie und jede horizontale Linie rastet auf ein Vielfaches von 1 BL, gezählt
ab dem oberen Rand (15 mm). Die Satzhöhe umfasst **61 BL** (15 mm → 294,76 mm).

## 2. Vertikale Abstands-Skala (Tokens)

| Token | Wert | Verwendung (belegt) |
| --- | ---: | --- |
| `v-line` | 1 BL | Zeile → Zeile · Label → Wert · Überschrift → zugehöriger Body · Absatz → Absatz |
| `v-section` | 2 BL | Abschnitt → nächster Abschnitt · Tabellen-Zeilenhöhe · Höhe einer Header-Titelzeile |
| `v-header-gap` | 3 BL | Unterkante Header-Block → erster Inhalt (Erstseite **und** Folgeseite) |
| `v-block` | 4 BL | Metadaten-Block → folgende Tabelle / folgender Body |

> Keine „halben" Abstände. Wenn Inhalt nicht aufgeht, wird auf das nächste volle BL gerundet.

## 3. Vertikale Zonen der Seite (ab Oberkante)

| Zone | von | bis | Höhe | Inhalt |
| --- | ---: | ---: | ---: | --- |
| Oberer Rand | 0 mm | 15 mm | — | frei |
| **Header** | 15 mm (0 BL) | ~56,3 mm (9 BL) | 9 BL | Wortmarke · Monogramm · Titelblock (2 Zeilen, 3 graue Linien bei 5 / 7 / 9 BL) |
| `v-header-gap` | 9 BL | 12 BL | 3 BL | Leerraum |
| **Body** | ~12 BL | ~52 BL | variabel | Metadaten-Block (falls Erstseite) + Dokumentinhalt |
| **Summen-/Abschlusszone** | ~52–54 BL | — | ~2 BL | z. B. „Gesamt" (nur letzte Seite, fixe Position — *zu bestätigen, siehe §5*) |
| **Footer** | ~57,3 BL (277,7 mm) | ~58,3 BL (282,3 mm) | 2 Zeilen | 5 Blöcke, siehe [[header-footer]] |
| Rasterrest | 61 BL (294,76 mm) | 297 mm | 2,25 mm | frei, kein Bleed |

## 4. Bausteinabstände im Detail (vermessen, in BL)

| Übergang | Abstand | Sauber? |
| --- | ---: | :--: |
| Header-Linie → Header-Linie | 2 BL | ✓ |
| Header-Block Unterkante (9 BL) → Metadaten-Label bzw. erster Body (Folgeseite) | 3 BL | ✓ (2,85–3,21) |
| Metadaten-Label → Metadaten-Wert 1 | ~1 BL (Label ist T8, sitzt eng darüber) | ~ |
| Metadaten-Wert → Metadaten-Wert | 1 BL | ✓ |
| Letzter Metadaten-Wert → Tabellenkopf / Body | **4 BL** | ✓ (4,02–4,08) |
| Abschnittsüberschrift → zugehöriger Body | 1 BL | ✓ |
| Abschnitt (Textende) → nächste Abschnittsüberschrift | 2 BL | ✓ |
| Body-Zeile → Body-Zeile | 1 BL | ✓ |
| Aufzählungszeile → Aufzählungszeile | 1 BL | ✓ |
| Tabellen-Zeile → Tabellen-Zeile (Grundlinienabstand) | 2 BL | ✓ |
| Footer-Zeile 1 → Footer-Zeile 2 | 1 BL | ✓ |

## 5. Horizontale Einrückung (offen — Ann-Entscheidung nötig)

Zwei Muster in der Quelle:

| Muster | linke Kante | belegt bei |
| --- | ---: | --- |
| **Volle Breite** | Spalte 1 (15 mm) | Tabellen (Stundennachweis, Angebot) · Brieftext im Angebot |
| **Eingerückt** | Spalte 3 (≈ 46 mm, +2 Module) | Metadaten-Block · Fließtext + Überschriften der Baustellendokumentation |

Vorschlag zur Vereinheitlichung:
- **Metadaten-Block** immer ab Spalte 3.
- **Tabellen** immer volle Breite (Spalte 1 → 12).
- **Fließtext-Dokumente:** entweder durchgängig Spalte 1 (wie Angebot) oder durchgängig
  Spalte 3 (wie Baustellendoku) — **eine** Regel wählen. → *offen*.
- Aufzählung: `•` an der Textkante, Text +1 Modul (15,4 mm) eingerückt (belegt: `•` Sp. 3, Text Sp. 4).

## 6. „Gesamt"-Zeile (Grundfall geklärt)

Gemessen: Grundlinie bei ~52,7 BL, also **~5 BL über der ersten Footerzeile**, unabhängig von
der Zeilenzahl (bei 2 Datenzeilen bleibt darüber viel Leerraum). Am gebauten Stundennachweis
bestätigt: **kein fixer mm-Wert, sondern reservierter Platz** — die Pagination-Engine
reserviert Summenzeile + Mindestabstand zum Footer nur auf der **letzten** Seite; auf
Zwischenseiten läuft der Body bis kurz vor den Footer durch. Details: [[allgemeine-systemregeln]] §5.
Zwischensummen je Seite: weiterhin nicht belegt/offen.

## 7. Offene Punkte

1. Fließtext-Einrückung: Spalte 1 oder Spalte 3 als globale Regel? (Für Tabellen bereits
   entschieden: volle Breite/Spalte 1.)
2. ~~„Gesamt": fixe Position unten, nur letzte Seite?~~ — **geklärt**, siehe §6. Zwischensummen
   weiterhin offen.
3. Mindestabstand Bild → Text (Baustellendoku S. 3: Bild ~17 BL hoch, Abstände noch grob).
4. Absatz-zu-Absatz ist aktuell 1 BL (kein extra Weißraum). Gilt das für alle Dokumenttypen?
