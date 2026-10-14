# La strada vera (per controllare le immagini)

Il percorso del gioco (2215 m), come lo fa il proprietario. Posizioni e tipi degli edifici vengono da OpenStreetMap; il
loro aspetto viene da un video di Street View registrato dal proprietario, **guardato e descritto a parole** (le
immagini di Street View non vanno usate come riferimento per generare: lo vietano i termini di Google).

## Il percorso

| metri | strada | cosa si vede |
| --- | --- | --- |
| 0–250 | parcheggio del **Panorama** (Centro Commerciale Le Tre Mura) | a sinistra il centro commerciale: muri bianco crema, pilastri quadrati alti color cotto rossiccio uniti in alto da una cornice sporgente a pergolato, grande ingresso a vetri con infissi rossi, cipressi sottili lungo la facciata, insegna rossa "PANORAMA" sul tetto; parcheggio con alberelli e lampioni |
| 250–700 | Via Pietro Gherardini e rotonde di Via Sestini | strada larga con aiuole d'erba e alberi giovani, rotonde col centro piantumato, campi incolti; a nord case basse con tetti di coppi |
| 700–1150 | Via Ginetta Chirici | condomini moderni di 3–4 piani color mattone e crema, uffici, un distributore di benzina, prati e campi |
| 1150–1350 | Via Ubaldo Fantacci e rotonde | svincoli con scarpate d'erba, muri di cemento, campi |
| 1350–1880 | Via Bure Vecchia Nord | strada di campagna stretta: siepi alte, cipressi, vivai e campi, una casa colonica in mattoni rossi, una croce votiva a un incrocio; verso sud capannoni e auto parcheggiate |
| 1880–2000 | Via Enrico Fermi | rotonde con aiuole, platani, capannoni; a destra l'**Ex Mensa Sant'Agostino** (1980, architetto Leonardo Ricci: sala con murature a corsi bianchi e neri di pietra e laterizio, copertura metallica sospesa "come un aquilone" sopra una fascia continua di finestre, gabbia dell'ascensore rossa; fonte: it.wikipedia "Mensa Sant'Agostino") e più indietro il PalaCarrara |
| 2000–2215 | Via Dino Buzzati e Via Luigi Salvatorelli | zona industriale di Sant'Agostino: capannoni prefabbricati, palazzine di uffici color mattone con vetrate blu; alla fine, a destra, **Utensilferramenta Pistoiese** |

Lungo la strada: circa 35% campi, 20% prati, 25% piazzali e asfalto; gli edifici sono soprattutto capannoni, condomini
moderni e case basse, poche case vecchie.

## Cosa vuol dire per le immagini

- È **periferia moderna**, non centro storico: niente borghi da cartolina, archi in pietra o insegne "La Bottega" in
  stile antico. Case anni '60–'90 intonacate, condomini color mattone, capannoni in cemento e lamiera, insegne semplici.
- Alberi: cipressi, platani e alberi giovani nelle aiuole; piante in vaso dei vivai.
- Gli edifici "generici" (`pistoia-*`) vengono ripetuti in tutta la strada, quindi devono essere tipici della zona,
  non copie di un edificio preciso. Gli edifici precisi sono i `b-*` (elenco con descrizioni e posizioni in `art/buildings-custom.json`) e i landmark
  (`lm-*`), ognuno al suo posto vero.

## Utensilferramenta com'è davvero (`lm-ufp`)

Un capannone alto circa 12 m, lungo e **senza finestre**, fatto di pannelli prefabbricati in cemento a **costoloni
verticali**, color **sabbia/ocra** con colature grigie di pioggia. Sul bordo del tetto piano una **struttura metallica
a ringhiera** regge grandi **lettere maiuscole grigio scuro "UTENSILFERRAMENTA PISTOIESE"**, che finiscono a destra con
un **cartello triangolare bianco col monogramma rosso UFP**. In basso a sinistra una **serranda grigio scuro** di carico
sotto una piccola pensilina, un **trabattello di alluminio** appoggiato al muro, paletti arancioni sul marciapiede.
Accanto c'è una palazzina di uffici color mattone con una vetrata blu.

## Le immagini già fatte (due giri di Codex), da ricontrollare

| immagine | giudizio |
| --- | --- |
| `pistoia-shop-1` (negozio a un piano con vetrina, secondo giro) | va bene |
| `pistoia-shop-2` (bar caffè su palazzina, secondo giro) | accettabile, ancora un po' da cartolina |
| `pistoia-apartment-1` (condominio giallo di quattro piani) | va bene |
| `pistoia-house-1`, `-2`, `-3` (villette intonacate) | vanno bene |
| `pistoia-farm-1` (casa colonica) | va bene: lungo Via Bure Vecchia Nord ce n'è una in mattoni rossi |
| `pistoia-tower-1` (condominio alto) | va bene |
| `pistoia-industrial-1`, `-2` (capannoni) | vanno bene, sono il tipo più presente |
| `pistoia-tree-1` (cipresso), `pistoia-tree-2` (pino a ombrello) | vanno bene |
| `pistoia-bush-1` (pianta in vaso), `pistoia-street-1` (cassonetto) | vanno bene |
| `lm-ufp` (capannone a costoloni con la scritta sul tetto) | molto fedele: va bene |
| `lm-mensa` (Ex Mensa, torre rossa) | va bene |
| `b-panorama-bay`, `b-panorama-entrance` | ritagliate dal `lm-panorama` di Codex (4 campate ripetibili e l'ingresso con l'insegna): vanno bene |
| `b-ufp-side` (secondo capannone di Utensilferramenta) | disegno provvisorio fatto dal codice: da rifare |
| tutte le altre `b-*` | mancano: finché non ci sono, l'edificio usa un'immagine generica |
