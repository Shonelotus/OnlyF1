"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/core/supabase/auth";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        document.body.classList.add("no-scrollbar");
        return () => {
            document.body.classList.remove("no-scrollbar");
        };
    }, []);

    async function handleResetPassword(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!email) {
                setError("Inserisci un'email");
                return;
            }
            // PocketBase non permette di verificare l'esistenza della mail senza login per sicurezza.
            // Quindi proviamo direttamente il reset. Se la mail esiste, arriverà.
            await resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError("Si è verificato un errore durante il reset");
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-white p-4">
                <div className="w-full max-w-md space-y-6 p-8 border border-white/10 rounded-2xl bg-black/50 text-center">
                    <h2 className="text-3xl font-bold text-primary">Controlla la tua Email!</h2>
                    <p className="text-gray-300">
                        Ti abbiamo inviato un link per reimpostare la password a <strong>{email}</strong>.
                        Per favore, clicca sul link per reimpostare la tua password.
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

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background text-white p-4">
            <div className="w-full max-w-md space-y-8 p-8 border border-white/10 rounded-2xl bg-black/50">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Reset Password</h2>
                    <p className="mt-2 text-gray-400">Inserisci la tua email per reimpostare la password</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                    <div className="space-y-4">
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? "Caricamento..." : "Invia Link"}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm">
                    <Link href="/login" className="text-primary hover:underline">
                        Torna al Login
                    </Link>
                </p>
            </div>
        </div>
    );
}