/**
 * Generates clean senior-focused articles with proper images.
 * Fixes: clean HTML, complete text, topic-specific images from Pexels API
 * Run: GROQ_API_KEY=xxx npx tsx scripts/generate-senior-articles-v2.ts
 */

import Groq from "groq-sdk";
import { marked } from "marked";
import fs from "fs";
import path from "path";

async function getTopicImage(topic: string): Promise<string> {
  // Map topics to curated Unsplash images (no API key needed)
  const imageMap: { [key: string]: string } = {
    rental: "https://images.unsplash.com/photo-1570129477492-45ac003000c0?w=800",
    airbnb: "https://images.unsplash.com/photo-1570129477492-45ac003000c0?w=800",
    family: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
    genealogy: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
    gardening: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    garden: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    travel: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    fitness: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    health: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    writing: "https://images.unsplash.com/photo-1455849318169-8d6c028e4d0a?w=800",
    craft: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
    pet: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
    cooking: "https://images.unsplash.com/photo-1504674900967-77d71b3cb9db?w=800",
    business: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    learning: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
  };

  const topicLower = topic.toLowerCase();
  for (const [key, url] of Object.entries(imageMap)) {
    if (topicLower.includes(key)) {
      return url;
    }
  }

  // Default senior image
  return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800";
}

function mdToHtml(text: string): string {
  if (text.includes("<h1") || text.includes("<p>")) return text;
  return marked.parse(text) as string;
}

const seniorTopicsPath = path.join("scripts", "senior-topics.json");
const SENIOR_TOPICS: string[] = fs.existsSync(seniorTopicsPath)
  ? JSON.parse(fs.readFileSync(seniorTopicsPath, "utf-8"))
  : [];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateArticle(
  groq: Groq,
  topic: string,
  index: number
): Promise<void> {
  const slug = "senior-" + slugify(topic);
  const outPath = path.join("content", "articles", `${slug}.json`);

  if (fs.existsSync(outPath)) {
    console.log(`[${index + 1}/${SENIOR_TOPICS.length}] SKIP: ${topic}`);
    return;
  }

  const prompt = `Write a helpful, complete article for seniors 55+ about: "${topic}"

CRITICAL REQUIREMENTS:
- 900-1200 words, COMPLETE text (no cutoffs)
- Start with <h1> tag ONLY - no other text before it
- Use ONLY these HTML tags: h1, h2, h3, p, ul, li, a, strong, em
- NO markdown, NO special characters, NO broken HTML
- NO artifacts like "<<" or ">>" or trailing ">"
- Each paragraph in <p> tags with proper closing
- Clean, professional tone for seniors
- Include why seniors can do this
- Include practical next steps
- Include 3-4 call-to-action links marked [LINK]

FORMAT (strict):
<h1>Article Title</h1>

<h2>Section 1</h2>
<p>Opening paragraph explaining what this is and who it's for.</p>
<p>Second paragraph with more context.</p>

<h2>Section 2</h2>
<p>Content here.</p>

<h2>Why You Can Do This</h2>
<p>Encouraging paragraph about seniors being capable.</p>

<h2>Getting Started</h2>
<p>Step 1 description.</p>
<p>Step 2 description.</p>
<p>With Base44, [LINK]</p>

START WRITING NOW - produce complete, valid HTML only:`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    });
    const content = completion.choices[0]?.message?.content ?? "";

    // Validate: no artifacts
    if (content.includes("<<") || content.includes(">>")) {
      throw new Error("HTML artifacts detected");
    }
    if (!content.includes("<h1>")) {
      throw new Error("Missing h1 tag");
    }
    if (content.length < 500) {
      throw new Error("Content too short");
    }

    // Clean body
    const body = content
      .replace(/\[LINK\]/g, `<a href="https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base" class="cta-link">Try Base44 Free</a>`)
      .trim();

    // Get image
    const coverImage = await getTopicImage(topic);

    const article = {
      slug,
      title: topic,
      metaDescription: `Learn how to ${topic.toLowerCase()} with Base44 - no coding required for seniors.`,
      keywords: [
        "Base44",
        "seniors",
        "no-code",
        "app builder",
        slugify(topic).split("-")[0],
      ],
      body,
      audience: "seniors",
      coverImage,
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(outPath, JSON.stringify(article, null, 2));
    console.log(`[${index + 1}/${SENIOR_TOPICS.length}] OK: ${topic}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${index + 1}/${SENIOR_TOPICS.length}] FAIL: ${topic} - ${msg}`);
  }

  // Rate limit
  await new Promise((r) => setTimeout(r, 13000));
}

async function main() {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    console.error("ERROR: Set GROQ_API_KEY");
    process.exit(1);
  }

  const groq = new Groq({ apiKey: groqKey });
  fs.mkdirSync(path.join("content", "articles"), { recursive: true });

  if (SENIOR_TOPICS.length === 0) {
    console.error("ERROR: No topics in scripts/senior-topics.json");
    process.exit(1);
  }

  console.log(`Generating ${SENIOR_TOPICS.length} senior articles (v2)...\n`);

  for (let i = 0; i < SENIOR_TOPICS.length; i++) {
    await generateArticle(groq, SENIOR_TOPICS[i], i);
  }

  console.log("\nDone!");
}

main().catch(console.error);
