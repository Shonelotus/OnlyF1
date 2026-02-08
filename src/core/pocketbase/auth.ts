import pb from "./connection";

// Registra nuovo utente
export async function register(email: string, password: string, username: string) {
    const user = await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        username,
    });
    return user;
}

// Login utente
export async function login(email: string, password: string) {
    const result = await pb.collection("users").authWithPassword(email, password);
    return result;
}

// Logout
export function logout() {
    pb.authStore.clear();
}

// Controlla se loggato
export function isLoggedIn(): boolean {
    return pb.authStore.isValid;
}

// Ottieni utente corrente
export function getCurrentUser() {
    return pb.authStore.record;
}
