interface Driver {
    // Identificativi
    id: number;
    abbreviation: string;
    name: string;
    surname: string;
    number: number;
    teamId: number;
    nationality: string;

    // Dati personali
    birthDate: string;
    height?: number;
    weight?: number;

    // Statistiche Carriera
    careerGpEntries: number;
    careerPodiums: number;
    careerWins: number;
    careerPoles: number;
    careerFastestLaps: number;
    careerPoints: number;
    championships: number;

    // Statistiche Stagione Corrente
    seasonPoints: number;
    seasonWins: number;
    seasonPodiums: number;

    // Meta
    debutYear: number;
    status: "active" | "retired" | "reserve";
    image?: string;
    bio?: string;
}

export default Driver;
