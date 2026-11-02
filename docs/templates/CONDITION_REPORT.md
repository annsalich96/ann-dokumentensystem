# Leistungsnachweis / Zustandsfeststellung (CONDITION_REPORT)

> Letzte Aktualisierung: 2026-11-02
> Editor: `tool/leistungsnachweis.html` · Layout-Quelle: `design-sources/Leistungsnachweis/Zustandsfeststellung(_grid).pdf`
> Siehe auch: [[OFFER]], [[typografie]], [[abstaende-und-raster]]

Erste Fassung nach Anns Vorgaben vom 2026-11-02. Ann prüft und meldet Änderungen.

## Aufbau

| Element | Wert | Quelle |
| --- | --- | --- |
| Kopf | wie alle Dokumente; Zeile 2 = `Auftragsnr.: … vom …` (leer, wenn keine Nr.) | Layout S. 1 |
| Titel | Rota Bold 10 pt, K13 (Grundlinie 78,1 mm) | Layout |
| Angaben | 2 Reihen × 3 Blöcke, Spalten 3 / 6 / 9 (45,8 / 91,9 / 138,0 mm); Beschriftung Versal 8 pt, Inhalt 10 pt; 1 Leerzeile zwischen den Reihen | Layout |
| Abschnitte | `01: Überschrift` Bold 10 pt; Text 10 pt Blocksatz; Stichpunkt „•“ Sp. 3, Text Sp. 4; 2 Leerzeilen nach den Angaben, 1 zwischen Abschnitten | Layout |
| Fotos | je Abschnitt beliebig viele Blöcke, 1 BL Abstand | Ann, 2026-11-02 |
| Unterschriften | Linie auf K53 (258,1 mm) der letzten Seite, Auftraggeber Sp. 3–7, Auftragnehmer Sp. 8–12 | Layout S. 2 |

## Fotoformate

| Format | Spalten | Höhe |
| --- | --- | --- |
| Ein Foto groß | 3–12 | 18 BL (82,5 mm) |
| Zwei Fotos nebeneinander | 3–7 und 8–12 | 14 BL (64,2 mm) |
| Hochformat + Querformat | 3–5 und 6–12 (getauscht: 3–9 und 10–12) | 14 BL (64,2 mm) |

Fotos werden mittig auf das Rahmenformat zugeschnitten; Ausschnitt (↔ ↕) und Zoom sind je Foto einstellbar. Ein Fotoblock wird nie allein von seinem Abschnitt getrennt: Die letzten Textzeilen wandern mit auf die neue Seite.

## Daten aus AppSheet (Datenbrücke `getReportContext`, nur lesend)

| Feld | AppSheet |
| --- | --- |
| Projekt im Kopf, Kürzel | `Projects` → `Project Name`, `Project Code` |
| Bauvorhaben | `Projects` → `Project Name` + `Address` |
| Auftragnehmer (ausführendes Gewerk) | `Collaborators` → `Company Name`, `Company Adress`; gruppiert nach `Company Discipline` |
| Beteiligte | fest „Architekt: Ann-Kathrin Salich“ + `Company Name: Contact Person Name` des Collaborators |
| Auftraggeber | Kunde des Projekts aus `Clients` (Straße/PLZ/Ort); ohne Adresse: `Bill Name`/`Bill Address` des Projekts |

Collaborators sind in AppSheet keinem Projekt zugeordnet (`Related Projects` überall leer). Deshalb zeigt die Auswahl alle Gewerke.

## Offen

- [ ] Auftragsnr.: Woher kommt sie (eigenes Register für Gewerk-Aufträge oder Freitext)?
- [ ] Beschriftungen der Angaben und Standard-Abschnitte fest oder je Dokument änderbar?
- [ ] Ablage des PDFs im Projektordner und Register-Eintrag (wie beim Angebot)?
- [ ] Dateiname: `Condition_Report_<Kürzel>_<JJMMTT>.pdf` (englisch nach Büro-Regel), bestätigen.
