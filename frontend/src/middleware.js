
import axios from "axios";
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

export async function middleware(request)  {
  const { pathname } = request.nextUrl;

  const api = axios.create({
    baseURL: "http://localhost:4000/api/",
    withCredentials: true, 
  });

  // Vérifie si la route est protégée
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const checkAuth = async () => {
    try {
      const response = await api.get('/authenticateUser'); // ou une route protégée quelconque
      console.log("User connecté:", response.data);
      return true;
    } catch (err) {
      console.warn("Utilisateur non authentifié");
      return false;
    }
  };  

  if (isProtectedRoute && !checkAuth) {
    const url = new URL('/', request.url);
    // url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  //redirect si l'utilisateur est déjà connecté
  if (checkAuth && !isProtectedRoute ) { 
    const newurl = new URL(protectedRoutes[0] // à changer en fonction du niveau d'authorisation
      , request.url);
    return NextResponse.redirect(newurl);
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
