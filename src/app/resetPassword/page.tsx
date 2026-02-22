"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetPassword, verifyOTP_forPasswordReset, updateUserPassword } from "@/core/supabase/auth";
import Link from "next/link";

export default function ResetPasswordPage() {
    // Stati Primo Step (Richiesta Mail)
    const [email, setEmail] = useState("");
    const [step, setStep] = useState<1 | 2>(1); // 1 = Chiedi Mail, 2 = Chiedi Codice e Nuova Password

    // Stati Secondo Step (Verifica e Cambio)
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Stati Generici
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

    // GESTIONE STEP 1: Invia l'email per chiedere il codice OTP
    async function handleRequestOTP(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!email) {
                setError("Inserisci un'email");
                return;
            }
            // Supabase invierà una mail col codice a 6 cifre invece del link
            await resetPassword(email);
            setStep(2); // Passiamo alla schermata di inserimento codice
        } catch (err: any) {
            setError(err.message || "Si è verificato un errore durante l'invio della mail.");
        } finally {
            setLoading(false);
        }
    }

    // GESTIONE STEP 2: L'utente ha ricevuto il codice e inserisce la password nuova
    async function handleVerifyAndChange(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!token || token.length !== 8) {
                setError("Inserisci un codice a 8 cifre valido.");
                return;
            }
            if (newPassword.length < 6) {
                setError("La nuova password deve essere di almeno 6 caratteri.");
                return;
            }

            await verifyOTP_forPasswordReset(email, token);

            try {
                await updateUserPassword(newPassword);
            } catch (updateErr: any) {
                throw new Error(updateErr.message + " (Richiedi una nuova mail per riprovare).");
            }

            // 3. MOSTRIAMO SUCCESSO
            setSuccess(true);

            // 4. Reindirizziamo al login pulito dopo 2 secondi
            setTimeout(() => {
                router.push("/login?message=Password%20aggiornata%20correttamente!%20Accedi.");
            }, 2000);

        } catch (err: any) {
            console.error("ERRORE PASSWORD RESET:", err);
            setError(`Errore: ${err.message || "Codice errato o scaduto."}`);
        } finally {
            setLoading(false);
        }
    }

    // UI SCHERMATA FINALE SUCCESSO
    if (success) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-white p-4">
                <div className="w-full max-w-md space-y-6 p-8 border border-white/10 rounded-2xl bg-black/50 text-center animate-in fade-in zoom-in">
                    <h2 className="text-3xl font-bold text-green-500">Password Aggiornata!</h2>
                    <p className="text-gray-300">
                        La tua password è stata salvata con successo nel database.
                    </p>
                    <p className="animate-pulse text-sm text-gray-500">
                        Reindirizzamento al login in corso...
                    </p>
                </div>
            </div>
        );
    }

    // UI PRINCIPALE (STEP 1 o STEP 2)
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background text-white p-4">
            <div className="w-full max-w-md space-y-8 p-8 border border-white/10 rounded-2xl bg-black/50">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">
                        {step === 1 ? "Reset Password" : "Cambia Password"}
                    </h2>
                    <p className="mt-2 text-gray-400">
                        {step === 1
                            ? "Inserisci la tua email per ricevere un codice a 8 cifre di recupero."
                            : `Abbiamo inviato un codice a ${email}`}
                    </p>
                </div>

                {/* STEP 1: FORM EMAIL */}
                {step === 1 && (
                    <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
                        <div className="space-y-4">
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                                placeholder="Indirizzo Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md border border-red-500/20">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? "Invio in corso..." : "Invia Codice"}
                        </button>
                    </form>
                )}

                {/* STEP 2: FORM CODICE + NUOVA PASSWORD */}
                {step === 2 && (
                    <form className="mt-8 space-y-6 animate-in slide-in-from-right-4" onSubmit={handleVerifyAndChange}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 pl-1 block">Codice a 8 cifre</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={8}
                                    className="w-full px-4 py-3 tracking-widest text-center text-xl font-mono bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                                    placeholder="00000000"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 pl-1 block">Nuova Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Scegli password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md border border-red-500/20">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? "Verifica e Salvataggio..." : "Salva Nuova Password"}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep(1); setError(null); }}
                            className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Torna indietro e modifica email
                        </button>
                    </form>
                )}

                {step === 1 && (
                    <p className="text-center text-gray-400 text-sm">
                        <Link href="/login" className="text-primary hover:underline">
                            Torna al Login
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}