# TODO

## Setup
- [x] Projektgerüst anlegen: `index.html`, `style.css`, `app.js`, `fraction.js`, `tasks.js`
- [ ] `.gitignore` (falls nötig), `README.md` mit Kurzbeschreibung & Link zu GitHub Pages

## Kern-Bausteine
- [x] `fraction.js`: Fraction-Klasse (add, sub, mul, gcd/kürzen, toString, fromString-Parser, exakter Vergleich)
- [x] `tasks.js`: Generatoren für Typ A (Ausklammern), B (geschickt berechnen), C (Klammern setzen), D (Zuordnung), E (Fehlersuche-Pool)
- [x] `app.js`: State-Machine (Start → Frage 1..10 → Erfolg / Fehler → Neustart)
- [x] Timer-Logik (Start/Stop/Format mm:ss)
- [x] Fortschrittsanzeige (X/10)

## UI
- [x] Start-Screen
- [x] Aufgaben-Screen mit dynamischem Eingabe-UI je Typ (Textfeld vs. Multiple-Choice-Kacheln)
- [x] Feedback-Zustand (richtig/falsch, kurze Erklärung bei falsch)
- [x] Fehler-Screen mit "Neu starten"
- [x] Erfolgs-Screen mit Zeitanzeige und "Nochmal spielen"
- [x] Responsive Layout (Mobile-first), einfaches, freundliches Design

## Aufgabentypen im Detail
- [x] Typ A: Ausklammern & berechnen (a·b ± a·c), Antwort als Bruch/Dezimal
- [x] Typ B: Geschickt berechnen (gemischte Distributiv-/Nicht-Distributiv-Fälle, 7 Templates)
- [x] Typ C: Klammern setzen & berechnen (Summe/Differenz aus 3–4 Termen)
- [x] Typ D: Äquivalente Ausdrücke zuordnen (Multiple-Choice, Mehrfachauswahl, Distraktoren inkl. Vorzeichenfehler)
- [x] Typ E: Fehlersuche als Multiple-Choice (3 Fehlerkategorien, zufällige Zahlen-Instanzierung)

## Antwort-Validierung
- [x] Parser für Nutzereingabe (Ganzzahl, Dezimal mit `,`/`.`, Bruch `a/b`, negative Vorzeichen)
- [x] Vergleich normalisiert (exakter Bruchvergleich nach Kürzen)
- [x] Formatshilfe-Text unter Eingabefeld

## Spiellogik
- [x] Bei falscher Antwort: sofortiger Abbruch, Anzeige der korrekten Lösung, Reset auf Aufgabe 1 mit neuem Aufgabenssatz
- [x] Bei 10/10 richtig: Erfolgs-Screen mit Zeit
- [x] Kein Aufgaben-Recycling zwischen Durchläufen (rein zufällig neu generiert)

## Qualität / Tests
- [x] Automatisierte Generator-Checks (5000 Durchläufe je Typ, Node) – 0 Fehler
- [x] Browser-Test mit Playwright/Chromium: kompletter Erfolgspfad (10/10) und Fehlerpfad (Reset) geprüft
- [ ] Edge Cases weiter beobachten: negative Ergebnisse, Bruch kürzen, Eingabe mit Komma, 0 als Ergebnis
- [ ] Cross-Check: Aufgaben aus SPEC.md (Beispielaufgaben 9a–h, 12a–h, 13a–f) manuell nachrechnen lassen

## Deployment
- [ ] GitHub Pages Konfiguration prüfen/einrichten (Settings → Pages, Branch/Ordner)
- [x] Commits & Push auf `claude/math-learning-app-ry5x8b`
