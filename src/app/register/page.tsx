"use client";  // Dice a Next.js che questo componente gira nel browser

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/core/pocketbase/auth";

export default function RegisterPage() {
    // STATI - variabili che React osserva
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();  // Per navigare tra pagine

    // FUNZIONE che gestisce il click su "Registrati"
    async function registerUser(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await register(email, password, username);
            router.push("/login");  // Vai alla pagina login
        }
        catch (err: any) {
            setError(err.message);  // Mostra errore
        }
        finally {
            setLoading(false);
        }
    }

    // RENDER - cosa viene mostrato sullo schermo
    return (
        <form onSubmit={registerUser}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button disabled={loading}>
                {loading ? "Caricamento..." : "Registrati"}
            </button>
            {error && <p>{error}</p>}
        </form>
    );
}
