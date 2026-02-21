"use client";

import { useState } from "react";
import { logout } from "@/core/supabase/auth";
import { useRouter } from "next/navigation";

interface LogoutProps {
    children: React.ReactNode;
    className?: string;
}

export default function Logout({ children, className }: LogoutProps) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const router = useRouter();

    async function confirmLogout() {
        await logout();
        setShowLogoutConfirm(false);
        router.push("/");
        router.refresh();
    }

    return (
        <>
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className={className}
            >
                {children}
            </button>

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