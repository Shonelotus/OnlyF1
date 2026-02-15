import Parser from "rss-parser"
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { NewsArticle } from "@/core/interfaces/newsArticle";

const parser = new Parser();

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!
);


//Algoritmo per calcolare la similarità tra due stringhe
function similarity(s1: string, s2: string) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString());
}

function editDistance(s1: string, s2: string) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
//Fine algoritmo

export async function GET(request: NextRequest) {
    //controllo che sono autorizzato a scrivere sul db di Supabase
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    //prendo il link del feed RSS dai parametri della richiesta
    const searchParams = request.nextUrl.searchParams;
    const link = searchParams.get('link') || 'https://it.motorsport.com/rss/f1/news/';

    try {
        const feed = await parser.parseURL(link);

        // 0. Fetch delle ultime news già nel DB per confronto
        // Usiamo supabaseAdmin anche qui per coerenza, ma basterebbe quello normale
        const { data: recentNews } = await supabaseAdmin
            .from('news')
            .select('title')
            .order('created_at', { ascending: false })
            .limit(50);

        // 1. Preparazione Dati BULK (Massiva) con filtro Deduplicazione
        const newsToInsert: Omit<NewsArticle, 'id'>[] = [];

        for (const item of feed.items) {
            if (!item.link || !item.title) continue;

            const title = item.title.trim();

            // CHECK DUPLICATI: Controlliamo se c'è già un titolo simile > 75%
            const isDuplicate = recentNews?.some(existing => {
                const sim = similarity(title, existing.title);
                return sim > 0.75; // Se sono uguali al 75%, lo scartiamo
            });

            if (isDuplicate) {
                console.log(`Skipping duplicate/similar news: "${title}"`);
                continue;
            }

            const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
            const sourceDomain = new URL(link).hostname.replace('www.', '');
            const description = (item.contentSnippet || item.description || item.content || "").substring(0, 200) + "...";
            const content = item['content:encoded'] || item.content || item.description || "";

            newsToInsert.push({
                title: title,
                link: item.link,
                description: description,
                content: content,
                image_url: item.enclosure?.url || null,
                source: sourceDomain,
                published_at: publishedAt.toISOString(),
                category: 'F1',
                tags: ['F1', 'News']
            });
        }

        if (newsToInsert.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: "Nessuna news nuova trovata." });
        }

        // 2. Esecuzione UPSERT con AMMINISTRATORE
        const { error, count } = await supabaseAdmin
            .from('news')
            .upsert(newsToInsert, {
                onConflict: 'link',
                ignoreDuplicates: true
            });

        if (error) {
            console.error("Errore Supabase:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            parsed: newsToInsert.length,
            message: `Sincronizzazione completata: ${newsToInsert.length} nuove notizie.`
        });

    } catch (error) {
        console.error("Errore RSS:", error);
        return NextResponse.json({ success: false, error: "Errore nel parsing del feed" }, { status: 500 });
    }
}
