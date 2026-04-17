import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes — viewable without sign-in
const isPublicRoute = createRouteMatcher([
  "/",
  "/crew",
  "/s/(.*)", // public shared kit view (M3)
  "/api/share/(.*)", // public share-link read API
  "/api/waitlist", // public waitlist capture
]);

export default clerkMiddleware(async (auth, req) => {
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
