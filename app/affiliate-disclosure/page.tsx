import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "Affiliate disclosure for Base44 Guide.",
};

export default function AffiliateDisclosure() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
      <h1>Affiliate Disclosure</h1>
      <p>Base44 Guide participates in affiliate advertising programs. When you click links and sign up or purchase, we may earn a commission at <strong>no extra cost to you</strong>.</p>
      <h2>How It Works</h2>
      <p>Affiliate links pay us a small referral fee when you complete a signup or purchase. This keeps the site free and funds our content.</p>
      <h2>Our Promise</h2>
      <p>Affiliate relationships never influence our reviews. We only recommend tools we believe provide genuine value.</p>
      <h2>Contact</h2>
      <p>Questions? Email <a href="mailto:nickdavies100@gmail.com">nickdavies100@gmail.com</a>.</p>
    </div>
  );
}
