# Wie wir das bauen — nach dem Bauzeitenplan-Muster

> Stand: 2026-09-09 · Entwurf, wird nach Anns Bestätigung finalisiert

## 1. Was hier gebaut wird (in einem Satz)

Ein eigenständiges, gebrandetes Web-Tool, in das strukturierte Daten (aus AppSheet/Google
Sheets oder manuell) hineinlaufen, das daraus in einer **Live-A4-Vorschau** ein Dokument
nach dem echten ann-Design-System setzt, automatisch über mehrere Seiten umbricht und am
Ende ein **PDF** exportiert. Erster Anwendungsfall: **Stundennachweis**.

## 2. Das Muster vom Bauzeitenplan, das gut funktioniert hat

| Bauzeitenplan | Dokumenten-System |
| --- | --- |
| Ein eigenständiges HTML-Tool, Corporate Design fest im Code | genauso |
| Strukturierte Daten (Vorgänge, Abhängigkeiten) als JSON | strukturierte Daten (Dokument + Zeileneinträge) als JSON |
| Engine rechnet Daten → zeichnet den Gantt | Engine setzt Daten → zeichnet die A4-Seiten |
| Live-Vorschau im Browser | Live-A4-Vorschau im Browser |
| „Projekt speichern/öffnen" als Datei | „Dokument speichern/öffnen" als Datei |
| Drucken → vollständiges PDF | Export → vollständiges PDF |
| Artifact + GitHub Pages (ANN-Tools) | gleiches Hosting-Muster |
| Die Grafik ist nur eine **Ansicht** der Daten | genauso |

**Neu / anders als beim Bauzeitenplan:**
1. Das **Design-System ist ein eigener Baustein** (Grid, Typo, Header, Footer, Linien —
   aus den Illustrator-Vorlagen abgeleitet), auf dem alle Dokumenttypen aufsetzen.
2. **Automatischer Seitenumbruch** über beliebig viele Seiten, mit wiederholtem
   Tabellenkopf und fortlaufender Seitennummerierung.
3. Eine **Daten-Schnittstelle zu AppSheet / Google Sheets** — nicht nur lokale JSON-Dateien.
   Diese Schnittstelle wird gekapselt, damit sie später gegen eine echte Datenbank
   tauschbar ist, ohne das Tool neu zu bauen.

## 3. Die Bausteine (jeder einzeln testbar)

```
   [ Editor-UI ]        ← Mensch tippt strukturierte Infos ein
        │
        ▼
   [ Dokument-Datenmodell ]   Dokument-Kopf + Liste von Zeileneinträgen
        │            ▲
        │            └──── [ Daten-Zugriffs-Schicht ] ── AppSheet / Google Sheets
        ▼                     (später: Datenbank — Tausch ohne UI-Umbau)
   [ Layout-Engine ]    setzt Daten auf 12-Spalten / 13-pt-Raster,
        │               bricht automatisch auf Folgeseiten um
        ▼
   [ Live-A4-Vorschau ]   zeigt exakt das spätere Dokument
        │
        ▼
   [ PDF-Export ]
```

- **Design-System** (Code): die festen Regeln — Seitengeometrie, Raster, Schrift,
  Header, Footer, Linien, Umbruchverhalten. Ändert sich selten. Quelle: `docs/document-design-system/`.
- **Template „Stundennachweis"**: welche Felder der Kopf hat, welche Spalten die Tabelle
  hat, wo die Summe steht. Setzt auf dem Design-System auf. Quelle: `docs/templates/TIME_SHEET.md`.
- **Datenmodell**: `Document` (Projekt, Auftrag, Zeitraum, Datum, Titel …) + `DocumentItem`
  (Datum, Tätigkeit, Bearbeiter, Stunden). Referenziert bestehende Sheets-Datensätze,
  kopiert sie nicht. Quelle: `docs/data/`.
- **Daten-Zugriffs-Schicht**: eine kleine, klar umrissene Menge an Funktionen
  (`findProject`, `getTimeRecords(project, period)`, `saveDocument` …). Dahinter steckt
  in Phase 1 AppSheet/Sheets; niemand sonst im Tool weiß, woher die Daten kommen.
- **Layout-Engine**: rechnet, wie viele Zeilen auf eine Seite passen, erzeugt Folgeseiten,
  wiederholt Kopf/Fuß, nummeriert Seiten, platziert die Summe.
- **Editor-UI + Live-Vorschau**: die menschliche Oberfläche.
- **Aktionen für KI**: dieselben Funktionen wie die Editor-UI, nur ohne Klicken —
  z. B. „erstelle August-Stundennachweis für Kant Haus". Kommt später, blockiert nichts.

## 4. Reihenfolge (so wie Ann es vorgegeben hat)

1. **Design-Regeln niederschreiben** + alle Ressourcen (Logo, Schrift, Grid) zusammenlegen. ← *läuft*
2. **Header und Footer fixieren** — als erste fertige, „eingefrorene" Bausteine.
3. Restliches Design-System (Raster, Typo, Farben/Linien, Umbruchregeln) niederschreiben.
4. AppSheet-/Sheets-Datenmodell des Timetrackers ansehen → Datenmodell festlegen.
5. **Dann langsam den PDF-Ersteller/Viewer bauen** — zuerst statische A4-Vorschau des
   Stundennachweises mit Beispieldaten, dann Editor, dann Umbruch, dann AppSheet-Anbindung,
   dann PDF-Export.
6. KI-Aktionen + weitere Dokumenttypen später.

Jeder Schritt wird einzeln gezeigt und abgenommen, bevor der nächste beginnt.

## 5. Technische Grundentscheidungen (Vorschlag, noch offen)

- **Start als eigenständiges HTML-Tool** wie der Bauzeitenplan (schnell sichtbar,
  einfach zu hosten). Wenn die AppSheet-Anbindung mehr braucht, kommt ein kleiner
  Server-/Apps-Script-Teil **nur für den Datenzugriff** dazu — der Rest bleibt gleich.
- **PDF-Export (global, für jeden Dokumenttyp):** echtes Vektor-PDF per jsPDF, **direkter
  Download ohne Browser-Druckdialog** (Ann, 2026-09-09/10 — „das will ich nicht" zum
  Druckdialog). Voraussetzung: Rota-Schriften als **TTF** einbetten (jsPDF kann kein
  OTF/CFF; Konvertierung per `otf2ttf`). HTML-Vorschau und PDF-Renderer teilen sich dieselben
  Layout-Positionen (eine Funktion, kein zweiter, getrennt gepflegter Satz Koordinaten —
  sonst laufen Vorschau und PDF auseinander).
- **Druckausgabe (`@media print`, global):** explizite Seitenhöhe knapp unter A4
  (296,6 mm statt 297 mm) + `page-break-after`-Regeln, sonst hängt eine leere Zusatzseite an.
- **Bildschirm-Zoom der Vorschau:** CSS `transform: scale()`, **nicht** CSS `zoom` — `zoom`
  verzerrt/bricht den Textsatz bei hohen Werten.
- **Rendering-Einheit**: Millimeter, 1:1 zu A4 — kein Pixel-Rätselraten.
