"use client";

import { useEffect, useState } from "react";
import pb from "@/core/pocketbase/connection";
import { NewsArticle } from "@/core/interfaces/newsArticle";
import Link from "next/link";

export default function NewsPage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filtri
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSource, setSelectedSource] = useState("");
    // Ipotizziamo le testate principali in italiano presenti nel DB
    const sources = ["it.motorsport.com", "formulapassion.it", "f1world.it", "f1grandprix.motorionline.com", "skysport.it"];

    const loadNews = async (currentPage: number, search: string, source: string, append = false) => {
        setLoading(true);
        try {
            // Costruiamo il filtro di PocketBase
            let filterString = "";
            let filters = [];

            if (search.trim()) {
                filters.push(`title ~ "${search.replace(/"/g, '\\"')}"`);
            }
            if (source) {
                filters.push(`source = "${source}"`);
            }

            if (filters.length > 0) {
                filterString = filters.join(" && ");
            }

            const resultList = await pb.collection('news').getList(currentPage, 15, {
                sort: '-published_at',
                filter: filterString,
            });

            if (append) {
                setNews(prev => [...prev, ...(resultList.items as unknown as NewsArticle[])]);
            } else {
                setNews(resultList.items as unknown as NewsArticle[]);
            }

            setTotalPages(resultList.totalPages);
        } catch (error) {
            console.error("Errore recupero news:", error);
        } finally {
            setLoading(false);
        }
    };

    // Al Mount e ai cambi "pesanti" di filtro, ricarica la pagina 1
    useEffect(() => {
        setPage(1);
        loadNews(1, searchQuery, selectedSource, false);
    }, [searchQuery, selectedSource]);

    // Gestione Load More
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadNews(nextPage, searchQuery, selectedSource, true);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <Link href="/" className="text-red-600 hover:text-red-500 font-bold mb-2 inline-block">&larr; Torna alla Home</Link>
                        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter">Tutte le Notizie</h1>
                    </div>
                </div>

                {/* Filtri */}
                <div className="flex flex-col sm:flex-row gap-4 bg-neutral-900/50 p-4 rounded-xl border border-white/10">
                    {/* Cerca testuale */}
                    <div className="flex-1">
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Cerca Parola Chiave</label>
                        <input
                            type="text"
                            placeholder="Es. Ferrari, Leclerc..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
                        />
                    </div>

                    {/* Filtro Fonte */}
                    <div className="w-full sm:w-64">
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Fonte Notizia</label>
                        <select
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600 transition"
                        >
                            <option value="">Tutte le fonti</option>
                            {sources.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Griglia Notizie */}
                {news.length === 0 && !loading && (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-xl">Nessuna notizia trovata con questi filtri.</p>
                        <button onClick={() => { setSearchQuery(""); setSelectedSource(""); }} className="mt-4 text-red-500 hover:underline">Resetta filtri</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((item) => (
                        <a
                            key={item.id}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col bg-neutral-900/30 rounded-xl overflow-hidden hover:bg-neutral-800 transition border border-white/5 hover:border-red-600/50"
                        >
                            <div className="h-48 overflow-hidden relative shrink-0">
                                <img
                                    src={item.image_url || '/placeholder-f1.jpg'}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white backdrop-blur-sm border border-white/10 shadow-lg">
                                    {item.source}
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <div className="text-xs text-red-500 font-bold mb-2 flex justify-between items-center uppercase tracking-wider">
                                    <span>News</span>
                                    <span className="text-gray-500 font-mono font-normal flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {new Date(item.published_at).toLocaleDateString('it-IT')}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                                    {item.description}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Carica Altro e Loading Stat */}
                <div className="flex justify-center mt-8 pb-12">
                    {loading && (
                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></span>
                            Ricerca notizie in corso...
                        </div>
                    )}
                    {!loading && page < totalPages && (
                        <button
                            onClick={handleLoadMore}
                            className="bg-neutral-800 border border-white/10 hover:bg-neutral-700 hover:border-red-500/50 text-white px-8 py-3 rounded-full transition font-semibold"
                        >
                            Carica Più Notizie
                        </button>
                    )}
                    {!loading && page >= totalPages && news.length > 0 && (
                        <div className="text-gray-500 text-sm">Hai raggiunto la fine delle notizie.</div>
                    )}
                </div>

            </div>
        </div>
    );
}
