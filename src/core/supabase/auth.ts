import { supabase } from "./client";
import { Profile } from "./interfaces/profile";

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
        throw new Error(error.message);
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
    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
    if (error) {
        console.error("Error updating profile:", error.message);
        return false;
    }
    return true;
}

// Carica l'immagine profilo (avatar) nel bucket Storage di Supabase
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
        // Estrai l'estensione e crea un nome univoco
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`; // Salviamo nella root del bucket

        // Carica il file nel bucket chiamato "avatars"
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error("Error uploading avatar:", uploadError.message);
            return null;
        }

        // Recupera l'URL pubblico dell'immagine appena caricata
        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error: any) {
        console.error("Error in uploadAvatar:", error.message);
        return null;
    }
}

// Elimina un file dal bucket avatars dato l'URL pubblico
export async function deleteAvatarByUrl(avatarUrl: string) {
    try {
        const parts = avatarUrl.split('/avatars/');
        if (parts.length === 2) {
            const fileName = parts[1].split('?')[0]; // Rimuove eventuali query parameters
            const { error } = await supabase.storage.from('avatars').remove([fileName]);
            if (error) console.error("Error deleting old avatar:", error.message);
        }
    } catch (e: any) {
        console.error("Error in deleteAvatarByUrl:", e.message);
    }
}
