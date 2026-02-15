import PocketBase from "pocketbase";

//indirizzo di localhost
//Per andare su pockethost: http://raspberrypi:8091/_/
const pb = new PocketBase("http://raspberrypi:8091");

// Sincronizza lo stato di PocketBase con i cookie per il middleware
if (typeof document !== "undefined") {
    // Carica lo stato dal cookie all'avvio (gestisce il refresh della pagina)
    pb.authStore.loadFromCookie(document.cookie);

    // Aggiorna il cookie ogni volta che cambia lo stato di autenticazione
    pb.authStore.onChange(() => {
        document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
    });
}

export default pb;
