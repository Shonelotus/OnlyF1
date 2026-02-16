import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    // Per ora, disabilitiamo il controllo server-side in attesa di @supabase/auth-helpers-nextjs
    // La protezione avviene client-side in src/app/page.tsx

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
