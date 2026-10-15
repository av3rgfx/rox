# I prodotti veri di Utensilferramenta Pistoiese (per il boss 2, ROX KONG)

Fonte: il sito dell'azienda, **ufptrade.it** (pagine "Prodotti", "Marchi" e "Azienda"), guardato il 15 ottobre 2026.
Serve a scegliere gli oggetti che Rox tira giù dagli scaffali e le scritte sulle scatole. Regola: **niente loghi
copiati**. I marchi compaiono solo come parole in pixel (il font 3x5 del gioco), su scatole di colori neutri, mai coi
colori o la grafica del marchio.

## L'azienda in breve

- Utensil Ferramenta Pistoiese S.p.A., Via Luigi Salvatorelli 161, Pistoia. Ingrosso di ferramenta e utensili.
- "AL SERVIZIO DEL PROFESSIONISTA DAL 1974", "LA TUA FERRAMENTA IN TOSCANA", "TUTTO CIO' CHE DESIDERI".
- Oltre 35.000 articoli a magazzino e oltre 200 marchi. Vende a professionisti e artigiani di tutta la Toscana
  tramite una rete di agenti.

## Le categorie del catalogo (come sul sito)

| reparto | sottocategorie |
| --- | --- |
| Accessori per serramenti | infissi in alluminio, ferro e legno; attuatori; chiudiporta; automazioni; maniglie e maniglioni; maniglioni antipanico |
| Sigillanti, colle, schiume, prodotti chimici | sigillanti, schiume e resine; colle per legno; prodotti chimici |
| Prodotti finiti | porte blindate, interne, tagliafuoco e da cantina; tende e veneziane; tapparelle e frangisole; zanzariere; controtelai; paratie antiallagamento; cancelletti estensibili e persiane blindate; pannelli porta; corrimano e parapetti; pensiline |
| Sistemi di fissaggio | fissaggio meccanico |
| Utensileria | utensili manuali; utensili elettrici e a batteria; macchine, saldatrici, idropulitrici, generatori; strumenti di misura, armadi, scaffali, cassettiere |
| Abbigliamento e antinfortunistica | abbigliamento; scarpe antinfortunistiche; protezione personale |
| Varie | bulloneria, viteria, rivetti; foratura e maschiatura, saldatura, molatura; imballaggio e pulizia; ponteggi, scale, ruote; nastri adesivi |

## Marchi (una scelta dalla pagina "Marchi", 197 in tutto)

- Utensili: Beta Utensili, Stanley, DeWalt, Milwaukee, Metabo, Fein, Flex, Bessey, Rupes, Stayer, Telwin (saldatrici),
  CMT, Hyundai.
- Fissaggio, viteria: Fischer, SPAX, Friulsider, Mustad, Vipa, Sacto, SFS.
- Sigillanti e chimici: Soudal, Henkel, Arexons, WD-40, 3M.
- Antinfortunistica e abbigliamento: U-Power, Diadora, 3M, Industrial Starter, Infield.
- Serrature e serramenti: Cisa, Iseo, Mottura, Hoppe, Colombo Design, Geze, Hafele, Eclisse.
- Varie: Brennenstuhl (prolunghe), Tractel, Barbero, Nastroflex, Zippo.

## Cosa usa il gioco (scelte fatte, il proprietario le può cambiare)

Ogni scaffale del boss è un reparto del catalogo. Gli oggetti sono disegnati a codice in `game/sprites.js`
(`buildKong`), piccoli (8–16 px) e senza scritte, perché a quella misura una parola non si legge. Le parole stanno
sulle scatole grandi dietro, sugli scaffali, e sulle due scatole che cadono.

| scaffale | reparto | cosa rotola o cade | scritte sulle scatole dietro |
| --- | --- | --- | --- |
| 1 | Sigillanti e schiume | cartucce di silicone, bombolette di schiuma poliuretanica, finocchi | SILICONE, SCHIUMA, SOUDAL, WD-40, AREXONS, COLLA, 3M |
| 2 | Viteria e nastri | rotoli di nastro adesivo, ruote pivottanti (da "Ponteggi, scale, ruote"), finocchi; scatole di viti che cadono dall'alto | VITI, TASSELLI, RIVETTI, FISCHER, SPAX, BULLONI, NASTRO |
| 3 | Antinfortunistica | scarpe antinfortunistiche che saltellano, rotoli di nastro, ruote, finocchi; scatole di viti e di chiodi che cadono | SCARPE S3, GUANTI, CASCHI, U-POWER, DIADORA, BETA, STANLEY, DEWALT |

Sempre presenti:
- il **casco giallo** (protezione personale): lo raccogli e per qualche secondo rompi quello che ti arriva addosso
  (al posto del martello di Donkey Kong);
- il **caffè**: ridà una vita;
- la **scatola dei RESI** in fondo al pianterreno, dove finisce la merce che rotola fino a terra (e alla fine Rox);
- sul muro lo striscione "AL SERVIZIO DEL PROFESSIONISTA DAL 1974", solo testo.

Da non fare: i loghi (forme, colori, caratteri dei marchi), le foto dei prodotti dal sito, e marchi su oggetti che si
rompono in modo brutto. Se un marchio non va bene al proprietario, basta toglierlo da `LEVELS[i].labels` in
`game/kong.js`.
