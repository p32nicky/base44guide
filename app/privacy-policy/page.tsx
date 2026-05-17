import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Base44 Guide.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
      <h1>Privacy Policy</h1>
      <p>Last updated: May 2026</p>
      <h2>Information We Collect</h2>
      <p>We use Google Analytics to collect anonymous usage data. No personally identifiable information is collected unless you contact us directly.</p>
      <h2>Cookies</h2>
      <p>Google Analytics uses cookies to track site usage. You can disable cookies in your browser settings.</p>
      <h2>Third-Party Links</h2>
      <p>This site contains affiliate links. We are not responsible for third-party privacy practices.</p>
      <h2>Contact</h2>
      <p>Email <a href="mailto:nickdavies100@gmail.com">nickdavies100@gmail.com</a>.</p>
    </div>
  );
}
