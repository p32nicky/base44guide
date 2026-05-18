import { getAllSlugs } from "@/lib/articles";
import { NextResponse } from "next/server";

export async function GET() {
  const base = "https://base44site.vercel.app";
  const slugs = getAllSlugs();

  const urls = [
    { loc: base, priority: "1.0", changefreq: "weekly" },
    ...slugs.map((slug) => ({
      loc: `${base}/articles/${slug}`,
      priority: "0.8",
      changefreq: "monthly",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
