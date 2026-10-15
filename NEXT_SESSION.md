# Stato del progetto e prossima sessione

Ultimo aggiornamento: 15 ottobre 2026, fine della terza sessione (branch `claude/rox-sessione-3`, PR da unire).

## Cosa c'è già (funziona, testato in headless su PC e telefono)

- Percorso reale, 2173 m, come lo fa il proprietario: si parte in fondo alla corsia lungo il lato ovest del
  Panorama (**il Panorama a destra**), si va dritti alla rotondina, poi Via Pietro Gherardini, Via Ginetta Chirici,
  Via Ubaldo Fantacci, Via Bure Vecchia Nord, Via Enrico Fermi, Via Dino Buzzati e Via Luigi Salvatorelli fino a
  **oltre** Utensilferramenta, che sta a destra lungo la strada. Scartati: la scorciatoia di 1,1 km giù per Via Bure
  Vecchia Nord e il giro ad anello di OSRM tra le corsie del parcheggio.
- Due modalità complete:
  - **INVESTI ROX**: partenza 14:28:00, timbratura entro le **14:30** (deciso dal proprietario); Rox in 9 varianti; combo fino a x8; traffico
    (−5 s), Ape, caffè turbo; muro di 4 Rox prima del traguardo "TIMBRA QUI" davanti alla serranda di UFP.
  - **ROX CHASE**: Rox sul Grizzly seduto al contrario, 5 cuori, finocchi e cartelli bagnati; perdi se arriva prima.
- Grafica: tutte le `pistoia-*` e i due landmark (UFP, Ex Mensa) sono immagini vere di Codex (due giri; il secondo
  era la PR #4, integrata a mano e chiusa). Il Panorama è ritagliato dal `lm-panorama` di Codex (4 campate ripetibili
  e l'ingresso con l'insegna). Mancano ancora le 15 `b-*` e il secondo capannone di UFP: prompt in
  `art/codex/PROMPTS-NUOVE.md`, messaggio in `art/codex/MESSAGGIO-CODEX.md` (ora si può mandare: la PR #5 è in `main`).
  Se Codex apre una PR, va controllata e integrata come la #4.
- La strada com'è davvero (confrontata col video tratto per tratto):
  - **nessun semaforo** (OSM non ne ha e il video lo conferma); STOP e precedenze dove sono, con la linea o i denti
    di squalo per terra; strisce pedonali solo dove ci sono; cartello blu della rotatoria;
  - 5 rotonde a senso unico con l'aiuola a sinistra (prato, siepe, cespugli o alberi; Via Fermi col cordolo in
    mattoni);
  - corsia del parcheggio senza linee, stalli a pettine a sinistra pieni di auto, aiuole a capo fila;
  - Gherardini e Chirici a doppia carreggiata (spartitraffico, auto contromano sull'altra carreggiata);
  - Bure Vecchia Nord stretta tra siepi e un muro bianco, poi la zona industriale con auto parcheggiate;
  - Via Fermi con il filare di alberi, auto e furgoni parcheggiati; canneto in Via Buzzati, traliccio, mucchio di
    rifiuti, paletti arancioni lungo UFP; niente grattacieli; capannoni nella zona industriale.
- Terza sessione:
  - le rotonde girano davvero intorno all'aiuola (smussatura ±12 m dentro l'anello);
  - siepi e canneto con foglie e steli fini da vicino;
  - Via Fantacci: muro a sinistra e 4 cartelloni inventati a destra (finocchi, Grizzly 50, "timbra entro le 14.30",
    corridoio IS);
  - via il cipresso davanti a UFP; in Via Chirici solo palazzine e case generiche (niente botteghe del centro);
  - facce di Rox ricavate dalla sola foto: dorme (occhi chiusi), colpito (bocca a O, sopracciglia alzate, vola a
    braccia in su), mangia (guance piene), Chase (sopracciglia aggrottate e ghigno; bocca a O quando lo colpisci);
  - circa 50 battute nuove in `SAY`;
  - **l'auto di Rox è una Renault Captur rossa** (detto dal proprietario): ammaccata, targa ROX 50, nel primo stallo
    davanti all'ingresso del Panorama; passandoci accanto compare una scritta (Investi: "lui è già a piedi", Chase:
    "oggi ha preso il Grizzly"), urtarla dà "un'altra ammaccatura";
  - playtest col bot: i Rox fermi e il Grizzly stanno lontani dalle auto parcheggiate al marciapiede, dopo un urto
    contro un'auto parcheggiata torni in strada (prima finivi dietro la fila e ci risbattevi), il Grizzly schiva meno
    e più piano, la scorciatoia dopo il sorpasso è più corta (35–55 m). Risultati in `tools/test/README.md`.
