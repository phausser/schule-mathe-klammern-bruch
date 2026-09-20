# Klammern & Distributivgesetz – Mathe-Übung

Kleine Lern-Webapp zum Üben von Klammern auflösen/setzen und dem
Distributivgesetz. Reines Frontend (HTML, CSS, JavaScript ohne
Abhängigkeiten), läuft direkt im Browser und über GitHub Pages.

## Spielprinzip

- 10 Aufgaben am Stück richtig lösen, um zu bestehen.
- Bei einer falschen Antwort geht's sofort zurück auf Aufgabe 1 – mit neu
  generierten Aufgaben.
- Nach bestandenem Durchlauf wird die benötigte Zeit angezeigt.

Die Aufgaben werden zufällig aus 5 Typen generiert: Ausklammern &
berechnen, geschickt rechnen, Klammern setzen, äquivalente Ausdrücke
zuordnen und typische Stolperstellen (Vorzeichenfehler) erkennen. Details
dazu stehen in [SPEC.md](SPEC.md).

## Lokal starten

Kein Build nötig – einfach `index.html` im Browser öffnen, oder lokal
über einen simplen Server ausliefern, z. B.:

```bash
python3 -m http.server 8000
```

und dann `http://localhost:8000` öffnen.

## Dateien

- `index.html`, `style.css` – Markup & Styling
- `fraction.js` – exakte Bruchrechnung für die Antwortprüfung
- `tasks.js` – Zufallsgeneratoren für die Aufgabentypen
- `app.js` – Spiellogik (Ablauf, Timer, Auswertung)
