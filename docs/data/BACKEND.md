# Backend — wie es funktioniert

> Letzte Aktualisierung: 2026-09-09
> Verknüpft: [[01_SYSTEM_ARCHITECTURE]] · [[stundennachweis-datenquellen]] · [[DATA_ACCESS_LAYER]]

## Prinzip

Das Backend ist **Google Sheets** — genau wie bei AppSheet. Ein Sheet ist die Datenbank.
Ein dünner Zugriffs-Layer liest und schreibt Zeilen. Menschen (über das Tool) und
KI-Agenten benutzen **denselben** Layer.

```
   Tool (Browser)        KI-Agent
        │                    │
        │  fetch()           │  HTTP / Sheets-API
        ▼                    ▼
   ┌─────────────────────────────────┐
   │  Zugriffs-Layer                 │
   │  Google Apps Script Web App     │   (Phase 1)
   │  ODER Node-Service (Render)     │   (wenn PDF-per-API gebraucht)
   └───────────────┬─────────────────┘
                   ▼
   ┌─────────────────────────────────┐
   │  GOOGLE SHEETS                   │
   │  • Project Management NEW  (lesen)  ← bestehende AppSheet-Daten
   │  • Dokumentensystem       (neu, r/w)                          │
   └─────────────────────────────────┘
```

## Zwei Bausteine

### A) Google Apps Script Web App  — der einfache Weg (Phase 1)

Ein Script, das an ein Google-Sheet gebunden ist und als **Web App** veröffentlicht wird.
Es bekommt eine feste URL (`https://script.google.com/macros/s/…/exec`).

- `doGet(e)` / `doPost(e)` nehmen einen `action`-Parameter und geben **JSON** zurück.
- Beispiele:
  - `?action=getProjects` → Liste aller Projekte aus `Projects`
  - `?action=getTimeRecords&project=…&from=…&to=…` → aufgelöste Zeiteinträge
    (Join `TimeTrackingRecords` ⋈ `TimeTracking` ⋈ `Users`, siehe [[stundennachweis-datenquellen]])
  - `?action=getCompanyInfo` → Footer-/Absenderdaten aus `Company Info`
  - `POST {action:"saveDocument", doc:{…}}` → schreibt `Documents` + `DocumentItems`
- Das Tool ruft diese URL mit `fetch()` auf. Ein KI-Agent ruft dieselbe URL auf
  **oder** schreibt direkt über die Google-Sheets-API (Service-Account).
- **Zugang:** „Ausführen als: ich", „Zugriff: jeder mit dem Link" (die URL ist das Geheimnis),
  oder auf ein Google-Konto beschränkt. Serverseitige Rechteprüfung ergänzen
  (AppSheet nutzt aktuell keine Security-Filter, siehe [[stundennachweis-datenquellen]]).

Das ist exakt das AppSheet-Prinzip: Sheet = Datenbank, eine Schicht darüber liest/schreibt.

### B) Node-Service (Render Frankfurt) — wenn die KI ein fertiges PDF zurückbekommen soll

Sobald „KI-Agent → fertiges PDF" gebraucht wird, kommt ein kleiner Node-Dienst dazu:

- liest das Sheet (Google-Sheets-API + Service-Account)
- baut das Dokument-Modell, ruft dieselbe Layout-Engine wie das Tool auf
- rendert die HTML in **Headless-Chromium** → PDF
- Endpunkt: `POST /api/create_stundennachweis  {project, from, to}` → `{documentId, pdfUrl}`
- schreibt die `Documents`-Zeile mit, legt das PDF ab (Drive-Ordner oder Storage)

Der Node-Dienst kann **auch** die Rolle von (A) übernehmen — dann braucht es kein
Apps Script. Für den schnellen Start ist (A) ausreichend.

## Datenmodell in Sheets

### Lesen — bestehende Datei `Project Management NEW`
`Projects`, `TimeTracking`, `TimeTrackingRecords`, `Services`, `Tasks`, `Sub Tasks`,
`Users`, `Company Info`. Beziehungen und Auflösung: [[stundennachweis-datenquellen]].
**Nichts an dieser Datei ändern** — nur lesen.

### Neu — `Dokumentensystem` (eigene Datei oder Tabs)
| Tab | Zweck | Felder (Entwurf) |
| --- | --- | --- |
| `Documents` | ein erzeugtes Dokument | `doc_id`, `type`, `title`, `place`, `date`, `project_id`, `auftrag_nr`, `auftrag_bez`, `zeitraum_von`, `zeitraum_bis`, `status`, `created_by`, `created_at`, `pdf_url` |
| `DocumentItems` | Zeilen eines Dokuments | `item_id`, `doc_id`, `pos`, `datum`, `taetigkeit`, `bearbeiter`, `stunden`, `source_record_id` |
| `DocumentMeta` *(optional)* | zusätzliche Felder je Typ | `doc_id`, `key`, `value` |

- `source_record_id` verweist auf `TimeTrackingRecords.Record_ID` — die Herkunft bleibt
  nachvollziehbar, die Daten werden **referenziert**, nicht kopiert.
- Ein Dokument ist damit reproduzierbar: gleiche Zeilen → gleiches Layout.

## Ablauf

**Mensch:** Tool öffnen → Projekt + Zeitraum wählen → „Aus Zeitraum laden" ruft
`getTimeRecords` → Tabelle füllt sich → bearbeiten → „Speichern" schreibt
`Documents` + `DocumentItems` → „Als PDF".

**KI-Agent:** `create_stundennachweis(project, from, to)` → Dienst liest Records, baut
Modell, rendert, schreibt `Documents`-Zeile, gibt PDF-Link zurück. Gleiche Zeilen,
gleiches Layout wie beim Menschen.

## Warum Sheets zuerst

- Die Daten liegen schon dort (AppSheet).
- KI-Agenten können dort bereits schreiben.
- Keine neue Infrastruktur nötig.
- Der Zugriffs-Layer kapselt Sheets → später Austausch gegen PostgreSQL ohne UI-Umbau.

## Offen

- (A) Apps Script vs. (B) Node von Anfang an? Vorschlag: mit (A) starten.
- Rechte-/Zugriffsmodell (aktuell keine Security-Filter in AppSheet).
- Wo landet das erzeugte PDF (Drive-Ordner-Struktur)? Ergebnis-PDFs gehören laut
  Vault-Regeln nach `01-EXTERNE-PROJEKTE/ANN ARCHITECTURE/<Projekt>/`.
- Zeitzone der Arbeitsmappe (`America/Los_Angeles`) — Datumswerte als lokales Kalenderdatum behandeln.
