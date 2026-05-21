import { getArticleSummaries } from "@/lib/articles";
import type { Metadata } from "next";
import ArticleList from "@/app/components/ArticleList";

export const metadata: Metadata = {
  title: "Base44 Reviews & Guides — Build Apps Without Code",
  description:
    "500+ in-depth articles, reviews, and tutorials about Base44 — the AI no-code platform anyone can use to build full-stack web apps.",
};

const AFFILIATE = "https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Base44 Guide",
  url: "https://base44guide.com",
  description:
    "Comprehensive guides, reviews, and tutorials for Base44 — the AI-powered no-code platform.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://base44guide.com/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base44 Guide",
  url: "https://base44guide.com",
  logo: "https://base44guide.com/logo.png",
};

export default function HomePage() {
  const articles = getArticleSummaries();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          The Complete Base44 Resource Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Everything you need to know about Base44 — the AI-powered platform
          that lets anyone build full-stack web apps without writing a single
          line of code.
        </p>
        <a
          href={AFFILIATE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full text-lg transition-colors"
        >
          Start Building with Base44 →
        </a>
      </div>

      {/* What is Base44 callout */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 mb-12 text-center">
        <h2 className="text-2xl font-bold mb-3">What Is Base44?</h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-4">
          Base44 is an AI-powered no-code platform that builds complete web
          applications from plain-language descriptions. Describe your idea,
          and the AI creates a fully functional, hosted app — no coding, no
          servers, no deployment headaches.
        </p>
        <a
          href={AFFILIATE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 font-semibold hover:underline"
        >
          Try Base44 Free →
        </a>
      </div>

      {/* Article list with search + categories */}
      <ArticleList articles={articles} />
    </div>
    </>
  );
}
