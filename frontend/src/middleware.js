// Le middleware vérifie si l'utilisateur  est authentifié grâce au cookie, avant d'accéder à une page
// et redirige vers la page de connexion si ce n'est pas le cas.
import axios from "axios";
import { NextResponse } from 'next/server';

 const f2s_routes = {
  "/clients": "view_super_admin_dashboard",
};

export async function middleware(request)  { 
  
  const { pathname } = request.nextUrl;

  const API_INTERNAL = process.env.API_INTERNAL_URL || 'http://localhost:4000';

  const api = axios.create({ // TODO: import api_backend
    baseURL: `${API_INTERNAL}/api/`, // baseURL: "http://localhost:4000/api/",
    withCredentials: true,    
    headers: {
        'cookie': request.headers.get('cookie')
    }
  });

  
  var userPermissions = [];
  var userclientId = null;
  const checkAuth = async () => { // TODO: modifier pour vérifier les permissions du cookie, pour pas avoir à chaque fois une requête au backend
    try {
      const response = await api.get('/me');
      userPermissions = response.data.user.permissions;
      userclientId = response.data.user.clientId;
      return true;
    } catch (err) {
      console.log("Utilisateur non authentifié", err.message, err.data);
      return false;
    }
  };

  var isAuth = (await checkAuth()).valueOf()
  

  // redirige vers la page de connexion si l'utilisateur n'est pas connecté
  if (!isAuth && pathname !== '/') { 
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  // redirige vers une page d'erreur si l'utilisateur n'est pas un super_admin et qu'il essaie d'accéder à une page super_admin
  if (isAuth && Object.keys(f2s_routes).includes(pathname)) {
    if (!userPermissions?.includes("view_super_admin_dashboard")) {
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
  }
}

  //redirect si l'utilisateur est déjà connecté
  if (isAuth && pathname === '/') {
    // rediger vers la page super admin si l'utilisateur est super_admin
    if (userPermissions?.includes("view_super_admin_dashboard")) { 
      const url = new URL('/clients', request.url); // 
      return NextResponse.redirect(url);
    }

    // rediger vers la page admin(orga_dashboard) si l'utilisateur est un autre role
    const url = new URL(`/${userclientId}/projets`, request.url); 
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


