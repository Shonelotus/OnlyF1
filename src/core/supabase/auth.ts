import { supabase } from "./client";

// Interfaccia per il profilo utente
// la creo qui perche su supabase avro solo l'auth
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

// Registra nuovo utente
export async function register(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username
            },
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// Login utente
export async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Error logging in:", error.message);
        return null;
    }

    return data;
}

// Logout
export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error.message);
    }
}

// Richiedi reset password
export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, // Assicurati di avere questa pagina o rimuovi se non serve redirect
    });

    if (error) {
        throw new Error(error.message);
    }
}

// Controlla se loggato (Nota: Supabase è async per la sessione, ma possiamo controllare user sincrono se lo stato è caricato)
export async function isLoggedIn(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

// Ottieni utente corrente
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Hook per ascoltare i cambiamenti di stato (utile per React)
export function onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
}

// Ottengo profilo utente
export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.
        from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error getting profile:", error.message);
        return null;
    }
    return data as Profile;
}


//funzione per aggiornare il profilo
//nota bene: non posso usare il tipo Profile completo perché non ho tutti i campi
//quindi uso Partial<Profile>
export async function updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
    if (error) {
        console.error("Error updating profile:", error.message);
        return null;
    }
    return data;
}
