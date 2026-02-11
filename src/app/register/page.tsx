"use client";  // Dice a Next.js che questo componente gira nel browser

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/core/pocketbase/auth";
import Link from "next/link";

export default function RegisterPage() {
    // STATI - variabili che React osserva
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false); // Nuovo stato per il successo
    const router = useRouter();  // Per navigare tra pagine

    // FUNZIONE che gestisce il click su "Registrati"
    async function registerUser(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await register(email, password, username);
            setSuccess(true); // Mostra il messaggio di successo invece di cambiare pagina subito
        }
        catch (err: any) {
            setError(err.message);  // Mostra errore
        }
        finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-white p-4">
                <div className="w-full max-w-md space-y-6 p-8 border border-white/10 rounded-2xl bg-black/50 text-center">
                    <h2 className="text-3xl font-bold text-primary">Controlla la tua Email! 📧</h2>
                    <p className="text-gray-300">
                        Ti abbiamo inviato un link di verifica a <strong>{email}</strong>.
                        Per favore, clicca sul link per attivare il tuo account.
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        Vai al Login
                    </button>
                </div>
            </div>
        );
    }

    // RENDER - cosa viene mostrato sullo schermo
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background text-white p-4">
            <div className="w-full max-w-md space-y-8 p-8 border border-white/10 rounded-2xl bg-black/50">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Registrati a OnlyF1</h2>
                    <p className="mt-2 text-gray-400">Inserisci le tue credenziali per registrarti</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={registerUser}>
                    <div className="space-y-4">
                        <input
                            type="username"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? "Caricamento..." : "Accedi"}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm">
                    Hai già un account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Accedi
                    </Link>
                </p>
            </div>
        </div>
    );
}



