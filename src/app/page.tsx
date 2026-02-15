"use client";

import { useEffect, useState } from "react";
import pb from "@/core/pocketbase/connection";
import { isLoggedIn } from "@/core/pocketbase/auth";
import LandingPage from "@/app/landingPage/page";
import HomePage from "@/app/homePage/page";

export default function homePageDefault() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsAuthenticated(isLoggedIn());
        setLoading(false);

        // Ascolta i cambiamenti di autenticazione (es. Logout dall'Header)
        const unsubscribe = pb.authStore.onChange(() => {
            setIsAuthenticated(isLoggedIn());
        });

        return () => {
            unsubscribe();
        };
    }, []);

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

    if (isAuthenticated && !pb.authStore.record?.verified) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-white p-8 text-center">
                <h2 className="text-4xl font-bold mb-4 text-primary">Verifica la tua Email</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-md">
                    Abbiamo inviato un link di conferma a <strong>{pb.authStore.record?.email}</strong>.<br />
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
                        onClick={() => {
                            pb.authStore.clear();
                            setIsAuthenticated(false);
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
