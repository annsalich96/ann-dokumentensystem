# DECISIONS

Architektur- und Design-Entscheidungen. Neueste oben.
Format: Entscheidung / Grund / Alternativen / Konsequenz.

---

## DECISION-008 — KI-Aufbereitung, Abbuchen, Tage-Modus, Projekt-Autofüllung (Ann, 2026-09-10)
- **Entscheidung:** Vier Erweiterungen des Stundennachweis-Tools, Details in
  [[PLAN_KI-AUFBEREITUNG_UND_ABBUCHUNG]]:
  1. **KI-Aufbereitung** der Tätigkeitstexte per Button, ein Aufruf für alle Zeilen, über
     die bestehende Apps-Script-Web-App (`cleanDescriptions`). Anbieter **OpenAI**
     (Standard, `gpt-4.1-mini`), per `AI_PROVIDER` auf Anthropic umschaltbar; Key in den
     Script-Properties. Editor zeigt neuen Text über dem Original, Vorschau sofort.
  2. **Abbuchen** — erster Schreibpfad. Fünf neue Spalten am Ende von `TimeTrackingRecords`
     (`Billing_Description`, `Billed`, `Billed_On`, `Billed_Document`, `Billing_Note`),
     eigener Button getrennt vom PDF-Export, plus „Abbuchung rückgängig". Schutz:
     `WRITE_SECRET` in Script-Properties, `LockService`, `Record_ID`-Match, `DocSystem_Log`.
     Filter „nur nicht abgerechnete" im Editor (Standard AN).
  3. **Tage-Modus** — Umschalter Stunden/Tage, Faktor 8 (einstellbar), nur die Gesamt-Zeile
     rechnet um, kaufmännisch auf 0,25 gerundet, Anzeige nur „2,75 Tage", Stunden-Spalte
     pro Zeile ausgeblendet.
  4. **Projekt-Autofüllung** — `getProjectMeta` (nur lesend), bei Projektwahl werden alle
     Felder neu gefüllt (überschreiben). Dokument bekommt **einen Adressblock** statt
     getrennter Straße/PLZ. Auftrags-Nr. + Bezeichnung + Titel bleiben vorerst frei.
- **Grund:** Anns Anforderungen aus der Praxis (rohe/zweisprachige Zeittexte, keine
  Doppel-Abrechnung, Tagespauschalen, Projektstammdaten nicht abtippen).
- **Konsequenz:** Backend wird von rein-lesend auf **additiv schreibend** erweitert —
  ausschließlich neue Spalten/Tabs, `Project Management NEW` sonst unangetastet
  ([[SHEET-AENDERUNGEN]]). AppSheet-Anpassungen macht Codex. Umsetzung in 4 Schritten,
  beginnend mit dem risikofreien Tage-Umschalter (reines Frontend).

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

## DECISION-004 — Linienfarbe = #a7a9ac, alle Linien 0,5 pt (Ann, 2026-09-09; revidiert am selben Tag)
- **Entscheidung:** **Alle** Dokumentlinien (Kopf-Linien, Tabellenlinien, Abschlusslinien)
  einheitlich **0,5 pt** in **`#a7a9ac`** (der aus der Designquelle gemessene Wert).
- **Verlauf:** Zunächst auf `#8C8C8C` (Brand gray-600) gesetzt; Ann hat am selben Tag am
  laufenden Tool zurück auf `#a7a9ac` entschieden — „Linien alle gleich dick nämlich 0,5 pt
  und doch grau #a7a9ac".
- **Konsequenz:** `--line: #a7a9ac` als eigenes Token (nicht `--color-gray-600`). Der
  Illustrator-Messwert ist damit doch der Sollwert. Regel-Register O-008 entsprechend.

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
