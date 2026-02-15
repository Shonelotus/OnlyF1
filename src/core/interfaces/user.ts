export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    avatar: string;
    created: string;
    updated: string;
    verified: boolean;
    emailVisibility: boolean;

    // Campi opzionali futuri (es. preferenze)
    favoriteTeam?: string;
    favoriteDriver?: string;
}
