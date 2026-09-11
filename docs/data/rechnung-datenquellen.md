# Rechnung: Datenquellen — Anforderung an AppSheet (für Codex)

> Stand: 2026-09-11 · Status: **offen, Übergabe an Codex** (Ann: „das kann Codex machen")
> Verknüpft: [[stundennachweis-datenquellen]] · [[BACKEND]] · [[STEP2_RECHNUNG_FINDINGS]]

## Ausgangslage

Das Rechnung-Tool (`tool/rechnung.html`) ist als **eigenständiger Editor** gebaut — genau wie
der Stundennachweis in seiner ersten Phase, bevor die Google-Sheet-Anbindung kam. Damit auch
hier „Aus Projekt laden" möglich wird, fehlen im Google Sheet **„Project Management NEW"**
noch zwei Verknüpfungen. Nur lesend nötig, keine neue Tabelle zwingend erforderlich —
Vorschlag unten, Entscheidung liegt bei Ann/Codex.

## 1. Empfänger-Adresse (Rechnungskopf: Name/Firma/Straße/PLZ-Ort)

**Schon vorhanden, vermutlich ausreichend:** `Projects.Bill Name` + `Projects.Bill Address` —
genau diese beiden Felder liefert der bestehende `getProjectMeta`-Endpunkt bereits (gebaut für
den Stundennachweis, siehe `tool/apps-script/Code.gs`). Für die Rechnung reicht es evtl., diese
zwei Felder in einen mehrzeiligen Empfänger-Block zu übernehmen (wie es das Tool jetzt schon
lokal als freies Textfeld tut).

**Zu klären:**
- Ist `Bill Name`/`Bill Address` in `Projects` bei allen relevanten Projekten gepflegt, oder
  liegt die eigentliche Rechnungsadresse besser bei `Clients` (`Client_ID, Client Name, Phone,
  Email` — aktuell **ohne** Adressfeld)?
- `Projects.Client` verweist per `Client_ID` auf `Clients` — ist diese Verknüpfung bei allen
  Projekten tatsächlich gesetzt? Ann: „da muss ich noch verknüpfen, dass Projects und Clients
  verbunden sind."
- Falls `Clients` die führende Quelle werden soll: dort fehlen Straße/PLZ-Ort und ein
  Ansprechpartner-Name (z. B. „Robert Bräunlin" getrennt von der Firma „Bräunlin Kolb
  Architekten GmbH"). Vorschlag: `Clients` um `Contact Person`, `Address` erweitern — analog zu
  den bereits vorhandenen Feldern in `Collaborators` (`Contact Person Name`, `Company Adress`),
  die genau diese Form schon haben.

## 2. Positionstabelle (LEISTUNG / ABRECHNUNGSART / MENGE / SATZ NETTO / GESAMT NETTO)

**Teilweise vorhanden:** `Services` (`Service_ID, Project_ID, Phase_ID, Service, Status,
StartDate, EndDate, Team Member, HoursPlanned, ExernalRate, Completed On, Completed By`).

- `Service` → LEISTUNG (Text) — passt direkt.
- `HoursPlanned` → könnte MENGE speisen (bei „Zeithonorar"-Positionen).
- `ExernalRate` *(Tippfehler im bestehenden Spaltennamen, bitte so belassen — nicht umbenennen,
  sonst bricht `Code.gs`/AppSheet)* → könnte SATZ NETTO speisen.
- **Fehlt:** ein Feld „Abrechnungsart" (Zeithonorar / pauschal / …) pro `Service`-Zeile —
  aktuell nicht vorhanden.
- **Fehlt:** GESAMT NETTO ist in der Vorlage **kein** verlässliches `Menge × Satz`
  (Beispieldaten multiplizieren sich nicht sauber, vermutlich Platzhalter) — für echte Rechnungen
  braucht es entweder eine eigene Spalte für den Endbetrag je Position, oder eine bewusste
  Rechenregel (die dann im Tool ergänzt wird, nicht hier).

## 3. Rechnungsnummer

Keine erkennbare Nummernquelle/-zählung im bisherigen Datenmodell. Muss noch definiert werden
(z. B. fortlaufender Zähler pro Jahr, wie bei `Projects.Project_ID`/`Offer` teils schon als
freier String gepflegt). Bis dahin bleibt das Titelfeld im Tool frei editierbar.

## Vorschlag an Codex

1. Prüfen/sicherstellen: `Projects.Client` ist bei aktiven Projekten mit einer gültigen
   `Clients.Client_ID` verknüpft.
2. Mit Ann klären, ob `Projects.Bill Name`/`Bill Address` **oder** `Clients` (erweitert um
   Adresse + Ansprechpartner) die führende Quelle für Rechnungsempfänger wird — dann ggf.
   `Clients` entsprechend erweitern (additiv, wie bei `TimeTrackingRecords` in
   [[SHEET-AENDERUNGEN]] — neue Spalten ans Ende, nichts Bestehendes umbenennen/verschieben).
3. Mit Ann klären, ob `Services` um ein `Abrechnungsart`-Feld erweitert wird, und wie der
   Betrag je Position (SATZ/GESAMT NETTO) verlässlich abgebildet wird.

Sobald das steht, ergänze ich in `Code.gs` einen weiteren nur-lesenden Endpunkt (analog
`getProjectMeta`/`getTimeRecords`) für die Rechnungspositionen — gleiches additive Muster,
gleicher Schutz, keine Änderung an bestehenden Endpunkten.
