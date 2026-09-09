#!/usr/bin/env python3
"""
Baut aus stundennachweis.html eine vollständig eigenständige Datei:
stundennachweis.standalone.html  — Rota-Schriften als Base64 eingebettet,
keine externen Dateien, läuft überall (lokal, privat gehostet, per Doppelklick).

    python3 build.py
"""
import base64, pathlib, re, sys

HERE = pathlib.Path(__file__).parent
SRC = HERE / "stundennachweis.html"
OUT = HERE / "stundennachweis.standalone.html"
FONTS = {
    "Rota-Light.otf": 300,
    "Rota-Medium.otf": 500,
    "Rota-Bold.otf": 700,
}

def data_uri(path: pathlib.Path) -> str:
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:font/otf;base64,{b64}"

def main() -> int:
    html = SRC.read_text(encoding="utf-8")
    missing = [f for f in FONTS if not (HERE / "fonts" / f).exists()]
    if missing:
        print("Fehlende Schriften in fonts/:", ", ".join(missing), file=sys.stderr)
        return 1
    for fname in FONTS:
        uri = data_uri(HERE / "fonts" / fname)
        html = html.replace(f'url("fonts/{fname}")', f'url({uri})')
    # pdf-fonts.js (Rota-TTF Base64 für jsPDF) einbetten
    pf = HERE / "pdf-fonts.js"
    if pf.exists():
        html = html.replace(
            '<script src="pdf-fonts.js"></script>',
            "<script>\n" + pf.read_text(encoding="utf-8") + "\n</script>",
        )
    # Hinweis in den Titelkommentar
    html = html.replace(
        "Stundennachweis-Ersteller / Viewer",
        "Stundennachweis-Ersteller / Viewer  —  STANDALONE (Schriften eingebettet)",
    )
    OUT.write_text(html, encoding="utf-8")
    kb = OUT.stat().st_size / 1024
    print(f"geschrieben: {OUT.name}  ({kb:.0f} KB)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
