# ROX

Un gioco di guida in pixel art su Rox, sulla strada vera dal **Panorama** (Via Bure Vecchia Nord, Pistoia) a
**Utensilferramenta Pistoiese** (Via Luigi Salvatorelli): 2,2 km presi da OpenStreetMap, con edifici, campi, colline e
orizzonte reali. Si gioca da PC e da telefono.

## Le modalità

- **INVESTI ROX**: la pausa pranzo è finita, sono le 13:58 e devi timbrare alle 14:00. Rox è ovunque: attraversa, saluta,
  telefona, mangia finocchi, spinge il carrello del Panorama o il Grizzly, dorme sull'asfalto, a volte è d'oro. Più ne
  prendi di fila, più sale il moltiplicatore (fino a x8). Le auto ti fanno perdere 5 secondi, il caffè dà il turbo.
  All'arrivo c'è un muro di Rox davanti al traguardo.
- **ROX CHASE**: Rox ha preso il Grizzly e corre a timbrare prima di te, seduto al contrario, lanciando finocchi e
  cartelli di pavimento bagnato. Speronalo 5 volte prima della ditta. Se lo superi prende una scorciatoia.

## Comandi

| | PC | Telefono |
| --- | --- | --- |
| sterzare | ← → (o A D) | ◀ ▶ |
| accelerare | ↑ (o W) | sempre premuto |
| frenare | ↓ (o S) | FRENO |
| clacson | Spazio (o H) | PA-PÀ |
| pausa | P o Esc | II |

## Provarlo sul computer

Serve un server statico (aprire `index.html` con doppio clic non funziona, il browser blocca il caricamento dei dati):

```
python3 -m http.server 8000
```

poi apri <http://localhost:8000/>. Con `?mode=investi` o `?mode=chase` parte subito una partita.

## Pubblicazione (GitHub Pages)

Il workflow `.github/workflows/pages.yml` pubblica il gioco a ogni push su `main`. Va attivato una volta sola:
**Settings → Pages → Build and deployment → Source: GitHub Actions**. L'indirizzo sarà
`https://av3rgfx.github.io/rox/`.

## La grafica dei palazzi (gratis, con Codex o ChatGPT)

Adesso i palazzi sono disegni provvisori fatti dal codice. Le immagini vere si generano gratis con Codex (o ChatGPT), poi
uno script le trasforma in pixel art della misura giusta. Tutto è spiegato in **[CODEX.md](CODEX.md)**, con il prompt da
dare a Codex per farle tutte in una volta. In breve:

1. i prompt, uno per immagine, sono in `art/codex/PROMPTS.md` (si rigenerano con `node tools/codex-art.mjs prompts`);
2. ogni immagine va salvata come `art/codex/in/<nome>.png`;
3. `node tools/codex-art.mjs import` la converte in pixel art (`art/raw/`);
4. `node tools/pixel-path/scripts/clean.mjs --trip .` la pulisce e la mette nel gioco (`art/`, `art/kit.json`), e crea
   `art/contact.png` con tutte le immagini per controllarle.

Un'immagine venuta male si mette in `art/drop.txt` (un nome per riga) e si rigenera.

## Rox

La faccia di Rox è ritagliata da una foto (`assets/rox/face.png`) e montata su un corpo in pixel art disegnato dal codice
(maglietta nera col logo "50", bermuda, scarpe da ginnastica). Per cambiare faccia basta sostituire quel file con un
ritaglio PNG trasparente, più o meno 53 × 70 pixel, faccia dritta.

## Come è fatto

- `index.html`: schermate, HUD, comandi touch
- `game/main.js`: il gioco (modalità, guida, Rox, traffico, punteggio)
- `game/sprites.js`: Rox, auto, oggetti e scritte, disegnati dal codice
- `game/audio.js`: suoni e musica sintetizzati (nessun file audio)
- `game/road.js`, `game/layout.js`: il motore di [Pixel Path](https://github.com/jonwheatley/pixel-path) di Jon Wheatley
  (MIT), con piccole modifiche per il gioco (telecamera dietro l'auto, sterzo, oggetti di gioco sulla strada)
- `data/`: il percorso scaricato da OpenStreetMap (`tools/pixel-path/scripts/route.mjs` e `bake.mjs`)
- `art/`: le immagini dei palazzi e `kit.json`
- `tools/`: Pixel Path (licenza in `tools/pixel-path/LICENSE`) e `codex-art.mjs`

## Crediti

- Dati della mappa © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), licenza ODbL: la cartella
  `data/` è un database derivato e resta sotto ODbL. La riga dei crediti nel gioco deve restare visibile.
- Percorso: OSRM. Altimetria: Terrain Tiles (Mapzen, AWS Open Data). Luoghi: Wikidata.
- Motore: Pixel Path, © Jon Wheatley, licenza MIT.
