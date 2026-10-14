# Stato del progetto e prossima sessione

Ultimo aggiornamento: 14 ottobre 2026 (fine della prima sessione).

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
6. **Grafica dei palazzi**: 14 immagini del primo giro di Codex sono nel gioco (PR #3 di Codex chiusa e integrata, con
   un margine aggiunto: senza, la pulizia ne scartava 5 come "tagliate"). Mancano `pistoia-apartment-1` e i landmark
   `lm-panorama` e `lm-mensa`. `lm-ufp` per ora è disegnato dal codice da una descrizione dell'edificio vero (capannone
   color sabbia a costoloni, scritta UTENSILFERRAMENTA PISTOIESE sul tetto, triangolo rosso UFP). Panorama e UFP sono
   descritti da un video di Street View fatto dal proprietario: Street View solo guardato e descritto a parole, mai
   usato come immagine di riferimento (termini di Google). Messaggio per Codex: `art/codex/MESSAGGIO-CODEX.md`. Quando
   arriva la PR di Codex: controllare `clean.mjs` (immagini scartate), `art/contact.png`, provare il gioco e i landmark
   al loro posto (Panorama m 23 a sinistra, Mensa m 1965 a destra, UFP m 2210 a destra).
7. **Playtest con persone vere**: regolare la difficoltà. Valori attuali (2,2 km): Investi 105 s (13:58:15 → 14:00),
   un Rox ogni 34–70 m; Chase: Rox parte 75 m avanti, velocità 15–30 m/s contro 35 del giocatore, 5 cuori, colpo
   valido entro 1,7 m di lato. I record ripartono da zero (chiave `rox-best-v3`).

## Come provarlo

- In locale: `python3 -m http.server 8000` e apri `http://localhost:8000/` (`?mode=investi` / `?mode=chase`).
- Test automatici: `tools/test/README.md`.
