#!/usr/bin/env python3
"""Packt game.js in einen Link: Code -> Minify -> Raw-Deflate -> Zahl in Basis 43 -> URL-Fragment.

Die Ausgabe ist eine einzelne HTML-Datei (play.html), die den Link dekodiert und ausfuehrt.
Den Link (play.html#...) kann man dann als QR-Code kodieren.
"""
import pathlib
import re
import sys
import zlib

ALPHA = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$*+-./:"  # 43 Zeichen, QR-Alphanumerik-Zeichensatz
HERE = pathlib.Path(__file__).parent


def minify(src: str) -> str:
    # Nur sicher fuer dieses Beispiel: ganze Kommentarzeilen und Einrueckung entfernen.
    lines = [l.strip() for l in src.splitlines()]
    return "\n".join(l for l in lines if l and not l.startswith("//"))


def encode(payload: bytes) -> str:
    n = int.from_bytes(payload, "big")
    out = []
    while n:
        n, r = divmod(n, 43)
        out.append(ALPHA[r])
    return "".join(reversed(out)) or "0"


def decode(s: str) -> bytes:  # Gegenprobe, spiegelt den Browser-Dekoder
    n = 0
    for c in s:
        n = n * 43 + ALPHA.index(c)
    return n.to_bytes((n.bit_length() + 7) // 8, "big")


def main():
    src = (HERE / (sys.argv[1] if len(sys.argv) > 1 else "game.js")).read_text(encoding="utf-8")
    code = minify(src)
    comp = zlib.compressobj(9, zlib.DEFLATED, -15)  # raw deflate, wie DecompressionStream('deflate-raw')
    packed = comp.compress(code.encode("utf-8")) + comp.flush()
    payload = encode(packed)

    # Gegenprobe: Zahl zurueck, entpacken, muss exakt der minifizierte Code sein
    assert zlib.decompress(decode(payload), -15).decode("utf-8") == code

    # Die Spielseite: liest das Fragment, dekodiert und fuehrt den Code aus.
    page = """<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width">
<script>
onhashchange=()=>location.reload();
let n=0n,a='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$*+-./:';
for(const c of decodeURIComponent(location.hash.slice(1))) n=n*43n+BigInt(a.indexOf(c));
const b=[];for(;n;n>>=8n)b.unshift(Number(n&255n));
new Response(new Blob([new Uint8Array(b)]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text().then(eval);
</script>"""
    (HERE / "play.html").write_text(page + "\n", encoding="utf-8")
    link = f"play.html#{payload}"
    (HERE / "link.txt").write_text(link + "\n", encoding="utf-8")
    print(f"Code: {len(code)} Zeichen, gepackt: {len(packed)} Bytes, Link: {len(link)} Zeichen")
    print(link)


if __name__ == "__main__":
    sys.exit(main())
