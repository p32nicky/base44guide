import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const SITE_URL = "https://base44guide.com";
const GA_ID = "G-HT83FTC210";

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
  verification: { google: "rExqKrlIUHf3C8lAuDKtsLeQVUqIIZ_IaHXKvClNwrQ" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
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
        <main>{children}</main>
        <footer className="border-t border-gray-100 mt-16 py-8 text-center text-sm text-gray-500">
          <p>
            Base44 Guide is an independent review site. We may earn a commission when you use our links.{" "}
            <a href="/" className="underline hover:text-gray-700">
              All Articles
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
