# QR-Spiel: Code im Link

Das Spiel (`game.js`) wird komplett in einen Link gepackt. Der Link landet als QR-Code, und die Seite führt den Code im Browser aus.

## Ablauf

1. Spiel ändern: `game.js` bearbeiten (normales, lesbares JavaScript, Kommentare sind erlaubt).
2. Packen: `python3 pack.py`
   - erzeugt `link.txt` (der Link) und `play.html` (Spielseite mit Dekoder).
3. QR-Code erzeugen (braucht `pip install qrcode`):
   `python3 -c "import qrcode; qrcode.make(open('link.txt').read().strip()).save('qr.png')"`

## Wichtig

- Der Link ist relativ (`play.html#...`). Damit der QR-Code auf dem Handy funktioniert, muss `play.html` online erreichbar sein, z. B. über GitHub Pages. Dann den Link mit der vollen URL (`https://.../play.html#...`) verwenden.
- Ein QR-Code mit Kleinbuchstaben im Link braucht mehr Platz. Mit dem Zeichensatz oben (nur Großbuchstaben und Ziffern) passt mehr hinein. Das Spiel ist klein genug, dass es in einen QR-Code passt.
- Die Kodierung entspricht dem Beispiel-Spiel von oben: Basis 43 mit Raw-Deflate.
