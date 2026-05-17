import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Base44 Guide — how we collect and use data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: May 2026</p>

      <div className="prose prose-gray max-w-none">
        <h2>Who We Are</h2>
        <p>Base44 Guide ("we", "us", "our") operates https://base44site.vercel.app. We publish reviews, guides, and tutorials about Base44 and related software products.</p>

        <h2>Affiliate Disclosure</h2>
        <p>This website participates in affiliate marketing programs. We earn commissions when you purchase products through our links, at no additional cost to you. We are an affiliate of Base44 and may receive compensation when you sign up or purchase through our links.</p>

        <h2>Information We Collect</h2>
        <p>We do not directly collect personal information from visitors. However, third-party services we use may collect data:</p>
        <ul>
          <li><strong>Google Analytics (G-HT83FTC210):</strong> Collects anonymized usage data including pages visited, time on site, browser type, and approximate location. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.</li>
          <li><strong>Affiliate tracking:</strong> When you click affiliate links, our affiliate partners (Base44/Impact) may set cookies to track referrals for up to 30 days.</li>
        </ul>

        <h2>Cookies</h2>
        <p>This site uses cookies from Google Analytics and affiliate tracking partners. These cookies help us understand traffic and ensure affiliate commissions are properly attributed. You can disable cookies in your browser settings.</p>

        <h2>How We Use Information</h2>
        <p>Analytics data is used solely to understand which content is helpful to visitors and improve the site. We do not sell data to third parties.</p>

        <h2>Third-Party Links</h2>
        <p>Our site contains links to third-party websites including Base44. We are not responsible for the privacy practices of these sites. We encourage you to review their privacy policies.</p>

        <h2>Children's Privacy</h2>
        <p>This site is not directed at children under 13. We do not knowingly collect information from children.</p>

        <h2>Your Rights</h2>
        <p>You may opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</p>

        <h2>Contact</h2>
        <p>Questions about this policy? Email: nickdavies100@gmail.com</p>
      </div>
    </div>
  );
}
