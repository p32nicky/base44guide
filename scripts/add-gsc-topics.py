"""
Adds 200 new GSC-informed topics to topics.json.
Based on Search Console data showing impressions for:
- Wix/Base44 acquisition (hot)
- base44 customer service
- base44 review/reddit
- base44 ai queries
- International audiences (DE, UK, CA, NL, BR, ES)
"""
import json
from pathlib import Path

TOPICS_FILE = Path(r"C:\base44site\scripts\topics.json")
existing = json.loads(TOPICS_FILE.read_text(encoding="utf-8"))
existing_set = set(existing)

new_topics = [
    # ── Wix acquisition angles (GSC: high impressions) ──────────────────
    "What the Wix Base44 Acquisition Means for No-Code in 2025",
    "Wix Buys Base44: Full Official Announcement Breakdown",
    "Base44 Wix Acquisition: Will Pricing Change?",
    "Base44 After the Wix Deal: Should You Still Use It?",
    "Wix and Base44: How the Acquisition Affects Your Apps",
    "Base44 Wix Acquisition: Timeline and What Happened",
    "Is Base44 Still Independent After the Wix Acquisition?",
    "Base44 vs Wix: How They're Different Now That Wix Owns It",
    "Wix Base44 Acquisition: Good or Bad for Developers?",
    "Base44 Roadmap Post-Wix: New Features Coming",
    "Will Wix Shut Down Base44? Honest Analysis",
    "Base44 and Wix: The Combined Platform Explained",
    "Wix Acquires Base44: What No-Code Users Need to Know",
    "Base44 Acquisition Price: What Wix Paid Explained",
    "Why Wix Acquired Base44: The Strategic Reasoning",

    # ── Customer service / support (GSC: "base44 customer service") ──────
    "Base44 Customer Service: How to Get Help Fast",
    "Base44 Support Options: Chat, Email, and Docs Explained",
    "How to Contact Base44 Support",
    "Base44 Help Center: Everything You Need to Find Answers",
    "Base44 Customer Service Review: Is Support Any Good?",
    "Base44 Live Chat Support: Is It Available?",
    "Base44 Response Time: How Fast Does Support Reply?",
    "Base44 Community Forum: Get Answers from Other Users",
    "Base44 Documentation: Where to Find Guides and Tutorials",
    "Base44 Onboarding Support: How Base44 Helps You Start",

    # ── Reddit / review queries (GSC: "base44 reddit review", "what is base44 reddit") ──
    "Base44 on Reddit: What the Community Really Thinks",
    "Base44 Reddit Review: Pros and Cons from Real Users",
    "What Is Base44? Reddit Users Explain It Best",
    "Base44 Reddit AMA: Highlights from Developer Discussions",
    "Base44 Honest Review: No Hype, Just Facts",
    "Base44 Review 2025: Is It Worth It?",
    "Base44 One-Year Review: What Changed",
    "Base44 Review from a Non-Technical Founder",
    "Base44 Review: What I Wish I Knew Before Starting",
    "Base44 Review After 6 Months of Daily Use",
    "Base44 Real User Reviews: Aggregated from Across the Web",
    "Base44 Trustpilot and G2 Reviews: What Scores Does It Get?",
    "Base44 Negative Reviews: Common Complaints Addressed",
    "Base44 Success Stories: Real Reviews from Real Builders",
    "Is Base44 Overhyped? An Honest Look",

    # ── "base44 ai" query cluster ─────────────────────────────────────────
    "Base44 AI: How the Artificial Intelligence Actually Works",
    "Base44 AI Engine: What Model Powers It?",
    "Base44 AI vs ChatGPT: Different Tools, Different Jobs",
    "How Base44 AI Understands Your App Description",
    "Base44 AI Accuracy: How Good Is the Code It Generates?",
    "Base44 AI Limitations: What It Cannot Do",
    "Base44 AI App Builder: Step-by-Step First Use Guide",
    "Base44 AI vs Human Developer: A Real Comparison",
    "How to Write Better Prompts for Base44 AI",
    "Base44 AI Updates: How the Model Keeps Improving",
    "Base44 AI for Business: Practical Use Cases",
    "The Technology Behind Base44 AI Explained Simply",
    "Base44 AI Security: Is AI-Generated Code Safe?",
    "How Base44 AI Reduces Development Time by 90 Percent",
    "Base44 AI vs Cursor: Which AI Coding Tool Wins?",

    # ── International audiences ────────────────────────────────────────────
    # Germany (7 impressions)
    "Base44 for German Businesses: A Complete Guide",
    "Base44 auf Deutsch: Features and Support for German Users",
    "Best No-Code App Builder for German Startups",
    "Base44 GDPR Compliance: What German Users Need to Know",
    "Base44 for Berlin Tech Companies: Build Apps Fast",

    # UK (6 impressions)
    "Base44 for UK Businesses: Everything You Need to Know",
    "Base44 UK Review: Is It Worth It for British Companies?",
    "Best No-Code Platform for UK Startups",
    "Base44 for London Entrepreneurs: Build Your App Today",
    "Base44 UK Pricing: What British Users Pay",

    # Canada (8 impressions — highest non-US)
    "Base44 for Canadian Businesses: Full Guide",
    "Base44 Canada Review: Is It Good for Canadian Startups?",
    "Best No-Code App Builder for Canadian Entrepreneurs",
    "Base44 for Toronto and Vancouver Startups",
    "Base44 Canada Pricing and Support",

    # Netherlands (5 impressions)
    "Base44 for Dutch Businesses: No-Code App Building",
    "Base44 Netherlands: Best No-Code Platform for Holland",
    "Base44 for Amsterdam Startups: Build Apps Without Code",

    # Brazil (4 impressions)
    "Base44 for Brazilian Businesses: Build Apps Without Coding",
    "Base44 Brasil: Como Usar o App Builder de IA",
    "Best No-Code App Builder for Brazilian Startups",

    # Spain (4 impressions)
    "Base44 for Spanish Businesses: A Practical Guide",
    "Base44 España: Crear Apps sin Programar",
    "Best No-Code Platform for Spain Entrepreneurs",

    # ── "what is base44" educational cluster ─────────────────────────────
    "What Is Base44? Complete Beginner's Guide",
    "Base44 Explained: What It Does and Who It's For",
    "Base44 vs Traditional App Development: The Key Differences",
    "How Base44 Works: Inside the No-Code AI Platform",
    "Base44 Origins: How It Was Founded and Why",
    "Base44 Use Cases: 20 Real Things People Build",
    "Base44 in Plain English: No Jargon Explanation",
    "What Kind of Apps Can You Build with Base44?",
    "Base44 for Beginners: Your First 30 Minutes",
    "Is Base44 a Website Builder or App Builder? (It's Both)",

    # ── User authentication (top page: 26 impressions) ────────────────────
    "Base44 Login System: How User Authentication Works",
    "How to Set Up Google Login in Your Base44 App",
    "Base44 Magic Link Authentication: Setup Guide",
    "Base44 Multi-Factor Authentication: Adding Extra Security",
    "How to Manage Users in Your Base44 App",
    "Base44 Password Reset Flow: Setting It Up",
    "Base44 Social Login: Facebook and Google Auth Guide",
    "Base44 JWT Tokens: Understanding Auth Behind the Scenes",
    "Base44 Auth for SaaS Apps: Multi-Tenant User Management",
    "How to Restrict Pages by User Role in Base44",

    # ── Retail/inventory (11 impressions) ─────────────────────────────────
    "Base44 Inventory Management: Full Feature Breakdown",
    "Build a POS System with Base44: Step-by-Step",
    "Base44 for Retail Stores: Replace Your Spreadsheets",
    "How to Track Stock Levels with a Base44 App",
    "Base44 for Ecommerce Inventory: What You Can Build",
    "Build a Barcode Scanning App with Base44",
    "Base44 Retail Dashboard: Sales, Stock, and Revenue",
    "How to Build a Purchase Order System with Base44",
    "Base44 for Multi-Location Retail: Manage All Stores",
    "Build a Supplier Management App for Retail with Base44",

    # ── "is base44 good" cluster (15 impressions) ─────────────────────────
    "Is Base44 Good for Building Real Apps? Tested",
    "Is Base44 Good for Small Businesses? Honest Answer",
    "Is Base44 Good for Freelancers? What You Need to Know",
    "Is Base44 Good for Startups? Pros and Cons",
    "Is Base44 Good for Enterprise Use? Deep Dive",
    "Is Base44 Good Enough to Replace Custom Development?",
    "Is Base44 Good for Non-Technical People? Verdict",
    "Is Base44 Good for Complex Apps? Real Limits Tested",
    "Is Base44 Good for Internal Tools? Business Guide",
    "Is Base44 Good Value for Money? ROI Analysis",

    # ── Website builder angle (9 impressions) ─────────────────────────────
    "Base44 Website Builder vs Wix: Which Should You Use?",
    "Can Base44 Build a Full Website? Complete Answer",
    "Base44 Landing Page Builder: How It Works",
    "Base44 vs Webflow for Websites: Detailed Comparison",
    "Base44 Website Features: What You Can Build",
    "How to Build a Marketing Website with Base44",
    "Base44 vs Squarespace: Web App vs Website Builder",
    "Base44 Portfolio Website: Build One in Minutes",
    "Base44 for Agencies: Build Client Websites and Apps",
    "Base44 Website SEO: How to Optimize Your App for Search",

    # ── CRM angle (7 impressions) ──────────────────────────────────────────
    "Base44 CRM: Build a Custom Sales Pipeline",
    "Base44 vs HubSpot CRM: Which Should You Use?",
    "Build a Free CRM with Base44 in One Hour",
    "Base44 CRM Features: Contacts, Deals, and Pipelines",
    "How to Import Your CRM Data into Base44",
    "Base44 CRM for Real Estate Agents: Full Guide",
    "Base44 CRM for Coaches and Consultants",
    "Base44 CRM Automation: Follow-Ups on Autopilot",
    "Base44 vs Salesforce for Small Business CRM",
    "Base44 CRM Case Study: How One Business Saved 10 Hours/Week",

    # ── Data visualization (5 impressions) ────────────────────────────────
    "Base44 Charts and Graphs: What You Can Build",
    "How to Build a KPI Dashboard with Base44",
    "Base44 Data Visualization: Bar, Line, and Pie Charts",
    "Base44 Analytics Dashboard: Track Business Metrics",
    "How to Connect Google Sheets to a Base44 Dashboard",
    "Base44 Real-Time Dashboard: Live Data Updates",
    "Build a Sales Analytics App with Base44",
    "Base44 for Data Teams: No-Code BI Dashboards",
    "Base44 Dashboard Templates: Get Started Fast",
    "How to Share Base44 Dashboards with Your Team",

    # ── Help desk (5 impressions) ──────────────────────────────────────────
    "Base44 Help Desk App: What You Can Build",
    "Build a Customer Support System with Base44",
    "Base44 vs Zendesk: Build Your Own Help Desk",
    "How to Build a Ticket Routing System in Base44",
    "Base44 Help Desk for Small Teams: Setup Guide",

    # ── "save $50k" / cost angles ──────────────────────────────────────────
    "How Much Does It Cost to Build an App Without Base44?",
    "Base44 vs Hiring a Developer: Full Cost Breakdown 2025",
    "How Businesses Cut $100k in Dev Costs with Base44",
    "Base44 ROI Calculator: How Much Will You Save?",
    "The True Cost of Custom App Development vs Base44",

    # ── Unique angles not yet covered ────────────────────────────────────
    "Base44 for Churches and Religious Organizations",
    "Base44 for Schools and K-12 Education",
    "Base44 for University Departments and Admins",
    "Base44 for Government and Public Sector",
    "Base44 for NGOs and Charities",
    "Base44 for Law Firms: Case Management Apps",
    "Base44 for Dental Practices: Patient Management",
    "Base44 for Gyms and Fitness Studios",
    "Base44 for Car Dealerships: Inventory and Sales Apps",
    "Base44 for Staffing Agencies: Candidate Tracking Apps",
    "How to Build a Referral Program App with Base44",
    "Base44 for Subscription Box Businesses",
    "How to Build a Membership Management App with Base44",
    "Base44 for Home Service Businesses: Scheduling and Billing",
    "Base44 for IT Departments: Internal Tool Builder",
    "How to Replace Microsoft Access with Base44",
    "Base44 for Remote Teams: Collaboration Apps That Work",
    "Base44 Multi-Language Apps: Build for Global Users",
    "How to Build a Dark Mode App with Base44",
    "Base44 Accessibility Features: Building Inclusive Apps",
]

added = 0
for t in new_topics:
    if t not in existing_set:
        existing.append(t)
        existing_set.add(t)
        added += 1

TOPICS_FILE.write_text(json.dumps(existing, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Added {added} new topics. Total: {len(existing)}")
