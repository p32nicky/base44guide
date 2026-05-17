import fs from "fs";
import path from "path";
import { marked } from "marked";

const AFFILIATE = "https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base";
const CTA_HTML = `<a href="${AFFILIATE}" class="cta-link">Start Building with Base44 →</a>`;

export interface Article {
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  body: string;
  generatedAt: string;
  error?: string;
}

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function processBody(raw: string): string {
  let body = raw
    .replace(/^META:.*$/gm, "")
    .replace(/^KEYWORDS:.*$/gm, "")
    .trim();

  // Always parse as markdown
  body = marked.parse(body) as string;

  // Replace all CTA variants
  body = body.replace(/\[CTA[^\]]*\]/gi, CTA_HTML);
  body = body.replace(/<strong>Start Building with Base44[^<]*<\/strong>/gi, CTA_HTML);
  body = body.replace(/<strong>Try Base44[^<]*<\/strong>/gi, CTA_HTML);
  body = body.replace(/<p><strong>Start Building[^<]*<\/strong><\/p>/gi, `<p>${CTA_HTML}</p>`);

  return body;
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const a = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), "utf-8")) as Article;
      return { ...a, body: processBody(a.body) };
    })
    .filter((a) => !a.error)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const a = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Article;
  return { ...a, body: processBody(a.body) };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
}
