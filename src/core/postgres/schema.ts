import { pgTable, text, timestamp, doublePrecision, integer, uuid } from "drizzle-orm/pg-core";

// Tabella Telemetria (Serie Temporale - Hypertable in TimescaleDB)
export const telemetry = pgTable("telemetry", {
    id: uuid("id").defaultRandom().primaryKey(),
    session_id: text("session_id").notNull(), // ID della sessione (es. FP1, Qualifica, Gara)
    driver_number: integer("driver_number").notNull(),
    date: timestamp("date").notNull(), // Timestamp preciso del dato
    speed: integer("speed"), // Km/h
    rpm: integer("rpm"),
    throttle: integer("throttle"), // 0-100
    brake: integer("brake"), // 0-100
    gear: integer("gear"),
    drs: integer("drs"), // 0-12-14 (Off/On/Available)
    x: doublePrecision("x"), // Coordinate pista
    y: doublePrecision("y"),
    z: doublePrecision("z"),
});

// Tabella Giri
export const laps = pgTable("laps", {
    id: uuid("id").defaultRandom().primaryKey(),
    session_id: text("session_id").notNull(),
    driver_number: integer("driver_number").notNull(),
    lap_number: integer("lap_number").notNull(),
    lap_time: doublePrecision("lap_time"), // Secondi
    sector_1: doublePrecision("sector_1"),
    sector_2: doublePrecision("sector_2"),
    sector_3: doublePrecision("sector_3"),
    compound: text("compound"), // SOFT, MEDIUM, HARD, INTER, WET
    tyre_life: integer("tyre_life"),
    date_start: timestamp("date_start"),
});
