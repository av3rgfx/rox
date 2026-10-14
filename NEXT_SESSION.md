# Stato del progetto e prossima sessione

Ultimo aggiornamento: 14 ottobre 2026, fine della prima sessione (PR #2 pronta da unire, PR #4 di Codex aperta e da
integrare, non da unire così com'è).

## Cosa c'è già (funziona, testato in headless su PC e telefono)

- Percorso reale, quello che fa il proprietario (verificato su un video di Street View che ha registrato): dal
  parcheggio del Panorama (43.938129, 10.939320) per Via Pietro Gherardini, Via Ginetta Chirici, Via Ubaldo Fantacci,
  Via Bure Vecchia Nord, Via Enrico Fermi, Via Dino Buzzati fino a Utensilferramenta Pistoiese (Via Luigi Salvatorelli,
  43.930245, 10.944464): 2215 m da OpenStreetMap. Una scorciatoia di 1,1 km giù per Via Bure Vecchia Nord è stata
  provata e scartata: non è la strada che fanno.
- Due modalità complete:
  - **INVESTI ROX**: partenza 13:58:15, timbratura entro le 14:00; Rox in 9 varianti (attraversa, saluta, telefona,
    mangia finocchio, carrello del Panorama, Grizzly, dorme, d'oro); combo fino a x8; traffico (−5 s), Ape, caffè turbo;
    muro di 4 Rox prima del traguardo "TIMBRA QUI"; titoli finali da "Collega modello" a "Leggenda della Ferramenta".
  - **ROX CHASE**: Rox sul Grizzly seduto al contrario, 5 cuori, lancia finocchi e cartelli di pavimento bagnato,
    scatta quando ti avvicini, schiva, scappa dopo ogni colpo, scorciatoia se lo superi; perdi se arriva al traguardo.
- Faccia vera di Rox ritagliata dalla prima foto su corpo pixel art (maglietta nera col logo "50", bermuda).
- Auto del giocatore: utilitaria rossa targata "UFP 50", vista da dietro.
- Comandi tastiera e touch, layout verticale e orizzontale, audio sintetizzato, record locali, condivisione.
- Edifici veri: ogni edificio della mappa vicino alla strada ha un'immagine sua (`art/buildings-custom.json`, 18
  immagini `b-*`); il Panorama è una facciata di 170 m lungo la corsia del parcheggio, che ha asfalto e auto
  parcheggiate; Utensilferramenta è un landmark (`lm-ufp`) più il suo secondo capannone (`b-ufp-side`). Strumenti:
  `CODEX.md`, `art/codex/`, `tools/codex-art.mjs`, `tools/buildings.mjs`, `tools/landmarks.mjs`, `tools/standins.mjs`.
- Sito pubblicato su GitHub Pages (`https://av3rgfx.github.io/rox/`), si aggiorna a ogni merge su `main`.

## Decisioni prese con il proprietario

- Entrambe le modalità (Investi e Chase). Rox deve vedersi bene: niente prima persona di Rox.
- Faccia vera ritagliata dalle foto (non generata).
- PC e telefono.
- Grafica gratis ma di qualità: Codex (o ChatGPT) con i prompt preparati; se non va, Higgsfield (connesso alla
  sessione, consuma i crediti del proprietario: chiedere prima). Niente RetroDiffusion (a pagamento).
- La strada deve somigliare il più possibile a quella vera (1:1): edifici, Panorama, Utensilferramenta, e ora anche
  la forma della strada, il parcheggio, semafori e rotonde.
- Street View: il proprietario ha registrato un video (link Drive nella conversazione, file
  `ScreenRecording_10-14-2026 17-59-45_1.mp4`, id Drive `1TIPDtQYwEhOnjqzf6phnmWuVX5aUjVPm`, 434 MB). Si guarda e si
  descrive a parole; le immagini non si usano mai come riferimento per generare e non entrano nel repository (termini
  di Google). Per scaricarlo: `curl -sSL "https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t"`,
  poi `ffmpeg` per estrarre i fotogrammi (la parte Street View è il riquadro in alto, `crop=1180:1060:0:150`).
  Tempi del video: 0–31 s Panorama e parcheggio, 32–56 s strade del parcheggio, 57–63 Via Gherardini, 64–73 rotonda
  di Via Sestini, 74–92 Via Chirici (distributore a 83–90), 93–118 rotonde e Via Fantacci, 119–164 Via Bure Vecchia Nord,
  165–175 rotonda di Via Fermi, 176–186 Via Fermi, 187–194 Via Buzzati, 195–230 Via Salvatorelli e Utensilferramenta.
- Pubblicazione su GitHub Pages: `https://av3rgfx.github.io/rox/`.

## Cosa sappiamo di Rox (per le battute)

- Si chiama Rossano, "Rox". Pranza sempre al Panorama. Mangia spesso il finocchio.
- Il "50" sulla maglietta è il logo dell'azienda.
- Nella foto spinge un lavapavimenti Grizzly arancione e blu, nel corridoio "IS" del magazzino (scaffali gialli e blu).
- Che auto guida: **da chiedere** (il messaggio si era interrotto a "guida una…").

## Da fare nella prossima sessione

### A. Integrare la PR #4 di Codex (subito, prima di tutto)

La PR #4 (`codex/palazzi-2`) è partita da un commit del branch precedente all'introduzione degli edifici `b-*`: contiene
immagini buone ma su una struttura vecchia. **Non unirla così**: dopo il merge della PR #2, prendere da
`origin/codex/palazzi-2` i file `art/raw/*.png` e integrarli nella struttura attuale, poi chiudere la #4 con un commento.

- Contenuto: `lm-ufp` (molto fedele: capannone sabbia a costoloni, scritta UTENSILFERRAMENTA PISTOIESE e triangolo UFP
  sul tetto, serranda, trabattello), `lm-panorama` (facciata intera con pilastri rossi, cipressi, ingresso a vetri e
  insegna PANORAMA), `lm-mensa` (torre rossa, fasce bianche e scure, tetto sospeso), `pistoia-apartment-1` e tutte le
  `pistoia-*` rigenerate.
- `lm-ufp`, `lm-mensa`, `pistoia-*`: copiare i raw in `art/raw/` (sostituiscono i disegni provvisori), poi
  `node tools/pixel-path/scripts/clean.mjs --trip .` e guardare cosa scarta. Sono già paddati? Se `clean` li dà `cut`,
  ripassarli con `node tools/codex-art.mjs import --src <cartella>`.
- `lm-panorama` non è più un landmark: il Panorama ora è `b-panorama-bay` (campata ripetibile) + `b-panorama-entrance`.
  Valutare se ricavare dal `lm-panorama` di Codex le due immagini (ritaglio della parte centrale per l'ingresso, di una
  campata per la ripetizione) o farle rigenerare a Codex con i prompt di `art/codex/PROMPTS-NUOVE.md`.
- Mancano ancora tutte le `b-*` tranne i provvisori: dopo l'integrazione, rigenerare `PROMPTS-NUOVE.md` con le sole
  immagini ancora mancanti (comando in `art/codex/MESSAGGIO-CODEX.md`) e dare al proprietario il messaggio per Codex.

### B. La strada più simile a quella vera (richiesta del proprietario, da verificare con lui)

Il proprietario, dalle schermate, vede edifici giusti ma strada diversa. Da controllare sul video e sui dati:

1. **Semafori dove non ci sono**: `layout.js` (riga ~206) mette un semaforo (`code: 'signal'`) a **ogni incrocio in
   zona costruita**: è una regola di Pixel Path, non un dato della mappa. Sostituirla con i semafori veri (nodi OSM
   `highway=traffic_signals` vicino al percorso, da aggiungere con una query Overpass in un file come
   `data/buildings.json`) o toglierli e metterli a mano dove il video li mostra. Lo stesso vale per le strisce pedonali
   (`cross`), da confrontare col video.
2. **Forma della strada davanti al Panorama**: la corsia del parcheggio è disegnata come una strada a due corsie con
   la linea di mezzeria e i cordoli; il percorso OSRM nel parcheggio fa anche delle "S" tra le corsie (m 90–160). Nella
   realtà: corsie del parcheggio senza mezzeria, stalli, aiuole, alberelli, lampioni, cartello STOP.
3. **Forma della strada davanti a Utensilferramenta**: l'arrivo è all'incrocio Via Dino Buzzati / Via Salvatorelli
   (video 187–215 s): strada di zona industriale, marciapiede con paletti arancioni, un traliccio, rifiuti abbandonati
   accanto. Controllare larghezze (`CLASSW` in `layout.js`) e la svolta finale.
4. **Rotonde**: si percorrono ma non c'è l'aiuola centrale; valutare di disegnarle (oggetto di gioco o patch del
   terreno in `layout.js`) dove il percorso ne attraversa una (Via Sestini, Via Fantacci, Via Fermi).
5. **Larghezza e segnaletica**: Via Gherardini e Via Chirici sono larghe con aiuole e pista ciclabile; Via Bure
   Vecchia Nord è stretta tra siepi e muri; Via Fermi ha filari di alberi e auto/camion parcheggiati a destra.
6. Strumento: `tools/test/` per gli screenshot, e una passata metro per metro confrontando gioco e video
   (corrispondenza tra metri e secondi del video sopra).

### C. Il resto

1. **Foto di Rox**: il proprietario ne manderà altre. Ritagliare (come `assets/rox/face.png`: maschera poligonale con
   Pillow, circa 53x70) e aggiungere espressioni: colpito/urlo, che mangia, che dorme, ghigno per il Chase. In
   `sprites.js` `buildRox` usa una sola faccia: estenderlo a una faccia per posa.
2. **Battute dell'ufficio**: chiedere frasi tipiche e tormentoni; aggiungerli a `SAY` in `game/main.js`.
3. **Auto di Rox**: chiedere il modello e disegnarla (per esempio parcheggiata al Panorama, o nel traffico).
4. **Boss finale nel magazzino UFP** (promesso nella proposta iniziale): una scena nel corridoio "IS" della foto, con
   Rox sul Grizzly come boss. Da progettare insieme.
5. **Classifica condivisa** tra colleghi (ora solo record locale): proposta Supabase (connesso alla sessione) con una
   tabella punteggi e nome del giocatore; valutare anche un anti-cheat minimo.
6. **Playtest con persone vere**: regolare la difficoltà. Valori attuali (2,2 km): Investi 105 s (13:58:15 → 14:00),
   un Rox ogni 34–70 m; Chase: Rox parte 75 m avanti, velocità 15–30 m/s contro 35 del giocatore, 5 cuori, colpo
   valido entro 1,7 m di lato. I record ripartono da zero (chiave `rox-best-v3`).

## Come provarlo

- In locale: `python3 -m http.server 8000` e apri `http://localhost:8000/` (`?mode=investi` / `?mode=chase`).
- Test automatici: `tools/test/README.md`.
