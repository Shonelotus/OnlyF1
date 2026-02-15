import { NextRequest, NextResponse } from "next/server";
import pb from "./core/pocketbase/connection";

export async function middleware(request: NextRequest) {

    //prendo il cookie dalla richiesta
    const cookie = request.headers.get('cookie');
    if (cookie) {
        pb.authStore.loadFromCookie(cookie);
    }

    const { pathname } = request.nextUrl;

    //pagine riservate ESCLUSIVAMENTE agli ospiti (utenti non loggati)
    const isGuestOnlyPage = pathname === '/login' ||
        pathname === '/register';

    //pagine accessibili a TUTTI (sia loggati che ospiti)
    const isPublicPage = isGuestOnlyPage ||
        pathname === '/resetPassword' ||
        pathname === '/';

    //controllo se l'utente è loggato
    if (!pb.authStore.isValid && !isPublicPage) {
        //se non sono loggato e non è una pagina pubblica porto alla login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pb.authStore.isValid && isGuestOnlyPage) {
        //se sono loggato e provo ad andare su login/register, porto alla home
        return NextResponse.redirect(new URL('/', request.url));
    }

    //altrimenti proseguo
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
