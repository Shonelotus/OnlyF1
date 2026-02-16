"use client";

import { useEffect, useState } from "react";
import pb from "@/core/pocketbase/connection";
import { NewsArticle } from "@/core/interfaces/newsArticle";

export default function HomePage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch notizie da PocketBase (Pagina 1, 15 risultati, ordinate per data decrescente)
                const resultList = await pb.collection('news').getList(1, 15, {
                    sort: '-published_at',
                });

                console.log("DATI POCKETBASE:", resultList.items);
                setNews(resultList.items as unknown as NewsArticle[]); // Type assertion se necessario
            } catch (error) {
                console.error("ERRORE POCKETBASE:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Caricamento notizie...</div>;
    }

    // Se non ci sono news
    if (news.length === 0) {
        return <div className="text-white p-10 bg-black min-h-screen">Nessuna notizia trovata. Esegui l'aggiornamento!</div>;
    }

    // La prima notizia è la "Hero" (in evidenza)
    const heroNews = news[0];
    // Le altre sono la griglia
    const gridNews = news.slice(1);

    return (
        <main className="min-h-screen bg-black text-white pb-20">

            {/* HERO SECTION */}
            <section className="relative h-[60vh] w-full overflow-hidden group cursor-pointer">
                <a href={heroNews.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    {/* Immagine Sfondo */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${heroNews.image_url})` }}
                    />
                    {/* Gradiente Scuro */}
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />

                    {/* Testo Hero */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-4xl">
                        <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wider rounded mb-4 inline-block">
                            Breaking News
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                            {heroNews.title}
                        </h1>
                        <p className="text-gray-200 text-lg md:text-xl line-clamp-2 max-w-2xl">
                            {heroNews.description}
                        </p>
                        <div className="mt-6 flex items-center text-sm text-gray-400 gap-4">
                            <span className="uppercase font-semibold text-red-500">{heroNews.source}</span>
                            <span>•</span>
                            <span>{new Date(heroNews.published_at).toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </a>
            </section>

            {/* LATEST NEWS GRID */}
            <section className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold uppercase tracking-tighter border-l-4 border-red-600 pl-4">
                        Ultime Notizie
                    </h2>
                    <a href="/news" className="text-sm text-gray-400 hover:text-white transition">Vedi tutte &rarr;</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gridNews.map((item) => (
                        <a
                            key={item.id}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block bg-neutral-900/50 rounded-xl overflow-hidden hover:bg-neutral-800 transition border border-white/10 hover:border-red-600/50"
                        >
                            {/* Card Image */}
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={item.image_url || '/placeholder-f1.jpg'}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                                    {item.source}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-red-500 transition">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                                    {item.description}
                                </p>
                                <div className="text-xs text-gray-500 font-mono">
                                    {new Date(item.published_at).toLocaleDateString('it-IT')}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

        </main>
    );
}
