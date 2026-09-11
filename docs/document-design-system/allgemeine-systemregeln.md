# Allgemeine Systemregeln — für jeden Dokumenttyp

> Erstellt: 2026-09-11 · Claude (Sonnet 5)
> Verknüpft: [[grid-system]] · [[typografie]] · [[abstaende-und-raster]] · [[header-footer]] · [[layout-technik]] · [[regel-register]] · [[DECISIONS]] · [[BACKEND]]

Diese Datei sammelt Regeln, die **nicht** einem einzelnen Dokumenttyp gehören, sondern beim
Bauen des ersten fertigen Dokuments (**Stundennachweis**, `tool/stundennachweis.html`) für
**jeden** künftigen Dokumenttyp (Rechnung, Angebot, Nachtragsangebot, Projekt-/Bau-/
Baustellendokumentation …) klar geworden sind. Die anderen Dateien in diesem Ordner
beschreiben *wie eine Seite aussieht*; diese Datei beschreibt *wie das System sich verhält*.

Quelle für alles hier: der tatsächlich gebaute und von Ann live genutzte Code
(`tool/stundennachweis.html`, `tool/apps-script/Code.gs`), nicht nur der Plan davor. Wo eine
Regel eine frühere Annahme in einer anderen Datei korrigiert, ist das vermerkt.

---

## 1. Schreibzugriffe auf Google Sheets — das Muster gilt für jeden Dokumenttyp

