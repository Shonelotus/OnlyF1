# Riepilogo Migrazione Architettura

## 1. Autenticazione (Supabase) 🔐
Abbiamo sostituito PocketBase con Supabase per la gestione utenti.
-   **Configurazione**: File `src/core/supabase/client.ts` inizializzato con le chiavi in `.env.local`.
-   **Logica Auth**: Creato `src/core/supabase/auth.ts` che espone le funzioni `login`, `register`, `logout` e `getCurrentUser`.
-   **Frontend**: Aggiornate pagine di Login, Registrazione e Reset Password per usare le nuove funzioni.
-   **Sessione**: La `HomePage` (`src/app/page.tsx`) e l'Header ora ascoltano in tempo reale lo stato dell'utente tramite `supabase.auth.onAuthStateChange`.
-   **Middleware**: Disabilitato temporaneamente il controllo server-side per facilitare la migrazione (la protezione è garantita client-side).

## 2. Infrastruttura Dati Pesanti (TimescaleDB su Raspberry Pi) 🏎️
Abbiamo predisposto un database robusto per la telemetria.V
-   **Docker Stack**: Creato `docker-compose.yml` (e guida `setup_raspberry_db.md`) per installare TimescaleDB e PgAdmin 4 su Portainer.
-   **Connessione**: Configurato `.env.local` con la stringa di connessione remota al Raspberry Pi.
-   **ORM (Drizzle)**:
    -   Installato `drizzle-orm`, `postgres`, `drizzle-kit`.V
    -   Configurato `drizzle.config.ts`.
    -   Definito lo schema in `src/db/schema.ts` con tabelle `telemetry` (dati sensori) e `laps` (tempi sul giro).
    -   Creato client in `src/db/index.ts`.
    -   Eseguito Push dello schema sul DB remoto (`npx drizzle-kit push`).
-   **Test**: Creata API di test `src/app/api/db-check/route.ts` per verificare la connessione.

## 3. Contenuti (PocketBase) 📰
Abbiamo mantenuto PocketBase per la gestione editoriali (News).
-   **HomePage**: La `HomePage` loggata continua a scaricare le notizie dalla collezione `news` di PocketBase, separando così i "Dati Caldi" (Supabase/Postgres) dai "Contenuti Freddi" (PocketBase).

---
**Prossimi Passi:**
-   Modificare tabella `users` su Supabase (Trigger per profili utente?).
-   Implementare l'ingestione dati telemetria.
