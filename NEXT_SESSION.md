# Stato del progetto e prossima sessione

Ultimo aggiornamento: 15 ottobre 2026, fine della seconda sessione (PR da `claude/rox-strada-vera`).

## Cosa c'è già (funziona, testato in headless su PC e telefono)

- Percorso reale, 2173 m, come lo fa il proprietario: si parte in fondo alla corsia lungo il lato ovest del
  Panorama (**il Panorama a destra**), si va dritti alla rotondina, poi Via Pietro Gherardini, Via Ginetta Chirici,
  Via Ubaldo Fantacci, Via Bure Vecchia Nord, Via Enrico Fermi, Via Dino Buzzati e Via Luigi Salvatorelli fino a
  **oltre** Utensilferramenta, che sta a destra lungo la strada. Scartati: la scorciatoia di 1,1 km giù per Via Bure
  Vecchia Nord e il giro ad anello di OSRM tra le corsie del parcheggio.
- Due modalità complete:
  - **INVESTI ROX**: partenza 13:58:15, timbratura entro le 14:00; Rox in 9 varianti; combo fino a x8; traffico
    (−5 s), Ape, caffè turbo; muro di 4 Rox prima del traguardo "TIMBRA QUI" davanti alla serranda di UFP.
  - **ROX CHASE**: Rox sul Grizzly seduto al contrario, 5 cuori, finocchi e cartelli bagnati; perdi se arriva prima.
- Grafica: tutte le `pistoia-*` e i due landmark (UFP, Ex Mensa) sono immagini vere di Codex (due giri; il secondo
  era la PR #4, integrata a mano e chiusa). Il Panorama è ritagliato dal `lm-panorama` di Codex (4 campate ripetibili
  e l'ingresso con l'insegna). Mancano ancora le 15 `b-*` e il secondo capannone di UFP: prompt in
  `art/codex/PROMPTS-NUOVE.md`, messaggio in `art/codex/MESSAGGIO-CODEX.md` (da mandare a Codex **dopo** aver unito
  la PR di questa sessione, perché dice di partire da `main`).
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
- Che auto guida: **ancora da chiedere** (nel messaggio della seconda sessione c'era il segnaposto "[modello e colore]").
- Battute e tormentoni: **ancora da chiedere** (stesso problema: segnaposto non compilato).

## Da fare nella prossima sessione

### A. Grafica

1. Quando Codex apre la PR con le `b-*`: controllarla (`clean.mjs`, `art/contact.png`), integrarla, provare.
2. Ritocchi alla strada notati ma non fatti: le rotonde curvano poco (le direzioni sono smussate su ±60 m); siepi e
   canneto sono blocchi visti da vicino; un cipresso generico davanti a UFP; Via Fantacci ha in realtà un muro a
   sinistra e cartelloni pubblicitari a destra; palazzine generiche in Via Chirici (le vere sono arretrate).

### B. Il resto (sezione C della prima sessione)

1. **Foto di Rox**: ritagliare (come `assets/rox/face.png`: maschera poligonale, circa 53x70) e aggiungere
   espressioni: colpito/urlo, che mangia, che dorme, ghigno per il Chase. In `sprites.js` `buildRox` usa una sola
   faccia: estenderlo a una faccia per posa.
2. **Battute dell'ufficio**: aggiungerle a `SAY` in `game/main.js`.
3. **Auto di Rox**: disegnarla (parcheggiata al Panorama, o nel traffico).
4. **Boss finale nel magazzino UFP**: una scena nel corridoio "IS" con Rox sul Grizzly come boss. Da progettare insieme.
5. **Classifica condivisa** tra colleghi: proposta Supabase con tabella punteggi e nome; anti-cheat minimo.
6. **Playtest con persone vere**: Investi 105 s, un Rox ogni 34–70 m; Chase: Rox parte 75 m avanti, 15–30 m/s contro
   35 del giocatore, 5 cuori. Ora ci sono più auto parcheggiate contro cui sbattere (parcheggio, Via Fermi, zona
   industriale): verificare che non sia troppo difficile.

## Come provarlo

- In locale: `python3 -m http.server 8000` e apri `http://localhost:8000/` (`?mode=investi` / `?mode=chase`).
- Test automatici: `tools/test/README.md`.
