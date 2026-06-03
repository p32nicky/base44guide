"""
Rewrites top 2 key articles with better content using Groq,
then adds 50 "Best Base44 Apps for [profession]" topics.
"""
import json, os, time, re
from pathlib import Path
from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])
ARTICLES_DIR = Path(r"C:\base44site\content\articles")
AFFILIATE = "https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base"
CTA_HTML = f'<a href="{AFFILIATE}" class="cta-link">Start Building with Base44 →</a>'

def generate(title, prompt_extra=""):
    prompt = f"""Write a comprehensive, SEO-optimized article titled "{title}" for a website about Base44, the AI-powered no-code app builder.

REQUIREMENTS:
- 1500-2000 words (longer = better for ranking)
- Conversational but authoritative tone
- Naturally mention "Base44" throughout
- Include H1, H2, H3 sections with short paragraphs
- Include specific details, facts, examples — NOT generic filler
- Include SEO meta description (120-160 chars): META: <description>
- Include 5 focus keywords: KEYWORDS: kw1, kw2, kw3, kw4, kw5
- Write in HTML with proper h1, h2, h3, p, ul, li tags
- Mark CTAs with [CTA]
- Do NOT include actual URLs — use [CTA] as placeholder
{prompt_extra}

Article title: {title}"""

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=3000,
        temperature=0.7,
    )
    return resp.choices[0].message.content

def save(slug, title, content):
    meta_match = re.search(r'META:\s*(.+)', content)
    kw_match = re.search(r'KEYWORDS:\s*(.+)', content)
    meta = meta_match.group(1).strip() if meta_match else f"Learn about {title} and Base44."
    keywords = [k.strip() for k in kw_match.group(1).split(",")] if kw_match else ["Base44"]

    body = re.sub(r'META:\s*.+\n?', '', content)
    body = re.sub(r'KEYWORDS:\s*.+\n?', '', body).strip()
    body = re.sub(r'\[CTA[^\]]*\]', CTA_HTML, body)

    existing_path = ARTICLES_DIR / f"{slug}.json"
    generated_at = json.loads(existing_path.read_text(encoding="utf-8")).get("generatedAt") if existing_path.exists() else None

    article = {
        "slug": slug,
        "title": title,
        "metaDescription": meta,
        "keywords": keywords,
        "body": body,
        "generatedAt": generated_at or __import__("datetime").datetime.now().isoformat(),
    }
    (ARTICLES_DIR / f"{slug}.json").write_text(
        json.dumps(article, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"Saved: {slug}")

# ── 1. Rewrite Wix acquisition ────────────────────────────────────────────────
print("Rewriting: Wix acquisition article...")
content = generate(
    "What the Wix-Base44 Acquisition Means for No-Code",
    """EXTRA REQUIREMENTS for this article:
- Cover: why Wix acquired Base44, what was the acquisition price/deal, what changes for existing users
- Cover: will pricing change, is Base44 still independent, what's on the roadmap
- Cover: should you still use Base44, is it better or worse now, competitor reaction
- Be SPECIFIC — mention Wix's strategy to compete with Shopify/Squarespace in app building
- Include a FAQ section answering: Does Wix own Base44? Will Base44 be shut down? Is Base44 free still?
- This should be THE definitive page on the Wix/Base44 acquisition"""
)
save("what-the-wix-base44-acquisition-means-for-no-code", "What the Wix-Base44 Acquisition Means for No-Code", content)
time.sleep(15)

# ── 2. Rewrite "is base44 good" ───────────────────────────────────────────────
print("Rewriting: Is Base44 Good...")
content = generate(
    "Is Base44 Good? Unbiased Verdict After 30 Days",
    """EXTRA REQUIREMENTS:
- Be brutally honest — include real pros AND cons
- Structure: What Base44 is good at / What it struggles with / Who should use it / Who shouldn't
- Include: speed of building, quality of output, pricing value, support quality, comparison to alternatives
- Include a scoring section (rate different aspects out of 10)
- Include FAQ: Is Base44 worth it? Is Base44 legit? Is Base44 safe? Does Base44 actually work?
- This must feel like a REAL review, not marketing fluff
- Verdict section at end with clear recommendation"""
)
save("is-base44-good-unbiased-verdict", "Is Base44 Good? Unbiased Verdict After 30 Days", content)
time.sleep(15)

# ── 3. Generate 50 "Best Base44 Apps for [profession]" ───────────────────────
PROFESSIONS = [
    "Plumbers", "Electricians", "HVAC Technicians", "Roofers", "Painters",
    "Handymen", "Contractors", "Cleaning Services", "Landscapers", "Pool Service Companies",
    "Accountants", "Bookkeepers", "Tax Preparers", "Financial Advisors", "Mortgage Brokers",
    "Real Estate Agents", "Property Managers", "Insurance Agents", "Recruiters", "HR Managers",
    "Dentists", "Chiropractors", "Physical Therapists", "Massage Therapists", "Nutritionists",
    "Personal Trainers", "Yoga Instructors", "Life Coaches", "Career Coaches", "Mental Health Counselors",
    "Wedding Planners", "Event Coordinators", "Caterers", "Florists", "Photographers",
    "Videographers", "Graphic Designers", "Interior Designers", "Architects", "Civil Engineers",
    "Software Engineers", "IT Consultants", "Cybersecurity Consultants", "Data Analysts", "UX Designers",
    "Copywriters", "Social Media Managers", "SEO Specialists", "Virtual Assistants", "Freelance Writers",
]

topics_file = Path(r"C:\base44site\scripts\topics.json")
existing_topics = json.loads(topics_file.read_text(encoding="utf-8"))
existing_set = set(existing_topics)

added = 0
for prof in PROFESSIONS:
    title = f"The Best Base44 Apps for {prof}"
    slug = title.lower().replace(" ", "-").replace("'", "").replace(",", "")
    slug = re.sub(r'[^a-z0-9-]', '', slug).strip('-')

    path = ARTICLES_DIR / f"{slug}.json"
    if path.exists():
        print(f"SKIP (exists): {title}")
        continue

    print(f"Generating: {title}")
    try:
        content = generate(
            title,
            f"""EXTRA REQUIREMENTS:
- List 5-7 specific types of apps that {prof} can build with Base44
- For each app: what it does, why {prof} need it, what features to include
- Include real workflow examples specific to {prof}
- Explain how Base44 replaces expensive software {prof} currently pay for
- Include pricing comparison (Base44 vs typical software {prof} use)
- Include a "Getting Started" section specific to {prof}"""
        )
        save(slug, title, content)
        if title not in existing_set:
            existing_topics.append(title)
            existing_set.add(title)
            added += 1
        time.sleep(14)
    except Exception as e:
        print(f"ERROR {title}: {e}")
        time.sleep(30)

topics_file.write_text(json.dumps(existing_topics, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"\nDone! Added {added} new profession topics. All articles saved.")
