# Grafica dei palazzi con Codex (gratis)

Il gioco funziona già con disegni provvisori. Per avere palazzi belli servono **16 immagini**: 15 per la strada
(case toscane, condomini, capannoni, negozi, alberi, la chiesa) e 1 per il magazzino di Utensilferramenta all'arrivo.
L'elenco completo, con un prompt pronto per ciascuna, è in [`art/codex/PROMPTS.md`](art/codex/PROMPTS.md).

Non serve che le immagini siano già piccole o perfette: lo script le ritaglia, le rimpicciolisce e le trasforma in pixel
art con la stessa tavolozza di colori, così la strada sembra disegnata da una mano sola. Contano tre cose:

- **sfondo bianco pieno**, niente cielo né prato dietro;
- **edificio dritto, visto di fronte**, senza prospettiva;
- **tutto dentro l'immagine**, niente tagliato ai bordi.

## Strada A: Codex fa tutto da solo (consigliata)

Apri il repository `av3rgfx/rox` in Codex, sul branch del gioco, e incollagli questo messaggio:

```
In questo repository c'è un gioco in pixel art. Mi servono le immagini dei palazzi.

1. Leggi art/codex/PROMPTS.md: contiene 16 immagini, ognuna con un prompt, un formato e il percorso dove salvarla.
2. Per ognuna, genera l'immagine con il tuo strumento di generazione immagini usando ESATTAMENTE quel prompt e quel
   formato, e salvala come PNG esattamente nel percorso indicato (art/codex/in/<nome>.png). Non ridimensionarla e non
   modificarla.
3. Quando le hai tutte, esegui:
     node tools/codex-art.mjs import
     node tools/pixel-path/scripts/clean.mjs --trip .
4. Apri art/contact.png e guarda ogni immagine. Se una è sbagliata (vista di lato o in prospettiva, con cielo o prato
   dietro, tagliata, due edifici in una, con loghi di marche vere), rigenerala con lo stesso prompt e ripeti il punto 3.
5. Fai commit di art/raw/, art/*.png, art/kit.json (NON di art/codex/in/, che è ignorata) e fai push sul branch.
6. Dimmi quali immagini hai dovuto rigenerare e se qualcuna è ancora imperfetta.

Non modificare nessun altro file.
```

Se Codex non riesce a generare immagini da solo, usa la strada B.

## Strada B: a mano con ChatGPT

1. Apri `art/codex/PROMPTS.md`, copia il prompt della prima immagine in ChatGPT e chiedi il formato indicato
   (quadrato, orizzontale o verticale).
2. Scarica l'immagine e rinominala come indicato, per esempio `pistoia-house-1.png`.
3. Ripeti per tutte e 16.
4. Mettile in `art/codex/in/` ed esegui i due comandi del punto 3 qui sopra, oppure **mandale a Claude in chat** e ci
   pensa lui.

## Se un'immagine viene male

Scrivi il suo nome in `art/drop.txt` (uno per riga) e rilancia `clean.mjs`: il gioco smette di usare
quell'immagine. Poi rigenerala, toglila da `drop.txt` e rilancia `import` e `clean.mjs`.

## Voglio più varietà

`art/plan.json` è il piano a livello `moderate` (15 immagini). Per il livello `detailed` (circa 30 immagini, più varianti
di ogni tipo di edificio) basta `sh tools/plan-art.sh detailed`: rifà il piano, i disegni provvisori e i prompt (le immagini già fatte con lo
stesso nome restano).
