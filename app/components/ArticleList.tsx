"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/articles";
import { CATEGORIES } from "@/lib/categories";

const PAGE_SIZE = 100;

const ALL_CATS = [{ slug: "all", label: "All", icon: "📚", match: () => true }, ...CATEGORIES];

export default function ArticleList({ articles }: { articles: ArticleSummary[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: articles.length };
    for (const cat of CATEGORIES) {
      map[cat.slug] = articles.filter((a) => cat.match(a.title)).length;
    }
    return map;
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return articles.filter((a) => {
      const catMatch = activeCategory === "all" || CATEGORIES.find((c) => c.slug === activeCategory)?.match(a.title);
      const searchMatch = !q || a.title.toLowerCase().includes(q) || a.metaDescription.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [articles, query, activeCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeCategory(slug: string) {
    setActiveCategory(slug);
    setPage(1);
  }

  function changeQuery(q: string) {
    setQuery(q);
    setPage(1);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Base44 Articles &amp; Guides</h2>

      {/* Category links — also link to indexable category pages */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_CATS.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => changeCategory(cat.slug)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === cat.slug
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className={`text-xs ${activeCategory === cat.slug ? "text-orange-100" : "text-gray-400"}`}>
              {counts[cat.slug] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Category page links for SEO */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/category/${cat.slug}`}
            className="text-xs text-orange-500 hover:underline">
            Browse all {cat.label} →
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        {query && (
          <button onClick={() => changeQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} articles
        {query && <> matching &ldquo;<strong>{query}</strong>&rdquo;</>}
      </p>

      {/* Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No articles found</p>
          <button onClick={() => { changeQuery(""); changeCategory("all"); }}
            className="mt-3 text-orange-500 hover:underline text-sm">Clear filters</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`}
              className="block p-5 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all group">
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 leading-snug mb-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">{article.metaDescription}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-orange-300 transition-colors">
            ← Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-orange-300 transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
