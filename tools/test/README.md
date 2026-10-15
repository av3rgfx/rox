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
  chase fino alla vittoria, CORRIDOIO IS dal menu fino a Rox che scappa sugli scaffali, Investi timbrato in tempo e
  passaggio al corridoio IS col punteggio che si somma) e stampa gli errori della pagina.
- `node tools/test/boss.mjs [partite=6] [ritardo_ms=200] [OUT_DIR] [in_parallelo=3]`: la boss fight giocata da un bot
  che vede il gioco in ritardo come una persona (schiva quello che arriva, va addosso a Rox quando ha la batteria
  scarica, prende il caffè). Gioca a `?ts=3` (tre volte più veloce, nel tempo del gioco) e stampa per ogni partita:
  vinta o no, tempo, colpi dati, colpi presi e da cosa. Con OUT_DIR fa screenshot della prima partita e delle
  schermate finali; `VERBOSE=1` stampa lo stato ogni 3 s.
- `node tools/test/at.mjs OUT_DIR 0,500,1000 [w h]`: la strada vuota (niente Rox, niente traffico) ai metri indicati,
  per confrontarla col video tratto per tratto.
- `node tools/test/kong.mjs [partite=6] [ritardo_ms=200] [OUT_DIR] [in_parallelo=3]`: ROX KONG (il boss sugli scaffali)
  giocato da un bot che vede la merce in ritardo come una persona: va alla scala più vicina, salta quello che gli
  rotola contro (prevede dove sarà, con un errore di ±60 ms sul momento del salto), non sale se qualcosa scende dalla
  scala, si sposta dal punto esclamativo delle scatole che cadono, prende il casco (e il caffè se ha perso una vita).
  Gioca a `?ts=3` e stampa per ogni partita: vinta o no, tempo, scaffale raggiunto, colpi presi e da cosa, salti.
- `node tools/test/kombat.mjs [torri=6] [ritardo_ms=200] [OUT_DIR] [in_parallelo=3] [lottatore]`: ROX KOMBAT (il picchiaduro)
  giocato da un bot che vede le mosse del computer in ritardo come una persona: si avvicina, preme pugno e calcio circa
  3 volte al secondo quando è a tiro, tiene indietro per parare quello che ha visto arrivare, salta il nastro, si abbassa
  sotto catalogo e "nel mio ufficio", si sposta dall'ombra del bancale, fa il montante a chi salta, usa lo speciale a
  barra piena e a "FINISCILO!" preme SPECIALE (non sempre). Gioca a `?ts=3`, a turno con tutti i lottatori (o solo con
  quello indicato), e stampa per ogni torre: vinta o no, incontro raggiunto, round vinti e persi, finocchiality,
  punteggio, i colpi andati a segno per tipo. `FROM=2` parte dall'ultimo incontro (per provare solo Rox).
- `node tools/test/fighters.mjs OUT.png [scala=2] [R|L]`: un foglio con i lottatori di ROX KOMBAT in tutte le pose,
  rivolti a destra o a sinistra (la pagina è `tools/test/fighters.html`).
- `node tools/test/sprites.mjs OUT.png`: un foglio con tutti gli sprite (Rox in ogni posa, auto, oggetti, fumetti, e
  quelli di ROX KONG: Rox a metà misura, il magazziniere di lato, la merce).

Il bot è più bravo di una persona (sterza senza ritardo): in Chase vince in ~35 s, in Investi prende ~37 Rox su 42 e
timbra con 10–30 s di margine. Non mira mai dietro un'auto parcheggiata al marciapiede (una persona la vede).
Playtest della terza sessione con un bot "umano" (lo stesso con 150–300 ms di ritardo, script non salvato nel repo):
con 150 ms vince Chase 2 volte su 3 (su `main` 0 su 3) e in Investi timbra in tempo 5 volte su 6.

Playtest della quarta sessione, CORRIDOIO IS con `boss.mjs` (il bot non sbaglia mai la finestra della batteria: una
persona ci mette di più): 0 ms 6/6 vinte, 200 ms 9/9, 300 ms 9/9, 450 ms 6/6; ~73 s a partita, 2,7–4,2 colpi presi
in media (il caffè che cade a ogni colpo ridà vite: senza, a 200–300 ms si vinceva 4 volte su 6). Da cosa si prendono
quasi tutti i colpi: scatole e cartelli che scivolano. Bachi trovati dal bot e corretti:
il tuo muletto restava "agganciato" a Rox dopo un colpo, e a tutta velocità i finocchi ad arco non partivano mai.

Playtest della quinta sessione, ROX KONG con `kong.mjs` (9 partite per ritardo, 5 vite):
0 ms 8/9 vinte, 200 ms 7/9, 300 ms 8/9, 450 ms 7/9; ~75–90 s a partita, 3–4 colpi presi in media, quasi tutti da
rotoli di nastro, ruote e finocchi (le scatole che cadono si schivano). Correzioni nate dal bot:
- il salto era troppo preciso (stando fermi andava azzeccato entro 70 ms): ora salto più alto, piani più distanti
  (46 px), merce e area di contatto più piccole; la finestra buona è di ~0,3 s;
- le scale erano troppo vicine (si saliva in 50 s senza incontrare niente): ora, come in Donkey Kong, si parte vicino
  ai RESI e la scala per salire è sempre all'altra estremità della trave, quindi la merce arriva di fronte;
- un tocco veloce su SALTA (più breve di un fotogramma) non faceva saltare: ora resta "prenotato".
