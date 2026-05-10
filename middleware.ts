import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

// Protect everything that lives in the (app) route group.
export const config = {
  matcher: [
    "/album/:path*",
    "/repes/:path*",
    "/match/:path*",
    "/stats/:path*",
  ],
};
