# Stundennachweis: Datenquellen und Ermittlung

> Letzte Aktualisierung: 2026-09-09

## Status

Die operative Datenquelle und die grundlegenden Beziehungen wurden am 2026-09-09 direkt in der aktuellen Google-Sheets-Arbeitsmappe geprüft. Die technische Ermittlung der vorhandenen Daten ist belegt. Noch nicht entschiedene fachliche Darstellungs- und Gruppierungsregeln sind ausdrücklich als offen markiert.

Es wurden keine produktiven Zeiterfassungsdaten verändert.

## Verbindliche operative Quelle

- AppSheet-App: `ANN ARCHITECTURE`
- Interner App-Name: `ProjectManagement-213754671`
- Google Sheet: [Project Management NEW](https://docs.google.com/spreadsheets/d/14WcYfxy5oFoArQh3dWz2zNeP5lFLMlkyMxunm3b-SHI/edit)
- Datei-ID: `14WcYfxy5oFoArQh3dWz2zNeP5lFLMlkyMxunm3b-SHI`
- AppSheet-Standardordner: `/appsheet/data/ProjectManagement-213754671`

Diese Arbeitsmappe ist die bestätigte operative Quelle für Projekte und Zeiterfassung. Die im AppSheet-Editor bei mehreren Tabellen sichtbare Bezeichnung `Phases` ist ein Verbindungsalias und darf nicht als physischer Dateiname interpretiert werden. Zwei ältere Drive-Dateien mit dem Titel `Phases` enthalten nicht die aktuellen Projekt- und Zeitdaten.

## Relevante Tabellenblätter

| Tabellenblatt | Aufgabe im Stundennachweis | Schlüsselfelder |
| --- | --- | --- |
| `TimeTracking` | Tageskopf: Datum und erfassende Person | `Record_ID`, `Date`, `User` |
| `TimeTrackingRecords` | einzelne Zeitbuchungen und Stunden | `Record_ID`, `Tracker_ID`, `Project_ID`, `Phase_ID`, `Service_ID`, `Task_ID`, `Sub_Task_ID`, `Spent Time`, `Record Date` |
| `Projects` | Projektbezeichnung und Projektstammdaten | `Project_ID`, `Project Name`, `Address`, `Client`, `Billable` |
| `Project Phases` | projektbezogene Leistungsphase | `_id`, `Phase_ID`, `Project_ID` |
| `Services` | Leistungs-/Servicebezeichnung | `Service_ID`, `Service`, `Project_ID`, `Phase_ID` |
| `Tasks` | Aufgabenbezeichnung | `Task_ID`, `Task`, `Project_ID`, `Phase_ID`, `Service_ID` |
| `Sub Tasks` | Unteraufgabenbezeichnung | `Sub_Task_ID`, `Sub Task`, `Task_ID` |
| `Users` | Zuordnung von E-Mail zu Anzeigename | `Email`, `Name`, `Position` |
| `Company Info` | Büroangaben für wiederkehrende Dokumentbestandteile | `Company Name`, `Company Adress`, `Company VAT Number`, `Company Telefon`, `Company Email` |

## Beziehung zwischen Tageskopf und Zeitbuchung

```text
TimeTracking.Record_ID
  -> TimeTrackingRecords.Tracker_ID
```

Ein Datensatz in `TimeTracking` beschreibt den Tag und die Person. Ein Datensatz in `TimeTrackingRecords` beschreibt eine einzelne Zeitbuchung innerhalb dieses Tages.

Die Stunden stehen in `TimeTrackingRecords.Spent Time` als Dezimalstunden. Das für den Stundennachweis maßgebliche Datum stammt fachlich aus `TimeTracking.Date`.

Das aktuelle Blatt `TimeTrackingRecords` besitzt zusätzlich die Spalte `Record Date`. Sie wird über eine Formel aus `Tracker_ID` und `TimeTracking.Date` gefüllt:

```text
Tracker_ID -> TimeTracking.Record_ID -> TimeTracking.Date
```

`Record Date` kann für Filterung und Kontrolle genutzt werden. Der Data-Access-Layer muss die zugrunde liegende Beziehung trotzdem kennen und darf nicht von einer ausgefüllten Hilfsspalte abhängig sein.

## Zuordnung zu den sichtbaren Feldern des Stundennachweises

| Dokumentfeld | Datenquelle | Ermittlungsregel | Status |
| --- | --- | --- | --- |
| Projekt | `TimeTrackingRecords.Project_ID` plus `Projects` | Detailzeilen nach exakter `Project_ID` auswählen; sichtbaren Namen über `Projects.Project_ID`/`Project Name` bestätigen | bestätigt |
| Datum | `TimeTracking.Date` | `Tracker_ID` mit `TimeTracking.Record_ID` verbinden; `Record Date` als vorhandene Hilfsspalte prüfen | bestätigt |
| Mitarbeiter | `TimeTracking.User` plus `Users` | E-Mail des Tageskopfs mit `Users.Email` verbinden und `Users.Name` ausgeben | bestätigt |
| Stunden | `TimeTrackingRecords.Spent Time` | Dezimalstunden unverändert rechnen; nur für die Ausgabe lokalisieren | bestätigt |
| Summe | alle gewählten `Spent Time` | numerisch summieren, erst danach formatieren | bestätigt |
| Tätigkeit | `Sub_Task_ID`, `Task_ID`, `Service_ID`, `Phase_ID` | Bezeichnung über die jeweilige ID aus dem zugehörigen Stammblatt auflösen | teilweise bestätigt; Priorität offen |
| Auftrag/Anlage | keine bestätigte Quelle | derzeit kein eindeutig zugeordnetes Feld gefunden | offen |
| Projektnummer wie `2503` | keine bestätigte eigene Spalte | `Project_ID` ist derzeit meist die Projektbezeichnung; eine getrennte Projektnummer ist nicht belegt | offen |

## Verlässlicher Ermittlungsablauf

1. Eingabe festlegen: exakte `Project_ID`, Von-Datum, Bis-Datum und optional ein oder mehrere Mitarbeiter.
2. `TimeTrackingRecords` nach der exakten `Project_ID` auswählen.
3. Jede Detailzeile über `Tracker_ID` mit `TimeTracking.Record_ID` verbinden.
4. Mit `TimeTracking.Date` auf den gewünschten Zeitraum filtern. `Record Date` dient als Kontroll-/Hilfswert.
5. Mit `TimeTracking.User` die E-Mail bestimmen und über `Users.Email` den sichtbaren Mitarbeiternamen aus `Users.Name` laden.
6. Die Tätigkeitsbezeichnung über die vorhandenen IDs auflösen. Als vorläufige technische Reihenfolge gilt: `Sub_Task_ID` → `Task_ID` → `Service_ID` → `Phase_ID`. Diese Reihenfolge ist noch fachlich zu bestätigen.
7. `Spent Time` als Zahl übernehmen, alle eingeschlossenen Zeilen summieren und anschließend für die Ausgabe formatieren.
8. Zeilen chronologisch sortieren. Gruppierung und Zusammenfassung dürfen erst nach einer bestätigten Dokumentregel erfolgen.
9. Die normalisierten Dokumentdaten an das Stundennachweis-Template übergeben; Pagination und Layout verändern die Quelldaten nicht.

## Umgang mit unvollständigen Beziehungen

- IDs werden exakt verglichen; ähnliche Namen werden nicht automatisch zusammengeführt.
- Fehlt eine referenzierte Aufgabe, Unteraufgabe oder Leistung, wird die Zeile als Datenproblem markiert. Das System erfindet keine Bezeichnung.
- `Project Phases._id` ist der kombinierte projektbezogene Schlüssel. Bestehende Varianten wie `LP 05` und `Phase 05` dürfen nicht durch unscharfe Namenssuche vermischt werden.
- In geprüften physischen Detailzeilen waren `Month` und `User` teilweise leer. Beide Spalten sind deshalb keine alleinige Grundlage für Zeitraum oder Mitarbeiter.
- Direkte Schreibvorgänge in Google Sheets lösen AppSheet-Initialwerte und App-Formeln nicht automatisch aus. Das ist für spätere Schreibfunktionen relevant, nicht für den jetzigen reinen Leseprozess.

## Aktuelle technische Risiken

- Die Arbeitsmappe ist auf die Zeitzone `America/Los_Angeles` eingestellt, das Büro arbeitet in `Europe/Berlin`. Datumswerte müssen als lokales Kalenderdatum behandelt werden; eine Korrektur der Arbeitsmappen-Zeitzone ist separat zu entscheiden.
- AppSheet verwendet für die produktiven Tabellen derzeit keine Security Filter und greift als App-Ersteller zu. Das spätere Dokumentensystem benötigt deshalb eine eigene serverseitige Berechtigungsprüfung.
- Die Detailtabelle besitzt kein eindeutig bestätigtes freies Textfeld für die Tätigkeit. Die gewünschte Auswahl zwischen Unteraufgabe, Aufgabe, Leistung und Phase muss von Ann bestätigt werden.

## Offene fachliche Entscheidungen

1. Wird jede Zeitbuchung als eigene Tabellenzeile ausgegeben oder werden identische Kombinationen aus Datum, Tätigkeit und Mitarbeiter summiert?
2. Welche Bezeichnung hat Vorrang: Unteraufgabe, Aufgabe, Leistung oder Leistungsphase?
3. Woher kommen die sichtbare Auftrags-/Anlagenbezeichnung und eine numerische Projektnummer?
4. Werden ausschließlich abrechenbare Projekte beziehungsweise Zeiten berücksichtigt?
5. Soll ein historischer Mitarbeitername eingefroren werden oder immer der aktuelle Wert aus `Users.Name` erscheinen?
6. Soll die Arbeitsmappen-Zeitzone auf Berlin umgestellt werden?

## So wurde die Quelle gefunden und bestätigt

1. Die vorhandene Gesamtdokumentation `[[APPSHEET – ANN ARCHITECTURE – Systemdokumentation]]` und `[[APPSHEET-DISCOVERY]]` wurden ausgewertet.
2. Die physische Google-Sheets-Datei wurde über ihre eindeutige Datei-ID geöffnet, nicht über den mehrdeutigen Titel beziehungsweise AppSheet-Alias `Phases`.
3. Tabellenblätter, Blatt-IDs, Spaltenköpfe und aktuelle Beispielbeziehungen wurden direkt in `Project Management NEW` gelesen.
4. Beispielhafte `Task_ID`, `Service_ID` und Nutzer-E-Mail wurden gegen `Tasks`, `Services` und `Users` aufgelöst. Dadurch ist belegt, dass die Verknüpfung über IDs funktioniert.
5. Die vorhandene Formel von `TimeTrackingRecords.Record Date` wurde direkt geprüft und auf `TimeTracking.Date` zurückgeführt.

## Verknüpfte Dokumentation

- [[APPSHEET – ANN ARCHITECTURE – Systemdokumentation]]
- [[APPSHEET-DISCOVERY]]
- [[APPSHEET-TIMETRACKER]]
- [[grid-system]]
- [[header-footer]]
- [[regel-register]]
