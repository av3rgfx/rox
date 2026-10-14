# Foto di riferimento

Le mappe (OpenStreetMap, OSRM) dicono **dove** sono gli edifici, quanto sono grandi e di che tipo, ma non **come
sono fatti**: niente colori, insegne o facciate. Per un'immagine fedele serve una foto.

Metti qui le foto, chiamate col nome dell'immagine da generare più `-1`, `-2`... (jpg, png o webp):

| file | cosa fotografare |
| --- | --- |
| `lm-ufp-1.jpg` | **Utensilferramenta**, la facciata vista da Via Salvatorelli, il più possibile di fronte e intera |
| `lm-ufp-2.jpg` | (facoltativa) un'altra foto dell'ingresso o dell'insegna |
| `lm-mensa-1.jpg` | **Ex Mensa Sant'Agostino**, alla rotonda di Via Enrico Fermi, sulla destra venendo dal Panorama |
| `lm-cappella-1.jpg` | **la cappellina** su Via Bure Vecchia Nord, a sinistra appena dopo il Panorama |
| `strada-1.jpg`, `strada-2.jpg`... | (facoltative) foto della strada: servono a Codex per capire com'è la zona e correggere le immagini generiche |

Consigli: di giorno, di fronte all'edificio, senza auto davanti se possibile. Non servono foto belle: servono foto
chiare. Le foto restano solo nel repository (non finiscono sul sito del gioco).

Dopo aver aggiunto le foto: `node tools/codex-art.mjs prompts` aggiorna `art/codex/PROMPTS.md` con i riferimenti.
