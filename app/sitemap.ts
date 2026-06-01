import { getAllSlugs } from "@/lib/articles";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.base44guide.io";
  const slugs = getAllSlugs();
  const articles = slugs.map((slug) => ({
    url: `${base}/articles/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/articles`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    ...articles,
  ];
}
