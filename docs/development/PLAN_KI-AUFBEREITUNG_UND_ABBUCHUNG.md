# Plan — KI-Aufbereitung, Rückschreiben/Abbuchen, Tage-Modus, Projekt-Autofüllung

> Stand: 2026-09-10 · mit Ann abgestimmt · Umsetzung in vier Schritten (siehe unten)
> Verknüpft: [[BACKEND]] · [[stundennachweis-datenquellen]] · [[DECISIONS]] · [[SHEET-AENDERUNGEN]]

Fünf Erweiterungen des Stundennachweis-Tools. Backend bleibt die eine Google-Apps-Script-Web-App
(Weg A aus [[BACKEND]]). Bis hierher war sie **nur lesend** — mit „Abbuchen" kommt der erste,
eng begrenzte Schreibpfad dazu.

---

## 1. KI-Aufbereitung der Tätigkeitsbeschreibungen

**Ziel:** Ein Klick verwandelt die teils englischen, teils deutschen, sprachlich rohen
Tätigkeitstexte in einheitliches, professionelles Architektendeutsch für den Stundennachweis.

- **Auslöser:** Button „Beschreibungen aufbereiten" im Editor. Verarbeitet **alle** Einträge
  des aktuellen Nachweises in **einem** Aufruf (konsistente Terminologie, günstiger).
- **Weg:** neuer Endpunkt `action=cleanDescriptions` in der Apps-Script-Web-App. Das Script
  ruft einen KI-Anbieter per `UrlFetchApp`.
  - **Standard OpenAI** (`OPENAI_API_KEY`, Modell `gpt-4.1-mini`); per `AI_PROVIDER=anthropic`
    auf Claude umschaltbar. Key liegt in den **Script-Properties**, von Ann selbst
    eingetragen — nie im Browser, nie im Chat.
  - Input je Eintrag: roher Tätigkeitstext (aufgelöst aus Sub Task → Task → Service),
    optional `TimeTracking.Notes` des Tages, Projekt- und Phasenname als Kontext.
  - Output: bereinigter deutscher Text pro `Record_ID`.
- **Anzeige:**
  - **Druckvorschau (links):** zeigt sofort den neuen Text.
  - **Editor, Zeiteinträge-Tabelle, Spalte „Tätigkeit":** oben das neue, **editierbare**
    Feld, direkt darunter klein/grau der **Originaltext** zum Vergleich. Pro Zeile „↺ Original",
    global „alle übernehmen / alle verwerfen".
  - Der Originaltext wird bei jedem Laden frisch aus dem Sheet aufgelöst — muss nicht
    gespeichert werden.
- **Rückschreiben:** der final übernommene Text wird als Spalte `Billing_Description` in
  `TimeTrackingRecords` gespeichert — **beim „Abbuchen"** (ein Schreibvorgang), nicht separat.
  Die Quell-Tätigkeit (Sub Task/Task/Service) wird nie überschrieben.

### Stil-Leitfaden (Entwurf, wird bei Umsetzung nach `docs/document-design-system/` ausgelagert)

- Deutsch, sachlich, nominaler Stil („Abstimmung der Ausführungsplanung mit dem
  Tragwerksplaner", nicht „habe mit dem Statiker telefoniert").
- Keine Ich-Form, keine Anrede, keine Füllwörter, keine Uhrzeiten/Namen erfinden.
- HOAI-/Architektur-Vokabular, wo es passt (Leistungsphase, Ausführungsplanung, Detail,
  Abstimmung, Koordination, Bemusterung, Aufmaß …).
- Einheitliche Terminologie über alle Zeilen eines Nachweises hinweg.
- Länge ähnlich dem Original; nicht ausschmücken, nur glätten und präzisieren.
- Unklare/leere Einträge nicht raten — als solche zurückgeben.

---

## 2. Rückschreiben / „Abbuchen"

- **Eigener Button „Abbuchen"** im Editor, **getrennt vom PDF-Export**. PDF = nur ein
  Dokument; Abbuchen = bewusster Schreibvorgang ins Sheet.
- Schreibt pro einbezogenem `Record_ID` in `TimeTrackingRecords`:
  | Spalte | Wert |
  | --- | --- |
  | `Billed` | ja / TRUE |
  | `Billed_On` | Dokumentdatum |
  | `Billed_Document` | Titel/Kennung des Nachweises |
  | `Billing_Description` | finaler (ggf. KI-)Text |
  | `Billing_Note` | Freitext, z. B. „2,75 Tage" (nur im Tage-Modus) |
- **Button „Abbuchung rückgängig"** (pro Dokument): setzt `Billed` leer, leert `Billed_On`,
  `Billed_Document`, `Billing_Note`. `Billing_Description` **bleibt** erhalten.
- **Endpunkte:** `action=markBilled` / `action=unmarkBilled` (POST).
- **Schutz:**
  - Shared Secret in den Script-Properties (`WRITE_SECRET`), fest im Tool hinterlegt wie
    die Web-App-URL. Zusätzlich weiterhin Deploy-Zugriff „Jeder in der Organisation".
  - `LockService.getScriptLock()` um jeden Schreibvorgang.
  - Immer nur per `Record_ID`-Match, nie flächig, nie leer über einen Bestandswert.
  - Wenige Schreibzugriffe pro „Abbuchen" (die fünf neuen Spalten je Zeile als
    zusammenhängender Bereich, gesammelt) — wegen des bestehenden onEdit-Triggers im Sheet.
