# Grafica dei palazzi con Codex (gratis)

Il gioco usa **34 immagini** per la strada:
- 18 **edifici veri** (`b-*`), ognuno sull'edificio della mappa che rappresenta, alla sua lunghezza reale: il
  **Panorama** (170 m di facciata lungo il parcheggio, campate ripetute con l'ingresso in mezzo), le villette di Via
  Sestini, i condomini di Via Chirici, il distributore, le case coloniche di Via Bure Vecchia Nord, i capannoni,
  il secondo capannone di Utensilferramenta. L'elenco con le descrizioni è `art/buildings-custom.json`;
- 2 **landmark** (`lm-*`): l'Ex Mensa Sant'Agostino e **Utensilferramenta** all'arrivo;
- 14 edifici e oggetti "tipici" (`pistoia-*`) per quello che sta dietro e tra gli edifici veri.

Finché un'immagine manca, il gioco usa un disegno provvisorio (per i landmark: niente; Utensilferramenta per ora è
disegnato dal codice da una descrizione dell'edificio vero).

## Perché servono le foto

OpenStreetMap e OSRM (usati da Pixel Path, in `tools/pixel-path/`) danno la strada vera e **dove** stanno gli edifici,
con forma, dimensioni e tipo. Non dicono **come sono fatti**: colori, insegne, facciate. Per questo il primo
Utensilferramenta di Codex era inventato. Ora i prompt dei landmark contengono descrizioni dell'edificio vero (da
Wikipedia e da un video di Street View guardato e descritto a parole); se arrivano foto vedi
[`art/codex/ref/README.md`](art/codex/ref/README.md). I dati veri della strada sono in
[`art/codex/REFERENCE.md`](art/codex/REFERENCE.md).

## I file

- [`art/codex/PROMPTS.md`](art/codex/PROMPTS.md): tutte le 17 immagini, ciascuna con prompt, formato, nome del file
  e foto di riferimento.
- [`art/codex/PROMPTS-NUOVE.md`](art/codex/PROMPTS-NUOVE.md): solo quelle da fare adesso (21: gli edifici veri, i
  landmark e `pistoia-apartment-1`).
- `art/codex/ref/`: le foto di riferimento.

Si rigenerano con `node tools/codex-art.mjs prompts` (tutte) e
`node tools/codex-art.mjs prompts --only nome1,nome2 --out art/codex/PROMPTS-NUOVE.md` (alcune).

## Come si mettono nel gioco

1. Ogni immagine va salvata come `art/codex/in/<nome>.png` (cartella ignorata da git, sono file grandi).
2. `node tools/codex-art.mjs import`: la trasforma in pixel art della misura giusta, in `art/raw/`.
3. `node tools/pixel-path/scripts/clean.mjs --trip .`: la pulisce, la mette in `art/` e in `art/kit.json` e crea
   `art/contact.png` con tutte le immagini da controllare.

Un'immagine venuta male si scrive in `art/drop.txt` (un nome per riga) e si rilancia `clean.mjs`: il gioco smette di
usarla. Poi si rigenera, si toglie da `drop.txt` e si rilanciano `import` e `clean.mjs`.

## Il messaggio per Codex

Il testo da incollare in Codex è nel messaggio di Claude che accompagna la PR #2, ed è salvato anche in
[`art/codex/MESSAGGIO-CODEX.md`](art/codex/MESSAGGIO-CODEX.md).

## Più varietà

`sh tools/plan-art.sh detailed` rifà il piano con circa il doppio delle immagini. Le immagini già fatte con lo stesso
nome restano.
