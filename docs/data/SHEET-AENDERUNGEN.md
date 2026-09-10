# Änderungen an „Project Management NEW" — Übergabe an ChatGPT / Codex (AppSheet)

> Stand: 2026-09-10 · **ausgeführt** — die Struktur ist im Google-Sheet, AppSheet muss
> nachgezogen werden. Dieses Dokument ist so geschrieben, dass es 1:1 an ChatGPT gegeben
> werden kann.
> Verknüpft: [[PLAN_KI-AUFBEREITUNG_UND_ABBUCHUNG]] · [[BACKEND]] · [[stundennachweis-datenquellen]]

## Kontext

Ein **eigenständiges** Apps-Script-Projekt („Dokumenten-System – Datenbrücke", **nicht** das
an die Tabelle gebundene Script) liest „Project Management NEW" und schreibt seit 2026-09-10
**rein additiv** zurück, wenn im Stundennachweis-Tool „Im Sheet abbuchen" geklickt wird:

- Es schreibt **ausschließlich** in fünf neue Spalten von `TimeTrackingRecords`, Zeile für
  Zeile per exaktem `Record_ID`-Match, unter `LockService`.
- Es legt bei Bedarf ein neues Tab `DocSystem_Log` an (reines Protokoll).
- Es fasst **keine** bestehende Spalte, Zeile, Formel, kein Tab, keinen Trigger an.

## Was jetzt im Sheet neu ist

### 1. Tab `TimeTrackingRecords` — 5 neue Spalten, **am Ende** angehängt

Bestehende Spalten unverändert in Name und Reihenfolge:
`Record_ID, Tracker_ID, Project_ID, Phase_ID, Service_ID, Task_ID, Sub_Task_ID, Spent Time, Month, User, Record Date`

danach neu:

| Spalte | Soll-Typ (AppSheet) | Bedeutung |
| --- | --- | --- |
| `Billing_Description` | LongText | aufbereiteter Tätigkeitstext für den Nachweis (KI-redigiert). Ersetzt **nie** die Quell-Tätigkeit aus `Sub Tasks`/`Tasks`/`Services`. |
| `Billed` | Yes/No | Eintrag wurde in einem Stundennachweis abgerechnet |
| `Billed_On` | Date | Datum des Stundennachweises |
| `Billed_Document` | Text | Titel des Nachweis-Dokuments |
| `Billing_Note` | Text | Freitext, z. B. „Nachweis: 2,75 Tage" |

### 2. Neues Tab `DocSystem_Log`

Append-only Protokoll. Spalten: `ts, user, action, record_ids, document, before, after`.

## Was ChatGPT in der AppSheet-App „ANN ARCHITECTURE" tun soll

1. **`TimeTrackingRecords` → Regenerate Structure** (Data → Tables). Damit erscheinen die
   5 Spalten in der App-Definition.
2. **Spaltentypen setzen** wie oben. Wichtig: `Billed` = **Yes/No** (AppSheet rät sonst Text),
   `Billed_On` = **Date**.
3. Für jede der 5 Spalten sicherstellen:
   - **nicht** Key, **nicht** Label,
   - **Require? = OFF**, **Valid If** leer, **App formula** / **Initial value** leer
     (ein Pflichtfeld oder eine fehlerhafte Formel hier ist die häufigste Fehlerursache),
   - **Editable? = OFF** empfohlen (die Spalten pflegt das Script, nicht die App) — nicht zwingend.
4. **Keine neuen Bots / Automationen anlegen.**
5. **Bestehende Bots/Automationen auf `TimeTrackingRecords` prüfen** (Events „data change",
   „adds/updates"). Falls einer bei jeder Zeilenänderung feuert: eine Bedingung ergänzen,
   die reine Billing-Änderungen ignoriert (z. B. Trigger nur wenn sich fachliche Felder
   ändern), damit das Abbuchen aus dem Tool **keinen** Bot auslöst.
6. **Nur-lesen-Ansicht/Filter** (optional, aber von Ann gewünscht): Slice oder View mit
   `[Billed] = true` bzw. `<> true`, damit sichtbar ist, was schon abgerechnet wurde.
7. **`DocSystem_Log` NICHT als Tabelle hinzufügen.** Falls AppSheet es automatisch erkannt
   hat: Tabelle entfernen — oder read-only + `Are updates allowed? = No` + von Views ausschließen.

## Was NICHT verändert werden darf

- Keine bestehende Spalte umbenennen, löschen, verschieben; keine Spaltenreihenfolge ändern.
- `Spent Time`, `Project_ID`, `Phase_ID`, `Service_ID`, `Tracker_ID`, `Record_ID` etc. unangetastet.
- Das an die Tabelle **gebundene** Apps-Script (`syncTimeLine_`, `syncTimePerMonth_`,
  onEdit-Trigger) bleibt wie es ist — es aggregiert nur `TimePerMonth`, ist bekannt und
  unkritisch.
- Das eigenständige Script „Dokumenten-System – Datenbrücke" und seine Bereitstellung
  nicht anfassen.

## Beim Weitergeben an ChatGPT unbedingt mitgeben

- **Den exakten Fehlertext aus AppSheet** (Wortlaut + wo er auftritt: beim Sync, beim
  Öffnen einer View, beim Speichern eines Eintrags, in einem Bot-Lauf).
- In welcher View/Tabelle der Fehler kommt.
- Ob er schon vor dem ersten „Abbuchen" da war oder erst danach.

## Später / noch offen (nicht Teil dieser Übergabe)

- **Auftrags-Nr.:** Quelle ungeklärt (Kandidat `Offer.Offer Nr.` oder neue Spalte in `Projects`).
- **`Documents` / `DocumentItems`:** eigener Tab-Satz für gespeicherte, reproduzierbare
  Nachweise (Struktur in [[BACKEND]]) — additiv, kommt später.
