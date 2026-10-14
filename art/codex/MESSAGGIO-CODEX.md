# Messaggio per Codex

Da incollare in Codex, sul repository `av3rgfx/rox`, branch `main` (le foto in `art/codex/ref/` sono facoltative).

```
Nel repository c'è ROX, un gioco in pixel art su una strada vera di Pistoia, costruito con Pixel Path (il motore e i suoi script sono in tools/pixel-path/: leggi tools/pixel-path/README.md e SKILL.md per capire come la strada viene ricostruita da OpenStreetMap e OSRM e come si usano le immagini). Devi sistemare le immagini degli edifici.

Leggi prima:
- CODEX.md (come funziona la grafica)
- art/codex/REFERENCE.md (com'è davvero la strada e il giudizio sulle immagini già fatte)
- art/codex/ref/README.md (le foto di riferimento)

Parti dal branch main aggiornato (git checkout main && git pull), non da altri branch: la volta scorsa la PR partiva da un branch vecchio e non si poteva unire.

Poi:

1. Esegui:
     node tools/codex-art.mjs prompts
     node tools/codex-art.mjs prompts --only b-mural,b-villa-a,b-villa-b,b-condo-a,b-condo-b,b-petrol,b-brick-shed,b-garden-wall,b-house-white,b-long-shed,b-farmhouse-orange,b-farmhouse-brick,b-grey-shed,b-lattice,b-white-shed,b-ufp-side --out art/codex/PROMPTS-NUOVE.md
   Così i prompt includono le eventuali foto in art/codex/ref/.

2. Genera le immagini di art/codex/PROMPTS-NUOVE.md con il tuo strumento di generazione immagini, usando ESATTAMENTE il prompt e il formato indicati, e salvale come PNG nel percorso indicato (art/codex/in/<nome>.png), senza ridimensionarle.
   Quando per un'immagine sono indicate delle foto di riferimento, passale allo strumento come immagini di riferimento e aggiungi al prompt la frase indicata: l'edificio deve somigliare a quello della foto (forma, piani, colori, materiali, finestre, porte, insegne), raddrizzato in vista frontale. Senza foto, segui con cura la descrizione dell'edificio vero che è nel prompt: ogni b-* è un edificio preciso della strada (vedi art/buildings-custom.json e art/codex/REFERENCE.md), b-panorama-* e lm-ufp sono il Panorama e Utensilferramenta. Non inventare dettagli che la contraddicono. b-ufp-side ora è un disegno provvisorio fatto dal codice: la tua immagine lo sostituisce. Il Panorama, Utensilferramenta (lm-ufp) e la Mensa (lm-mensa) sono già a posto: non rifarli.

3. Controlla le immagini già fatte (art/pistoia-*.png) confrontandole con art/codex/REFERENCE.md e con le foto della strada in art/codex/ref/strada-*.jpg, se ci sono. Rigenera con il prompt di art/codex/PROMPTS.md quelle che secondo te non sembrano la periferia di Pistoia (per esempio da centro storico o da cartolina). Le altre lasciale stare.

4. Esegui:
     node tools/codex-art.mjs import
     node tools/pixel-path/scripts/clean.mjs --trip .
   Apri art/contact.png e guarda ogni immagine. Se una è sbagliata, rigenerala e ripeti questo punto. Sono sbagliate le immagini:
   - viste di lato o in prospettiva;
   - con cielo, prato o un colore dietro invece del bianco;
   - tagliate ai bordi;
   - con due edifici in una;
   - con loghi di marche vere (l'insegna di Utensilferramenta nella foto va bene).

5. Crea un branch chiamato codex/palazzi-3. Fai commit di art/raw/, di tutti i file art/*.png, di art/kit.json e dei due file PROMPTS (NON di art/codex/in/). Apri una pull request verso main.

6. Nella descrizione della pull request scrivi:
   - quali immagini hai generato o rigenerato e perché;
   - quali foto di riferimento hai usato;
   - quali immagini sono ancora imperfette o mancano.

Non modificare nessun altro file.
```
