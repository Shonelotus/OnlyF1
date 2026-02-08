interface Circuit {
    // Identificativi
    id: number;
    name: string;
    location: string;
    country: string;
    flag: string;

    // Tecnico
    length: number;
    turns: number;
    laps: number;
    timezone: string;

    // Record
    lapRecordTime?: string;
    lapRecordDriverId?: number;
    lapRecordYear?: number;

    // Meta
    firstGpYear: number;
    capacity?: number;

    // Media
    image?: string;
    circuitTrack?: string;
}

export default Circuit;
