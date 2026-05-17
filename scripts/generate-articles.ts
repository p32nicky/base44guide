/**
 * Generates 500 unique SEO articles about Base44.
 * Uses Groq first, falls back to Cerebras when Groq hits daily limit.
 * Run: GROQ_API_KEY=xxx CEREBRAS_API_KEY=xxx npx tsx scripts/generate-articles.ts
 * Output: content/articles/*.json
 */

import Groq from "groq-sdk";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import fs from "fs";
import path from "path";

let useGroq = true; // flips to false when Groq quota exhausted

const AFFILIATE_LINK = "https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base";

const ARTICLE_TOPICS = [
  // High-value keyword research targets (low competition)
  "Base44 Reddit: What Users Are Really Saying",
  "Base44 Review Reddit: Honest Community Opinions",
  "Base44 Student Discount: How to Get It",
  "Base44 Website Builder: Full Breakdown",
  "Base44 vs Claude: Which AI Tool Should You Use?",
  "How Does Base44 Work? Plain English Explanation",
  "Base44 Examples: Real Apps Built on the Platform",
  "Base44 Mobile App: Build Apps That Work on Phone",
  "Is Base44 Good? Unbiased Verdict",
  "Base44 AI Review: What the AI Actually Does",
  "Is Base44 Worth It? Honest Cost vs Value Analysis",
  "Base44 Reviews: What Customers Are Saying",
  "Base44 Builder Plan: Which Plan Is Right for You?",
  "Is Base44 Down? How to Check Status and Fixes",

  // Core reviews & comparisons
  "Base44 Review Complete Guide for Non-Technical Founders",
  "Base44 vs Bubble: Which No-Code Platform Wins",
  "Base44 vs Webflow: Which Is Better for Building Web Apps?",
  "Base44 vs Glide: AI App Builder Showdown",
  "Base44 vs Adalo: Best No-Code Mobile App Builder?",
  "Base44 vs AppGyver: Enterprise No-Code Comparison",
  "Base44 vs Softr: Best for Internal Tools?",
  "Base44 vs Notion: Can Base44 Replace Your Wiki?",
  "Base44 vs Airtable: Database App Builder Comparison",
  "Base44 vs Retool: Best for Building Admin Panels?",
  "Base44 vs OutSystems: AI vs Low-Code Enterprise",
  "Base44 vs Mendix: No-Code Platform Review",
  "Base44 vs PowerApps: Microsoft vs AI-Native",
  "Base44 vs AppSheet: Google vs Groq-Powered AI",
  "Base44 vs Wix Studio: Post-Acquisition Review",
  "Base44 Pricing: Is It Worth the Cost",
  "Base44 Free Plan: What You Get Without Paying",
  "Base44 Alternatives: 10 Platforms Compared",
  "Base44 Pros and Cons: Honest Review",
  "Base44 Tutorial: Build Your First App in 10 Minutes",

  // Use cases - business
  "How to Build a CRM with Base44 (No Code Required)",
  "Build an Invoice Generator App with Base44",
  "Create a Project Management Tool with Base44",
  "Build a Customer Portal with Base44 in Minutes",
  "How to Build an HR Management System with Base44",
  "Build a Booking System with Base44",
  "Create an Inventory Management App Using Base44",
  "Build a Help Desk Ticketing System with Base44",
  "How to Build a Lead Tracker with Base44",
  "Build a Sales Pipeline App with Base44",
  "Create a Client Reporting Dashboard with Base44",
  "Build an Employee Directory App with Base44",
  "How to Build a Performance Review System with Base44",
  "Create a Vendor Management App with Base44",
  "Build a Budget Tracker with Base44",
  "How to Create a Contract Management System with Base44",
  "Build an Expense Reporting App with Base44",
  "Create a Payroll Management Tool with Base44",
  "Build a Fleet Management System with Base44",
  "How to Build a Maintenance Request App with Base44",

  // Use cases - startups & MVPs
  "How to Build an MVP with Base44 in 24 Hours",
  "Base44 for Startups: Launch Your Product Faster",
  "How to Validate a Business Idea Using Base44",
  "Build a SaaS Product with Base44: Step-by-Step",
  "How to Build a Marketplace App with Base44",
  "Create a Subscription App with Base44",
  "Build a Membership Site with Base44",
  "How to Launch a Waitlist App with Base44",
  "Build a Feedback Collection App with Base44",
  "Create a Community Platform with Base44",
  "Build a Directory App with Base44",
  "How to Build a Job Board with Base44",
  "Create an Event Management App with Base44",
  "Build a Booking and Scheduling App with Base44",
  "How to Create a Crowdfunding Platform with Base44",
  "Build a Donation App with Base44",
  "Create a Survey Tool with Base44",
  "Build a Quiz App with Base44",
  "How to Create a Social Network App with Base44",
  "Build a Review and Rating App with Base44",

  // Professional use cases
  "Base44 for Freelancers: Build Client Apps Fast",
  "Base44 for Consultants: Deliver Projects in Days",
  "How Agencies Can Use Base44 to Scale",
  "Base44 for Real Estate Agents: Build Property Apps",
  "Base44 for Healthcare: Build Patient Management Apps",
  "How to Build a Telemedicine App with Base44",
  "Base44 for Legal Professionals: Case Management Apps",
  "Build a Law Firm Client Portal with Base44",
  "Base44 for Accountants: Financial Tracking Apps",
  "How to Build a Tax Preparation App with Base44",
  "Base44 for Coaches: Client Management Systems",
  "Build a Course Platform with Base44",
  "Base44 for Restaurants: Table and Order Management",
  "How to Build a Food Ordering App with Base44",
  "Base44 for Retail: Inventory and POS Systems",
  "Build an E-commerce Backend with Base44",
  "Base44 for Hotels: Reservation Management Apps",
  "How to Build a Property Management System with Base44",
  "Base44 for Nonprofits: Donor Management Apps",
  "Build a Volunteer Coordination App with Base44",

  // Technical features
  "Base44 AI Features: How the AI Builds Your App",
  "Base44 Database Features: What You Need to Know",
  "Base44 Authentication System: How User Login Works",
  "Base44 API Integrations: Connect Any External Service",
  "Base44 Email Integration: Send Automated Emails",
  "How Base44 Handles Data Security and Privacy",
  "Base44 Hosting: How Your App Goes Live Instantly",
  "Base44 Custom Domains: How to Use Your Own URL",
  "Base44 Webhooks: Trigger Actions from External Events",
  "Base44 Role-Based Permissions: How to Control Access",
  "Base44 SMS Integration: Send Text Messages from Your App",
  "Base44 File Storage: Manage Documents and Images",
  "How Base44 Handles Real-Time Data Updates",
  "Base44 Search Functionality: Build Searchable Apps",
  "Base44 Reporting Features: Generate Custom Reports",
  "How to Export Data from Base44",
  "Base44 Mobile Responsiveness: Apps That Work on Any Device",
  "Base44 Workflow Automation: Automate Repetitive Tasks",
  "Base44 Notifications: Push, Email, and In-App Alerts",
  "Base44 Analytics: Track User Behavior in Your App",

  // SEO & content marketing angles
  "What Is Vibe Coding? How Base44 Uses It",
  "No-Code vs Low-Code vs Traditional Development",
  "Can AI Really Build Functional Web Apps? Base44 Tested",
  "How Base44 Is Disrupting the $250B Software Industry",
  "The Rise of AI-Native No-Code Platforms: Base44 Leads",
  "Base44 Wix Acquisition: What It Means for Users",
  "How to Save $50,000 in Development Costs with Base44",
  "From Idea to App in 10 Minutes: Base44 Real Test",
  "Is No-Code the Future of Software Development?",
  "How Non-Technical Founders Are Building Apps with Base44",
  "Base44 Success Stories: Real Apps Built by Non-Coders",
  "The Best No-Code Tools for Entrepreneurs",
  "How to Hire a Developer vs Using Base44: Cost Comparison",
  "Base44 vs Hiring a Developer: What Makes More Sense?",
  "Building Internal Tools Without IT: The Base44 Way",
  "Why Your Business Needs a Custom App (and How Base44 Helps)",
  "The No-Code Revolution: How Base44 Is Leading the Charge",
  "Citizen Development: How Employees Build Apps with Base44",
  "Digital Transformation with No-Code: A Base44 Guide",
  "How to Prototype an App Idea for Free with Base44",

  // Industry-specific
  "Base44 for Education: Build Learning Management Apps",
  "How to Build a Student Portal with Base44",
  "Base44 for Finance: Build Fintech Apps Without Coding",
  "How to Build a Personal Finance Tracker with Base44",
  "Base44 for Marketing Teams: Build Campaign Trackers",
  "Build a Content Calendar App with Base44",
  "Base44 for Operations Teams: Process Automation Apps",
  "Build a Quality Assurance Tracking App with Base44",
  "Base44 for Supply Chain: Logistics Management Apps",
  "How to Build a Shipping Tracker with Base44",
  "Base44 for Construction: Project and Site Management Apps",
  "Build a Safety Inspection App with Base44",
  "Base44 for Agriculture: Farm Management Systems",
  "How to Build a Crop Tracking App with Base44",
  "Base44 for Sports: Team and League Management Apps",
  "Build an Athlete Performance Tracker with Base44",
  "Base44 for Events: Conference Management Systems",
  "How to Build a Ticketing App with Base44",
  "Base44 for Travel: Itinerary and Booking Management",
  "Build a Travel Agency App with Base44",

  // Specific feature deep-dives
  "How to Add User Authentication to Your Base44 App",
  "Building Multi-Tenant Apps with Base44",
  "How to Create Custom Dashboards in Base44",
  "Building Data Visualization Apps with Base44",
  "How to Implement Search and Filters in Base44",
  "Building CRUD Apps with Base44 Step-by-Step",
  "How to Set Up Email Automation in Base44",
  "Building Approval Workflows with Base44",
  "How to Create PDF Reports with Base44",
  "Building a Kanban Board with Base44",
  "How to Build a Calendar Feature in Base44",
  "Creating Recurring Tasks with Base44 Automation",
  "How to Build a Notification System with Base44",
  "Building Multi-Step Forms with Base44",
  "How to Implement File Uploads in Base44 Apps",
  "Building a Chat Feature into Your Base44 App",
  "How to Add Maps and Location Features in Base44",
  "Building Social Login (Google, Facebook) with Base44",
  "How to Build a Payment Integration with Base44",
  "Creating Stripe Integration in a Base44 App",

  // Guides & tutorials
  "Base44 Getting Started Guide: Everything You Need to Know",
  "Base44 Best Practices: Tips from Power Users",
  "10 Things to Build First with Base44",
  "Base44 Tips and Tricks: Get More from the Platform",
  "Common Base44 Mistakes and How to Avoid Them",
  "How to Describe Your App Idea to Base44 AI",
  "Base44 Prompt Engineering: Get Better App Results",
  "How to Iterate and Improve Your Base44 App",
  "Base44 for Beginners: Complete No-Code Guide",
  "Advanced Base44 Techniques for Power Users",
  "How to Migrate Your Spreadsheet to a Base44 App",
  "Replacing Google Sheets with a Base44 App",
  "How to Move from Airtable to Base44",
  "Converting a Notion Database to a Base44 App",
  "How to Launch Your First Base44 App",

  // Benefits & ROI
  "Base44 ROI: How Much Money Can You Save?",
  "Time Savings with Base44: Hours Saved Per Week",
  "How Base44 Reduces Software Development Risk",
  "Base44 for Non-Technical CEOs: Why It Matters",
  "The Business Case for Using Base44",
  "How to Calculate ROI from a Base44 App",
  "Base44 vs Traditional Development: True Cost Comparison",
  "How Small Businesses Compete with Base44",
  "Base44 as a Competitive Advantage for Your Business",
  "Why Investors Love Companies That Use Base44",
  "How Base44 Reduces Time to Market",
  "Base44 and Business Agility: Adapt Faster",
  "Building Digital Products Without a Technical Co-Founder",
  "How Base44 Levels the Playing Field for Entrepreneurs",
  "Base44 for Side Projects: Build Your Idea on Weekends",

  // trends
  "AI No-Code Platforms: Where Base44 Fits",
  "The Future of App Development: AI-Powered No-Code",
  "Generative AI in Software Development: Base44 Case Study",
  "How GPT and LLMs Power Base44's App Building",
  "No-Code Trends: What's Driving Adoption",
  "The No-Code Market: Growth and Opportunities",
  "How AI Is Making App Development Accessible to Everyone",
  "No-Code for Enterprises: Is Base44 Enterprise-Ready?",
  "Building AI-Powered Apps with Base44",
  "How to Add ChatGPT Features to Your Base44 App",
  "Base44 and the Future of Work: How Jobs Are Changing",
  "No-Code Development Teams: How Companies Are Adapting",
  "The Democratization of Software with Base44",
  "How Base44 Empowers the Citizen Developer",
  "No-Code Predictions: Will AI Replace Developers?",

  // Niche audiences
  "Base44 for Stay-at-Home Parents: Build and Earn",
  "Base44 for Students: Build Portfolio Apps",
  "Base44 for Teachers: Create Educational Apps",
  "Base44 for Therapists: Client Management Systems",
  "Base44 for Personal Trainers: Client Tracking Apps",
  "Base44 for Interior Designers: Project Management Apps",
  "Base44 for Photographers: Booking and Portfolio Apps",
  "Base44 for Wedding Planners: Event Management Apps",
  "Base44 for Freelance Writers: Project and Invoice Apps",
  "Base44 for Social Media Managers: Content Scheduling Apps",
  "Base44 for Musicians: Gig and Fan Management Apps",
  "Base44 for Podcasters: Episode and Guest Management Apps",
  "Base44 for YouTubers: Video Production Tracking Apps",
  "Base44 for Influencers: Brand Deal Management Apps",
  "Base44 for E-commerce Sellers: Order Management Apps",
  "Base44 for Drop Shippers: Inventory and Supplier Apps",
  "Base44 for Amazon FBA Sellers: Product Tracking Apps",
  "Base44 for Airbnb Hosts: Property Management Apps",
  "Base44 for Etsy Sellers: Order and Production Apps",
  "Base44 for Dog Trainers: Client and Session Management",

  // Problem-first articles
  "Tired of Excel? Replace Your Spreadsheets with Base44",
  "Stop Paying $500/Month for SaaS: Build It with Base44",
  "Why Your Off-the-Shelf Software Doesn't Fit Your Business",
  "The Problem with Hiring Developers (and How Base44 Solves It)",
  "Why Most Apps Never Get Built (Base44 Changes This)",
  "Too Many Tabs? Build a Custom Dashboard with Base44",
  "Drowning in Manual Processes? Automate with Base44",
  "Why Your Startup Can't Afford Not to Use Base44",
  "The Hidden Cost of NOT Having a Custom App",
  "How to Stop Duct-Taping Software Together with Base44",
  "Too Complex for No-Code? Think Again with Base44",
  "Why Your Business Processes Are Broken (and the Fix)",
  "Frustrated with Off-the-Shelf CRMs? Build Your Own",
  "How to Finally Launch That App Idea with Base44",
  "Your Competitor Has a Custom App. Do You?",

  // Comparison with methods
  "No-Code vs Hiring a Developer",
  "Base44 vs Outsourcing Development: What's Better?",
  "DIY App Development: No-Code vs Learning to Code",
  "Is Base44 Better Than Hiring a Freelancer?",
  "Using Base44 to Replace Your Development Agency",
  "Base44 vs WordPress for Web Applications",
  "Base44 vs Squarespace: More Than Just a Website Builder",
  "Base44 vs Shopify: Build Custom E-commerce Apps",
  "Base44 vs Zapier: Automation vs Full App Building",
  "Base44 vs Make (Integromat): When to Use Which",

  // Long-form guides
  "The Complete Guide to Building a SaaS with Base44",
  "Building a No-Code Business: A Base44 Blueprint",
  "How to Build 10 Apps in 10 Days with Base44",
  "The No-Code Playbook: Using Base44 for Business Growth",
  "From Zero to App: The Ultimate Base44 Tutorial",
  "Base44 Masterclass: Build Like a Pro Without Coding",
  "How to Build, Launch, and Monetize Apps with Base44",
  "The Entrepreneur's Guide to No-Code App Development",
  "Building Your First Digital Product with Base44",
  "How to Turn Your Expertise into a Custom App with Base44",

  // Reviews & trust signals
  "Base44 User Reviews: What Real Users Are Saying",
  "Base44 G2 Reviews: Is It Worth It?",
  "Is Base44 Legit? Full Platform Investigation",
  "Base44 vs the Hype: Realistic Expectations",
  "Base44 Customer Support: What to Expect",
  "Base44 Uptime and Reliability: Can You Depend on It?",
  "How Base44 Handles Your Data: Privacy and Security Review",
  "Base44 Terms of Service: What You're Agreeing To",
  "Base44 Refund Policy: What Happens If You Cancel?",
  "Is Base44 Worth It for Small Businesses?",

  // Trending searches
  "How to Build a No-Code App",
  "Best AI App Builders",
  "Top No-Code Platforms for Entrepreneurs",
  "Best Tools to Build Apps Without Coding",
  "How to Start a Software Business Without Coding",
  "Fastest Way to Build a Web App",
  "Free App Builders That Actually Work",
  "How to Build a Business App on a Budget",
  "No-Code Platforms That Use AI to Build Apps",
  "Build an App for Your Small Business: Complete Guide",

  // Email/lead capture angles
  "How to Build an Email List App with Base44",
  "Build a Lead Generation System with Base44",
  "Create a Sales Funnel App Using Base44",
  "How to Build a Newsletter Management App with Base44",
  "Create an Opt-In Form with Database Storage Using Base44",
  "Build a CRM and Email Sequence Tool with Base44",
  "How to Build a Drip Campaign Manager with Base44",
  "Create an Affiliate Marketing Tracker with Base44",
  "Build a Referral Program App with Base44",
  "How to Build a Loyalty Program App with Base44",

  // Cost & monetization
  "How to Make Money Selling Base44 Apps to Clients",
  "Base44 Freelancing: Build Client Apps and Charge Premium",
  "How to Start a No-Code Agency with Base44",
  "Monetizing Your Base44 App: Revenue Models That Work",
  "How to Charge for Apps You Build with Base44",
  "Base44 White Label: Can You Sell Apps Under Your Brand?",
  "Building a Passive Income App with Base44",
  "How to Build a Subscription Business with Base44",
  "Charging Monthly Fees for Base44 Apps You Build",
  "No-Code Business Ideas That Work with Base44",

  // Wix acquisition angle
  "What the Wix-Base44 Acquisition Means for No-Code",
  "Base44 After Wix Acquisition: Better or Worse?",
  "Will Wix Ruin Base44? Post-Acquisition Analysis",
  "Base44 + Wix: The Future of No-Code App Development",
  "How the Wix Acquisition Changes Base44 Pricing",
  "Wix Buys Base44: What Users Need to Know",
  "Base44 Roadmap After Wix Acquisition: What's Coming",
  "Should You Use Base44 After the Wix Acquisition?",
  "Base44 Competition After Wix Deal: Market Analysis",
  "Wix's Strategy Behind Buying Base44 Explained",

  // Extra unique topics
  "Building Internal Tools vs SaaS: Base44 Strategy Guide",
  "How to Document Your Base44 App for Clients",
  "Base44 Team Collaboration: Multi-User App Development",
  "How to Manage Multiple Apps in Base44",
  "Base44 Version Control: Managing App Changes",
  "How to Test Your Base44 App Before Launch",
  "Base44 App Launch Checklist: 20 Steps to Go Live",
  "How to Get Your First User for Your Base44 App",
  "Marketing Your Base44 App: Growth Strategies",
  "How to Get Feedback on Your Base44 App",
  "Base44 App Maintenance: Keeping Your App Updated",
  "How to Scale a Base44 App as You Grow",
  "Base44 Performance Optimization Tips",
  "How to Handle Base44 App Errors",
  "Base44 Support Resources: How to Get Help",
  "Is Base44 Right for Complex Apps?",
  "Base44 Limitations: What It Can't Build",
  "When to Use Base44 vs Custom Code",
  "The Learning Curve of Base44: How Long Does It Take?",
  "Base44 Certification: Is There a Course or Certification?",

  // Specific business workflows
  "How to Build a Client Onboarding App with Base44",
  "Build an RFP Management System with Base44",
  "Create a Grant Management App with Base44",
  "Build a Compliance Tracking System with Base44",
  "How to Build an Audit Trail App with Base44",
  "Create a Risk Management Tool with Base44",
  "Build an Asset Management System with Base44",
  "How to Create a Knowledge Base App with Base44",
  "Build a Glossary and Documentation App with Base44",
  "Create an SOP Management System with Base44",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateArticle(
  groq: Groq,
  cerebras: Cerebras,
  topic: string,
  index: number
): Promise<void> {
  const slug = slugify(topic);
  const outPath = path.join("content", "articles", `${slug}.json`);

  if (fs.existsSync(outPath)) {
    console.log(`[${index + 1}/500] SKIP (exists): ${topic}`);
    return;
  }

  const prompt = `Write a comprehensive, SEO-optimized article titled "${topic}" for a website about Base44, the AI-powered no-code app builder.

REQUIREMENTS:
- 800-1200 words
- Conversational but authoritative tone
- Naturally mention "Base44" throughout (not forced)
- Include an H1 title, H2 sections, and short paragraphs
- Include at least 3 places to insert a call-to-action (mark with [CTA])
- Include an SEO meta description (120-160 chars) at the very top in this exact format: META: <description here>
- Include 5 focus keywords in this exact format on a new line: KEYWORDS: keyword1, keyword2, keyword3, keyword4, keyword5
- Write in HTML with proper h1, h2, h3, p, ul, li tags
- The article should genuinely help readers understand Base44's value
- Reference the affiliate link naturally as "Start Building with Base44" or "Try Base44 Free" -- use [CTA] as placeholder
- Do NOT include actual URLs -- just use [CTA] where a link should go
- Make each section substantive, not generic filler

Article title: ${topic}`;

  try {
    let content = "";

    if (useGroq) {
      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
          temperature: 0.8,
        });
        content = completion.choices[0]?.message?.content ?? "";
      } catch (groqErr: unknown) {
        const msg = String(groqErr);
        if (msg.includes("429") || msg.includes("rate_limit") || msg.includes("tokens per day")) {
          console.log(`Groq quota hit -- switching to Cerebras for remaining articles`);
          useGroq = false;
        } else {
          throw groqErr;
        }
      }
    }

    // Use Cerebras if Groq quota hit or unavailable
    if (!useGroq || !content) {
      const completion = await cerebras.chat.completions.create({
        model: "llama3.1-8b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        // @ts-ignore
        temperature: 0.8,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content = ((completion as any).choices?.[0]?.message?.content as string) ?? "";
      if (!useGroq) console.log(`[${index + 1}/500] Using Cerebras: ${topic}`);
    }

    // Extract meta description
    const metaMatch = content.match(/META:\s*(.+)/);
    const metaDescription = metaMatch
      ? metaMatch[1].trim()
      : `Learn about ${topic} and how Base44 helps you build apps without coding.`;

    // Extract keywords
    const kwMatch = content.match(/KEYWORDS:\s*(.+)/);
    const keywords = kwMatch
      ? kwMatch[1].split(",").map((k) => k.trim())
      : ["Base44", "no-code", "app builder", "AI app builder", "no-code platform"];

    // Strip META and KEYWORDS lines from body
    const body = content
      .replace(/META:\s*.+\n?/, "")
      .replace(/KEYWORDS:\s*.+\n?/, "")
      .replace(/\[CTA\]/g, `<a href="${AFFILIATE_LINK}" class="cta-link">Start Building with Base44 →</a>`);

    const article = {
      slug,
      title: topic,
      metaDescription,
      keywords,
      body,
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(outPath, JSON.stringify(article, null, 2));
    console.log(`[${index + 1}/500] DONE: ${topic}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${index + 1}/500] ERROR: ${topic} â€" ${msg}`);
    // Write error placeholder so we can retry
    const article = {
      slug,
      title: topic,
      metaDescription: `Learn about ${topic} and how Base44 helps you build apps without coding.`,
      keywords: ["Base44", "no-code", "app builder"],
      body: `<h1>${topic}</h1><p>Content generation failed. Please retry.</p>`,
      generatedAt: new Date().toISOString(),
      error: msg,
    };
    fs.writeFileSync(outPath, JSON.stringify(article, null, 2));
  }

  // Groq: 13s = ~4.6/min (under 12k TPM limit)
  // Cerebras: 25s = ~2.4/min (under RPM limit)
  await new Promise((r) => setTimeout(r, useGroq ? 13000 : 25000));
}

async function main() {
  const groqKey = process.env.GROQ_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;

  if (!groqKey && !cerebrasKey) {
    console.error("ERROR: Set GROQ_API_KEY and/or CEREBRAS_API_KEY");
    process.exit(1);
  }

  if (!groqKey) {
    useGroq = false;
    console.log("No Groq key -- using Cerebras only");
  }
  if (!cerebrasKey) {
    console.log("No Cerebras key -- using Groq only (no fallback)");
  }

  const groq = new Groq({ apiKey: groqKey ?? "none" });
  const cerebras = new Cerebras({ apiKey: cerebrasKey ?? "none" });

  fs.mkdirSync(path.join("content", "articles"), { recursive: true });

  // Combine hardcoded topics + topics.json (if exists)
  let allTopics = [...ARTICLE_TOPICS];
  const topicsJsonPath = path.join("scripts", "topics.json");
  if (fs.existsSync(topicsJsonPath)) {
    const extra: string[] = JSON.parse(fs.readFileSync(topicsJsonPath, "utf-8"));
    const existing = new Set(ARTICLE_TOPICS);
    for (const t of extra) {
      if (!existing.has(t)) { allTopics.push(t); existing.add(t); }
    }
  }

  console.log(`Generating ${allTopics.length} articles (Groq → Cerebras fallback)...`);

  for (let i = 0; i < allTopics.length; i++) {
    await generateArticle(groq, cerebras, allTopics[i], i);
  }

  console.log("Done! All articles generated.");
}

main().catch(console.error);
