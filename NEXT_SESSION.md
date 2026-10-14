# Stato del progetto e prossima sessione

Ultimo aggiornamento: 14 ottobre 2026 (prima sessione).

## Cosa c'è già (funziona, testato in headless su PC e telefono)

- Percorso reale Panorama (Via Bure Vecchia Nord 95, centro commerciale Le Tre Mura, 43.93831, 10.93926) →
  Utensilferramenta Pistoiese (Via Luigi Salvatorelli 161, 43.93037, 10.94511): 2,2 km da OpenStreetMap.
- Due modalità complete:
  - **INVESTI ROX**: partenza 13:58:15, timbratura entro le 14:00; Rox in 9 varianti (attraversa, saluta, telefona,
    mangia finocchio, carrello del Panorama, Grizzly, dorme, d'oro); combo fino a x8; traffico (−5 s), Ape, caffè turbo;
    muro di 4 Rox prima del traguardo "TIMBRA QUI"; titoli finali da "Collega modello" a "Leggenda della Ferramenta".
  - **ROX CHASE**: Rox sul Grizzly seduto al contrario, 5 cuori, lancia finocchi e cartelli di pavimento bagnato,
    scatta quando ti avvicini, schiva, scappa dopo ogni colpo, scorciatoia se lo superi; perdi se arriva al traguardo.
- Faccia vera di Rox ritagliata dalla prima foto su corpo pixel art (maglietta nera col logo "50", bermuda).
- Auto del giocatore: utilitaria rossa targata "UFP 50", vista da dietro.
- Comandi tastiera e touch, layout verticale e orizzontale, audio sintetizzato, record locali, condivisione.
- Palazzi: disegni provvisori. Kit di prompt per Codex pronto (`CODEX.md`, `art/codex/PROMPTS.md`) e script di
  conversione in pixel art (`tools/codex-art.mjs`), testato solo con un'immagine finta.
- Workflow GitHub Pages pronto (serve attivarlo e fare merge su `main`).

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
6. **Grafica dei palazzi**: quando arrivano le immagini da Codex/ChatGPT, `node tools/codex-art.mjs import`, poi
   `node tools/pixel-path/scripts/clean.mjs --trip .`, guardare `art/contact.png`, provare il gioco e correggere.
   Il magazzino UFP (`extra-ufp`) viene usato da solo se `art/extra-ufp.png` esiste.
7. **Playtest con persone vere**: regolare la difficoltà. Valori attuali: Investi 105 s per 2,2 km (il bot arriva
   in ~86 s senza incidenti); Chase velocità Rox 21–30 m/s contro 35 del giocatore, colpo valido entro 1,7 m di
   lato (il bot vince in ~35 s).

## Come provarlo

- In locale: `python3 -m http.server 8000` e apri `http://localhost:8000/` (`?mode=investi` / `?mode=chase`).
- Test automatici: `tools/test/README.md`.
