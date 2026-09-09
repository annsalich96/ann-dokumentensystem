# System-Architektur — technisch

> Letzte Aktualisierung: 2026-09-09
> Verknüpft: [[BUILD_APPROACH]] · [[grid-system]] · [[typografie]] · [[stundennachweis-datenquellen]]

## Kurzantwort

**Ja, das Tool ist HTML/CSS/JavaScript** — wie der Bauzeitenplan. Das Dokument selbst wird
als **HTML/CSS auf einem Millimeter-Raster** gesetzt und daraus ein PDF erzeugt.

Damit auch **KI-Assistenten** ein fertiges Dokument bekommen, ist die Layout-Logik von der
Oberfläche getrennt: dieselbe Engine läuft **im Browser** (Live-Vorschau für Menschen) **und
serverseitig ohne Browser-UI** (PDF auf Zuruf über eine API).

---

## 1. Schichten

```
┌─────────────────────────────────────────────────────────────┐
│ EDITOR-UI (HTML)          │  API / AUTOMATION (HTTP)         │
│ Formular + Live-Vorschau  │  /api/create_stundennachweis …   │
│ – für Menschen –          │  – für KI-Assistenten –          │
└───────────────┬───────────┴───────────────┬─────────────────┘
                │      gleiche Funktionen    │
                ▼                            ▼
        ┌───────────────────────────────────────────┐
        │ DOKUMENT-MODELL  (reines JSON)            │
        │ { type, header, meta, items[], totals }   │
        └───────────────┬───────────────────────────┘
                        │
        ┌───────────────▼───────────────┐   ┌────────────────────┐
        │ LAYOUT- / PAGINATION-ENGINE   │◄──│ DESIGN-SYSTEM      │
        │ reines JS, kein DOM nötig     │   │ Raster, Typo,     │
        │ – misst Inhalt                │   │ Header, Footer,   │
        │ – bricht Tabellen um          │   │ Abstände (Konst.) │
        │ – wiederholt Tabellenkopf     │   └────────────────────┘
        │ – nummeriert Seiten n/m       │
        └───────────────┬───────────────┘
                        ▼
        ┌───────────────────────────────┐
        │ RENDERER → A4-HTML/CSS         │
        │  ├─ Browser: Live-Vorschau     │
        │  └─ Headless-Chromium: PDF     │
        └───────────────────────────────┘
                        ▲
        ┌───────────────┴───────────────┐
        │ DATEN-ZUGRIFFS-SCHICHT (data/) │
        │ getProjects() getTimeRecords() │
        │ getCompanyInfo() saveDocument()│
        └───────────────┬───────────────┘
                        ▼
        ┌───────────────────────────────┐
        │ GOOGLE SHEETS  (Phase-1-Backend)│
        │ • Project Management NEW (lesen)│
        │ • Dokumenten-Sheet (neu, r/w)  │
        │ später: PostgreSQL – nur diese │
        │ Schicht wird getauscht         │
        └───────────────────────────────┘
```

## 2. Die Bausteine im Detail

### 2.1 Design-System (`/design`)
Die eingefrorenen Regeln aus `docs/document-design-system/` **als Code**:
- `design/tokens.css` — CSS Custom Properties in **mm/pt**: Seitenmaße, 12-Spalten-Raster,
  13-pt-Baseline, `--v-line/-section/-header-gap/-block`, Farben, Rota `@font-face`.
- `design/constants.js` — dieselben Zahlen für die Engine (Spaltenkanten, Baseline, Zonen).
- `design/components/` — `header`, `footer`, `metadata-block`, `data-table` als
  wiederverwendbare Render-Funktionen bzw. CSS-Klassen.
Ändert sich selten. Eine Änderung hier wirkt auf **alle** Dokumenttypen.

### 2.2 Template (`/templates/stundennachweis`)
Was dieser Dokumenttyp konkret hat: Metadaten-Felder (AUFTRAG, PROJEKT …), Tabellenspalten
(DATUM · TÄTIGKEIT · BEARBEITER · ZEITAUFWAND), Summenzeile, Titel-Herleitung.
Setzt auf `/design` auf, erfindet keine eigenen Maße.

### 2.3 Dokument-Modell
Reines JSON, die **einzige Wahrheit**. Beispiel:
```json
{
  "type": "stundennachweis",
  "header": { "title": "Anlage 01_Stundennachweis", "place": "Berlin", "date": "2026-09-08" },
  "meta": {
    "auftrag": { "nr": "OFF_KHP_N_01_260301", "bez": "Nachtrag 01 – Bodenmarkierungsplanung" },
    "projekt": { "name": "Kant Center – Parkhaus", "strasse": "Krumme Str. 48", "ort": "10627 Berlin" },
    "zeitraum": { "von": "2026-08-01", "bis": "2026-08-31" }
  },
  "items": [
    { "datum": "2026-08-03", "taetigkeit": "Erstellung von Plänen", "bearbeiter": "Ann-Kathrin Salich", "stunden": 0.5 }
  ],
  "totals": { "stunden": 0.5 }
}
```
Menschen erzeugen dieses Objekt über das Formular, KI-Assistenten über die API — **gleiches
Objekt, gleiches Ergebnis**.