- Strumenti nuovi: `tools/realroad.mjs` (segnaletica e rotonde da OSM + `art/road-custom.json` → `data/road.json`),
  `tools/rebase.mjs` (dopo un nuovo bake sposta edifici veri e landmark ai metri nuovi), `tools/test/at.mjs`
  (fotografa la strada vuota a metri precisi).
- Record locali: chiave `rox-best-v4` (il percorso è cambiato).

## Decisioni prese con il proprietario

- Entrambe le modalità (Investi e Chase). Rox deve vedersi bene: niente prima persona di Rox.
- Faccia vera ritagliata dalle foto (non generata). PC e telefono.
- Grafica gratis ma di qualità: Codex (o ChatGPT) con i prompt preparati; se non va, Higgsfield (consuma i crediti
  del proprietario: chiedere prima). Niente RetroDiffusion (a pagamento).
- La strada deve somigliare il più possibile a quella vera (1:1). All'uscita il Panorama deve stare **a destra** e si
  va dritti alla rotondina; l'arrivo continua oltre UFP lungo Via Salvatorelli.
- Video di Street View del proprietario: copia locale `/home/uepacio/Scaricati/Telegram Desktop/IMG_2425.MP4`
  (590x1278, 232 s; Street View nella metà alta, `crop=590:560:0:80`). Si guarda e si descrive a parole; le immagini
  non entrano mai nel repository né si usano come riferimento per generare (termini di Google). Tempi del video:
  0–14 s lungo il Panorama, 16–28 s parcheggio, 30–56 s strade del parcheggio e rotondine, 57–63 Via Gherardini,
  64–73 rotonda di Via Sestini, 74–92 Via Chirici (distributore a 83–88), 93–118 rotonde e Via Fantacci, 119–164 Via
  Bure Vecchia Nord (zona industriale da circa 150 s), 165–175 rotonda di Via Fermi, 176–186 Via Fermi, 187–194 Via
  Buzzati, 195–230 Via Salvatorelli e Utensilferramenta.
- Pubblicazione su GitHub Pages: `https://av3rgfx.github.io/rox/`.

## Cosa sappiamo di Rox (per le battute)

- Si chiama Rossano, "Rox". Pranza sempre al Panorama. Mangia spesso il finocchio.
- Il "50" sulla maglietta è il logo dell'azienda.
- Nella foto spinge un lavapavimenti Grizzly arancione e blu, nel corridoio "IS" del magazzino (scaffali gialli e blu).
- Guida una **Renault Captur rossa**. Battute e tormentoni dell'ufficio: non li abbiamo. Altre foto: nessuna.
  **Decisione del proprietario: non chiederli più.** Si procede con scelte ragionevoli (sotto) e il proprietario le
  correggerà se vuole.

## Da fare nella prossima sessione

A e B della terza sessione sono fatti (sopra). **Nella quarta sessione: costruire il boss 1 coi muletti (C.1).** Nessuna PR di Codex con le `b-*` è arrivata: se arriva, controllarla e
integrarla come la #4 (`art/codex/MESSAGGIO-CODEX.md` si può mandare). Lavorare senza chiedere le informazioni mancanti,
piano breve all'inizio, branch nuovo da `main`, PR alla fine.

### C. Boss fight e nuove modalità

**Decisione del proprietario (fine della terza sessione): la boss fight va bene, "costruiscila con i muletti".** È il
lavoro della quarta sessione. Interpretazione: **tu e Rox siete entrambi su un muletto** (nella boss fight successiva
"Rossano scende dal muletto", quindi in questa ci sta sopra). Se il proprietario intendeva altro, lo correggerà: non
chiedere prima.

