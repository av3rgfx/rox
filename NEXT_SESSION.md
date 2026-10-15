# Stato del progetto e prossima sessione

Ultimo aggiornamento: 15 ottobre 2026, fine della seconda sessione (PR #5 unita in `main`).

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
- Che auto guida: non lo sappiamo. Battute e tormentoni dell'ufficio: non li abbiamo. Altre foto: nessuna.
  **Decisione del proprietario: non chiederli più.** Si procede con scelte ragionevoli (sotto) e il proprietario le
  correggerà se vuole.

## Da fare nella prossima sessione

Lavorare in quest'ordine **senza chiedere le informazioni mancanti**; proporre un piano breve all'inizio, un branch
nuovo da `main`, PR alla fine. Se tutto è fatto, passare alla boss fight e alle nuove modalità (sezione C).

### A. Ritocchi alla strada (piccoli)

1. Le rotonde curvano poco (headings smussati su ±60 m in `layout.js`): provare a ridurre la smussatura dentro i
   tratti `q.ring`, così la strada gira davvero intorno all'aiuola.
2. Siepi e canneto a blocchi da vicino (`road.js`, codice `hedge`/`reeds`): pezzi più stretti o sfumati quando sono
   vicini alla camera.
3. Via Fantacci (930–1130 m): muro a sinistra e cartelloni pubblicitari a destra (un nuovo `props` disegnato dal
   codice, con scritte inventate). Un cipresso generico davanti a UFP da togliere. Palazzine generiche in Via Chirici:
   con `open` sono già arretrate, valutare `roles` più adatti.
4. Se arriva la PR di Codex con le `b-*`: controllarla e integrarla.

### B. La vecchia sezione C, con scelte nostre

1. **Espressioni di Rox** dalla sola foto che abbiamo (`assets/rox/face.png`): ritocchi a pixel della stessa faccia
   (occhi chiusi per "dorme", bocca aperta per "colpito/urlo", guance piene per "mangia", sopracciglia e ghigno per il
   Chase). In `sprites.js` `buildRox` passa da una faccia sola a una faccia per posa.
2. **Battute**: scriverne di nuove, affettuose e da cartone animato, partendo da quello che sappiamo (pranzo al
   Panorama, il finocchio, il Grizzly, la timbratura delle 14:00, il "50", il corridoio IS, il magazzino): aggiungerle
   a `SAY` in `game/main.js`. Niente cattiverie.
3. **Auto di Rox**: una utilitaria italiana anni 2000, grigio chiaro, un po' ammaccata, targa "ROX 50" (stesso stile
   di `carRear`): parcheggiata in uno stallo del Panorama vicino all'uscita, e in Chase la si può superare all'inizio.
4. **Playtest**: ora ci sono più auto parcheggiate contro cui sbattere (parcheggio, Via Fermi, zona industriale):
   verificare col bot che Investi resti vincibile e regolare se serve.

### C. Boss fight e nuove modalità (quando A e B sono fatti)

1. **Boss finale nel magazzino UFP**: dopo "TIMBRA QUI" (o come terza modalità) una scena nel corridoio "IS" (scaffali
   gialli e blu della foto), vista frontale come la strada: Rox sul Grizzly arancione e blu lava il pavimento e lancia
   cartelli bagnati e finocchi; si schiva e lo si colpisce. Progettare la scena prima (proporla al proprietario con
   uno schizzo o una pagina), poi farla. Il corridoio si può disegnare a codice con il motore della strada (`road.js`
   ha già render prospettico) o come scena a sé in `main.js`.
2. **Altre modalità** da proporre: "Pausa pranzo" (al contrario, da UFP al Panorama entro le 13:00), "Notturna" (la
   stessa strada di sera, fari e lampioni), "Ape Car" (guidi l'Ape del finocchio, lenta e instabile), sfida a tempo
   giornaliera. Scegliere col proprietario quali fare.
3. **Classifica condivisa** tra colleghi: proposta Supabase con tabella punteggi e nome; anti-cheat minimo. Chiedere
   prima di creare il progetto (consuma risorse del proprietario).

## Come provarlo

- In locale: `python3 -m http.server 8000` e apri `http://localhost:8000/` (`?mode=investi` / `?mode=chase`).
- Test automatici: `tools/test/README.md`.
