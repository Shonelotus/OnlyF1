"use client";

import { useEffect, useState } from "react";
import { isLoggedIn, onAuthStateChange, getCurrentUser, logout } from "@/core/supabase/auth";
import LandingPage from "@/app/landingPage/page";
import HomePage from "@/app/homePage/page";

export default function homePageDefault() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Controllo iniziale
        getCurrentUser().then(u => {
            setUser(u);
            setIsAuthenticated(!!u);
            setLoading(false);
        });

        // Ascolta i cambiamenti di autenticazione
        const { data: { subscription } } = onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session);
            if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
            // Reset scrollbar quando smonto
            document.body.classList.remove("no-scrollbar");
        };
    }, []);

    // Gestione Scrollbar basata sullo stato
    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                document.body.classList.add("no-scrollbar");
            } else {
                document.body.classList.remove("no-scrollbar");
            }
        }
    }, [isAuthenticated, loading]);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-white">
                <p>Caricamento...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LandingPage />;
    }

    // Verifica Email (Supabase: email_confirmed_at è presente se verificata)
    // Nota: Se "Confirm Email" è disabilitato su Supabase, questo campo potrebbe essere null o gestito diversamente.
    // Assumiamo che la verifica sia richiesta.
    if (isAuthenticated && user && !user.email_confirmed_at) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-white p-8 text-center">
                <h2 className="text-4xl font-bold mb-4 text-primary">Verifica la tua Email</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-md">
                    Abbiamo inviato un link di conferma a <strong>{user.email}</strong>.<br />
                    Per favore, clicca sul link per attivare il tuo profilo.
                </p>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-primary hover:bg-primary-hover rounded-full transition font-bold transform hover:scale-105"
                    >
                        Ho già cliccato! Accedi
                    </button>
                    <button
                        onClick={async () => {
                            await logout();
                            setIsAuthenticated(false);
                            setUser(null);
                        }}
                        className="text-gray-400 hover:text-white transition text-sm"
                    >
                        Esci (Logout)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <HomePage />
    );
}
