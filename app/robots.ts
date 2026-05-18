import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: [
      "https://base44guide.io/sitemap.xml",
      "https://base44site.vercel.app/sitemap-main.xml",
    ],
  };
}