- **Protokoll:** jede Aktion (`cleanDescriptions`, `markBilled`, `unmarkBilled`) in einen
  eigenen Tab `DocSystem_Log` (Zeitpunkt, Nutzer-Email, Aktion, Record-IDs, vorher/nachher).
- **Doppel-Abrechnung verhindern:** `getTimeRecords` liefert je Eintrag `billed` +
  `billedDocument`. Editor-Filter **„nur nicht abgerechnete"** (Standard AN); bereits
  abgerechnete Einträge werden ausgeblendet bzw. deutlich markiert.
- Der gespeicherte Nachweis (lokale JSON) merkt sich die einbezogenen `Record_ID` + Status.

---

## 3. Abrechnungsstatus in AppSheet sichtbar

- Läuft über die **echten neuen Spalten** in `TimeTrackingRecords` (`Billed`, `Billed_On`,
  `Billed_Document`) — keine Referenz-/Virtual-Column-Konstruktion nötig.
- Die **AppSheet-App-Definition passt Codex an** (Spalten übernehmen, Typen setzen, `Billed`
  als Filter/Spalte in einer Time-Tracking-View). Spezifikation: [[SHEET-AENDERUNGEN]].
- **Granularität:** ganzer Eintrag rein/raus. Kein Teil-Stunden-Feld (`Billed_Hours` wurde
  verworfen — wäre bei „ganz rein/raus" immer = `Spent Time`).

---

## 4. Abrechnung nach Tagen

- Umschalter im Dokument **„Einheit: Stunden | Tage"**. Faktor Standard **8 h/Tag**, einstellbar.
- Nur die **Gesamt-Zeile** rechnet um: `Summe Stunden / Faktor`, **kaufmännisch auf 0,25
  gerundet**. Anzeige **nur „2,75 Tage"** (kein Stunden-Zusatz in Klammern).
- Einzelzeilen bleiben in Stunden erfasst. Im Tage-Modus wird die **Stunden-Spalte pro Zeile
  ausgeblendet** — die Tabelle zeigt dann Datum / Tätigkeit / Bearbeiter.
- Kein Tageswert pro Zeile.
- `Billing_Note` = „2,75 Tage" wird beim Abbuchen mitgeschrieben (nur Dokumentation; die
  Nicht-Doppel-Abrechnung läuft ausschließlich über `Billed`).

---

## 5. Projekt-Autofüllung aus dem Sheet

- Neuer, **nur lesender** Endpunkt `action=getProjectMeta&project=…&phase=…`.
- Bei Projektwahl im Dropdown werden **alle** zugehörigen Felder **neu gefüllt**
  (überschreiben, auch von Hand geänderte — Anns Vorgabe: „neues Projekt = alles neu").
- **Mapping:**
  | Dokumentfeld | Quelle im Sheet |
  | --- | --- |
  | Projektname | `Projects.Project Name` |
  | Projekt-Adressblock | `Projects.Address` (ein Feld) |
  | Auftraggeber / Rechnungsadresse | `Projects.Bill Name` + `Projects.Bill Address`; Fallback `Projects.Client` → `Clients.Client Name` |
  | Phase (Klartext) | `TimeTrackingRecords.Phase_ID` „LP 05" → `Phases.Phase Name` |
  | Auftrags-Nr. | **frei** (Logik später; Kandidat `Offer.Offer Nr.`) |
  | Bezeichnung | **frei** |
  | Titel | **frei** / Regel später |
- **Adressblock:** das Dokument wird von getrennter „Straße" / „PLZ / Ort" auf **einen
  Adressblock** umgestellt (Sheet-Realität). Muss im Layout sauber gesetzt werden
  (mehrzeilig, im Raster).
- `getFilterTree` optional verbessern: Phasen als Klartext (`Phases`-Tab) statt
  „LP 05-KANT CENTER" im Dropdown.

---

## Umsetzungsreihenfolge

1. **Tage-Umschalter** + 0,25-Rundung + Stunden-Spalte im Tage-Modus ausblenden.
   Reines Frontend, kein Backend, null Risiko.
2. **Projekt-Autofüllung** (`getProjectMeta`, nur lesend) + Adressblock-Layout.
3. **KI-Aufbereitung** (`cleanDescriptions` via Apps Script + Anthropic; Editor-Anzeige
   neu über alt; sofortige Vorschau).
4. **Rückschreiben / Abbuchen** (fünf neue Spalten, `markBilled` / `unmarkBilled`,
   `DocSystem_Log`, Filter „nur offene") — gemeinsam mit Codex' AppSheet-Anpassungen.

Jeder Schritt wird einzeln gezeigt und abgenommen.

---

## Sicherheit — „nichts kaputt machen" in `Project Management NEW`

- Bestehende Spalten, Reihenfolge, Tabs, Trigger und das **gebundene Script**
  (`syncTimeLine_`, `syncTimePerMonth_`, onEdit-Trigger) bleiben unangetastet.
- Nur **additiv**: 5 neue Spalten am Ende von `TimeTrackingRecords`, 1 neuer Tab
  `DocSystem_Log`.
- Der bestehende onEdit-Trigger feuert bei unseren Writes mit — unkritisch (er aggregiert
  nur `TimePerMonth`), aber Schreibzugriffe werden minimiert.
- Schreiben nur per `Record_ID`-Match, unter `LockService`, nie leer über Bestand.
- Web-App bleibt „Jeder in der Organisation"; Schreib-Endpunkte zusätzlich per `WRITE_SECRET`.
- Alle Sheet-Struktur-Änderungen sind in [[SHEET-AENDERUNGEN]] spezifiziert und werden von
  Codex in der AppSheet-App nachgezogen.
