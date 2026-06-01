"""
50 laser-targeted articles based on May 2026 GSC data.
Targeting high-impression/no-click queries and new competitor gaps.
"""
import json
from pathlib import Path

TOPICS_FILE = Path(r"C:\base44site\scripts\topics.json")
existing = json.loads(TOPICS_FILE.read_text(encoding="utf-8"))
existing_set = set(existing)

new_topics = [
    # ── "base44 roadmap" — 8 impressions, no dedicated page ──────────────
    "Base44 Roadmap 2025: Upcoming Features and What's Coming",
    "Base44 Product Roadmap After Wix Acquisition: What to Expect",
    "Base44 Future Features: What the Roadmap Tells Us",

    # ── "base44 vs kiro" — new competitor, pos 63 ────────────────────────
    "Base44 vs Kiro: Which AI App Builder Is Better?",
    "Kiro vs Base44: Full Comparison for No-Code Builders",

    # ── Wix acquisition — 590 impressions, 0.34% CTR (title weak) ────────
    "Why Did Wix Acquire Base44? The Real Strategy Explained",
    "Does Wix Own Base44? What the Acquisition Actually Means",
    "Is Base44 Still Independent After Wix Bought It?",
    "Wix Base44 Acquisition Official: Everything Confirmed So Far",
    "Wix Acquires Base44 AI App Builder: Full Breakdown",
    "Base44 Wix Acquisition Press Release: What Was Announced",
    "Will Wix Ruin Base44? Honest Post-Acquisition Analysis",
    "Base44 Bought by Wix: Good or Bad for Users?",

    # ── "is base44 legit" / "does base44 work" cluster ───────────────────
    "Is Base44 Legit? Full Investigation and Verdict",
    "Does Base44 Actually Work? We Tested It",
    "Is Base44 Safe? Security and Data Privacy Explained",
    "Is Base44 Worth It? Honest Cost vs Value Analysis",
    "Is Base44 Bad? Common Complaints and the Truth",
    "Does Base44 Work for Real Businesses? 10 Examples",
    "Base44 Pros and Cons: The Unfiltered Truth",

    # ── "base44 whitelabel" ───────────────────────────────────────────────
    "Base44 White Label: Can You Sell Apps Under Your Own Brand?",
    "Base44 White Labeling Guide: Rebranding Apps for Clients",

    # ── "base44 gmail integration" / "google analytics integration" ───────
    "Base44 Gmail Integration: How to Connect Google Mail to Your App",
    "Base44 Google Analytics Integration: Track Your App Users",
    "Base44 Google Integrations: Sheets, Gmail, Analytics and More",

    # ── "what llm does base44 use" ────────────────────────────────────────
    "What LLM Does Base44 Use? The AI Model Behind the Platform",
    "Base44 AI Model Explained: What Powers the App Builder",

    # ── "base44 security" ─────────────────────────────────────────────────
    "Base44 Security: How Your Data and Apps Are Protected",
    "Is Base44 GDPR Compliant? Data Privacy Deep Dive",
    "Base44 Security Review: Encryption, Auth, and Compliance",

    # ── "base44 crm" — 13 impressions combined ────────────────────────────
    "Base44 CRM Review: Is It Good Enough to Replace HubSpot?",
    "Base44 CRM Tutorial: Build a Full Sales Pipeline in 1 Hour",
    "Base44 CRM vs Salesforce: Which Wins for Small Business?",

    # ── "base44 ticket / support ticket" — 15 impressions ────────────────
    "Base44 Support Ticket System: Build One in Minutes",
    "Base44 Ticketing App: Full Build Guide with Screenshots",

    # ── "base44 to pdf" / "base44 pdf" ───────────────────────────────────
    "Base44 to PDF: How to Export Data as PDF Reports",
    "Base44 PDF Generation: Everything You Can Create",

    # ── "base44 dashboard" — 5 impressions ───────────────────────────────
    "Base44 Dashboard Guide: Build Any Dashboard Without Code",
    "Base44 Custom Dashboard Tutorial: KPIs, Charts, and Live Data",

    # ── "base44 custom login page" ────────────────────────────────────────
    "Base44 Custom Login Page: How to Brand Your Auth Screen",

    # ── "base44 templates" ────────────────────────────────────────────────
    "Base44 Templates: Every Starter Template Explained",
    "Best Base44 Templates to Get Started Fast",

    # ── Australia — 93 impressions, 0 clicks ─────────────────────────────
    "Base44 for Australian Businesses: Complete Guide",
    "Best No-Code App Builder for Australian Startups",
    "Base44 Australia: Pricing, Support, and Features for Aussies",

    # ── Japan — 93 impressions, 0 clicks ─────────────────────────────────
    "Base44 for Japanese Businesses: No-Code App Building",
    "Best No-Code Platform for Japan Startups",

    # ── Improve fleet management (top CTR page — expand cluster) ─────────
    "Base44 Fleet Management App: Full Feature Walkthrough",
    "How to Build a Vehicle Tracking App with Base44",
    "Base44 for Logistics Companies: Fleet, Routes, and Delivery Apps",

    # ── Attorneys niche (16.7% CTR — expand cluster) ─────────────────────
    "Base44 for Law Firms: Build Case Management Apps",
    "Base44 Legal Apps: What Attorneys Are Building",
    "Best Base44 Apps for Immigration Lawyers",
    "How Attorneys Use Base44 to Win More Clients",
]

added = 0
for t in new_topics:
    if t not in existing_set:
        existing.append(t)
        existing_set.add(t)
        added += 1

TOPICS_FILE.write_text(json.dumps(existing, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Added {added} new topics. Total: {len(existing)}")
