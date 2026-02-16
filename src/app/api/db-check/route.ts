import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        // Eseguiamo una query semplice per testare la connessione
        // 'NOW()' funziona su Postgres e TimescaleDB
        const result = await db.execute(sql`SELECT NOW() as time`);

        return NextResponse.json({
            status: "success",
            message: "Connessione al Database riuscita! 🚀",
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: "Errore di connessione al Database ❌",
            error: error.message
        }, { status: 500 });
    }
}
