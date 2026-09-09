# DECISIONS

Architektur- und Design-Entscheidungen. Neueste oben.
Format: Entscheidung / Grund / Alternativen / Konsequenz.

---

## DECISION-007 — GitHub-Repo `annsalich96/ann-dokumentensystem` (Ann, 2026-09-09)
- **Entscheidung:** Eigenes Repo, enthält `docs/` + `tool/`. Git-Arbeitskopie = der
  Drive-Projektordner `DOKUMENTEN-SYSTEM/`. `design-sources/` (24-MB-PDF etc.) bleibt via
  `.gitignore` nur im Drive.
- **Grund:** Projekt wächst über ein einzelnes Tool hinaus (mehrere Dokumenttypen + Backend);
  Ann will „direkt auf GitHub" entwickeln.
- **Alternativen:** in bestehendes `ANN-Tools` (verworfen — Doku passt nicht dazu); nur Tool ohne Doku (verworfen).
- **Konsequenz:** Pages served `/tool`. Wenn Repo privat gestellt wird, greift GitHub Pages
  auf dem Free-Tarif nicht → dann `stundennachweis.standalone.html` (Base64-Fonts) direkt hosten.

## DECISION-006 — Rota-Fonts ins Repo + Standalone-Build (Ann, 2026-09-09)
- **Entscheidung:** Die drei Rota-OTF (`Light/Medium/Bold`) liegen unter `tool/fonts/` im Repo,
  damit das gehostete Tool sofort in Rota rendert. Zusätzlich `tool/build.py` →
  `stundennachweis.standalone.html` mit Schriften als Base64 (eine portable Datei).
- **Grund:** Ann: „will definitiv direkt Rota sehen, mache eh bald alles privat."
- **Alternativen:** Fallback-Schrift beim Hosting (verworfen); nur Standalone (ok, aber
  `tool/fonts/` wird für den Build ohnehin gebraucht).
- **Konsequenz:** Repo nicht öffentlich streuen (Rota ist gekauft). Rota-Webfont-Lizenz für
  echtes öffentliches Hosting bliebe zu prüfen — bei privatem Betrieb unkritisch.

## DECISION-005 — Header/Footer-Inhaltsregeln (Ann, 2026-09-09)
- **Entscheidung:** Footer-Seitenwort = **`Page`** (nicht „Seite"). Header-Ort = editierbares
  Feld, **Standard `Berlin`**. Datumsformat global **`TT.MM.JJJJ`**. Header-Titel wird
  „intelligent" hergeleitet, bleibt aber editierbar (Herleitung pro Dokumenttyp später).
- **Grund:** Anns direkte Vorgabe. „Page" ist im Bestand konsistent; Büro derzeit überwiegend Berlin.
- **Konsequenz:** Titel-Herleitung ist ein offener Template-Punkt; Ort/Datum kommen als
  Felder ins Dokument-Modell, nicht als feste Textkonstante.

## DECISION-004 — Linienfarbe = Brand-Grau #8C8C8C (Ann, 2026-09-09)
- **Entscheidung:** Alle Hilfslinien/Regeln (Header-Linien, Tabellenlinien) in **`#8C8C8C`**
  (Brand `--color-gray-600`), Strichstärke **0,5 pt**.
- **Grund:** Der aus der PDF gemessene Wert `#A7A9AC` war ein Export-/Illustrator-Wert; Ann
  wählt bewusst den Brand-Grauton für Konsistenz mit dem übrigen Design-System.
- **Alternativen:** Messwert `#A7A9AC` behalten (verworfen — nicht im Token-System).
- **Konsequenz:** Farbe kommt aus `design/tokens.css` (`--color-gray-600`), nicht hartkodiert.

## DECISION-003 — Typo-Skala: nur 10 pt und 8 pt (Ann, 2026-09-09)
- **Entscheidung:** Schriftgrößen im gesamten Dokumentsystem sind **ausschließlich 10 pt oder
  8 pt**, Rota in **Light / Medium / Bold**. Zeilenabstand immer 13 pt (1 Grundraster).
- **Grund:** Anns Aussage „Schriftgröße immer 10 oder 8". Die in der PDF gemessenen
  Zwischengrößen (9,64 / 7,71 pt) sind eine in Illustrator auf 96,4 % skalierte Gruppe,
  keine Absicht.
- **Alternativen:** die gemessene 96,4-%-Stufe übernehmen (verworfen — Artefakt).
- **Konsequenz:** `docs/document-design-system/typografie.md` kennt genau zwei Grade (T10, T8).
  Stilkatalog ordnet jedem Dokumentbestandteil einen der beiden zu.

## DECISION-002 — Ordner im ANN WORKSPACE unter 02-INTERNE-PROJEKTE/ANN ARCHITECTURE/DOKUMENTEN-SYSTEM/
- **Entscheidung:** Das Projekt liegt als `DOKUMENTEN-SYSTEM/` in Anns Vault-Struktur, nicht als loser Ordner unter `_AI PORTAL/`.
- **Grund:** Anns feste Projektstruktur (`04-projects/README.md`, `CLAUDE.md`): interne Tools gehören unter `02-INTERNE-PROJEKTE/{Unternehmen}/{Tool}/` mit `README.md` als Einstieg.
- **Alternativen:** loser Ordner `_AI PORTAL/Document Engine/` (verworfen — außerhalb der Ordnung); `DOKUMENTEN-ENGINE` / `DOCUMENT-ENGINE` als Name (verworfen — `DOKUMENTEN-SYSTEM` parallel zu `RENDERING-SYSTEM`, deckt Design-System + Templates + Engine).
- **Konsequenz:** Quellcode/Config/Doku bleiben in diesem Ordner; projektbezogene *Ergebnisse* (fertige Stundennachweise etc.) gehören nach `01-EXTERNE-PROJEKTE/ANN ARCHITECTURE/{PROJEKT}/`.

---

## DECISION-001 — Globales Grid = grids.taras.ee-Spezifikation
- **Entscheidung:** Das globale Seitenraster ist exakt das aus **grids.taras.ee** generierte:
  A4 210 × 297 mm · Ränder oben/links/rechts 15 mm, unten min 0 (effektiv 2,247 mm) ·
  Baseline-Grid **13 pt** · **12 Spalten** · Spalten-Gutter 1 Baseline (13 pt) · Zeilen-Module 1 ·
  Zeilen-Gutter 1 Baseline. Daraus: Spaltenbreite 10,80 mm, Satzbreite 180 mm, 61 Baseline-Einheiten vertikal.
- **Grund:** Ann hat dieses Grid als Underlay in Illustrator verwendet (Screenshot). Die
  PDF-Vermessung bestätigt jeden Wert (± 0,3 mm).
- **Alternativen:** Grid aus dem PDF „frei" nachmessen und runden (verworfen — Quelle ist bekannt und exakt).
- **Konsequenz:** Der Layout-Engine liegt dieses Grid als Konstante zugrunde. Alle
  Templates positionieren auf 12 Spalten und 13-pt-Baselines. Reine Bildschirm-Hilfslinien
  (cyan/magenta) werden nicht exportiert.