Der Stundennachweis war der erste Dokumenttyp mit echtem Rückschreibe-Pfad ("Abbuchen"). Das
Muster ist bewusst so gebaut, dass es sich 1:1 wiederholen lässt (Rechnung: "als bezahlt/
verschickt markieren"; Angebot: "als angenommen markieren" …):

- **Additiv, nie invasiv:** ausschließlich **neue Spalten am Ende** der bestehenden Tabelle
  und/oder ein **eigenes neues Tab**. Keine bestehende Spalte, Zeile oder Formel wird je
  angefasst. Spaltennamen werden beim ersten Schreiben automatisch angelegt, falls sie fehlen
  (`ensureBillingCols_`-Muster).
- **Getrennter, bewusster Schreib-Button** — nie ein Nebeneffekt von PDF-Export oder Vorschau.
  Schreiben ist immer eine eigene, benannte Aktion (`markBilled` als Vorbild), mit
  Gegenstück zum Zurücknehmen (`unmarkBilled`).
- **Schutz:** ein `WRITE_SECRET` in den Apps-Script-Script-Properties (nie im Browser/Chat),
  `LockService` gegen Race Conditions, Zuordnung ausschließlich über die stabile ID
  (`Record_ID`), nie über Zeilennummer/Position.
- **Prüflauf vor echtem Schreiben:** `dryRun`-Modus, der exakt zeigt, welche Zeilen getroffen
  würden, bevor wirklich geschrieben wird.
- **Audit-Log:** jeder Schreibvorgang (vorher/nachher, wer, wann) landet in einem eigenen Tab
  (`DocSystem_Log`), nie in der Fachtabelle selbst.
- **Filter „nur nicht erledigte"** im Editor, Standard AN — verhindert versehentliche
  Doppel-Abrechnung/-Bearbeitung.
- **AppSheet bleibt separat zuständig:** neue Spalten werden dort per „Regenerate Structure"
  nachgezogen (Codex/ChatGPT-Aufgabe, siehe `docs/data/SHEET-AENDERUNGEN.md`), nie vom
  Dokumenten-Tool selbst konfiguriert. Bestehende AppSheet-Bots dürfen durch reine
  Billing-Writes nicht auslösen.

## 2. Freitext, den eine KI aufbereitet — Stil gilt systemweit

Jeder Dokumenttyp mit freien Tätigkeits-/Leistungs-/Beschreibungstexten (Stundennachweis heute;
Rechnungs-Leistungsbeschreibung, Angebotstexte später) nutzt denselben Aufbereitungs-Stil:

- Deutsch, sachlich, **nominaler Stil** ("Abstimmung der Ausführungsplanung mit dem
  Tragwerksplaner", nicht "habe mit dem Statiker telefoniert").
- Keine Ich-Form, keine Anrede, keine Füllwörter, keine erfundenen Uhrzeiten/Namen/Daten.
- HOAI-/Architektur-Vokabular, wo eindeutig passend (Leistungsphase, Ausführungsplanung,
  Detail, Abstimmung, Koordination, Bemusterung, Aufmaß …).
- Einheitliche Terminologie über alle Zeilen/Positionen **eines** Dokuments hinweg.
- Länge ähnlich dem Original bzw. **harte Zeichen-Obergrenze**, wenn die Zielspalte im Layout
  begrenzt ist (siehe §3) — nicht ausschmücken, nur glätten/präzisieren/verdichten.
- Unklare oder leere Einträge werden unverändert zurückgegeben, nie geraten.
- **Ein API-Aufruf für alle Zeilen/Positionen eines Dokuments** (konsistente Terminologie,
  günstiger), nicht Zeile für Zeile.
- **Original bleibt immer sichtbar und editierbar** neben dem KI-Vorschlag (klein/grau
  darunter, „↺ Original" pro Zeile, „alle übernehmen/verwerfen" global) — die Quelldaten
  (Sub Task/Task/Service o. Ä.) werden nie überschrieben, nur der aufbereitete Text landet in
  einer eigenen neuen Spalte.
- Anbieter ist austauschbar (`AI_PROVIDER`-Property, Standard OpenAI `gpt-4.1-mini`,
  alternativ Anthropic); Key immer in Script-Properties, nie im Code/Chat.

## 3. Text messen statt zählen

Wenn eine Spalte/Zone eine begrenzte Breite hat (z. B. TÄTIGKEIT im Stundennachweis), wird die
**tatsächliche gerenderte Breite in der Dokumentschrift** gemessen (Canvas `measureText` mit
`"Rota"` in der richtigen Größe), **nicht** die Zeichenzahl geschätzt. Zeichenzahl-Schätzung ist
nur ein grober Richtwert für Hinweise an eine KI (z. B. „~55 Zeichen"), nie die Kürzungs-Logik
selbst. Gilt für jede Spalte/Zone mit variabler Textlänge in jedem Dokumenttyp.

## 4. Stammdaten-Autofüllung — füllen, nicht sperren

Bestätigtes Muster aus der Projekt-Autofüllung des Stundennachweises, gilt für jeden
Dokumenttyp, der an ein Projekt/einen Kunden gebunden ist:

- Bei Auswahl eines Projekts/Kunden werden **alle** zugehörigen Felder aus den Stammdaten neu
  befüllt (überschreiben vorherige Werte) — kein Zusammenführen einzelner Felder.
- **Danach bleibt jedes Feld frei editierbar.** Autofüllung ist ein Startwert, keine Sperre.
- Adresse ist **ein zusammenhängender Adressblock** (Name/Straße/PLZ-Ort als ein Textfeld),
  nicht einzelne Felder pro Zeile — entspricht, wie Adressen in den Sheets/AppSheet ohnehin
  gepflegt werden.
- Felder ohne verlässliche automatische Herleitung (z. B. Auftrags-Nr., Bezeichnung, Titel)
  bleiben bewusst frei/manuell, statt eine unsichere Herleitung zu erzwingen.
- Absender-/Büroprofil ist aktuell **ein** fest hinterlegter Block (ANN ARCHITECTURE) im Code;
  vorgesehen ist ein Bezug auf das Sheet „Company Info" (Mehrfach-Profile sind offen, siehe
  [[regel-register]] O-007).

## 4a. Editierbare Felder mit sinnvollem Standard

Wiederkehrendes Muster: ein Feld ist frei editierbar, bekommt aber einen sinnvollen
Vorbelegungswert (Header-Ort → Standard „Berlin", editierbar; Einheit Stunden/Tage → Standard
Stunden, Umrechnungsfaktor editierbar mit Standard 8). Kein Feld ist rein automatisch und
zugleich gesperrt.

## 5. Layout-Korrekturen aus dem Bau (aktualisiert gegenüber dem ursprünglichen Plan)

Diese Werte weichen von der ursprünglichen Planung in [[layout-technik]] / [[abstaende-und-raster]]
ab und sind der **aktuelle, im Tool laufende Stand**:

- **Metadaten-Block (AUFTRAG/PROJEKT) steht untereinander, nicht nebeneinander** wie ursprünglich
  geplant (`colX(3)`/`colX(8)` side-by-side). Abstand **3 Grundraster (BL) über** dem Block
  (ab Kopf-Linie) **und 3 BL darunter** (zur Tabelle) — beidseitig derselbe Wert, nicht wie
  ursprünglich unterschiedlich angenommen. → [[layout-technik]] Beispiel A entsprechend lesen.
- **Mindestabstand Inhaltsende → Footer: exakt 2 BL** (`minGapBeforeFooter`), kein Richtwert
  mehr, sondern feste Konstante der Pagination-Engine.
- **Kopf-Linien unter dem Titelblock spannen nicht die volle Seitenbreite**, sondern nur unter
  dem rechtsbündigen Titelblock (von x ≈ 122,65 mm bis zur rechten Rasterkante 195 mm).
  Volle Breite gilt für Tabellen-/Abschlusslinien im Body, nicht für die Header-Linien.
- **„Gesamt"/Summenzeile:** kein fixer mm-Wert, sondern **reservierter Platz** — die
  Pagination-Engine rechnet auf jeder Seite, ob Summe + Mindestabstand zum Footer noch passen;
  reserviert wird der Platz nur auf der **letzten** Seite. Löst [[abstaende-und-raster]] §6 /
  [[regel-register]] O-012: „fixe Position unten, nur letzte Seite" ist damit **bestätigt**,
  der Mechanismus ist reservierter Platz, nicht eine feste Grundlinie.
- **Laufweite (Letter-Spacing) für VERSALIEN-Stile ist `0,02em`**, angewendet auf Wortmarke,
  Metadaten-Label und Tabellenkopf. Löst [[typografie]] „Offene Punkte" #1 /
  [[regel-register]] O-010.
- **Textfarbe** durchgängig `#0A0A0A` — wie in [[typografie]] dokumentiert, im Code als
  `--ink` bestätigt.
- **Linienfarbe** durchgängig `#a7a9ac`, `0,5 pt` — wie in DECISION-004 festgelegt, im Code als
  `--line` bestätigt.

## 6. Hosting- und Build-Muster — gilt für das ganze Dokumenten-System

- Ein Dokumenttyp = eine Datei `tool/<typ>.html` im Repo
  [`annsalich96/ann-dokumentensystem`](https://github.com/annsalich96/ann-dokumentensystem)
  (Git-Arbeitskopie **ist** dieser Drive-Ordner, DECISION-007).
- `design-sources/` und `dev-screenshots/` sind bewusst **gitignored** — große/temporäre
  Dateien bleiben nur im Drive, landen nie im Repo-Verlauf.
- `tool/build.py` erzeugt aus der gehosteten Version eine **portable Standalone-Datei**
  (`*.standalone.html`) mit den Rota-Fonts als Base64 eingebettet — für privates Hosting ohne
  Font-Nachladen. Grund: Rota ist eine gekaufte Lizenz, das Repo bleibt **privat**
  (DECISION-006).
- Rendering-Einheit ist konsequent **mm/pt**, nie Pixel — Vorschau und PDF nutzen denselben
  Renderer (Headless-Chromium-Druck), „Vorschau = PDF" (siehe [[layout-technik]]).

## 7. Kein Dokument ohne Datenherkunft

`DATA ≠ DOCUMENT` bleibt Grundprinzip: das Tool referenziert bestehende Sheet-Datensätze über
ihre ID, kopiert sie nicht in eine eigene Datenhaltung. Gilt unverändert für jeden künftigen
Dokumenttyp — Rechnung greift auf dieselbe `Project Management NEW`-Datenbasis zu wie der
Stundennachweis, nicht auf eine neue.

---

**Für Codex/ChatGPT:** diese Datei ist Teil des git-versionierten Docs-Ordners (nicht nur
Drive) — bei jeder AppSheet-Anpassung oder neuen Dokumenttyp-Umsetzung zuerst hier + in
[[regel-register]] nachsehen, ob eine der obigen Regeln greift, bevor etwas Neues erfunden wird.
