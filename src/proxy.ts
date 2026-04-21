import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes — viewable without sign-in
const isPublicRoute = createRouteMatcher([
  "/",
  "/crew", // public directory grid
  "/crew/(.*)", // public freelancer profile pages — but /crew/me is protected below
  "/terms", // legal — must be reachable without an account
  "/privacy", // legal — must be reachable without an account
  "/listing", // rental-house claim / correction contact page
  "/s/(.*)", // public shared kit view (M3)
  "/api/share/(.*)", // public share-link read API
  "/api/waitlist", // public waitlist capture
  "/api/crew", // public GET list of crew
  "/api/crew/(?!(profile|upload))(.*)", // public GET by slug (exclude profile/upload)
  "/robots.txt", // SEO — Google must fetch unauthenticated
  "/sitemap.xml", // SEO — Google must fetch unauthenticated
]);

// Explicitly protect these — /crew/me needs Clerk auth even though
// /crew/(.*) is otherwise public; the API write routes same.
const isProtectedCrew = createRouteMatcher([
  "/crew/me",
  "/api/crew/profile",
  "/api/crew/upload",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protected Crew routes take priority — /crew/me is matched by
  // the public /crew/(.*) pattern above, but we re-gate it here so
  // the editor is actually sign-in-only.
  if (isProtectedCrew(req)) {
    await auth.protect();
    return;
  }
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
