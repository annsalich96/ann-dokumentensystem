# Rota-Schriften

Die App verwendet **Rota** (Light 300 / Medium 500 / Bold 700).

```
Rota-Light.otf
Rota-Medium.otf
Rota-Bold.otf
```

Quelle im Vault: `02-brand/ANN ARCHITECTURE/FONTS/Rota Complete Family/`.

Die Dateien liegen im Repo, damit das gehostete Tool direkt in Rota rendert
(Entscheidung Ann, 2026-09-09 — Repo wird ohnehin privat gestellt). Rota ist eine
gekaufte Schrift; das Repo daher **nicht öffentlich streuen**.

**Volle Portabilität:** `python3 build.py` erzeugt `stundennachweis.standalone.html`
mit den Schriften als Base64 eingebettet — eine einzige Datei, läuft überall (auch
lokal per Doppelklick, auch bei privatem Hosting ohne GitHub Pages).
