(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root of the server]__ebf7387e._.js", {

"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[project]/src/middleware.js [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "config": (()=>config),
    "middleware": (()=>middleware)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
;
;
const protectedRoutes = [
    '/super_admin',
    '/admin',
    '/new_project',
    '/project_overview',
    '/rh_page',
    '/user'
];
function middleware(request) {
    const { pathname } = request.nextUrl;
    // Vérifie si la route est protégée
    const isProtectedRoute = protectedRoutes.some((route)=>pathname.startsWith(route));
    // Vérifie si l'utilisateur est authentifié
    const isAuthenticated = request.cookies.get('next-auth.session-token') // Exemple pour next-auth
    ;
// if (isProtectedRoute && !isAuthenticated) {
//   const url = new URL('/', request.url);
//   // url.searchParams.set('callbackUrl', pathname);
//   return NextResponse.redirect(url);
// }
// return NextResponse.next();
}
const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)'
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__ebf7387e._.js.map