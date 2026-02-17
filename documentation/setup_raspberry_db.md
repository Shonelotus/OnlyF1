# Guida: Installare TimescaleDB su Raspberry Pi con Portainer

Questa guida ti mostra come configurare **TimescaleDB** (una versione potenziata di PostgreSQL per dati temporali/telemetria) sul tuo Raspberry Pi usando Docker e Portainer.

## Perché TimescaleDB?
Per un progetto di Formula 1, i dati di telemetria (giri, velocità, posizioni) sono "serie temporali". TimescaleDB è ottimizzato per questo: gestisce meglio le query su dati storici e risparmia spazio rispetto a un Postgres standard.

## 1. Preparazione Cartella (Bind Mount)
Hai chiesto di salvare i dati in una cartella esterna al container. Ottima scelta per backup e sicurezza.

1.  Collegati al Raspberry Pi (via SSH o terminale locale).
2.  Crea una cartella per i dati del database:
    ```bash
    mkdir -p /home/pi/openpaddock/postgres-data
    ```
    *(Sostituisci `/home/pi` con il tuo percorso utente se diverso)*
    
## 2. Creazione dello Stack su Portainer
1.  Apri **Portainer** nel browser.
2.  Vai su **Stacks** -> **Add stack**.
3.  Nome: `openpaddock-db`.
4.  Nell'editor Web, incolla questo contenuto:

```yaml
version: '3.8'

services:
  timescaledb:
    image: timescale/timescaledb:latest-pg16
    container_name: openpaddock_db
    restart: always
    environment:
      # Modifica queste credenziali con password sicure!
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password_sicura_f1
      POSTGRES_DB: openpaddock_stats
    ports:
      - "5432:5432"
    volumes:
      # Bind Mount: Collega la cartella del Pi a quella interna del container
      - /home/pi/openpaddock/postgres-data:/var/lib/postgresql/data
    networks:
      - openpaddock_net

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: openpaddock_pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@openpaddock.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    volumes:
      - pgadmin-data:/var/lib/pgadmin
    networks:
      - openpaddock_net

networks:
  openpaddock_net:
    driver: bridge

volumes:
  pgadmin-data:
```

5.  Clicca su **Deploy the stack**.

## 3. Accesso a PgAdmin (Web UI)
Una volta avviato lo stack, puoi gestire il database dal browser!

1.  Vai su: `http://IP_RASPBERRY_PI:5050`
2.  Login con:
    *   Email: `admin@openpaddock.com`
    *   Password: `admin`
3.  Clicca su **Add New Server**.
4.  Tab **General**: Nome = `OpenPaddock Pi`.
5.  Tab **Connection**:
    *   Host name/address: `timescaledb` (nome del servizio Docker interna alla rete)
    *   Port: `5432`
    *   Maintenance database: `openpaddock_stats`
    *   Username: `admin`
    *   Password: `password_sicura_f1`
6.  Salva. Ora hai una GUI completa per vedere tabelle e dati!

## 4. Verifica e Connessione Esterna
### Dall'Interno della Rete (es. dal tuo PC su cui sviluppi)
Per collegarti al database dal progetto Next.js (o da DBeaver), userai l'IP del Raspberry Pi.

**Stringa di connessione (URL):**
`postgresql://admin:password_sicura_f1@IP_RASPBERRY_PI:5432/openpaddock_stats`

### Prossimi Passi nel Progetto
Ora dobbiamo configurare Next.js per parlare con questo DB.
Nel file `.env.local` del progetto aggiungeremo:
```
DATABASE_URL="postgresql://admin:password_sicura_f1@IP_RASPBERRY_PI:5432/openpaddock_stats"
```
Poi useremo un ORM (come Drizzle o Prisma) per creare le tabelle della telemetria.
