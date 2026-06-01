import { getArticleBySlug, getAllSlugs, getArticleSummaries } from "@/lib/articles";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const AFFILIATE = "https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.metaDescription,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      type: "article",
    },
    alternates: {
      canonical: `/articles/${slug}`,
    },
  };
}

function getRelated(slug: string, count = 6) {
  const all = getArticleSummaries().filter((a) => a.slug !== slug);
  // seed shuffle deterministically by slug so it's stable across builds
  const seed = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...all].sort((a, b) => {
    const ha = (seed * 1664525 + a.slug.length * 22695477) & 0x7fffffff;
    const hb = (seed * 1664525 + b.slug.length * 22695477 + 1) & 0x7fffffff;
    return ha - hb;
  });
  return shuffled.slice(0, count);
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const related = getRelated(slug);

  const SITE = "https://base44guide.com";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    keywords: article.keywords.join(", "),
    datePublished: article.generatedAt,
    dateModified: article.generatedAt,
    author: { "@type": "Organization", name: "Base44 Guide", url: SITE },
    publisher: {
      "@type": "Organization",
      name: "Base44 Guide",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/articles/${slug}` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Articles", item: `${SITE}/articles` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${SITE}/articles/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
          <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <a href="/" itemProp="item" className="hover:text-orange-500">
                <span itemProp="name">Home</span>
              </a>
              <meta itemProp="position" content="1" />
            </li>
            <li aria-hidden="true">›</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name" className="text-gray-400">
                {article.title}
              </span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        {/* Per-article affiliate disclosure (FTC required) */}
        <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-6">
          <strong>Affiliate Disclosure:</strong> This article contains affiliate links. We may earn a commission if you purchase through our links, at no extra cost to you.{" "}
          <a href="/affiliate-disclosure" className="underline hover:text-gray-700">Learn more</a>.
        </p>

        {/* Top CTA banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-700 font-medium">
            Build your app idea today — no coding required.
          </p>
          <a
            href={AFFILIATE}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors whitespace-nowrap"
          >
            Start Building Free →
          </a>
        </div>

        {/* Article body */}
        <article
          className="prose prose-gray prose-headings:font-bold prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline max-w-none"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Build Your App?</h2>
          <p className="mb-6 text-orange-100">
            Join thousands of entrepreneurs, founders, and business owners
            building custom apps with Base44 — no coding required.
          </p>
          <a
            href={AFFILIATE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors"
          >
            Start Building with Base44 →
          </a>
          <p className="text-xs text-orange-200 mt-3">Free plan available. No credit card required.</p>
        </div>

        {/* Related Articles — drives crawl budget */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Base44 Guides</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <a
                  key={r.slug}
                  href={`/articles/${r.slug}`}
                  className="block p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all group"
                >
                  <p className="font-medium text-sm text-gray-900 group-hover:text-orange-600 leading-snug">
                    {r.title}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 underline">
            ← Browse all Base44 guides
          </a>
        </div>
      </div>
    </>
  );
}
