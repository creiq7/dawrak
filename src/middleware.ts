import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dawrak-super-secret-key-123456-premium-design-system"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clone request headers and set pathname
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // 1. Language management (dynamic language detection and set cookie if absent)
  let lang = request.cookies.get("lang")?.value;
  let hasSetLang = !!lang;
  if (!lang) {
    lang = "ar"; // Default is Arabic
  }

  // 2. Session verification using jose jwtVerify (edge-safe)
  const sessionToken = request.cookies.get("session")?.value;
  let hasSession = false;

  if (sessionToken) {
    try {
      await jwtVerify(sessionToken, SECRET);
      hasSession = true;
    } catch {
      hasSession = false;
    }
  }

  // 3. Routing protection and redirection
  if (pathname.startsWith("/dashboard")) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      const res = NextResponse.redirect(loginUrl);
      if (!hasSetLang) res.cookies.set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
      return res;
    }
  }

  if (pathname === "/login" || pathname === "/register") {
    if (hasSession) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Set default language cookie if it was not present
  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!hasSetLang) {
    res.cookies.set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
