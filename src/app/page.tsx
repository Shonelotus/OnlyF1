"use client"; // Dice a Next.js che questo componente gira nel browser

import { useEffect, useState } from "react";
import pb from "@/core/pocketbase/connection"; // Importa la connessione al database PocketBase
import LandingPage from "@/app/landingPage/page"; // Importa la pagina di presentazione (landing)

export default function HomePage() {
    // STATI: Variabili che React osserva per capire cosa mostrare
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Per mostrare "Caricamento" all'inizio

    // useEffect: Viene eseguito una sola volta all'apertura della pagina
    useEffect(() => {
        // Controlliamo se nel browser esiste una sessione valida dell'utente
        setIsAuthenticated(pb.authStore.isValid);

        // Finito il controllo, togliamo la scritta caricamento
        setLoading(false);
    }, []);

    // Se stiamo ancora controllando se l'utente esiste...
    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-white">
                <p>Caricamento...</p>
            </div>
        );
    }

    // LOGICA DI NAVIGAZIONE:
    // 1. Se l'utente NON è loggato -> Mostra la Landing Page (Vetrine/Marketing)
    if (!isAuthenticated) {
        return <LandingPage />;
    }

    // 2. Se l'utente È loggato -> Controlliamo se è verificato
    // Controlliamo l'oggetto 'record' che contiene i dati dell'utente loggato
    if (isAuthenticated && !pb.authStore.record?.verified) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-white p-8 text-center">
                <h2 className="text-4xl font-bold mb-4 text-primary">Verifica la tua Email 📧</h2>
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

    // 3. Se l'utente È loggato E verificato -> Mostra la Dashboard (Work in Progress)
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-white p-8 text-center uppercase">
            <h1 className="text-4xl font-bold mb-4">Dashboard OnlyF1 🏎️</h1>
            <p className="text-xl text-gray-400 mb-8">Benvenuto nel Paddock. Profilo verificato con successo.</p>

            <button
                onClick={() => {
                    pb.authStore.clear();
                    setIsAuthenticated(false);
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full transition"
            >
                Logout
            </button>
        </div>
    );
}
