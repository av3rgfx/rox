# Stato del progetto e prossima sessione

Ultimo aggiornamento: 15 ottobre 2026, fine della sesta sessione (branch `claude/rox-sessione-6`, PR da unire).

## Cosa c'è già (funziona, testato in headless su PC e telefono)

- Percorso reale, 2173 m, come lo fa il proprietario: si parte in fondo alla corsia lungo il lato ovest del
  Panorama (**il Panorama a destra**), si va dritti alla rotondina, poi Via Pietro Gherardini, Via Ginetta Chirici,
  Via Ubaldo Fantacci, Via Bure Vecchia Nord, Via Enrico Fermi, Via Dino Buzzati e Via Luigi Salvatorelli fino a
  **oltre** Utensilferramenta, che sta a destra lungo la strada. Scartati: la scorciatoia di 1,1 km giù per Via Bure
  Vecchia Nord e il giro ad anello di OSRM tra le corsie del parcheggio.
- Cinque modalità complete:
  - **INVESTI ROX**: partenza 14:28:00, timbratura entro le **14:30** (deciso dal proprietario); Rox in 9 varianti; combo fino a x8; traffico
    (−5 s), Ape, caffè turbo; muro di 4 Rox prima del traguardo "TIMBRA QUI" davanti alla serranda di UFP.
  - **ROX CHASE**: Rox sul Grizzly seduto al contrario, 5 cuori, finocchi e cartelli bagnati; perdi se arriva prima.
  - **CORRIDOIO IS** (boss 1, quarta sessione): dopo "TIMBRA QUI" se timbri in tempo (schermata "TIMBRATO! Ma Rox non
    ha finito...", con "AL CORRIDOIO IS!" o "FINE QUI"; il punteggio si somma) e come terza carta del menu
    (`?mode=boss`). Vedi sotto, "Quarta sessione".
  - **ROX KONG** (boss 2, quinta sessione): dopo il corridoio IS vinto ("MULETTO FERMATO! Ma Rox è saltato giù...",
    con "SUGLI SCAFFALI!" o "FINE QUI"; il punteggio si somma) e come quarta carta del menu (`?mode=kong`). Vedi sotto,
    "Quinta sessione".
  - **ROX KOMBAT** (il picchiaduro, sesta sessione): quinta carta del menu (`?mode=kombat`). Vedi sotto, "Sesta sessione".
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
- Quarta sessione, la boss fight coi muletti nel corridoio IS del magazzino UFP:
  - un renderer a parte, `game/warehouse.js`: corridoio dritto e senza fine, scaffalature con montanti blu, correnti
    gialli, bancali di scatole (marroni, avvolte nel film, scatole colorate di utensili con una fascia bianca),
    pavimento grigio a lastre con le strisce gialle, neon al soffitto con la luce a terra, pozzanghere; cartello blu
    "CORRIDOIO IS" appeso ogni 45 m;
  - tu guidi il muletto giallo di UFP (da dietro, guardia aperta: ci vedi attraverso; "UFP" sul contrappeso, lampeggiante
    arancione); Rox guida in retromarcia un muletto arancione e blu come il Grizzly (il "50" davanti), forche alzate e
    un bancale con scatole, cartello bagnato e finocchi; sul tettuccio la spia della batteria;
  - 3 fasi, 2 colpi ciascuna: **IL BANCALE** (scatole e cartelli che scivolano verso di te, una tanica blu che perde e
    bagna una corsia: slitti), **PIOGGIA DI FINOCCHI** (lanciati ad arco, l'ombra a terra mostra dove cadono; quelli
    caduti fanno scivolare), **TURBO** (faccia col ghigno, più veloce di lato, scatole che cadono dagli scaffali con
    l'ombra prima);
  - lo colpisci solo quando resta a secco: la spia lampeggia rossa per 1,2 s, poi "BATTERIA SCARICA!" e sta fermo
    3,4 / 3,1 / 2,8 s secondo la fase. Se lo tocchi mentre va ti tiene a distanza (nel corridoio non si sorpassa);
  - il tuo muletto regge 5 botte (HUD: MULETTO ■■■■■); a ogni colpo a Rox cade un caffè dal bancale: preso, ridà una
    vita (o 500 punti se sei pieno). Scelta mia per stare sul gentile, si può togliere;
  - fine: al sesto colpo Rox salta giù, si arrampica sullo scaffale ("NON MI PRENDI!", "CI VEDIAMO SUGLI SCAFFALI!") e
    in cima saluta; poi (quinta sessione) "MULETTO FERMATO!" con "SUGLI SCAFFALI!" (ROX KONG) o "FINE QUI". Se perdi:
    "ROX HA VINTO!";
  - punteggio: 1500 a colpo, bonus tempo (6000 − 40 × secondi) + 800 per ogni vita rimasta; record locale `boss`
    (solo i punti del corridoio) nella stessa chiave `rox-best-v4`;
  - circa 50 battute nuove (fase per fase, batteria scarica, ricarica, colpito, clacson, risate quando ti colpisce);
    suoni nuovi: batteria che muore, ricarica, il bip della retromarcia, la scatola che cade;
  - menu a 3 carte (in colonna sul telefono verticale, compatto sul telefono orizzontale), sezione in "Come si gioca".
  - Playtest col bot: vedi `tools/test/README.md` (nuovo `tools/test/boss.mjs`).
- Quinta sessione, il boss 2 "Donkey Kong" sugli scaffali, **ROX KONG** (`game/kong.js`):
  - vista di lato della scaffalatura del magazzino (montanti blu, travi gialle, bancali e scatole dietro con le parole
    dei prodotti, scale di alluminio, neon); ai lati, in orizzontale, gli scaffali vicini scuriti;
  - Rox (metà misura, sempre con la sua faccia) sta sulla trave in cima vicino alla sua pila di merce, alza le cose
    sopra la testa e le fa rotolare giù; le travi sono aperte a un'estremità a turno, così la merce cade sulla trave
    sotto e torna indietro, a volte scende per le scale; al pianterreno finisce nella scatola dei **RESI**;
  - tu sei il magazziniere di UFP (maglietta "50", pantaloni da lavoro, scarpe antinfortunistiche) visto di lato:
    cammini, sali e scendi le scale, salti (100 punti a salto). Parti vicino ai RESI e la scala per salire è sempre
    all'altra estremità, come in Donkey Kong; alcune travi hanno una seconda scala in mezzo (scorciatoia);
  - **tre scaffali, uno per reparto del catalogo vero di UFP** (`art/codex/UFP-PRODOTTI.md`, dal sito ufptrade.it):
    1 "SIGILLANTI E SCHIUME" (cartucce di silicone, bombolette di schiuma, finocchi), 2 "VITERIA E NASTRI" (rotoli di
    nastro, ruote pivottanti, cartucce, finocchi, e scatole di VITI che cadono dall'alto: prima lampeggia un punto
    esclamativo sulla trave), 3 "ANTINFORTUNISTICA" (scarpe antinfortunistiche che saltellano, nastro, ruote, schiuma,
    finocchi, scatole di CHIODI che cadono). I marchi veri (Soudal, Fischer, SPAX, U-Power, Diadora, Beta, Stanley,
    DeWalt...) sono solo parole a pixel sulle scatole dietro, niente loghi;
  - il **casco giallo** (uno per scaffale) per 8 s rompe la merce che ti tocca (300 punti); il **caffè** ridà una vita
    (o 500 punti); **5 vite**; bonus che scende da 5000 (100 ogni 2 s), preso quando arrivi da Rox, più 2000;
  - arrivato da Rox nei primi due scaffali lui sale ancora più su per la sua scala ("PIÙ SU! PIÙ SU!"); nel terzo
    indietreggia sul suo finocchio, scivola, vola come un birillo e atterra nella scatola dei RESI, **avvolto nel film
    estensibile con l'etichetta FRAGILE** ("MI AVETE IMBALLATO!"). Fine partita "ROX IMBALLATO! Spedito alla
    timbratrice. FRAGILE."; se perdi "ROX HA VINTO!";
  - sullo sfondo lo striscione "AL SERVIZIO DEL PROFESSIONISTA DAL 1974" (la frase del loro sito, solo testo) e il
    cartello "CORRIDOIO IS"; all'inizio di ogni scaffale la camera guarda Rox in cima e poi scende da te;
  - comandi: PC ← → cammini, ↑ ↓ scale, SPAZIO salti; telefono ◀ ▶, ▲ ▼ e SALTA (al posto di PA-PÀ e FRENO);
  - circa 50 battute nuove (lancio, "NON SALIRE!", casco, risate, scatole che cadono, imballato), suoni nuovi (salto,
    piolo della scala, scarpa che saltella, merce che cade sulla trave, casco che rompe, film);
  - menu a 4 carte (2 x 2 sul PC, in colonna sul telefono verticale); record locale `kong`; "RIGIOCA" dopo una serie
    (Investi → corridoio → scaffali) riparte dal primo;
  - playtest col bot (`tools/test/kong.mjs`): vince 7–8 partite su 9 anche vedendo con 450 ms di ritardo, ~80 s a
    partita. Dettagli in `tools/test/README.md`.
- Sesta sessione:
  - **ROX KONG sul telefono verticale**: lo schermo di gioco è più alto (fino a 350 px invece di 250, i comandi restano
    sotto), così lo scaffale ci sta tutto e Rox in cima non finisce più sotto l'HUD (`fitStage` in `main.js`). Il
    proprietario non aveva altre correzioni; il bot vince ancora 6 su 6 a 200 ms.
  - **ROX KOMBAT**, il picchiaduro "stile Mortal Kombat" (`game/kombat.js`, lottatori in `game/staff.js`):
    - vista di lato, uno contro uno, barre dell'energia, timer di 60 s, al meglio dei 3 round; l'HUD è disegnato sul
      canvas (nomi, round vinti, punteggio, barra SPECIALE);
    - scegli il lottatore (schermata con le facce) e fai una **torre di 3 incontri**: due colleghi a caso, poi **Rox**
      (se sei Rox, il **Rox d'oro**), in tre posti della sua strada: **parcheggio del Panorama** (la facciata di Codex e le
      auto, la Captur rossa compresa), **davanti a UFP** (il capannone vero di Codex, il cartello TIMBRA QUI, i paletti
      arancioni) e il **corridoio IS** (scaffali, lo striscione "AL SERVIZIO DEL PROFESSIONISTA DAL 1974");
    - mosse: pugno, calcio, salto e calcio volante, abbassarsi, ↓+pugno **montante** (fa volare), ↓+calcio
      **sgambetto**, tenendo indietro **pari**; la barra verde SPECIALE si riempie colpendo e prendendo colpi;
    - **lottatori e mosse speciali** (Rox con la sua faccia vera; gli altri sono **ruoli segnaposto**, con facce
      disegnate a pixel, mai una persona vera indovinata):
      - ROX: PIOGGIA DI FINOCCHI (tre finocchi ad arco);
      - IL MAGAZZINIERE (casco giallo, maglietta "50"): NASTRO ADESIVO (rotola a terra, se ti prende sei impacchettato;
        si salta);
      - IL MULETTISTA (cappellino "50", barba, gilet giallo): BANCALE DALL'ALTO (cade dove sei, l'ombra avvisa);
      - IL COMMERCIALE (giacca, cravatta): CATALOGO NUOVO (vola dritto all'altezza della testa; ci si abbassa);
      - L'AMMINISTRAZIONE (capelli rossi, occhiali, cardigan): SCONTRINO INFINITO (lunghissimo, "TOT 50,00", ti tira
        vicino);
      - IL CAPO (camicia bianca, baffi grigi): NEL MIO UFFICIO! (un fumetto che, se ti prende, ti lascia immobile);
      - ROX D'ORO: come Rox, tutto d'oro (solo come ultimo avversario);
    - niente sangue: col K.O. si vola come un birillo (al rallentatore); quando vinci un incontro compare
      **FINISCILO!** e premendo SPECIALE parte la **FINOCCHIALITY**: piovono finocchi finché dello sconfitto resta fuori
      solo la testa ("SOTTO I FINOCCHI...");
    - ogni lottatore ha le sue battute (saluto nella schermata VS, quando lo colpisci, quando vince); suoni nuovi
      (pugno, calcio, montante, parata, speciale, K.O.);
    - comandi: PC ← → (indietro = parata), ↑ salto, ↓ abbassati, Z/J pugno, X/K calcio, C/L/SPAZIO speciale; telefono:
      una croce a sinistra e PUGNO, CALCIO, SPECIALE a destra;
    - punteggio: danni × 10, combo, round vinto 1000 + tempo, round perfetto 2000, FINOCCHIALITY 5000, incontro vinto
      3000 × numero; record locale `kombat`; se perdi, **RIPROVA** riparte da quell'incontro;
    - playtest col bot (`tools/test/kombat.mjs`), vedi `tools/test/README.md`.
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

La sesta sessione ha costruito ROX KOMBAT con Rox e cinque colleghi segnaposto (sopra in "Cosa c'è già"). **Prossima
sessione: far provare ROX KOMBAT al proprietario e correggere quello che dice; mettere i colleghi veri se manda
nomi, foto e mosse (vedi C.3); poi la prossima cosa che sceglie** tra le modalità proposte (C.4) e la classifica (C.5). Nessuna PR di Codex con le `b-*` è arrivata: se arriva, controllarla e integrarla come la #4
(`art/codex/MESSAGGIO-CODEX.md` si può mandare). Lavorare senza chiedere le informazioni mancanti, piano breve
all'inizio, branch nuovo da `main`, PR alla fine.

### C. Boss fight e nuove modalità

**Decisione del proprietario (fine della terza sessione): la boss fight va bene, "costruiscila con i muletti".**
Interpretazione usata: **tu e Rox siete entrambi su un muletto** (nella boss fight successiva "Rossano scende dal
muletto"). Se il proprietario intendeva altro, lo correggerà.

1. **Boss 1, "CORRIDOIO IS": fatto nella quarta sessione.** Scelte fatte senza chiedere, da far confermare:
   - la vita del tuo muletto (5 botte) e il caffè che cade dal bancale di Rox a ogni colpo (ridà una vita);
   - lo colpisci solo a batteria scarica (spia rossa); se lo tocchi mentre va ti tiene a distanza, niente danno;
   - il muletto di Rox arancione e blu "50" (come il Grizzly), il tuo giallo "UFP"; il guidatore sei tu di spalle con
     la maglietta "50";
   - la carta del menu si chiama "CORRIDOIO IS"; dopo Investi in tempo si può scegliere "FINE QUI";
   - la durata: col bot ~70 s se non sbagli mai un colpo; una persona ci mette di più (vedi `tools/test/README.md`).
   Possibili ritocchi se il proprietario li chiede: più o meno difficile (`PHASES` in `main.js`: distanza, durata
   dell'attacco, finestra della batteria, frequenza dei lanci), facce di Rox diverse, una sirena/lampeggiante quando
   la batteria muore, musica diversa nel magazzino.
2. **Boss 2, "ROX KONG": fatto nella quinta sessione.** Scelte fatte senza chiedere, da far confermare:
   - il nome "ROX KONG" (gioco di parole con Donkey Kong) e il finale con Rox imballato nei RESI;
   - tre scaffali a tema (sigillanti, viteria, antinfortunistica) e quali prodotti rotolano; i marchi scritti sulle
     scatole (si tolgono da `LEVELS[i].labels` in `game/kong.js`); lo striscione con la loro frase "AL SERVIZIO DEL
     PROFESSIONISTA DAL 1974";
   - il casco giallo al posto del martello, il caffè, 5 vite, nessuna caduta mortale (se cadi da una trave dici
     "OPS!" e basta), il bonus a tempo;
   - il tuo personaggio: un magazziniere senza faccia vera (capelli castani, maglietta "50").
   Possibili ritocchi: più o meno difficile (`LEVELS` in `kong.js`: `every` = secondi tra un lancio e l'altro, `v` =
   velocità, `down` = quanto spesso la merce scende dalle scale, `falls`, `KONG_HP`), altri prodotti, un quarto
   scaffale (per esempio "UTENSILERIA": trapani e valigette), la faccia di un collega vero per il magazziniere (solo
   da una sua foto).
3. **Picchiaduro "ROX KOMBAT": fatto nella sesta sessione, con i colleghi segnaposto.** Scelte fatte senza chiedere, da
   far confermare: il nome ROX KOMBAT, la FINOCCHIALITY, i cinque ruoli e le loro mosse, la torre di 3 incontri con Rox
   per ultimo (Rox d'oro se giochi con Rox), le tre arene, la difficoltà (il computer colpisce meno forte nei primi due
   incontri: `LEVELS` in `kombat.js`).
   **Per mettere i colleghi veri** servono dal proprietario, per ognuno: il nome o il soprannome, una foto del viso
   (frontale, buona luce, anche dal telefono: si ritaglia come quella di Rox, mai generata) e, se vuole, una mossa
   speciale, due o tre battute tipiche e i colori dei vestiti. Si cambia la riga del collega in `ROSTER` (`game/staff.js`):
   `name`, `photo: 'assets/staff/<nome>.png'`, `look`, `lines`, `special` (uno di quelli che ci sono, o una mossa nuova in
   `fireSpecial`). Con la foto il collega ha la stessa faccia in tutte le pose (le espressioni "ouch" e ghigno sono
   fatte a mano solo per la foto di Rox; per un collega si possono fare guardando la sua foto). Si possono aggiungere
   lottatori oltre i sei: la schermata di scelta li mette in griglia da sola.
4. **Modalità proposte da Claude** (salvate, da scegliere col proprietario), in ordine di consiglio:
   1. "Ape Car": guidi l'Ape del finocchio, lenta e ballerina, si ribalta nelle rotonde (costa poco, fa ridere);
   2. "Sfida del giorno": stessi Rox nelle stesse posizioni per tutti quel giorno (generatore casuale con seme dalla
      data), da abbinare alla classifica;
   3. "Notturna": la stessa strada di sera, fari e lampioni (costo medio);
   4. "Pausa pranzo" al contrario: costa di più (la strada va percorsa all'indietro).
5. **Classifica condivisa** (Supabase, nome + punteggio, anti-cheat minimo): chiedere prima di creare il progetto.

### Piccole cose rimaste

- Il muro di Via Fantacci e di Bure Vecchia Nord è fatto di lastre piatte: da vicino si vede.
- L'aiuola delle rotonde è un ovale a sinistra, non un cerchio intorno a cui gira la strada.
- Le 15 `b-*` e il secondo capannone di UFP aspettano le immagini di Codex.

## Come provarlo

- In locale: `python3 -m http.server 8000` e apri `http://localhost:8000/` (`?mode=investi` / `?mode=chase` /
  `?mode=boss` / `?mode=kong` / `?mode=kombat`, quest'ultimo con Rox).
- Test automatici: `tools/test/README.md`.
