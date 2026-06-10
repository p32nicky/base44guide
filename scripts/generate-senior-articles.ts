/**
 * Generates articles for seniors 55+ on practical projects with Base44.
 * Tone: encouraging, clear, project-focused
 * Run: GROQ_API_KEY=xxx CEREBRAS_API_KEY=xxx npx tsx scripts/generate-senior-articles.ts
 * Output: content/articles/senior-*.json
 */

import Groq from "groq-sdk";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { marked } from "marked";
import fs from "fs";
import path from "path";

function mdToHtml(text: string): string {
  if (text.includes("<h1") || text.includes("<p>")) return text;
  return marked.parse(text) as string;
}

let useGroq = true;
const AFFILIATE_LINK = "https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base";

// Load senior topics
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

async function generateSeniorArticle(
  groq: Groq,
  cerebras: Cerebras,
  topic: string,
  index: number
): Promise<void> {
  const slug = "senior-" + slugify(topic);
  const outPath = path.join("content", "articles", `${slug}.json`);

  if (fs.existsSync(outPath)) {
    console.log(`[${index + 1}/${SENIOR_TOPICS.length}] SKIP: ${topic}`);
    return;
  }

  const prompt = `Write a warm, encouraging article titled "${topic}" for seniors 55+ learning to build apps with Base44.

AUDIENCE: Retirees, semi-retired people, or those 55+ wanting to:
- Start a side hustle or monetize expertise
- Build an app for a hobby or personal project
- Create a digital tool for their community
- Document family history or memories
- Automate their business or volunteer work

TONE: Friendly, clear, practical. Assume NO technical background.
- Use simple language (avoid jargon)
- Include real-world examples they relate to
- Emphasize it's easier than they think
- Show actual benefits/outcomes
- Include encouragement

REQUIREMENTS:
- 1000-1300 words
- H1 title + H2 sections (3-5 sections)
- Short paragraphs (2-3 sentences max)
- Include an H2 section "Why You Can Do This (Seriously)"
- Include an H2 section "What You'll Need"
- Include at least 4 [CTA] placeholders for call-to-action buttons
- Include META: <SEO description 120-160 chars> at top
- Include KEYWORDS: keyword1, keyword2, keyword3, keyword4, keyword5
- Write in HTML with h1, h2, h3, p, ul, li tags
- Make it inspiring but realistic
- Do NOT include actual URLs -- use [CTA] as placeholder

Article: ${topic}`;

  try {
    let content = "";

    if (useGroq) {
      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2500,
          temperature: 0.9,
        });
        content = completion.choices[0]?.message?.content ?? "";
      } catch (groqErr: unknown) {
        const msg = String(groqErr);
        if (msg.includes("429") || msg.includes("rate_limit")) {
          console.log(`Groq quota hit -- switching to Cerebras`);
          useGroq = false;
        } else {
          throw groqErr;
        }
      }
    }

    if (!useGroq || !content) {
      const completion = await cerebras.chat.completions.create({
        model: "llama3.1-8b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2500,
        // @ts-ignore
        temperature: 0.9,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content = ((completion as any).choices?.[0]?.message?.content as string) ?? "";
    }

    // Extract metadata
    const metaMatch = content.match(/META:\s*(.+)/);
    const metaDescription = metaMatch
      ? metaMatch[1].trim()
      : `Learn how to build ${topic.toLowerCase()} with Base44 -- no coding required.`;

    const kwMatch = content.match(/KEYWORDS:\s*(.+)/);
    const keywords = kwMatch
      ? kwMatch[1].split(",").map((k) => k.trim())
      : ["Base44", "no-code", "seniors", "app builder", "DIY projects"];

    // Clean and convert
    const rawBody = content
      .replace(/META:\s*.+\n?/, "")
      .replace(/KEYWORDS:\s*.+\n?/, "");
    const body = mdToHtml(rawBody).replace(
      /\[CTA\]/g,
      `<a href="${AFFILIATE_LINK}" class="cta-link">Try Base44 Free →</a>`
    );

    const article = {
      slug,
      title: topic,
      metaDescription,
      keywords,
      body,
      audience: "seniors",
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(outPath, JSON.stringify(article, null, 2));
    console.log(`[${index + 1}/${SENIOR_TOPICS.length}] DONE: ${topic}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${index + 1}/${SENIOR_TOPICS.length}] ERROR: ${topic} -- ${msg}`);
    const article = {
      slug,
      title: topic,
      metaDescription: `Learn about ${topic.toLowerCase()}.`,
      keywords: ["Base44", "no-code"],
      body: `<h1>${topic}</h1><p>Article generation failed. Please retry.</p>`,
      audience: "seniors",
      generatedAt: new Date().toISOString(),
      error: msg,
    };
    fs.writeFileSync(outPath, JSON.stringify(article, null, 2));
  }

  await new Promise((r) => setTimeout(r, useGroq ? 13000 : 60000));
}

async function main() {
  const groqKey = process.env.GROQ_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;

  if (!groqKey && !cerebrasKey) {
    console.error("ERROR: Set GROQ_API_KEY and/or CEREBRAS_API_KEY");
    process.exit(1);
  }

  if (!cerebrasKey) {
    console.log("No Cerebras key -- using Groq only (no fallback)");
  }

  const groq = new Groq({ apiKey: groqKey ?? "none" });
  const cerebras = new Cerebras({ apiKey: cerebrasKey ?? "none" });

  fs.mkdirSync(path.join("content", "articles"), { recursive: true });

  if (SENIOR_TOPICS.length === 0) {
    console.error("ERROR: No senior topics found in scripts/senior-topics.json");
    process.exit(1);
  }

  console.log(`Generating ${SENIOR_TOPICS.length} senior-focused articles...`);

  for (let i = 0; i < SENIOR_TOPICS.length; i++) {
    await generateSeniorArticle(groq, cerebras, SENIOR_TOPICS[i], i);
  }

  console.log("Done! Senior articles generated.");
}

main().catch(console.error);
