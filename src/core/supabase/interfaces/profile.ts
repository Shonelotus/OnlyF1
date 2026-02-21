export interface Profile {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    country: string | null;
    favorite_driver: number | null;
    favorite_team: string | null;
    role: "user" | "admin";
    created_at: string;
}
