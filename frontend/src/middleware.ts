import { NextRequest, NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  admin:     "/admin/dashboard",
  member:    "/member/dashboard",
  volunteer: "/volunteer/dashboard",
};

const PROTECTED_ROUTES: Record<string, string[]> = {
  "/admin":     ["admin"],
  "/member":    ["member"],
  "/volunteer": ["volunteer"],
};

const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/about",
  "/events",
  "/announcements",
  "/contact",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes and root
  if (pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;
  const role  = request.cookies.get("user_role")?.value;

  // No token — redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check role-based access for protected prefixes
  for (const [prefix, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      if (!role || !allowedRoles.includes(role)) {
        // Redirect to their own dashboard
        const home = role ? ROLE_HOME[role] : "/login";
        return NextResponse.redirect(new URL(home || "/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|animation.json|404.json).*)",
  ],
};