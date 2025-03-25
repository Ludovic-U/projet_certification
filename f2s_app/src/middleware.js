import { NextResponse } from "next/server";

export function middleware(req) {
  const isLoggedIn = false; // Simule un utilisateur non connecté
  const url = req.nextUrl;

  // alert("redirect")
  console.log(req.nextUrl);

  // if (!isLoggedIn && url.pathname.startsWith("/test")) {

  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  return NextResponse.next();
}

// Appliquer le middleware à certaines pages seulement
export const config = {
  // matcher: ["/dashboard/:path*"], // Bloque toutes les sous-pages de /dashboard
  // matcher: ["/test"],
  // matcher: ["/"], 
};
