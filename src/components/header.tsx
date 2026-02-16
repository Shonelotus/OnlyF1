"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout, getCurrentUser, isLoggedIn, onAuthStateChange } from "@/core/supabase/auth";
import { useRouter } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        // Controllo iniziale
        getCurrentUser().then(u => {
            setUser(u);
            setLoading(false);
        });

        // Ascolta cambiamenti
        const { data: { subscription } } = onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Richiede conferma prima di uscire
    function handleLogoutClick() {
        setShowLogoutConfirm(true);
    }

    // Esegue il logout vero e proprio
    async function confirmLogout() {
        await logout();
        setUser(null);
        setShowLogoutConfirm(false);
        router.push("/");
        router.refresh();
    }

    // Stile base per i link (attivo vs inattivo)
    const getLinkClass = (path: string) => {
        const base = "text-sm font-medium transition-colors hover:text-primary";
        return pathname === path ? `${base} text-primary` : `${base} text-gray-400`;
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur supports-backdrop-filter:bg-black/60">
                <div className="flex w-full h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* 1. SINISTRA: Logo */}
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center text-xl tracking-tighter text-white">
                            <span className="font-bold text-primary">Open</span>
                            <span className="font-bold">Paddock</span>
                        </Link>
                    </div>

                    {/* 2. CENTRO: Navigazione (Solo Desktop e Solo se Loggato) */}
                    {user && (
                        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
                            <Link href="/" className={getLinkClass("/")}>
                                News
                            </Link>
                            <Link href="/live-timing" className={getLinkClass("/live-timing")}>
                                Live Timing
                            </Link>
                            <Link href="/stats" className={getLinkClass("/stats")}>
                                Statistiche
                            </Link>
                        </nav>
                    )}

                    {/* 3. DESTRA: Utente */}
                    <div className="flex items-center gap-4 ml-auto">
                        {user ? (
                            // UTENTE LOGGATO
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-300 hidden sm:inline-block">
                                    <span className="font-bold text-white">{user.user_metadata?.username || user.email}</span>
                                </span>
                                <button
                                    onClick={handleLogoutClick}
                                    className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            // UTENTE OSPITE
                            <div className="ml-auto flex items-center gap-4">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-md hover:bg-white/10 transition-colors"
                                >
                                    Accedi
                                </Link>
                                <Link
                                    href="/register"
                                    className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-1"
                                >
                                    Registrati
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* MODAL DI CONFERMA LOGOUT */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Vuoi davvero uscire?</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Dovrai effettuare nuovamente l'accesso per vedere i contenuti riservati.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium border border-white/10"
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold shadow-lg shadow-red-900/20"
                                >
                                    Esci
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}