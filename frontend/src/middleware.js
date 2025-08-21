
import axios from "axios";
import { NextResponse } from 'next/server';
// import { NextRequest } from 'next/server';

import {routePermissions} from "../src/routePermissions.js"

export async function middleware(request)  {
  
  const { pathname } = request.nextUrl;

  const api = axios.create({
    baseURL: "http://localhost:4000/api/me",
    withCredentials: true,    
    headers: {
        'cookie': request.headers.get('cookie')
    }
  });

  
  var userPermissions = [];
  const checkAuth = async () => {
    console.log("Vérification de l'authentification...");
    try {
      const response = await api.get('/authenticateUser'); 
      console.log("User connecté:", response.data);
      userPermissions = response.data.permissions;
      return true;
    } catch (err) {
      console.warn("Utilisateur non authentifié");
      return false;
    }
  };
  var isAuth = (await checkAuth()).valueOf()

  

  // redirige vers la page de connexion si l'utilisateur n'est pas connecté
  if (!isAuth && pathname !== '/') { 
    console.log("Utilisateur non authentifié, redirection vers la page de connexion...", pathname);
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  // Vérifie si la route est protégée
  const requiredPerms = routePermissions[request.path];
  if (requiredPerms && !requiredPerms.length) {
    console.log(`No permissions defined for route: ${request.path}`);
    return NextResponse.next();
  }

  //redirect si l'utilisateur est déjà connecté
  if (isAuth && pathname === '/') {
    const url = new URL('/admin', request.url); //TODO: change to the desired default page
    return NextResponse.redirect(url);
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