### 2.4 Layout-/Pagination-Engine (`/engine`)
Reines JavaScript, testbar ohne Browser. Aufgaben:
1. Kopf-/Fußbereich jeder Seite platzieren (feste Zonen aus `/design`).
2. Body füllen bis zur Bodyzone-Unterkante; passt der nächste Block nicht → neue Seite.
3. Tabellen zeilenweise umbrechen, **Tabellenkopf auf Folgeseite wiederholen**.
4. Summenzeile auf der letzten Seite an fixer Position unten setzen.
5. Nach vollständiger Pagination Seitenzahlen `n/m` eintragen.
Ausgabe: `pages[]` mit positionierten Blöcken (mm-Koordinaten) → deterministisch.

### 2.5 Renderer
`pages[]` → A4-HTML. Jede Seite ein `<div class="page">` (210×297 mm), Blöcke absolut in mm.
- **Browser:** direkt ins Vorschau-Panel, bei jeder Modelländerung neu.
- **PDF:** dieselbe HTML in **Headless-Chromium** (Puppeteer/Playwright) →
  `page.pdf({ format: "A4", printBackground: true })`. Vorschau und PDF sind identisch,
  weil es derselbe Renderer ist.

### 2.6 Daten-Zugriffs-Schicht (`/data`)
Kleine, klar umrissene Funktionsmenge — **nur diese Schicht weiß, dass es Sheets ist**:
| Funktion | Quelle heute |
| --- | --- |
| `getProjects()` | `Project Management NEW` › `Projects` |
| `getTimeRecords({ projectId, from, to, users? })` | `TimeTrackingRecords` ⋈ `TimeTracking` ⋈ `Users` (siehe [[stundennachweis-datenquellen]]) |
| `getCompanyInfo()` | `Company Info` |
| `createDocument(doc)` / `getDocument(id)` / `saveDocument(doc)` | neues Dokumenten-Sheet |
Später PostgreSQL: **nur `/data` wird neu geschrieben**, UI und Engine bleiben unberührt.

### 2.7 Editor-UI (`/app`)
Links Formular (Projektauswahl, Zeitraum, „Zeiteinträge laden", Tabelle bearbeiten,
Zeile hinzufügen), rechts Live-A4-Vorschau. Speichern/Öffnen eines Dokuments als
`.json`-Datei — wie beim Bauzeitenplan.

### 2.8 API für Automatisierung (`/api`)
Dünne HTTP-Endpunkte, die **dieselben** `/data`- und `/engine`-Funktionen aufrufen:
```
POST /api/create_stundennachweis
     { "project": "Kant Haus", "from": "2026-08-01", "to": "2026-08-31" }
  → lädt Zeiteinträge, baut Modell, rendert, erzeugt PDF,
    legt Dokument-Zeile an, antwortet mit { documentId, pdfUrl }
```
Das ist der Weg „KI-Assistent → fertiges Dokument".

## 3. Technik-Stack (Vorschlag)

| Teil | Technik | Hosting |
| --- | --- | --- |
| Editor-UI + Vorschau + Engine + Renderer | HTML / CSS / Vanilla-JS, eine SPA | GitHub Pages (`ANN-Tools`) / Artifact — wie Bauzeitenplan |
| PDF-Erzeugung (KI-Weg) + API + Sheets-Zugriff | Node-Service, Puppeteer, Google Sheets API | Render Frankfurt (nutzt Ann bereits für PRIVATE ASSISTANTS) |
| Sheets-Lesen/-Schreiben (einfacher Einstieg) | Google Apps Script Web App | Google |
| Schriften | Rota OTF → woff2, eingebettet | — |

**Stufenweise:** Zuerst ganz ohne Server — Mensch nutzt „Als PDF drucken" im Browser (wie
Bauzeitenplan heute). Der Node-Service kommt dazu, sobald der KI-Weg und exakter PDF-Export
gebraucht werden. Der Rest des Codes ändert sich dabei nicht.

## 4. Technische Baureihenfolge

1. `/design` — tokens.css + constants.js aus den eingefrorenen Regeln. Eine **statische**
   Stundennachweis-Seite in HTML rendern, visuell gegen `PAPER Templates` S. 5 prüfen.
2. `/engine` — Pagination der Zeiteintrags-Tabelle. Test mit 3 / 30 / 80 Zeilen,
   Tabellenkopf-Wiederholung, Seitenzahlen.
3. `/app` — Formular + Live-Vorschau, Modell im Speicher, Speichern/Öffnen als JSON.
4. `/data` — Apps-Script-Web-App über `Project Management NEW`: `getProjects`,
   `getTimeRecords`. „Projekt + Zeitraum → Zeilen laden" verdrahten.
5. Neues **Dokumenten-Sheet** (`Documents`, `DocumentItems`) + `createDocument`/`saveDocument`.
6. Node-Service + Puppeteer → echter PDF-Export (löst Browser-Druck ab).
7. `/api/create_stundennachweis` — der KI-Weg. Antwort: PDF + Dokument-Zeile.
8. Zweites Template (Rechnung/Angebot) — nutzt `/design` + `/engine` wieder.

## 5. Warum diese Trennung

- **Vorschau = PDF:** ein Renderer, keine zwei Layout-Wege, die auseinanderlaufen.
- **Mensch = KI:** beide erzeugen dasselbe Dokument-Modell und rufen dieselbe Engine.
- **Sheets tauschbar:** Geschäftslogik und Layout hängen nie an Zellkoordinaten, nur an `/data`.
- **Design zentral:** alle Dokumenttypen teilen `/design`; eine Regeländerung wirkt überall.
