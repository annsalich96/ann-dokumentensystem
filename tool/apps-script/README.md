# Apps Script — Datenbrücke zum Google-Sheet (nur lesend)

`Code.gs` ist die Verbindung zwischen dem Stundennachweis-Tool und deiner
Google-Tabelle **„Project Management NEW"** (die Mappe hinter deiner AppSheet-App).

## Warum daran nichts kaputtgehen kann

- **Eigenes, getrenntes Skript-Projekt.** Es wird **nicht** in den Skript-Editor der
  Tabelle eingefügt, sondern als eigenständiges Projekt auf script.google.com angelegt.
  Es teilt sich mit deinen bestehenden Skripten **keinen Code, keine Trigger, keine
  Bereitstellung**. Vorhandene Projekte in deinem Drive (unverändert lassen):
  `PROJECT TASK TIMETABLE`, `Gmail Intelligente Labels`, `CLIENT ARCHITECT EXCHANGE`,
  `Ordner Überwachung`, `Unbenanntes Projekt` — sowie ggf. ein an die Tabelle gebundenes
  Skript und die AppSheet-Bots. Nichts davon wird berührt.
- **Nur lesend.** `Code.gs` enthält ausschließlich `SpreadsheetApp.openById(...).getValues()`
  — kein `setValue`, kein `appendRow`, kein `getRange().set…`, kein Löschen. Es *kann*
  die Tabelle technisch nicht verändern.
- **Eigene Web-App-URL.** Die Bereitstellung als Web-App erzeugt eine neue, separate URL.
  Deine AppSheet-App und alles andere laufen unverändert weiter.
- Beim ersten Aufruf fragt Google einmal nach Zugriff (dein Konto, „nur Tabellen lesen").

## Deploy (einmalig, ~3 Minuten)

1. **script.google.com** öffnen → **Neues Projekt**.
2. Den Inhalt von `Code.gs` komplett hineinkopieren (die vorhandene `Code.gs`-Datei im
   neuen Projekt ersetzen — es ist ja leer).
3. Projekt benennen, z. B. **`Dokumenten-System – Datenbrücke`**. Speichern.
4. Oben rechts **Bereitstellen → Neue Bereitstellung** → Typ **Web-App**.
   - *Ausführen als:* **Ich**
   - *Zugriff:* **Nur ich** (oder „Jeder mit Link", wenn das Tool ohne Google-Login laufen soll)
   - **Bereitstellen** → Google fragt einmal nach Berechtigung → zulassen.
5. Die angezeigte **Web-App-URL** kopieren (endet auf `/exec`).
6. Im Stundennachweis-Tool oben im Abschnitt **„Aus Time Tracking laden"** die URL
   einfügen und **Verbinden**. Die URL wird lokal im Browser gemerkt.

> Nach jedem Code-Update im Skript: **Bereitstellen → Bereitstellung verwalten → Bearbeiten
> → Version „Neu" → Bereitstellen** (die URL bleibt gleich).

## Endpunkte

| Aufruf | Rückgabe |
| --- | --- |
| `…/exec?action=ping` | `{ok:true, ts:…}` — Verbindungstest |
| `…/exec?action=getFilterTree` | Baum **Projekt → Phase → Leistung**, nur mit vorhandenen Buchungen |
| `…/exec?action=getCompanyInfo` | Büroangaben für die Fußzeile |
| `…/exec?action=getTimeRecords&project=…&phase=…&service=…&from=YYYY-MM-DD&to=YYYY-MM-DD` | Zeiteinträge: `{items:[{datum,taetigkeit,bearbeiter,stunden,recordId}], total, unresolved}` |

## Getestete Tabellenstruktur (aus der echten Mappe)

`TimeTracking` (Record_ID, Date, User) · `TimeTrackingRecords` (Tracker_ID, Project_ID,
Phase_ID, Service_ID, Task_ID, Sub_Task_ID, Spent Time, Record Date) · `Projects`
(Project_ID, Project Name, Address, Client) · `Services` (Service_ID, Service, Project_ID,
Phase_ID) · `Tasks` · `Sub Tasks` · `Users` (Email, Name) · `Company Info`.

Zeitzone der Mappe: `America/Los_Angeles` — das Skript behandelt Datumswerte als lokales
Kalenderdatum und gibt sie in `Europe/Berlin` aus.
