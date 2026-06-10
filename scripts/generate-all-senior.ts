/**
 * Generate all 125 senior articles with images.
 * Run: GROQ_API_KEY=xxx npx tsx scripts/generate-all-senior.ts
 */

import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import https from "https";

// Load topics from file
const topicsPath = path.join("scripts", "senior-topics.json");
const TOPICS: string[] = JSON.parse(fs.readFileSync(topicsPath, "utf-8"));

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

let imagePool: string[] = [];
let imageIndex = 0;

async function initImagePool(): Promise<void> {
  // Fetch pool of senior images from Pexels (no duplicates)
  const apiKey = "6gWNCCoY8r6izbwoqv4uAgtwegOiN1P7nMVLBfmnWNL0sgLV4ielHWxn";

  try {
    const url = `https://api.pexels.com/v1/search?query=senior&per_page=80`;

    const data = await new Promise<any>((resolve, reject) => {
      const options = {
        headers: {
          "Authorization": apiKey,
        },
      };

      https.get(url, options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }).on("error", reject);
    });

    if (data.photos && data.photos.length > 0) {
      imagePool = data.photos.map((p: any) => p.src.medium);
      // Shuffle pool
      for (let i = imagePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [imagePool[i], imagePool[j]] = [imagePool[j], imagePool[i]];
      }
      console.log(`Loaded ${imagePool.length} unique senior images\n`);
    }
  } catch (err) {
    console.log("Failed to load images, using fallback\n");
  }
}

function getImage(): string {
  // Return next image from pool, cycle if exhausted
  if (imagePool.length === 0) {
    return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800";
  }
  const img = imagePool[imageIndex % imagePool.length];
  imageIndex++;
  return img;
}

async function generateArticle(groq: Groq, topic: string, index: number): Promise<void> {
  const slug = "senior-" + slugify(topic);
  const outPath = path.join("content", "articles", `${slug}.json`);

  if (fs.existsSync(outPath)) {
    console.log(`[${index + 1}/${TOPICS.length}] SKIP: ${topic}`);
    return;
  }

  const prompt = `Write a helpful article for seniors 55+ about: "${topic}"

CRITICAL REQUIREMENTS:
- 800-1000 words, COMPLETE text
- Start ONLY with <h1> tag
- HTML ONLY: h1, h2, h3, p, ul, li, strong, em
- ZERO external links (NO HubSpot, Clarity, other websites)
- ZERO <a> tags except at [MID_CTA] and [END_CTA]
- 4-5 sections with practical advice
- Include "Why You Can Do This" section early
- Place [MID_CTA] after 2-3 sections (around 400-500 words)
- Place [END_CTA] at the very end
- NO other links, NO resources section, NO additional links
- Focus entirely on Base44

Write now:`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    });
    const content = completion.choices[0]?.message?.content ?? "";

    // Validate
    if (content.includes("<<") || content.includes(">>")) {
      throw new Error("HTML artifacts detected");
    }
    if (!content.includes("<h1>")) {
      throw new Error("Missing h1 tag");
    }
    if (content.length < 400) {
      throw new Error("Content too short");
    }

    // Get image
    const imageUrl = getImage();

    // Clean body
    let body = content
      .replace(/\[MID_CTA\]/g, `[KEEP_MID_CTA]`)
      .replace(/\[END_CTA\]/g, `[KEEP_END_CTA]`)
      .trim();

    // Strip all <a> tags except those with base44
    body = body.replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, (match, href, text) => {
      if (href.includes("base44") || href.includes("base44guide")) {
        return match;
      }
      return text;
    });

    // Insert CTAs
    const cta = `<p><a href="https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base"><strong>Try Base44 free today.</strong></a></p>`;
    body = body.replace(/\[KEEP_MID_CTA\]/g, cta);
    body = body.replace(/\[KEEP_END_CTA\]/g, cta);

    const article = {
      slug,
      title: topic,
      metaDescription: `Learn how to ${topic.toLowerCase()} with Base44 - no coding required.`,
      keywords: ["Base44", "seniors", "no-code", "app builder"],
      body,
      audience: "seniors",
      coverImage: imageUrl,
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(outPath, JSON.stringify(article, null, 2));
    console.log(`[${index + 1}/${TOPICS.length}] OK: ${topic}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${index + 1}/${TOPICS.length}] FAIL: ${topic} - ${msg}`);
  }

  // Rate limit: 20 seconds between requests to avoid Groq limits
  await new Promise((r) => setTimeout(r, 20000));
}

async function main() {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    console.error("ERROR: Set GROQ_API_KEY");
    process.exit(1);
  }

  const groq = new Groq({ apiKey: groqKey });
  fs.mkdirSync(path.join("content", "articles"), { recursive: true });

  console.log(`Generating ${TOPICS.length} senior articles...\n`);

  // Load unique image pool
  await initImagePool();

  for (let i = 0; i < TOPICS.length; i++) {
    await generateArticle(groq, TOPICS[i], i);
  }

  console.log("\nDone!");
}

main().catch(console.error);
