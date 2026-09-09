# STEP 1 — Reverse-Engineering des Document Design Systems

> Stand: 2026-09-09
> Quellen: `design-sources/PAPER Templates_ A4_vertical.pdf` (5 Seiten, 3 Dokumenttypen)
> `design-sources/Bildschirmfoto 2026-09-09 um 21.08.49.png` (Grid-Underlay aus **grids.taras.ee**)

Alle Maße aus dem PDF vermessen (PyMuPDF, mm bei 1 pt = 0,3528 mm). Guide-Layer waren im
Export sichtbar: **cyan = Baseline-Grid**, **magenta = Spalten-Grid + Satzspiegel-Rahmen**.

---

## 0. Inhalt der Referenz-PDF

| Seite | Dokumenttyp | Seitenzahl im Dokument |
| --- | --- | --- |
| 1 | Angebot / Rechnung (Brief + Positionstabelle) | 1/6 |
| 2–4 | Baustellenbericht („Dokumentation der Baustellenbegehung") | 1/3 · 2/3 · (3/3, im Mock fälschlich 2/3) |
| 5 | **Stundennachweis** („Anlage 01_Stundennachweis") — **MVP** | 1/2 |

Es sind drei **eigenständige** Dokumente, hintereinander in eine PDF gelegt.

---

## A. Visuell / messtechnisch BESTÄTIGT

### A1 — Seite
- Format **A4 Hochformat, 210 × 297 mm** (595,28 × 841,89 pt), alle Seiten.
- Satzspiegel-Rahmen (magenta): **x 15 → 195 mm**, **y 15 → 294,8 mm**.

### A2 — Globales Grid (aus grids.taras.ee, Screenshot bestätigt die Messung)
| Parameter | Wert | Gegengemessen im PDF |
| --- | --- | --- |
| Seitenränder | oben 15 · links 15 · rechts 15 · **unten min 0 → effektiv 2,247 mm** | Rahmen 15/15/15, Unterkante 294,8 → 2,2 mm |
| Baseline-Grid | **13 pt** (≈ 4,587 mm) | 62 cyan-Linien, Abstand 4,59 mm |
| Spalten | **12** | 24 magenta-Vertikalen = 12 Paare |
| Spaltenabstand (Gutter) | **1 Baseline = 13 pt** (≈ 4,59 mm) | gemessen 4,6 mm |
| Zeilen-Module | 1 (keine vertikale Unterteilung) | — |
| Zeilenabstand (row gutter) | 1 Baseline | — |
| **Spaltenbreite (berechnet)** | **10,80 mm** | gemessen 10,8 mm |

Modul = Spalte + Gutter = **15,39 mm**. Nutzbare Satzbreite = **180 mm**.
Vertikal nutzbar: 294,8 − 15 = 279,8 mm = 61 Baseline-Einheiten.

### A3 — Typografie
- Eine Schriftfamilie: **Rota** (René Bieder). Schnitte im Einsatz: **Light, Medium, Bold**.
- Alle Textfarbe **#000000**.
- Gemessene Größen / Verwendung:

| Größe | Schnitt | Verwendung |
| --- | --- | --- |
| 10 pt | Rota Medium | Brieftext & Anrede (Angebot); Header-Titelblock; Bullet-Zeichen; Fließtext-Aufzählungen |
| 9,64 pt | Rota Medium | Fließtext & Metadaten-Werte in Baustellenbericht + Stundennachweis |
| 9,64 pt | Rota Bold | Abschnittsüberschriften Baustellenbericht („01: …") |
| 8 pt | Rota Medium | Tabellen-Kopf (Versalien) und Tabellen-Zellen |
| 8 pt | Rota Bold | Summenzeile „Gesamt"; einzelne Betragszellen im Angebot |
| 8 pt | Rota Light | Wortmarke oben links; kompletter Footer |
| 7,71 pt | Rota Medium | Metadaten-Labels („AUFTRAG:", „PROJECT:") |

- **9,64 = 10 × 0,964** und **7,71 = 8 × 0,964** → alle „krummen" Größen sind exakt **96,4 %** der
  runden Größe. Siehe Frage **C1**.
- Zeilenführung: Fließtext rastet auf **13 pt** (Baseline), d. h. 9,64/13 bzw. 10/13.
- Fließtext im Baustellenbericht ist **Blocksatz mit Silbentrennung**. Metadaten & Tabellen
  linksbündig. Zahlen/Beträge/Stunden **rechtsbündig**.
- Labels & Wortmarke in **Versalien**, leicht gesperrt.

### A4 — Linien
- Einzige sichtbare Linienfarbe: **#a7a9ac (Grau), 0,5 pt**, horizontal.
  - unter/zwischen den beiden Header-Titelzeilen: y 37,8 / 47,0 / 56,3 (auf **jeder** Seite)
  - als Trennlinie unter dem Tabellenkopf und zwischen Tabellenzeilen
- Keine vertikalen Linien, keine Zellrahmen, keine Umrandungen.
- cyan 0,25 pt und magenta 0,5 pt sind **Hilfslinien** (nicht Teil des Drucks).

### A5 — Header (auf jeder Seite gleich)
- **Wortmarke** oben links: „AN(N) ARCHITECTURE / SOLUTION", 2 Zeilen, 8 pt Rota Light,
  x = 15, Baselines y ≈ 14,6 / 19,2.
- **Monogramm „/NN"** oben rechts, groß, schwarz (Vektor), läuft zur oberen rechten Ecke.
- **Titelblock** oben rechts, rechtsbündig auf x = 195:
  - Zeile 1: Dokumenttitel, 10 pt Rota Medium, Baseline y ≈ 40,4
  - Zeile 2: „<Stadt>, <Datum>" (hier „Berlin, 08.09.2026"), 10 pt Rota Medium, Baseline y ≈ 49,6, x ≈ 169,6
  - eingefasst von Grau-Linien y 37,8 / 47,0 / 56,3 (Zeilenhöhe 9,2 mm = 2 Baselines)

### A6 — Footer (auf jeder Seite gleich)
- 2 Zeilen, 8 pt Rota Light, Baselines y ≈ 277,7 / 282,3 (Abstand 4,59 mm = 1 Baseline).
- 5 Blöcke:

| x (mm) | Spalte | Zeile 1 | Zeile 2 |
| --- | --- | --- | --- |
| 15,3 | 1 | Wilmersdorfer Str. 108 | 10627 Berlin |
| 45,8 | 3 | info@annarchitecture-studio.com | annarchitecturesolution.com |
| 91,7 | 6 | Tel.: +49 1702828889 | USt-IdNr.: DE123456789 |
| 123,1 | 8 | Ann-Kathrin Salich | Freischaffende Architektin |
| 188,8 (rechtsb. 195) | 12 | Page | `<n>/<m>` |

### A7 — Seitennummerierung
- Format **`n/m`** (aktuell/gesamt), rechtsbündig unter dem Wort „Page".
- Im Mock inkonsistent (S. 3 und S. 4 zeigen beide „2/3") → Nummer ist offenkundig
  ein automatisch zu füllendes Feld.

### A8 — Body-Einstieg
- Seiten **mit** Metadaten-Block (Baustellenbericht S. 2, Stundennachweis S. 5):
  Labels Baseline y ≈ 71,0; Werte y ≈ 75,0 / 79,6 / 84,2 (Schritt 4,59).
- **Folgeseiten ohne** Metadaten-Block (S. 3, S. 4): Inhalt beginnt direkt bei y ≈ 69.
- Erster Inhalt **nach** Metadaten-Block: y ≈ 102 (Tabellenkopf Stundennachweis y = 102,9;
  Fließtext Baustellenbericht y = 102,6).

### A9 — Stundennachweis (Seite 5) — Template-spezifisch
- **Titel:** „Anlage 01_Stundennachweis" (Titelblock-Zeile 1).
- **Metadaten-Block**, 2-spaltig, eingerückt auf **Spalte 3 (x ≈ 46)**:
  - links **AUFTRAG:** → Auftragsnummer (`OFF_KHP_N_01_260301`) + Auftragsbezeichnung
    (`Nachtrag 01 – Bodenmarkierungsplanung`)
  - rechts **PROJEKT:** (x ≈ 123, Spalte 8) → Projektname + Straße + PLZ/Ort
- **Tabelle**, volle Breite ab **x = 15**, Kopf Baseline y = 102,9, Grau-Linie darunter:

| Spalte | x (mm) | Grid-Spalte | Ausrichtung |
| --- | --- | --- | --- |
| DATUM | 15,3 | 1 | links |
| TÄTIGKEIT | 45,9 | 3 | links |
| BEARBEITER | 123,0 | 8 | links |
| ZEITAUFWAND | rechtsbündig ~195 | 12 | rechts |

- **Zeilenhöhe 9,17 mm** (= 2 Baselines). Grau-Trennlinie 0,5 pt zwischen den Zeilen.
- Datenzellen 8 pt Rota Medium. Stundenwert Format `0,00 Std.`
- **Summenzeile** „Gesamt" 8 pt Rota **Bold**, Label bei x ≈ 123 (unter BEARBEITER),
  Wert rechtsbündig ~195. **Baseline y ≈ 256,6** — also **fix am unteren Rand des
  Satzspiegels verankert**, nicht direkt unter der letzten Datenzeile (bei nur 2 Zeilen
  bleibt dazwischen eine große Lücke). Siehe Frage **C4**.
- Im Mock zeigt Spalte „DATUM" die Werte `01`, `02` (fortlaufende Nummer, kein Datum). Frage **C5**.

### A10 — Angebot / Rechnung (Seite 1) — Template-spezifisch (nur grob, nicht MVP)
- Kopf-Titel: „Rechnungsnr.: <ID>" + „<Stadt>, <Datum>".
- Empfängeradresse ab linkem Rand (x = 15), 10 pt — Briefkopf-Stil (kein Metadaten-Block).
- Anrede, Einleitungsabsatz, Positionstabelle, Summenblock, Schlussabsatz, Grußformel,
  Bankverbindung (IBAN/BIC) — alles am linken Rand.
- Positionstabelle: **POS. | LEISTUNG | ABRECHNUNGSART | MENGE | SATZ NETTO | GESAMT NETTO**
  (x ≈ 15 / 31 / 92 / 123 / 154 / 177; Beträge rechtsbündig).
- Summenblock: „Gesamt netto / MwSt. 19 % / Gesamt brutto", Label ab x ≈ 123, Werte rechtsbündig.
- `*` / `**` Fußnoten-Marker an einzelnen Beträgen.

### A11 — Baustellenbericht (Seiten 2–4) — Template-spezifisch (nicht MVP)
- Metadaten-Block **3-spaltig**: PROJECT (x ≈ 46) · ATTENDEES (x ≈ 92) · DATE & LOCATION (x ≈ 154).
- Einleitungsabsatz, dann nummerierte Abschnitte „01: <Überschrift>" (Rota Bold) + Blocksatz-Text.
- Aufzählungen: `•` bei x ≈ 46 (Spalte 3), Text bei x ≈ 61 (Spalte 4, +15 mm).
- **Vollbild-Bild**: x 15 → 195, Höhe variabel, auf Grid gesetzt (S. 3).
- Folgeseiten: nur Header-Titelblock + Footer wiederholt, Inhalt läuft weiter.

---

## B. Plausibel ABGELEITET (nicht explizit belegt)

- **B1** Bemaßung in **Millimetern**; Grid stammt 1:1 aus grids.taras.ee mit den in A2 genannten Werten.
- **B2** Der „Satzspiegel" reicht bis y = 294,8; der Footer sitzt **innerhalb** des Grids auf den
  Baselines 57–58 (von 61). Es gibt keinen separaten Footer-Rand — der Footer ist die
  letzte Grid-Zone. Untere „echte" Weißfläche = 2,25 mm bis Blattkante.
- **B3** Header-Zone = y 0 … ~56 (bis zur unteren Grau-Linie). Body-Zone Erstseite = y ~60 … ~270.
  Footer-Zone = y ~275 … 285.
- **B4** Metadaten-Block ist ein **gemeinsames globales Bauteil** mit variabler Spaltenzahl
  (2 beim Stundennachweis, 3 beim Baustellenbericht), immer eingerückt auf Spalte 3,
  Label 7,71 pt Versalien + Werte 9,64 pt, Zeilenschritt 1 Baseline.
- **B5** Tabellenzeile = **2 Baselines (9,17 mm)** ist die Grundeinheit für alle Tabellen
  (Angebot wie Stundennachweis nutzen denselben ~9,2-mm-Zeilentakt).
- **B6** Header-Titelblock und Footer sind **wiederholte Seitenelemente** und auf jeder Seite
  positionsgleich (Messwerte über alle 5 Seiten identisch ± 0,3 mm).
- **B7** Spaltenzuordnung der Tabellen richtet sich am 12-Spalten-Grid aus
  (DATUM=Sp.1, TÄTIGKEIT=Sp.3, BEARBEITER=Sp.8, ZEITAUFWAND=Sp.12).
- **B8** „Gesamt"-Zeile des Stundennachweises ist an den **unteren Satzspiegelrand** gebunden
  (fixe Position), unabhängig von der Zeilenzahl — zumindest auf der letzten Seite.

---

## C. UNKLAR — Bestätigung von Ann nötig

- **C1 — Schriftgrößen 96,4 %.** Sind 10 pt / 8 pt die Sollwerte und 9,64 / 7,71 nur ein in
  Illustrator skalierter Gruppen-Rahmen? Oder ist die 96,4-%-Stufe Absicht? → Ich würde
  **10 / 9 / 8 / 7 pt** als saubere Skala vorschlagen. Welche Größe hat welche Rolle exakt?
- **C2 — Zeilenabstand exakt.** Baseline = **13 pt** bestätigt. Welcher konkrete
  Zeilenabstandswert für welchen Textstil (Fließtext, Tabellen, Metadaten, Footer)?
  Alles auf 13 pt, oder Footer/Tabellen enger?
- **C3 — Farben.** In diesen 3 Templates nur Schwarz + Grau #a7a9ac. Gibt es eine
  Marken-/Akzentfarbe (z. B. für Rechnung, Status, Links) oder ist das System bewusst
  rein schwarz-grau? Gibt es definierte Grautöne/Abstufungen?
- **C4 — „Gesamt"-Zeile.** Immer fix am unteren Satzspiegelrand? Was, wenn die Tabelle
  über mehrere Seiten geht — Summe nur auf der letzten Seite unten? Zwischensummen je Seite?
- **C5 — Spalte „DATUM" im Stundennachweis.** Im Mock stehen dort `01`, `02`. Soll die
  Spalte ein **echtes Datum** (pro Zeiteintrag) enthalten, oder eine laufende Positionsnummer,
  oder beides (Nr. + Datum)?
- **C6 — Umbruchregeln Tabelle.** Wenn mehr Zeilen als auf eine Seite passen: Tabellenkopf
  auf Folgeseite wiederholen? Ab welcher y-Position bricht der Body auf Folgeseiten um
  (bestätigt ~69 mm) und wo endet er unten (über dem Footer — welche y)?
- **C7 — Metadaten-Block Stundennachweis.** Feste Felder? Brief nennt: Projekt, Kunde,
  Auftrag, Dokumentdatum, Ort, Titel, Zeitraum, Zusatzinfos. Im Mock sichtbar: AUFTRAG
  (Nr. + Bez.) und PROJEKT (Name + Adresse). Wo stehen Kunde, Zeitraum, Ort, Zusatzinfos?
  Kommt ein „ZEITRAUM"-Feld dazu?
- **C8 — Header-Titel Herleitung.** Zeile 1 = Dokumenttitel (frei? aus Dokumenttyp +
  laufender Nummer wie „Anlage 01_…"?). Zeile 2 = immer „<Stadt>, <Dokumentdatum>"?
  Ist die Stadt immer „Berlin"?
- **C9 — Monogramm & Wortmarke.** Brauche die Vektor-Assets (SVG/AI) für „/NN" und die
  Wortmarke sauber — im PDF sind sie in Pfade zerlegt. Exakte Position/Größe des Monogramms?
- **C10 — Fonts.** Rota-Font-Dateien (Light/Medium/Bold) für die Umsetzung — Lizenz/Web-Font
  vorhanden? Fallback-Schrift?
- **C11 — Weitere Dokumenttypen.** Für das globale System später hilfreich: je ein Beispiel
  für Angebot (vollständig), Nachtragsangebot, Projektdokumentation, Baudokumentation.
  Nicht blockierend für den MVP.
- **C12 — Grid-Details.** Row-gutter / rows im grids.taras.ee-Screenshot stehen auf 1 / 1 —
  bestätigst du: keine vertikale Modulteilung, nur das Baseline-Grid vertikal?
- **C13 — Druck vs. Bildschirm.** Sollen cyan/magenta je exportiert werden? (Annahme: nein,
  reine Arbeitshilfe.) Randlos-Bleed nötig (Monogramm läuft an die Kante)?

---

## Nächste Schritte

1. Ann beantwortet C1–C13 (mindestens C1, C3–C8 für den MVP).
2. Danach STEP 3: `docs/document-design-system/` (Grid, Typo, Farben/Linien, Komponenten,
   Pagination) + `docs/templates/TIME_SHEET.md` schreiben.
3. Parallel STEP 4: AppSheet-/Sheets-Datenmodell (Timetracker) auswerten.
