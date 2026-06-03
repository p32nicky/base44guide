import { getArticleSummaries } from "@/lib/articles";
import { CATEGORIES } from "@/lib/categories";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.base44guide.io";
  const articles = getArticleSummaries().map((a) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: a.generatedAt ? new Date(a.generatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const categoryPages = CATEGORIES.map((c) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/articles`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    ...categoryPages,
    ...articles,
  ];
}
