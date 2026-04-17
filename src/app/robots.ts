import type { MetadataRoute } from "next";

// Next.js serves this at /robots.txt. Generated at build time — no
// runtime cost. Allow Google (and others) to crawl the marketing
// surface; keep the app, API, and user-specific share pages out.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/crew"],
        disallow: ["/builder", "/api/", "/s/"],
      },
    ],
    sitemap: "https://riglogic.app/sitemap.xml",
    host: "https://riglogic.app",
  };
}
