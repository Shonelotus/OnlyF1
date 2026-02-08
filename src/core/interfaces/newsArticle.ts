interface NewsArticle {
    // Identificativi
    id: number;
    title: string;
    summary: string;

    // Contenuto
    contents: string[];
    images: string[];
    author: string;

    // Origine
    sourceUrl: string;
    sourceName: string;
    sourceLogo?: string;

    // Organizzazione
    category: "breaking" | "team-news" | "interview" | "analysis" | "preview";
    tags?: string[];
    featured?: boolean;

    // Timestamp
    publishedAt: string;
    createdAt: string;

    // Analytics
    views?: number;
}

export default NewsArticle;
