# Änderungen an „Project Management NEW" — Spezifikation für Codex

> Stand: 2026-09-10 · **geplant, noch nicht ausgeführt**
> Verknüpft: [[PLAN_KI-AUFBEREITUNG_UND_ABBUCHUNG]] · [[BACKEND]] · [[stundennachweis-datenquellen]]

Aufgabenteilung:
- **Claude / Dokumenten-System:** legt die neuen Spalten + den neuen Tab an — **passiert
  automatisch beim ersten `markBilled`** (`ensureBillingCols_` / `logRow_` in `Code.gs`),
  rein additiv am Ende der Kopfzeile bzw. als neues Tab.
- **Codex / ChatGPT:** zieht diese Struktur in der **AppSheet-App „ANN ARCHITECTURE"** nach
  (Spalten in die App-Definition übernehmen, Typen setzen, Views/Filter, Bots prüfen).

> Stand 2026-09-10: `markBilled` / `unmarkBilled` sind in `Code.gs` implementiert. Schreiben
> ist über die Script-Eigenschaft `WRITE_SECRET` abgesichert; jeder Aufruf läuft unter
> `LockService` und trifft Zeilen nur per exaktem `Record_ID`-Match. Das Tool macht vor
> jedem echten Abbuchen einen `dryRun`.

---

## A) Neue Spalten in Tab `TimeTrackingRecords`

Angehängt **nach** der bestehenden letzten Spalte `Record Date`.
Bestehende Spalten bleiben unverändert in Name und Reihenfolge:
`Record_ID, Tracker_ID, Project_ID, Phase_ID, Service_ID, Task_ID, Sub_Task_ID, Spent Time, Month, User, Record Date`

| Neue Spalte | AppSheet-Typ | Befüllt von | Bedeutung |
| --- | --- | --- | --- |
| `Billing_Description` | LongText | Dokumenten-Tool | Aufbereiteter Tätigkeitstext für den Stundennachweis. Überschreibt **nie** die Quell-Tätigkeit (bleibt in `Sub Tasks` / `Tasks` / `Services`). |
| `Billed` | Yes/No | Dokumenten-Tool | Eintrag wurde in einem Stundennachweis abgerechnet. |
| `Billed_On` | Date | Dokumenten-Tool | Datum des Stundennachweises. |
| `Billed_Document` | Text | Dokumenten-Tool | Titel/Kennung des Nachweis-Dokuments. |
| `Billing_Note` | Text | Dokumenten-Tool | Freitext, z. B. „2,75 Tage" bei Tagesabrechnung. |

**AppSheet-Schritte (Codex):**
- Nach „Regenerate Structure" die fünf Spalten auf die obigen Typen setzen
  (AppSheet rät sonst evtl. `Billed` als Text).
- `Billed` (und optional `Billed_On`, `Billed_Document`) in einer Time-Tracking-View
  sichtbar/filterbar machen — Ann will sehen, was schon abgerechnet ist.
- **Keine** neuen Bots/Automationen.
- Prüfen, ob ein bestehender Bot auf „`TimeTrackingRecords` geändert / hinzugefügt" reagiert.
  Falls ja: die neuen Spalten aus dessen Auslösebedingung ausnehmen, damit „Abbuchen" aus
  dem Tool **keinen** Bot triggert.
- Hinweis: Im Sheet hängt bereits ein gebundenes Apps-Script mit onEdit-Trigger
  (`syncTimeLine_`, `syncTimePerMonth_`) — das ist bekannt und unkritisch, es aggregiert nur
  `TimePerMonth`. Nicht anfassen.

---

## B) Neuer Tab `DocSystem_Log`

Eigenständiges Protokoll, **nur** vom Dokumenten-System beschrieben.
In AppSheet **nicht** als Tabelle hinzufügen (oder nur read-only + versteckt).

| Spalte | Typ | Inhalt |
| --- | --- | --- |
| `ts` | Datetime | Zeitpunkt der Aktion |
| `user` | Text | Google-Konto, das die Aktion ausgelöst hat |
| `action` | Text | `cleanDescriptions` \| `markBilled` \| `unmarkBilled` |
| `record_ids` | LongText | betroffene `Record_ID` (kommagetrennt) |
| `document` | Text | Titel/Kennung des Nachweises |
| `before` | LongText | Zustand vorher (JSON) |
| `after` | LongText | Zustand nachher (JSON) |

---

## C) Ausdrücklich NICHT geändert

- Kein bestehender Tab, keine bestehende Spalte, keine Spaltenreihenfolge.
- Kein Trigger, kein gebundenes Script.
- Kein Schreibzugriff auf `TimeTracking`, `Projects`, `Services`, `Tasks`, `Sub Tasks`,
  `Users`, `Company Info`, `Offer`, `Clients` u. a. — diese werden nur gelesen.

---

## D) Später / noch offen

- **Auftrags-Nr.:** Quelle/Logik ungeklärt. Kandidaten: `Offer.Offer Nr.` oder eine neue
  Spalte `Order_No` in `Projects`. Bis zur Entscheidung: Freitextfeld im Tool.
- **`Documents` / `DocumentItems`:** eigener Tab-Satz für gespeicherte, reproduzierbare
  Nachweise (Struktur in [[BACKEND]]). Kommt, sobald „Dokument speichern/erneut öffnen"
  im Tool gebraucht wird — dann als eigene Datei oder eigene Tabs, ebenfalls nur additiv.
