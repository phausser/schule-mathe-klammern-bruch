# SPEC – Mathe-Lern-App "Klammern & Distributivgesetz"

## Ziel

Reine Frontend-Webapp (HTML/CSS/JavaScript, kein Build-Step, kein Backend),
gehostet auf GitHub Pages. Übt das Auflösen/Setzen von Klammern und das
geschickte Rechnen mit dem Distributivgesetz (Vorlage: Aufgaben 9–13 vom
Aufgabenblatt).

## Spielprinzip

- Ein Durchlauf besteht aus **10 Aufgaben** in zufälliger Reihenfolge,
  zufällig aus den unten definierten Aufgabentypen gezogen (gemischt,
  keine Schwierigkeitsstufen).
- Bei **jedem Fehler** wird der Durchlauf sofort abgebrochen und beginnt
  wieder bei Aufgabe 1 (neuer Aufgabensatz, kein Aufgaben-Recycling).
- Nach **10 richtig gelösten Aufgaben in Folge** gilt die Übung als
  **bestanden**. Es wird die benötigte Zeit (Start beim Beginn von Aufgabe 1,
  Ende bei der 10. richtigen Antwort) angezeigt, z. B. `mm:ss`.
- Ein Timer läuft sichtbar während des Durchlaufs (fortlaufende Uhr).
- Fortschrittsanzeige "Aufgabe X / 10".

## Aufgabentypen

Alle Aufgaben werden **zur Laufzeit zufällig generiert** (keine feste
Aufgabenliste), mit Zahlenbereichen ähnlich dem Aufgabenblatt (kleine
ganze Zahlen, einfache Brüche mit Nennern wie 3,4,5,6,7,8,10,12,20;
Dezimalzahlen mit 1–2 Nachkommastellen).

### Typ A – Ausklammern & berechnen (Blatt-Aufgabe 9)

Form: `a·b ± a·c` → Nutzer klammert `a` aus und berechnet das Ergebnis.
Beispiel: `7 · 1/4 − 7 · 11/4`.
Antwort: numerischer Wert (Bruch oder Dezimalzahl, siehe Antwortformat).

### Typ B – Geschickt berechnen (Blatt-Aufgabe 12)

Form: gemischte Ausdrücke, bei denen Anwendung des Distributivgesetzes
sinnvoll ist oder auch nicht (z. B. `5/6·90 − 5/6·84`, `4·(5,3−1,3)`,
`(−40−2)·0,8`). Nutzer berechnet nur das Ergebnis (die Entscheidung
"anwenden oder nicht" wird nicht separat abgefragt, siehe Vereinfachung
unten – nur das Endergebnis zählt).
Antwort: numerischer Wert.

### Typ C – Klammern setzen & berechnen (Blatt-Aufgabe 13)

Form: Summe/Differenz von 3 Brüchen bzw. Dezimalzahlen, bei denen
geschicktes Klammern das Rechnen vereinfacht (z. B. `3/5 + 5/12 + 7/12`,
`−0,9 + 3,82 + 0,18`). Nutzer berechnet nur das Endergebnis.
Antwort: numerischer Wert.

### Typ D – Äquivalente Ausdrücke zuordnen (Blatt-Aufgabe 10)

Multiple-Choice: Referenzterm `a·(b − c)` wird angezeigt, dazu 4–6
Antwortkacheln mit Ausdrücken, von denen eine Teilmenge äquivalent ist
(inkl. Distributivgesetz, Vertauschung, Vorzeichenfehler-Distraktoren).
Nutzer wählt **alle** äquivalenten Ausdrücke aus (Mehrfachauswahl),
bestätigt mit "Prüfen". Nur exakt richtige Gesamtauswahl zählt als richtig.

### Typ E – Fehlersuche (Blatt-Aufgabe 11), als Multiple-Choice

