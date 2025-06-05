
import axios from "axios";
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

import navigationGraph from "../src/arborescence.json"

const protectedRoutes = [
                        '/super_admin',
                        '/admin',
                        '/new_project',
                        '/project_overview',
                        '/rh_page',
                        '/user',
                        ];

export async function middleware(request)  {
  console.log(navigationGraph)
  
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
      const response = await api.get('/authenticateUser'); 
      console.log("User connecté:", response.data);
      return true;
    } catch (err) {
      console.warn("Utilisateur non authentifié");
      return false;
    }
  };
  var isAuth = (await checkAuth()).valueOf() 

  if (isProtectedRoute && !isAuth) { // redirige vers la page de connexion si l'utilisateur n'est pas connecté
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  //redirect si l'utilisateur est déjà connecté
  if (isAuth && !isProtectedRoute ) { 
    const newurl = new URL(protectedRoutes[0] // TODO: à changer en fonction du niveau d'authorisation
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
