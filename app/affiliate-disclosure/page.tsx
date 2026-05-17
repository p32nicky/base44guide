import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "Full affiliate disclosure for Base44 Guide.",
};

export default function AffiliateDisclosure() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Affiliate Disclosure</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: May 2026</p>

      <div className="prose prose-gray max-w-none">
        <p className="text-lg font-medium">Base44 Guide is a participant in affiliate marketing programs and earns commissions from qualifying purchases.</p>

        <h2>What This Means</h2>
        <p>When you click links on this site and make a purchase or sign up for a service, we may receive a commission. This comes at <strong>no extra cost to you</strong> — in many cases the price is identical to going directly to the site.</p>

        <h2>Our Affiliate Relationships</h2>
        <ul>
          <li><strong>Base44:</strong> We are an affiliate of Base44 through the Impact affiliate network. We earn a commission when visitors purchase a paid Base44 plan through our links.</li>
        </ul>

        <h2>Our Editorial Independence</h2>
        <p>Affiliate relationships do not influence our editorial content. We only recommend products we believe provide genuine value. Our reviews aim to be honest and balanced, including both pros and cons.</p>

        <h2>FTC Compliance</h2>
        <p>In accordance with the Federal Trade Commission's guidelines on endorsements and testimonials (16 CFR Part 255), we disclose all material connections between this site and any products or services we recommend.</p>

        <h2>Questions?</h2>
        <p>If you have questions about our affiliate relationships, contact us at nickdavies100@gmail.com.</p>
      </div>
    </div>
  );
}
