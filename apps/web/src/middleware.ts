import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
      return NextResponse.rewrite(new URL("/not-found", req.url));
    }

    if (path.startsWith("/instructor")) {
      const approvedRoles = (token?.approvedRoles as string[]) || [];
      if (token?.role !== "ADMIN" && !approvedRoles.includes("INSTRUCTOR")) {
        return NextResponse.rewrite(new URL("/not-found", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/instructor/:path*"],
};
