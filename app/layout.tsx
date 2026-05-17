import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const SITE_URL = "https://base44guide.io";
const GA_IDS = ["G-HT83FTC210", "G-JH93VZ244D"];

export const metadata: Metadata = {
  title: {
    default: "Base44 Reviews & Guides — Build Apps Without Code",
    template: "%s | Base44 Guide",
  },
  description:
    "Comprehensive guides, reviews, and tutorials for Base44 — the AI-powered no-code platform that lets anyone build full-stack web apps without coding.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: "Base44 Guide",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@base44guide",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: { google: "5BA3Ya5GEzK1z-jPqVUSsUD0U4-SPc1gNMGul0waLeI" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_IDS[0]}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${GA_IDS.map(id => `gtag('config','${id}');`).join("")}`}
        </Script>
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-lg text-orange-500 hover:text-orange-600">
              Base44 Guide
            </a>
            <a
              href="https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-full transition-colors"
            >
              Try Base44 Free →
            </a>
          </div>
        </header>
        <div className="bg-amber-50 border-b border-amber-200 text-center text-xs text-amber-800 py-2 px-4">
          <strong>Affiliate Disclosure:</strong> Base44 Guide is reader-supported. We may earn a commission when you purchase through our links, at no extra cost to you.
        </div>
        <main>{children}</main>
        <footer className="border-t border-gray-100 mt-16 py-8 text-center text-sm text-gray-500">
          <p>
            Base44 Guide is an independent review site. We may earn a commission when you use our links.
          </p>
          <p className="mt-2 flex items-center justify-center gap-4">
            <a href="/" className="underline hover:text-gray-700">All Articles</a>
            <a href="/affiliate-disclosure" className="underline hover:text-gray-700">Affiliate Disclosure</a>
            <a href="/privacy-policy" className="underline hover:text-gray-700">Privacy Policy</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
