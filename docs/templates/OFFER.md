# OFFER — Angebots-Editor (Dokumenttyp Angebot)

> Letzte Aktualisierung: 2026-10-26
> Siehe auch: [[README]], [[typografie]], [[abstaende-und-raster]], [[angebots-system]]

Layout-Quelle: `design-sources/angebot/Angebote_lang.pdf` (+ `_grid.pdf`).
Die Kurzvariante (`Angebote_kurz.pdf`) wird vorerst **nicht** gebaut.

## Von Ann bestätigte Regeln (2026-10-26)

1. Gebaut wird zuerst das **lange Format**.
2. Feste Reihenfolge der Teile:
   1. **Anschreiben** (Seite 1, immer)
   2. **Übersicht** (Seite 2: Aufgabenstellung, Rahmenbedingungen, Angebotsübersicht mit Summen)
   3. **Leistungsübersicht im Detail** (ab Seite 3, so viele Seiten wie nötig)
   4. **AGB-Teil** (immer am Ende, eine oder mehrere Seiten)
3. Der AGB-Teil ist Fließtext mit **immer gleichen Überschriften**. Die Texte liegen als
   Vorlage gespeichert vor, sind aber **pro Angebot frei änderbar**.

## Aus der Vorlage abgelesen (noch nicht bestätigt)

- AGB-Überschriften im langen Angebot: Anmerkungen · Vergütung · Zahlungen · Zeitplan · Beauftragung,
  danach zwei Unterschriftslinien (Auftraggeber, Auftragnehmer).
- Positionen sind nach Gruppen geordnet (Gruppenname in der linken Randspalte, Nummer `Gruppe.Position`).
- Detailblock je Position: Titel · Leistungsumfang (Aufzählung) · optional Arbeitsergebnis · Kostenzeile
  (Rolle, Abrechnungsart, Menge, Satz, Gesamt).
- Fließtext und Aufzählungen dürfen über Seiten umbrechen.

4. „Nutzungsrechte“ ist ein optionaler Abschnitt im Bedingungsteil.
5. Alle Bedingungs-Abschnitte sind einzeln abwählbar.
6. Aufgabenstellung und Rahmenbedingungen (Übersicht) sind optional zubuchbar.
7. Zwischenüberschriften einheitlich **ohne** Doppelpunkt.
8. Werte im Text (Angebotsnr., Datum, Stundensätze) automatisch — Ziel: aus AppSheet.
9. Kopf mit drei Zeilen (Projekt · Angebotsnr. · Ort, Datum) — gilt für alle Dokumente (DECISION-012).

## Umsetzung (tool/angebot.html, Stand 2026-10-26)

| Element | Wert |
| --- | --- |
| Kopf | Zeilen K5/K7/K9 (je 2 BL), Linien K5/K7/K9/K11 |
| Erster Inhalt jeder Seite | K13 (2 BL Abstand unter der Kopf-Linie K11) |
| Textkante | Spalte 3 (45,8 mm) bis 195 mm, Blocksatz (letzte Absatzzeile linksbündig) |
| „ANGEBOT“ | Spalte 1, Rota Bold 10 pt, auf Höhe der Anrede |
| Empfänger → Anrede | 3 BL Leerraum |
| Gruß → Name | 3 BL Leerraum |
| Abschnittsüberschrift | Rota Bold 8 pt, Text 1 BL darunter |
| Abschnitt → Abschnitt | Übersicht 2 BL, Bedingungen 1 BL Leerraum |
| Übersichtstabelle | POS. Sp. 3 · LEISTUNG 56,6 mm (gemessen) · ABRECHNUNGSART Sp. 7 · MENGE Sp. 9 · SATZ rechtsbündig an Sp. 11 · GESAMT rechtsbündig 195 mm; Zeilen 2 BL |
| Gruppenname / Nr. im Detail | Bold 8 pt, rechtsbündig an der Kante von Spalte 2 |
| Positionstitel | 2-BL-Zeile, Bold 8 pt |
| Aufzählung | Zeile beginnt mit „- “ → „•“ Sp. 3, Text Sp. 4 (in Positionen bis Ende Sp. 11); frei mit Fließtext mischbar |
| Kostenzeile | **0,5 BL** unter der Aufzählung (bewusster Halb-Raster-Versatz, Ann 2026-10-26), Linie oben + unten, 2 BL; folgende Position läuft im halben Raster weiter |
| Summenblock | Textmitte jeder Zeile **auf** einer Rasterlinie (Band ab x,5), mind. 1 BL unter der letzten Tabellenlinie; Abschlusslinie auf der nächsten ganzen Rasterlinie; Label Sp. 8 |
| Unterschrift | 4 BL Leerraum, Linie Sp. 3–Sp. 7 und Sp. 8–195 mm |
| Umbruch | mind. 2 BL vor dem Footer (letzte Inhaltszeile endet ≤ K55) |

