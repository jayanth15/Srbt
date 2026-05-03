import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that don't require authentication (public)
const publicPaths = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/manifest.json") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  const isPublic = publicPaths.some(p => pathname === p)

  // Root path: redirect to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Allow all other routes — auth is handled client-side by AuthContext
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image).*)",
  ],
}
