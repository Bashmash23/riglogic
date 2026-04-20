import type { MetadataRoute } from "next";

// Next.js serves this at /sitemap.xml. Only include the public,
// indexable marketing surface — /builder is auth-gated and the
// [shortId] share pages are per-user (no SEO value, can leak
// private project names). `lastModified` is set to build time so
// Google treats the content as freshly re-crawlable after deploys.

const SITE = "https://riglogic.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE}/crew`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE}/listing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