Ein vorgerechneter Ausdruck mit einem klassischen Fehler wird gezeigt
(z. B. `−3 · (20 − 3) = −3 · 20 − 3 · 3` [Vorzeichenfehler] oder
`71 − (−29 − 53) = 71 − 29 + 53` [Klammer falsch aufgelöst]).
Nutzer wählt aus 3–4 Optionen die **korrekte Fehlerbeschreibung /
Korrektur** aus (Multiple-Choice mit genau einer richtigen Antwort).
Aufgabenpool: feste Sammlung typischer Fehler (siehe `tasks.js`,
mehrere Varianten pro Fehlerkategorie, zufällig ausgewählt und ggf. mit
zufälligen Zahlen neu instanziert).

## Antwortformat (Typ A, B, C)

- Eingabefeld akzeptiert:
  - Ganze Zahlen: `12`, `-5`
  - Dezimalzahlen: `3.5` oder `3,5` (Komma wird toleriert)
  - Brüche: `3/4`, `-7/2`
  - Gemischte Zahlen optional NICHT gefordert (nur unechte Brüche)
- Die App normalisiert eingegebene und erwartete Antwort auf einen
  gekürzten Bruch (bzw. Fließkommavergleich mit Toleranz `1e-9` für
  Dezimal-Ausdrücke) und vergleicht.
- Eine kurze Formatshilfe steht unter dem Eingabefeld ("Bruch als 3/4
  eingeben").

## UI / Screens

1. **Start-Screen**: Titel, kurze Erklärung, Button "Start".
2. **Aufgaben-Screen**: Fortschritt (X/10), Timer, Aufgabenstellung,
   passendes Eingabe-UI je Typ, Button "Prüfen", Feedback (richtig/falsch
   inline, kein Blocken).
3. **Fehler-Screen** (bei falscher Antwort): zeigt kurz die korrekte
   Lösung, Button "Neu starten" → zurück zu Aufgabe 1 mit neuem Satz.
4. **Erfolgs-Screen**: "Bestanden!", benötigte Zeit, Bestzeit-Vergleich,
   Konfetti, Button "Nochmal spielen".

## Pep-Elemente

- **Feedback-Animationen**: kurzer grüner Puls bei richtiger, Shake bei
  falscher Antwort (auf der Aufgaben-Box), mit kurzer Verzögerung bevor es
  weitergeht – Eingabe/Optionen sind währenddessen kurz gesperrt.
- **Konfetti** auf dem Erfolgs-Screen (reines CSS/JS, keine Bilder/Libs).
- **Streak-Badge** ("🔥 Serie: N") in der HUD-Zeile, sobald 3 oder mehr
  Aufgaben am Stück richtig gelöst wurden.
- **Ermutigungssprüche**: wechselnder, locker-motivierender Kurzspruch
  nach jeder richtigen Antwort (z. B. "Stark!", "Läuft bei dir!").
- **Bestzeit**: wird lokal im Browser gemerkt (`localStorage`) und beim
  Bestehen mit der aktuellen Zeit verglichen ("🏆 Neue Bestzeit!" bzw.
  Anzeige der bisherigen Bestzeit).

## Technik

- `index.html`, `style.css`, `app.js` (+ ggf. `tasks.js` für
  Aufgabengeneratoren, `fraction.js` für Bruchrechnung-Helper).
- Kein Framework, kein Bundler, keine JS-Abhängigkeiten. Läuft direkt per
  `index.html` im Browser und via GitHub Pages.
- Bruchrechnung: eigene kleine `Fraction`-Klasse/Modul (Addition,
  Subtraktion, Multiplikation, Kürzen via ggT, Vergleich, Formatierung).
- Responsives, buntes Design (mobiltauglich): Farbverlauf-Hintergrund,
  Google Font "Poppins" (mit Systemschrift-Fallback, falls die
  Foundry/Netzwerk nicht erreichbar ist).
- Zustand nur im Speicher (kein LocalStorage-Zwang, außer für die lokale
  Bestzeit); Reload = Neustart der Übung.

## Nicht im Scope (v1)

- Keine Nutzerkonten, kein serverseitiges Speichern von Highscores/Historie
  (nur eine lokale Bestzeit im Browser des jeweiligen Geräts, siehe
  "Pep-Elemente").
- Kein Server, keine Analytics.
- Keine Barrierefreiheits-Zertifizierung, aber grundlegende Semantik
  (Labels, Kontraste) wird beachtet.
