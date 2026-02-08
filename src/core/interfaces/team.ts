interface Team {
    // Identificativi
    id: number;
    name: string;
    shortName: string;
    color: string;
    country: string;

    // Staff
    teamPrincipal: string;
    technicalDirector?: string;

    // Tecnico
    powerUnit: string;
    base: string;
    foundationYear: number;
    firstEntryYear: number;

    // Statistiche Carriera
    careerWins: number;
    careerPoles: number;
    careerPodiums: number;
    championships: number;

    // Statistiche Stagione
    seasonPoints: number;
    seasonPosition: number;
    seasonWins: number;

    // Relazioni
    currentDrivers: number[];

    // Media
    logoUrl?: string;
    websiteUrl?: string;
}

export default Team;
