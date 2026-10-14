# Stato del progetto e prossima sessione

Ultimo aggiornamento: 14 ottobre 2026 (fine della prima sessione).

## Cosa c'è già (funziona, testato in headless su PC e telefono)

- Percorso reale, come su Google Maps: dal Panorama (si parte su Via Bure Vecchia Nord accanto al parcheggio,
  43.938067, 10.940142) giù per Via Bure Vecchia Nord, Via Enrico Fermi, Via Dino Buzzati, fino a Utensilferramenta
  Pistoiese (Via Luigi Salvatorelli 161, 43.930245, 10.944464): 1145 m da OpenStreetMap. La prima versione partiva
  dentro il parcheggio e faceva un giro di 1 km in più (2,2 km): corretto su segnalazione del proprietario.
- Due modalità complete:
  - **INVESTI ROX**: partenza 13:59:00, timbratura entro le 14:00 (un minuto); Rox in 9 varianti (attraversa, saluta, telefona,
    mangia finocchio, carrello del Panorama, Grizzly, dorme, d'oro); combo fino a x8; traffico (−5 s), Ape, caffè turbo;
    muro di 4 Rox prima del traguardo "TIMBRA QUI"; titoli finali da "Collega modello" a "Leggenda della Ferramenta".
  - **ROX CHASE**: Rox sul Grizzly seduto al contrario, 5 cuori, lancia finocchi e cartelli di pavimento bagnato,
    scatta quando ti avvicini, schiva, scappa dopo ogni colpo, scorciatoia se lo superi; perdi se arriva al traguardo.
- Faccia vera di Rox ritagliata dalla prima foto su corpo pixel art (maglietta nera col logo "50", bermuda).
- Auto del giocatore: utilitaria rossa targata "UFP 50", vista da dietro.
- Comandi tastiera e touch, layout verticale e orizzontale, audio sintetizzato, record locali, condivisione.
- Palazzi: 11 immagini fatte con Codex, il resto provvisorio (vedi punto 6). Edifici veri come landmark al loro posto.
  Prompt e strumenti: `CODEX.md`, `art/codex/`, `tools/codex-art.mjs`, `tools/landmarks.mjs`.
- Sito pubblicato su GitHub Pages (`https://av3rgfx.github.io/rox/`), si aggiorna a ogni merge su `main`.

## Decisioni prese con il proprietario

- Entrambe le modalità (Investi e Chase). Rox deve vedersi bene: niente prima persona di Rox.
- Faccia vera ritagliata dalle foto (non generata).
- PC e telefono.
- Grafica dei palazzi gratis ma di qualità: Codex (o ChatGPT) con i prompt preparati; se non va, Higgsfield
  (connesso alla sessione, consuma i crediti del proprietario: chiedere prima). Niente RetroDiffusion (a pagamento).
- Pubblicazione su GitHub Pages: `https://av3rgfx.github.io/rox/`.

## Cosa sappiamo di Rox (per le battute)

- Si chiama Rossano, "Rox". Pranza sempre al Panorama. Mangia spesso il finocchio.
- Il "50" sulla maglietta è il logo dell'azienda.
- Nella foto spinge un lavapavimenti Grizzly arancione e blu, nel corridoio "IS" del magazzino (scaffali gialli e blu).
- Che auto guida: **da chiedere** (il messaggio si era interrotto a "guida una…").

## Da fare nella prossima sessione

1. **Foto di Rox**: il proprietario ne manderà altre. Ritagliare (vedi come è stato fatto per `assets/rox/face.png`:
   maschera poligonale con Pillow, circa 53x70) e aggiungere espressioni: colpito/urlo, che mangia, che dorme, ghigno
   per il Chase. In `sprites.js` `buildRox` usa una sola faccia: estenderlo a una faccia per posa.
2. **Battute dell'ufficio**: chiedere frasi tipiche e tormentoni; aggiungerli a `SAY` in `game/main.js`.
3. **Auto di Rox**: chiedere il modello e disegnarla (per esempio parcheggiata al Panorama, o come variante nel traffico).
4. **Boss finale nel magazzino UFP** (promesso nella proposta iniziale): una scena nel corridoio "IS" della foto, con
   Rox sul Grizzly come boss. Da progettare insieme (scena a sé dopo il traguardo, o terza modalità).
5. **Classifica condivisa** tra colleghi (ora solo record locale): proposta Supabase (connesso alla sessione) con una
   tabella punteggi e nome del giocatore; valutare anche anti-cheat minimo.
6. **Grafica dei palazzi**: 11 immagini del primo giro di Codex sono nel gioco (PR #3 di Codex integrata nella PR #2,
   con un margine aggiunto: senza, la pulizia ne scartava 5 come "tagliate"). Mancano `pistoia-shop-4/5/6` e i 3
   landmark (`lm-cappella`, `lm-mensa`, `lm-ufp`). Il proprietario ha trovato le immagini poco fedeli (Utensilferramenta
   inventato): per i landmark servono **foto** in `art/codex/ref/` (vedi `art/codex/ref/README.md`), poi il messaggio
   in `art/codex/MESSAGGIO-CODEX.md`. Quando arriva la PR di Codex: controllare `clean.mjs` (immagini scartate),
   `art/contact.png`, provare il gioco e i landmark al loro posto (cappellina m 84 a sinistra, Mensa m 897 a destra,
   UFP m 1139 a destra).
7. **Playtest con persone vere**: regolare la difficoltà. Valori attuali (percorso da 1,1 km): Investi 60 s, un Rox
   ogni 24–46 m (il bot arriva in ~38 s senza incidenti, 28 Rox su 33); Chase: Rox parte 45 m avanti, velocità
   13–26 m/s contro 35 del giocatore, 5 cuori, colpo valido entro 1,7 m di lato (il bot vince in ~25 s, a metà strada).
   I record locali sono ripartiti da zero (chiave `rox-best-v2`).

## Come provarlo

- In locale: `python3 -m http.server 8000` e apri `http://localhost:8000/` (`?mode=investi` / `?mode=chase`).
- Test automatici: `tools/test/README.md`.
