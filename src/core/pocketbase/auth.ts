import pb from "./connection";

// Registra nuovo utente
export async function register(email: string, password: string, username: string) {
    const user = await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        username,
    });

    // Invia la mail di verifica
    await pb.collection("users").requestVerification(email);

    return user;
}

// Ottieni email
export async function getEmail(email: string) {
    const result = await pb.collection("users").getFirstListItem(`email = "${email}"`);
    return result;
}

// Richiedi reset password
export async function resetPassword(email: string) {
    await pb.collection("users").requestPasswordReset(email);
}


// Login utente
export async function login(email: string, password: string) {
    const result = await pb.collection("users").authWithPassword(email, password);
    return result;
}

// Logout
export function logout() {
    //cancello il token e pulisco il cookie
    pb.authStore.clear();
    document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Controlla se loggato
export function isLoggedIn(): boolean {
    return pb.authStore.isValid;
}

// Ottieni utente corrente
export function getCurrentUser() {
    return pb.authStore.record;
}
