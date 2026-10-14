# La strada vera (per controllare le immagini)

Dati da OpenStreetMap lungo il percorso del gioco (1145 m), raccolti con Pixel Path. Le mappe danno posizione, forma
e tipo degli edifici, non il loro aspetto: per colori, insegne e facciate valgono le foto in `art/codex/ref/`.

## Il percorso

| metri | strada | cosa c'è intorno |
| --- | --- | --- |
| 0–230 | Via Bure Vecchia Nord, dal Panorama alla prima rotonda | a sinistra case basse di 2 piani, una **cappellina** a 13 m dalla strada (m 84), una villa storica arretrata; a destra il parcheggio del centro commerciale |
| 230–870 | Via Bure Vecchia Nord verso sud | campi e vivai (Pistoia è la città dei vivai), prati, qualche casa di 2 piani e capannoni sparsi, un garage |
| 870–960 | rotonda di Via Enrico Fermi | a destra l'**Ex Mensa Sant'Agostino** (1980, architetto Leonardo Ricci), a sinistra un grande parcheggio |
| 960–1145 | Via Dino Buzzati e Via Luigi Salvatorelli | zona industriale e commerciale di Sant'Agostino: capannoni prefabbricati, showroom, uffici; alla fine, a destra, **Utensilferramenta Pistoiese** |

Lungo la strada: circa 40% piazzali e asfalto, 25% campi, 20% prati e giardini; gli edifici sono soprattutto
capannoni e edifici commerciali moderni, poche case.

## Cosa vuol dire per le immagini

- È **periferia moderna**, non centro storico: niente borghi da cartolina, archi in pietra o insegne "La Bottega" in
  stile antico. Case anni '60–'90 intonacate, capannoni in cemento e lamiera, showroom con vetrate, insegne semplici.
- Alberi: platani e tigli lungo le strade, cipressi e piante in vaso dei vivai.
- Gli edifici "generici" (`pistoia-*`) vengono ripetuti in tutta la strada, quindi devono essere tipici della zona,
  non copie di un edificio preciso. Gli edifici precisi sono i landmark (`lm-*`), ognuno al suo posto vero.

## Le immagini già fatte (primo giro di Codex), da ricontrollare

| immagine | giudizio |
| --- | --- |
| `pistoia-shop-1` (negozio "La Bottega" con archi) | troppo centro storico: da rifare più periferico |
| `pistoia-shop-2` (bar caffè su palazzina con persiane) | accettabile, un po' da cartolina |
| `pistoia-shop-3` (edificio commerciale moderno con fascia arancione) | va bene |
| `pistoia-house-1`, `pistoia-house-2` (villette intonacate) | vanno bene |
| `pistoia-industrial-1`, `pistoia-industrial-2` (capannoni) | vanno bene, sono il tipo più presente |
| `pistoia-tree-1` (cipresso), `pistoia-tree-2` (pino a ombrello) | vanno bene |
| `pistoia-bush-1` (pianta in vaso), `pistoia-street-1` (cassonetto) | vanno bene |
| `extra-ufp` (magazzino inventato con insegna blu) | **non somiglia**: sostituito da `lm-ufp`, da fare con la foto |
