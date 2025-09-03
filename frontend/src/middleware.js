// Le middleware vérifie si l'utilisateur  est authentifié grâce au cookie, avant d'accéder à une page
// et redirige vers la page de connexion si ce n'est pas le cas.
import axios from "axios";
import { NextResponse } from 'next/server';

 const f2s_routes = {
  "/super_admin": "view_super_admin_dashboard",
};

export async function middleware(request)  { // TODO: à modifier pour ne pas faire d'appel API à chaque fois
  
  const { pathname } = request.nextUrl;

  const api = axios.create({
    baseURL: "http://localhost:4000/api/",
    withCredentials: true,    
    headers: {
        'cookie': request.headers.get('cookie')
    }
  });

  
  var userPermissions = [];
  const checkAuth = async () => {
    console.log("Vérification de l'authentification...");
    try {
      const response = await api.get('/me');
      userPermissions = response.data.user.permissions;
      console.log("Utilisateur authentifié avec les permissions :", response.data.user.permissions);
      return true;
    } catch (err) {
      console.warn("Utilisateur non authentifié", err.message);
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

  // redirige vers une page d'erreur si l'utilisateur n'est pas un super_admin et qu'il essaie d'accéder à une page super_admin
  if (isAuth && Object.keys(f2s_routes).includes(pathname)) {
    if (!userPermissions?.includes("view_super_admin_dashboard")) {
      console.log("Page super_admin, utilisateur non authorisé, redirection...", pathname, userPermissions);
      const url = new URL('/admin', request.url);
      return NextResponse.redirect(url);
  }
}

  //redirect si l'utilisateur est déjà connecté
  if (isAuth && pathname === '/') {
    // rediger vers la page super admin si l'utilisateur est super_admin
    if (userPermissions?.includes("view_super_admin_dashboard")) { 
      const url = new URL('/super_admin', request.url); // 
      return NextResponse.redirect(url);
    }

    // rediger vers la page admin(orga_dashboard) si l'utilisateur est un autre role
    const url = new URL('/admin', request.url); 
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
