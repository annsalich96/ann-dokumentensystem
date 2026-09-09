# tool/ — Stundennachweis-Ersteller (Prototyp)

> Stand: 2026-09-09 · v0.1

## Was das ist

Erster funktionierender Prototyp nach [[BUILD_APPROACH]] / [[01_SYSTEM_ARCHITECTURE]]:
ein eigenständiges HTML-Tool, das einen **Stundennachweis** nach dem Design-System setzt,
automatisch auf mehrere Seiten umbricht und als PDF exportierbar ist.

## Starten

`stundennachweis.html` im Browser öffnen. Wegen `@font-face` am besten über einen lokalen
Server statt Doppelklick:

```
cd tool
python3 -m http.server 8777
# http://localhost:8777/stundennachweis.html
```

## Was funktioniert (v0.1)

- A4-Layout nach den eingefrorenen Regeln: 12-Spalten-Raster, 13-pt-Baseline, Header
  (Wortmarke, Monogramm, Titel + „Berlin, TT.MM.JJJJ", 3 Graulinien), Footer (5 Blöcke +
  `Page` `n/m`), Farben Schwarz `#0A0A0A` / Linien `#8C8C8C`.
- Editor links: Kopf, Auftrag, Projekt, Zeitraum, Zeiteinträge (Zeilen hinzufügen/löschen,
  Auto-Summe). „Intelligenter" Titelvorschlag `Anlage <NN>_Stundennachweis`, überschreibbar.
- Live-A4-Vorschau rechts, Zoom.
- **Pagination-Engine:** Tabellenzeilen fließen; Überlauf → neue Seite; Tabellenkopf wird
  wiederholt; Metadaten-Block nur auf Seite 1; `Gesamt` nur auf der letzten Seite;
  Seitenzahlen `n/m` nach abgeschlossener Pagination. Getestet mit 2 / 14 / 45 Zeilen.
- Speichern/Öffnen als `.json` (Dokument-Modell). „Als PDF exportieren" = Browser-Druck.

## Annahmen, die noch verfeinert werden (im Code als `// ANNAHME`)

| Thema | Aktuelle Annahme | Klärung |
| --- | --- | --- |
| Tabellenkopf Folgeseite | Grundlinie bei `bl(12)` (Header-Unterkante + 3 BL) | O-006-nah, visuell prüfen |
| Letzte Zeile spätestens | `maxRowBaseline = 250 mm` | Ann testet, Wert justieren |
| `Gesamt` | fix bei `bl≈53` (256,6 mm), nur letzte Seite | docs O-012 |
| Graulinie unter Zeile | 3,4 mm unter Textgrundlinie | visuell justieren (`--baseline-fudge`, `ruleOffset`) |
| Erste Datenzeile | 2 BL unter dem Tabellenkopf | Quelle zeigt ~1,4 BL — prüfen |
| USt-IdNr im Footer | Platzhalter `DE123456789` | echte Nummer eintragen (`BUERO` im Code / später `Company Info`) |
| Einrückung Fließtext | n/a (Stundennachweis hat keinen Fließtext) | globale Regel offen (O-009) |

## Noch nicht drin (kommt laut Roadmap)

- Laden echter Zeiteinträge aus Google Sheets / AppSheet (`Project Management NEW`,
  siehe [[stundennachweis-datenquellen]]) — Button ist als Platzhalter vorhanden.
- Neues Dokumenten-Sheet (`Documents`/`DocumentItems`), Speichern zurück in Sheets.
- Node-Service + Headless-Chromium für exakten PDF-Export und den KI-Weg (`/api`).
- Weitere Dokumenttypen (Rechnung, Angebot …).

## Dateien

- `stundennachweis.html` — die App (Design-System + Modell + Engine + Renderer + Editor)
- `fonts/Rota-{Light,Medium,Bold}.otf` — für die Anzeige; für Hosting später → woff2