## Abweichungen von der Vorlage (bewusst, bitte prüfen)

- „ANGEBOT“ in 10 pt statt 12 pt (Regel: nur 10 oder 8 pt).
- ABRECHNUNGSART in der Detailtabelle wie in der Übersicht auf Spalte 7 und mit Spaltenkopf.
- Keine Silbentrennung im Blocksatz → bei langen Wörtern teils große Wortabstände.

## Nummer, Projekt, Empfänger (Ann, 2026-10-26)

- **Angebotsnr.:** `OFF_<Projekt-Kürzel>_<lfd. Nr. je Projekt, 2-stellig>_<JJMMTT>`, z. B. `OFF_KHE_07_261021`.
  Laufende Nummer **pro Projekt** (nicht pro Jahr). Vorschlag = höchste Nummer im Register
  `DocSystem_Offers` + 1, überschreibbar. Beim PDF-Export wird das Angebot dort eingetragen.
- **Projekt-Kürzel (automatisch, nie doppelt):** Die Datenbrücke vergibt jedem externen Projekt ohne
  Kürzel eins und schreibt es in `Projects` → `Project Code`. Regel, aus dem `Project Name`:
  - 3+ Wörter: Anfangsbuchstaben der ersten drei (KANT HOUSE ENTRANCES → KHE)
  - 2 Wörter: beide Anfangsbuchstaben + 2. Buchstabe des zweiten Wortes (RING CENTER → RCE)
  - 1 Wort: die ersten drei Buchstaben (GUNDILITOR → GUN)
  - vergeben → dritter Buchstabe = nächster Buchstabe des letzten Wortes (RCE → RCN), notfalls A–Z.
  Ein Kürzel ändert sich nie wieder (die Angebotsnummern hängen daran).
- **Projekt:** Dropdown, **nur externe Projekte** (`Billable` = Y). Im Kopf steht der `Project Name`.
- **Kunde = Firma + Ansprechpersonen:**
  - Firma in `Clients`: `Client Name` (in AppSheet als „Company Name“ anzeigen), neue Spalten
    `Company Street` (Straße + Nr.), `Company Postal Code`, `Company City`, `Tax Number`; `Email`/`Phone` vorhanden.
  - Ansprechpersonen im neuen Tab `Contacts`: `Contact_ID`, `Client_ID` (Ref → Clients), `Salutation`
    (Herr/Frau), `First Name`, `Last Name`, `Email`, `Phone`. Eine Firma kann mehrere Personen haben.
  - Projekt merkt sich Firma (`Client`) und Standard-Ansprechperson (neue Spalte `Contact`).
  - Fälle: nur Firma · Firma + eine Person · Firma + mehrere Personen · Privatperson (Firmenname = Name der Person).
  - Im Angebot: Person · Firma · Straße · PLZ Ort; Anrede aus Herr/Frau + Nachname, ohne Person
    „Sehr geehrte Damen und Herren“. Steuernummer, E-Mail, Telefon nicht im Angebot.
  - Hat die Firma noch keine Adresse, nimmt der Editor `Bill Name`/`Bill Address` des Projekts.
- **Editor-Reihenfolge je Position:** Leistung · Leistungsumfang · Arbeitsergebnis · Kostenzeile ·
  Abrechnungsart / Menge / Satz netto / Gesamt (automatisch) — wie im Angebot.

## Offen

- Stundensätze aus AppSheet statt aus dem Editor.
- Tabellenkopf auf Folgeseiten der Detailtabelle wiederholen? (Vorlage: nein)
- Kurzformat.
