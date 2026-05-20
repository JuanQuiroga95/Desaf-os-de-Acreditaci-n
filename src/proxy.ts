import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/api/chat", "/api/ai-grade", "/api/upload", "/api/extract-pdf", "/api/export-grades", "/api/roleplay-chat", "/api/simulate-exam", "/api/summarize-material"];

function isPublic(pathname: string) {
  return publicPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public assets and API routes that handle their own auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    isPublic(pathname)
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("videla_session");
  
  if (!sessionCookie?.value) {
    // Not authenticated → redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Decode session to check role for protected routes
  try {
    const secret = process.env.SESSION_SECRET || "videla-default-secret-change-me";
    const decoded = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString());
    const crypto = require("crypto");
    const expectedHmac = crypto.createHmac("sha256", secret).update(decoded.payload).digest("hex");
    
    if (decoded.hmac !== expectedHmac) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const user = JSON.parse(decoded.payload);

    // Role-based route protection
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/docente") && user.role !== "teacher" && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
