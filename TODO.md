# TODO

## Setup
- [ ] Projektgerüst anlegen: `index.html`, `style.css`, `app.js`, `fraction.js`, `tasks.js`
- [ ] `.gitignore` (falls nötig), `README.md` mit Kurzbeschreibung & Link zu GitHub Pages

## Kern-Bausteine
- [ ] `fraction.js`: Fraction-Klasse (add, sub, mul, gcd/kürzen, toString, fromString-Parser, Vergleich mit Toleranz)
- [ ] `tasks.js`: Generatoren für Typ A (Ausklammern), B (geschickt berechnen), C (Klammern setzen), D (Zuordnung), E (Fehlersuche-Pool)
- [ ] `app.js`: State-Machine (Start → Frage 1..10 → Erfolg / Fehler → Neustart)
- [ ] Timer-Logik (Start/Stop/Format mm:ss)
- [ ] Fortschrittsanzeige (X/10)

## UI
- [ ] Start-Screen
- [ ] Aufgaben-Screen mit dynamischem Eingabe-UI je Typ (Textfeld vs. Multiple-Choice-Kacheln)
- [ ] Feedback-Zustand (richtig/falsch, kurze Erklärung bei falsch)
- [ ] Fehler-Screen mit "Neu starten"
- [ ] Erfolgs-Screen mit Zeitanzeige und "Nochmal spielen"
- [ ] Responsive Layout (Mobile-first), einfaches, freundliches Design

## Aufgabentypen im Detail
- [ ] Typ A: Ausklammern & berechnen (a·b ± a·c), Antwort als Bruch/Dezimal
- [ ] Typ B: Geschickt berechnen (gemischte Distributiv-/Nicht-Distributiv-Fälle)
- [ ] Typ C: Klammern setzen & berechnen (Summe/Differenz aus 3 Termen)
- [ ] Typ D: Äquivalente Ausdrücke zuordnen (Multiple-Choice, Mehrfachauswahl, Distraktoren inkl. Vorzeichenfehler)
- [ ] Typ E: Fehlersuche als Multiple-Choice (fester Fehlerpool, zufällige Zahlen-Instanzierung)

## Antwort-Validierung
- [ ] Parser für Nutzereingabe (Ganzzahl, Dezimal mit `,`/`.`, Bruch `a/b`, negative Vorzeichen)
- [ ] Vergleich normalisiert (gekürzter Bruch bzw. Float-Toleranz)
- [ ] Formatshilfe-Text unter Eingabefeld

## Spiellogik
- [ ] Bei falscher Antwort: sofortiger Abbruch, Anzeige der korrekten Lösung, Reset auf Aufgabe 1 mit neuem Aufgabenssatz
- [ ] Bei 10/10 richtig: Erfolgs-Screen mit Zeit
- [ ] Kein Aufgaben-Recycling zwischen Durchläufen (rein zufällig neu generiert)

## Qualität / Tests
- [ ] Manuelle Testdurchläufe im Browser (Chromium) für alle 5 Typen
- [ ] Edge Cases: negative Ergebnisse, Bruch kürzen, Eingabe mit Komma, 0 als Ergebnis
- [ ] Cross-Check: Aufgaben aus SPEC.md (Beispielaufgaben 9a–h, 12a–h, 13a–f) manuell nachrechnen lassen

## Deployment
- [ ] GitHub Pages Konfiguration prüfen/einrichten (Settings → Pages, Branch/Ordner)
- [ ] Finaler Commit & Push auf `claude/math-learning-app-ry5x8b`
