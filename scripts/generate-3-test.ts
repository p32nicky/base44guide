/**
 * Generate 3 test senior articles with clean HTML and images.
 * Run: GROQ_API_KEY=xxx npx tsx scripts/generate-3-test.ts
 */

import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import https from "https";

const TOPICS = [
  "How to Build a Personal Budget Tracking App",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getImage(topic: string): Promise<string> {
  // Query Pexels for senior images only (no topic-specific terms to avoid repetition)
  const apiKey = "6gWNCCoY8r6izbwoqv4uAgtwegOiN1P7nMVLBfmnWNL0sgLV4ielHWxn";
  // Add random offset to get different photos each time
  const page = Math.floor(Math.random() * 10) + 1;

  try {
    const url = `https://api.pexels.com/v1/search?query=senior&per_page=1&page=${page}`;

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
      return data.photos[0].src.medium;
    }
  } catch (err) {
    // Silent fallback
  }

  // Fallback to senior generic image
  return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800";
}

async function generateArticle(groq: Groq, topic: string, index: number): Promise<void> {
  const slug = "senior-" + slugify(topic);
  const outPath = path.join("content", "articles", `${slug}.json`);

  if (fs.existsSync(outPath)) {
    console.log(`[${index + 1}/3] SKIP: ${topic}`);
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

    let content = completion.choices[0]?.message?.content ?? "";

    // Validate
    if (!content.includes("<h1>")) throw new Error("No h1 tag");
    if (content.includes("<<") || content.includes(">>")) throw new Error("Artifacts found");
    if (content.length < 400) throw new Error("Too short");

    // Clean - remove ALL external links except Base44
    let body = content
      .replace(/\[MID_CTA\]/g, `[KEEP_MID_CTA]`)
      .replace(/\[END_CTA\]/g, `[KEEP_END_CTA]`)
      .trim();

    // Strip all <a> tags except those with base44 or base44guide in href
    body = body.replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, (match, href, text) => {
      if (href.includes("base44") || href.includes("base44guide")) {
        return match; // Keep Base44 links
      }
      return text; // Replace with just text, no link
    });

    // Insert the CTAs
    const cta = `<p><a href="https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base"><strong>Try Base44 free today.</strong></a></p>`;
    body = body.replace(/\[KEEP_MID_CTA\]/g, cta);
    body = body.replace(/\[KEEP_END_CTA\]/g, cta);

    const coverImage = await getImage(topic);

    const article = {
      slug,
      title: topic,
      metaDescription: `Learn how to ${topic.toLowerCase()} with Base44 - no coding required.`,
      keywords: ["Base44", "seniors", "no-code", "app builder"],
      body,
      audience: "seniors",
      coverImage,
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(outPath, JSON.stringify(article, null, 2));
    console.log(`[${index + 1}/3] OK: ${topic}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${index + 1}/3] FAIL: ${topic} - ${msg}`);
  }

  await new Promise((r) => setTimeout(r, 5000));
}

async function main() {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    console.error("ERROR: Set GROQ_API_KEY");
    process.exit(1);
  }

  const groq = new Groq({ apiKey: groqKey });
  fs.mkdirSync(path.join("content", "articles"), { recursive: true });

  console.log("Generating 3 test senior articles...\n");

  for (let i = 0; i < TOPICS.length; i++) {
    await generateArticle(groq, TOPICS[i], i);
  }

  console.log("\nDone!");
}

main().catch(console.error);
