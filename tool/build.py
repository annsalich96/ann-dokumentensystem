#!/usr/bin/env python3
"""
Baut aus jedem Dokumenten-Tool (*.html mit einer *.standalone.html-Gegenstelle)
eine vollständig eigenständige Datei: Rota-Schriften als Base64 eingebettet,
keine externen Dateien, läuft überall (lokal, privat gehostet, per Doppelklick).

    python3 build.py
"""
import base64, pathlib, re, sys

HERE = pathlib.Path(__file__).parent
SOURCES = ["stundennachweis.html", "rechnung.html"]
FONTS = {
    "Rota-Light.otf": 300,
    "Rota-Medium.otf": 500,
    "Rota-Bold.otf": 700,
}

def data_uri(path: pathlib.Path) -> str:
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:font/otf;base64,{b64}"

def build_one(src_name: str) -> int:
    src = HERE / src_name
    if not src.exists():
        return 0
    out = HERE / src_name.replace(".html", ".standalone.html")
    html = src.read_text(encoding="utf-8")
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
    # Hinweis im Titel-Tag
    html = re.sub(
        r"<title>([^<]*)</title>",
        lambda m: f"<title>{m.group(1)} — STANDALONE (Schriften eingebettet)</title>",
        html, count=1,
    )
    out.write_text(html, encoding="utf-8")
    kb = out.stat().st_size / 1024
    print(f"geschrieben: {out.name}  ({kb:.0f} KB)")
    return 0

def main() -> int:
    rc = 0
    for name in SOURCES:
        rc = build_one(name) or rc
    return rc

if __name__ == "__main__":
    raise SystemExit(main())
