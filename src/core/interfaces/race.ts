interface Race {
    // Identificativi
    id: number;
    round: number;
    season: number;
    name: string;
    flag: string;

    // Luogo e Tempo
    circuitId: number;
    circuit: string;
    location: string;
    country: string;
    date: string;
    time: string;

    // Dettagli Gara
    laps: number;
    distance: number;
    weather?: string;
    status: "upcoming" | "completed" | "cancelled";

    // Risultati
    winnerId?: number;
    podiumDriverIds?: number[];
    polePositionId?: number;
    fastestLapDriverId?: number;
    fastestLapTime?: string;
    fastestLapSpeed?: number;
}

export default Race;
