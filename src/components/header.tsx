"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, isLoggedIn, onAuthStateChange } from "@/core/supabase/auth";
import { useRouter } from "next/navigation";
import Logout from "./logout";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                            <Link href="/profile" className={getLinkClass("/profile")}>
                                Profilo
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
                                <Logout className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">
                                    Logout
                                </Logout>
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
        </>
    );
}