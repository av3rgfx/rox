# Test automatici (headless)

Servono Node 20+ e Playwright con Chromium. Nell'ambiente cloud di Claude Code sono già installati
(`/opt/node-tools/node_modules/playwright`); altrove: `npm i playwright` in una cartella a parte e
`PLAYWRIGHT=<cartella>/node_modules/playwright/index.mjs`, più `CHROME=/usr/bin/google-chrome-stable` (o un altro
Chrome installato) per non scaricare il Chromium di Playwright.

Prima avvia un server statico dalla radice del repo: `python3 -m http.server 8765 --bind 127.0.0.1`

- `node tools/test/drive.mjs investi OUT_DIR [w h tempi_ms mobile]`: un bot gioca (insegue Rox, evita ostacoli e auto),
  fa screenshot ai tempi indicati e stampa lo stato (posizione, velocità, Rox presi, punteggio, cuori del boss).
  Esempi: `node tools/test/drive.mjs chase /tmp/shots 1280 720 6000,20000,40000` ·
  telefono verticale: `node tools/test/drive.mjs investi /tmp/shots 390 844 6000 mobile`
- `node tools/test/ui.mjs OUT_DIR`: clicca tutte le schermate come una persona (menu, istruzioni, partita, pausa, menu,
  chase fino alla vittoria) e stampa gli errori della pagina.
- `node tools/test/at.mjs OUT_DIR 0,500,1000 [w h]`: la strada vuota (niente Rox, niente traffico) ai metri indicati,
  per confrontarla col video tratto per tratto.
- `node tools/test/sprites.mjs OUT.png`: un foglio con tutti gli sprite (Rox in ogni posa, auto, oggetti, fumetti).

Il bot è più bravo di una persona (sterza senza ritardo): in Chase vince in ~35 s, in Investi prende ~39 Rox su 43.
