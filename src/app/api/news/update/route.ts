import Parser from "rss-parser";
import PocketBase from "pocketbase";
import { type NextRequest, NextResponse } from "next/server";

// Inizializza parser RSS
const parser = new Parser();

// Inizializza PocketBase (lato server)
const pb = new PocketBase("http://raspberrypi:8091");

// Algoritmo per calcolare la similarità tra due stringhe (Levenshtein semplificato)
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
            if (i == 0) costs[j] = j;
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
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

export async function GET(request: NextRequest) {
    // 0. CONTROLLO SICUREZZA:
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. AUTENTICAZIONE ADMIN SU POCKETBASE
        // Necessaria per scrivere nella collezione 'news' se le API rules sono restrittive
        console.log("Tentativo Login Admin...", process.env.POCKETBASE_ADMIN_EMAIL);

        await pb.admins.authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL!,
            process.env.POCKETBASE_ADMIN_PASSWORD!
        );

        if (pb.authStore.isValid) {
            console.log("LOGIN ADMIN: Successo (Token valido)");
        } else {
            console.log("LOGIN ADMIN: Fallito (Token non valido)");
            throw new Error("Login fallito post-auth");
        }

        // 2. RECUPERA NEWS ESISTENTI (per controllo duplicati)
        // Prendiamo le ultime 50 notizie per sicurezza e le ordiniamo per data
        console.log("Tentativo recupero lista news...");
        const recentNews = await pb.collection("news").getList(1, 50, {
            sort: '-published_at'
        });

        // 3. FETCH RSS
        const searchParams = request.nextUrl.searchParams;
        const link = searchParams.get("link") || "https://it.motorsport.com/rss/f1/news/";
        const feed = await parser.parseURL(link);

        let createdCount = 0;
        let skippedCount = 0;

        for (const item of feed.items) {
            if (!item.link || !item.title) continue;

            const title = item.title.trim();
            const linkUrl = item.link;

            // CHECK DUPLICATI ESATTI (Link)
            // Nota: Se hai messo il vincolo UNIQUE su 'link' nel DB, potremmo anche lasciar fare errore al DB,
            // ma controllarlo prima evita chiamate inutili.
            const existsByLink = recentNews.items.some((n) => n.link === linkUrl);
            if (existsByLink) {
                skippedCount++;
                continue;
            }

            // CHECK DUPLICATI SIMILI (Titolo)
            const isDuplicateTitle = recentNews.items.some((existing) => {
                const sim = similarity(title, existing.title);
                return sim > 0.75;
            });

            if (isDuplicateTitle) {
                console.log(`Skipping similar news: "${title}"`);
                skippedCount++;
                continue;
            }

            // PREPARA DATI
            const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
            const sourceDomain = new URL(link).hostname.replace("www.", "");
            // Pulizia descrizione
            let description = item.contentSnippet || item.description || "";
            if (description.length > 200) description = description.substring(0, 200) + "...";

            const content = item["content:encoded"] || item.content || item.description || "";
            const imageUrl = item.enclosure?.url || null;

            // CREA RECORD SU POCKETBASE
            try {
                await pb.collection("news").create({
                    title: title,
                    link: linkUrl,
                    description: description,
                    content: content,
                    image_url: imageUrl,
                    source: sourceDomain,
                    published_at: publishedAt.toISOString(),
                    category: "F1",
                    tags: ["F1", "News"],
                });
                createdCount++;
            } catch (err: any) {
                // Se c'è un errore 400 ed è dovuto al campo Unique sul link, lo ignoriamo in silenzio
                if (err.status === 400) {
                    skippedCount++;
                } else {
                    console.error(`Errore creazione news "${title}":`, err.message);
                }
            }
        }

        return NextResponse.json({
            success: true,
            created: createdCount,
            skipped: skippedCount,
            message: `Sincronizzazione completata: ${createdCount} nuove notizie.`
        });

    } catch (error: any) {
        console.error("Errore Sync News:", error.response || error.message || error);
        return NextResponse.json(
            { success: false, error: error.response?.message || error.message || "Errore sconosciuto", details: error.response },
            { status: 500 }
        );
    }
}
