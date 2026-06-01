import { getArticleSummaries } from "@/lib/articles";
import { CATEGORIES } from "@/lib/categories";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const AFFILIATE = "https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base";

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ name: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const cat = CATEGORIES.find((c) => c.slug === name);
  if (!cat) return {};
  return {
    title: `Base44 ${cat.label} — Complete Guide Collection`,
    description: `Browse all Base44 ${cat.label.toLowerCase()} articles. ${cat.icon} Comprehensive guides, tutorials, and reviews about Base44 no-code app builder.`,
    alternates: { canonical: `https://www.base44guide.io/category/${name}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const cat = CATEGORIES.find((c) => c.slug === name);
  if (!cat) notFound();

  const all = getArticleSummaries();
  const articles = all.filter((a) => cat.match(a.title));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <span>›</span>
        <span className="text-gray-400">{cat.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {cat.icon} Base44 {cat.label}
        </h1>
        <p className="text-gray-600">
          {articles.length} guides covering Base44 {cat.label.toLowerCase()} — from beginner to advanced.
        </p>
      </div>

      {/* CTA */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-700 font-medium">Build your app idea today — no coding required.</p>
        <a href={AFFILIATE} target="_blank" rel="noopener noreferrer"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors whitespace-nowrap">
          Start Building Free →
        </a>
      </div>

      {/* Other categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.filter((c) => c.slug !== name).map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors">
            {c.icon} {c.label}
          </Link>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link key={a.slug} href={`/articles/${a.slug}`}
            className="block p-5 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all group">
            <h2 className="font-semibold text-gray-900 group-hover:text-orange-600 leading-snug mb-2 text-sm">
              {a.title}
            </h2>
            <p className="text-xs text-gray-500 line-clamp-2">{a.metaDescription}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 underline">
          ← Browse all Base44 guides
        </Link>
      </div>
    </div>
  );
}
