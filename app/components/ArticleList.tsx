"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/articles";

const CATEGORIES: { label: string; icon: string; match: (t: string) => boolean }[] = [
  { label: "All",              icon: "📚", match: () => true },
  { label: "Reviews",          icon: "⭐", match: (t) => /\b(review|reddit|honest|verdict|vs\b|comparison|alternative|pros.cons|worth it|overhyped|trustpilot|g2)\b/i.test(t) },
  { label: "Wix Acquisition",  icon: "🤝", match: (t) => /\b(wix|acquisition)\b/i.test(t) },
  { label: "How-To Guides",    icon: "🔧", match: (t) => /^(how to|step-by-step|build |create |set up|launch |deploy |configure |automate |integrate )/i.test(t) },
  { label: "Industry Guides",  icon: "🏭", match: (t) => /\bfor (accounting|aerospace|agricult|architect|auto|aviation|banking|biotech|cannabis|chemical|construct|consult|consumer|crypto|cyber|defense|e-learning|elearning|energy|engineer|entertainment|environ|fashion|film|fintech|food|gaming|government|hospital|hr|insurance|legal|logistics|manufactur|media|mining|music|nonprofit|oil|pharma|photo|proptech|publish|real estate|recruit|retail|shipping|saas|sports|supply chain|telecom|transport|travel|wellness|wholesale)\b/i.test(t) },
  { label: "Professions",      icon: "👔", match: (t) => /\bfor (accountants|acupuncturist|actors|architects|artists|attorneys|bakers|barbers|bookkeeper|coaches|contractors|copywriter|dentists|designers|dog walker|electrician|event|financial|fitness|florist|freelan|graphic|hair|handyman|home inspector|hr manager|hvac|immigration|insurance|interior|it consult|jeweler|journalist|landscape|language tutor|life coach|locksmith|makeup|massage|mechanic|mediator|mental health|midwife|mortgage|music teacher|nail tech|notary|nutritionist|occupational|optometrist|orthodontist|painter|paralegal|personal chef|personal shopper|pet groom|physical|pilates|plumber|pr special|private invest|private tutor|property manager|psychologist|public speaker|real estate|recruiter|roofer|seo special|social worker|software engineer|speech|startup|stylist|surveyor|tax|therapist|title compan|tour guide|travel agent|ux designer|veterinarian|video editor|virtual assistant|web designer|wedding|yoga)\b/i.test(t) },
  { label: "Pricing & ROI",    icon: "💰", match: (t) => /\b(pric|cost|roi|save|saving|worth|budget|cheap|free plan|subscription|revenue|monetiz|income|earn|charge|pay)\b/i.test(t) },
  { label: "Features",         icon: "⚙️", match: (t) => /\b(authentication|database|api|webhook|permission|notification|search|report|dashboard|workflow|automation|file upload|email|sms|real-time|mobile|export|backup|audit|chart|visualization|pdf|payment|stripe|login|role)\b/i.test(t) },
  { label: "Getting Started",  icon: "🚀", match: (t) => /\b(beginner|tutorial|getting started|first app|quick start|complete guide|masterclass|introduction|overview|explained|plain english|what is)\b/i.test(t) },
  { label: "Comparisons",      icon: "⚖️", match: (t) => /\bvs\b|\bversus\b|alternative|switching from|replace /i.test(t) },
];

function categorize(title: string): string {
  for (const cat of CATEGORIES.slice(1)) {
    if (cat.match(title)) return cat.label;
  }
  return "All";
}

export default function ArticleList({ articles }: { articles: ArticleSummary[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Count per category
  const counts = useMemo(() => {
    const map: Record<string, number> = { All: articles.length };
    for (const cat of CATEGORIES.slice(1)) {
      map[cat.label] = articles.filter((a) => cat.match(a.title)).length;
    }
    return map;
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return articles.filter((a) => {
      const catMatch =
        activeCategory === "All" ||
        CATEGORIES.find((c) => c.label === activeCategory)?.match(a.title);
      const searchMatch =
        !q || a.title.toLowerCase().includes(q) || a.metaDescription.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [articles, query, activeCategory]);

  return (
    <div>
      {/* Heading */}
      <h2 className="text-2xl font-bold mb-4">
        Base44 Articles &amp; Guides
      </h2>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.label)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === cat.label
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className={`text-xs ${activeCategory === cat.label ? "text-orange-100" : "text-gray-400"}`}>
              {counts[cat.label] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results count */}
      {(query || activeCategory !== "All") && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {filtered.length} of {articles.length} articles
          {query && <> matching &ldquo;<strong>{query}</strong>&rdquo;</>}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No articles found</p>
          <button onClick={() => { setQuery(""); setActiveCategory("All"); }} className="mt-3 text-orange-500 hover:underline text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block p-5 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 leading-snug mb-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {article.metaDescription}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
