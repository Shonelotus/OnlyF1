"use client"; // Componente lato client

import Link from "next/link";
import { Timer, Radio, BarChart3, ChevronRight, Sliders, Share2, History } from "lucide-react"; // Icone

export default function landingPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col p-8 md:p-12">
            {/* Hero Semplice */}
            <main className=" flex flex-col items-center justify-center text-center space-y-8 mb-20">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
                    OPENPADDOCK
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl">
                    "Tutto sulla F1 in un UNICO posto"
                </p>
            </main>

            {/* Griglia Features Semplice */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
                <FeatureCard
                    icon={<Timer className="w-6 h-6 text-primary" />}
                    title="Live Onboard"
                    desc="Segui i tempi sul giro in tempo reale con precisione millimetrica."
                />
                <FeatureCard
                    icon={<Radio className="w-6 h-6 text-primary" />}
                    title="Team Radio"
                    desc="Ascolta le comunicazioni tra piloti e box senza censure."
                />
                <FeatureCard
                    icon={<BarChart3 className="w-6 h-6 text-primary" />}
                    title="Statistiche"
                    desc="Analisi telemetriche dettagliate per ogni sessione."
                />
            </section>
        </div>
    );
}

/**
 * COMPONENTE FeatureCard Semplificato
 */
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-start gap-4 p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/50 transition-all group">
            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}