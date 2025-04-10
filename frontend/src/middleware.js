

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const protectedRoutes = [
                        '/super_admin',
                        '/admin',
                        '/new_project',
                        '/project_overview',
                        '/rh_page',
                        '/user',
                        ];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Vérifie si la route est protégée
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Vérifie si l'utilisateur est authentifié
  const isAuthenticated = request.cookies.get('next-auth.session-token') // Exemple pour next-auth
  console.log(request.cookies)
  console.log(isAuthenticated)

  if (isProtectedRoute && !isAuthenticated) {
    // const url = new URL('/', request.url);
    // url.searchParams.set('callbackUrl', pathname);
    // return NextResponse.redirect(url);
  }
  // return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
