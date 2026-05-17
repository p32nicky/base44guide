import { getAllSlugs } from "@/lib/articles";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://base44guide.io";
  const slugs = getAllSlugs();
  const articles = slugs.map((slug) => ({
    url: `${base}/articles/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...articles,
  ];
}