1. **Boss 1, "CORRIDOIO IS" (da costruire ora)**:
   - quando: dopo "TIMBRA QUI" in Investi se timbri in tempo, e anche come terza modalità dal menu;
   - dove: il corridoio del magazzino UFP, dritto, scaffali gialli e blu ai lati con scatole, pavimento grigio con le
     strisce gialle, neon; un renderer a parte e semplice (`game/warehouse.js`), senza i dati della strada;
   - tu guidi il **muletto giallo di UFP** visto da dietro (in magazzino l'auto non entra); Rox guida **un altro
     muletto** a marcia indietro verso il fondo del corridoio, con le forche alzate e sopra un bancale pieno di
     finocchi, cartelli "pavimento bagnato" e scatole, che ti butta addosso;
   - 3 fasi, 2 colpi ciascuna (6 in tutto, circa 90 s):
     1. **bancale**: cartelli e scatole che scivolano verso di te, una tanica che perde e bagna una corsia (slitti);
     2. **finocchi**: li lancia ad arco, l'ombra a terra mostra dove cadono;
     3. **turbo**: faccia col ghigno, più veloce, scatole che cadono dagli scaffali (ombra prima).

     Si colpisce speronandolo quando il suo muletto resta a secco ("BATTERIA SCARICA", spia che lampeggia, 2 s);
   - fine: al sesto colpo Rox salta giù dal muletto e si arrampica sugli scaffali ("NON MI PRENDI!"): è il gancio per
     il boss 2. Punteggio = tempo + colpi presi; record locale;
   - sprite nuovi in `sprites.js`: due muletti (giallo UFP da dietro, quello di Rox di fronte col bancale), Rox seduto
     al volante (posa `sit` con faccia `grin`/`ouch`), scatole, tanica, scaffale a codice.
2. **Più avanti, idee del proprietario (non ora)**:
   - **Boss 2, "Donkey Kong"**: Rossano scende dal muletto e scappa salendo sugli scaffali; tu lo segui piano per
     piano (piattaforme e scale, vista di lato) mentre lui ti lancia finocchi e oggetti presi dagli scaffali. Gli
     oggetti devono essere **i prodotti veri che vende UFP**: prima di disegnarli analizzare il sito di
     Utensilferramenta Pistoiese (marchi e categorie: utensili, ferramenta, viteria, antinfortunistica...) e farne una
     lista in `art/codex/UFP-PRODOTTI.md`; nei disegni i marchi come scritte a pixel sulle scatole, niente loghi copiati
     a pixel.
   - **Picchiaduro "stile Mortal Kombat"**: tutti i dipendenti dell'azienda come personaggi, ognuno con la sua mossa
     speciale. Servono dal proprietario: l'elenco dei dipendenti (nomi o soprannomi), una foto del viso di ciascuno
     (come per Rox, ritagliata dalle foto, mai generata) e un'idea di mossa speciale per ognuno; dove manca, proporre
     mosse affettuose. Chiedere queste cose quando si arriva a questa modalità.
3. **Modalità proposte da Claude** (salvate, da scegliere col proprietario), in ordine di consiglio:
   1. "Ape Car": guidi l'Ape del finocchio, lenta e ballerina, si ribalta nelle rotonde (costa poco, fa ridere);
   2. "Sfida del giorno": stessi Rox nelle stesse posizioni per tutti quel giorno (generatore casuale con seme dalla
      data), da abbinare alla classifica;
   3. "Notturna": la stessa strada di sera, fari e lampioni (costo medio);
   4. "Pausa pranzo" al contrario: costa di più (la strada va percorsa all'indietro).
4. **Classifica condivisa** (Supabase, nome + punteggio, anti-cheat minimo): chiedere prima di creare il progetto.

### Piccole cose rimaste

- Il muro di Via Fantacci e di Bure Vecchia Nord è fatto di lastre piatte: da vicino si vede.
- L'aiuola delle rotonde è un ovale a sinistra, non un cerchio intorno a cui gira la strada.
- Le 15 `b-*` e il secondo capannone di UFP aspettano le immagini di Codex.

## Come provarlo

- In locale: `python3 -m http.server 8000` e apri `http://localhost:8000/` (`?mode=investi` / `?mode=chase`).
- Test automatici: `tools/test/README.md`.
