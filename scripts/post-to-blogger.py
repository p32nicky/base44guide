"""
Posts all Base44 articles to Blogspot via Blogger API v3.
Run once to authenticate, then posts all articles automatically.

Setup:
1. Go to https://console.cloud.google.com
2. New project -> Enable "Blogger API v3"
3. APIs & Services -> Credentials -> Create OAuth 2.0 Client ID (Desktop app)
4. Download JSON -> save as C:\base44site\scripts\google-credentials.json
5. Run: python scripts/post-to-blogger.py
"""

import os
import json
import time
import re
from pathlib import Path

# pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/blogger"]
BLOG_URL = "https://base44-nocode.blogspot.com/"
AFFILIATE_LINK = "https://base44.pxf.io/c/2252709/2049275/25619?trafcat=base"
VERCEL_SITE = "https://base44site.vercel.app"
ARTICLES_DIR = Path(r"C:\base44site\content\articles")
CREDS_FILE = Path(r"C:\base44site\scripts\google-credentials.json")
TOKEN_FILE = Path(r"C:\base44site\scripts\google-token.json")
POSTED_FILE = Path(r"C:\base44site\scripts\posted-articles.json")

CTA_HTML = f"""
<div style="background:#fff3e0;border:2px solid #ff6d00;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
  <strong style="font-size:18px;">Ready to build your own app?</strong><br><br>
  <a href="{AFFILIATE_LINK}" style="background:#ff6d00;color:white;padding:12px 24px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:16px;">
    Start Building with Base44 →
  </a>
  <br><br>
  <small>No coding required. Free plan available.</small>
</div>
"""

FOOTER_HTML = f"""
<hr>
<p><em>Want to read more Base44 guides? Visit <a href="{VERCEL_SITE}">Base44 Guide</a> for 500+ articles, tutorials, and reviews.</em></p>
<p style="text-align:center;">
  <a href="{AFFILIATE_LINK}" style="background:#ff6d00;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;font-weight:bold;">
    Try Base44 Free →
  </a>
</p>
"""

def authenticate():
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDS_FILE.exists():
                print(f"ERROR: Missing {CREDS_FILE}")
                print("Download OAuth credentials from Google Cloud Console first.")
                exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
    return creds

def get_blog_id(service):
    blog = service.blogs().getByUrl(url=BLOG_URL).execute()
    return blog["id"]

def load_posted():
    if POSTED_FILE.exists():
        return set(json.loads(POSTED_FILE.read_text()))
    return set()

def save_posted(posted):
    POSTED_FILE.write_text(json.dumps(list(posted), indent=2))

def build_post_body(article):
    body = article["body"]
    # Inject CTA after first </h2> or </p> section
    first_section = body.find("</p>")
    if first_section != -1:
        body = body[:first_section+4] + CTA_HTML + body[first_section+4:]
    # Add footer
    body = body + FOOTER_HTML
    return body

def post_article(service, blog_id, article):
    body = build_post_body(article)
    post = {
        "kind": "blogger#post",
        "title": article["title"],
        "content": body,
        "labels": article.get("keywords", ["Base44"])[:5],
    }
    result = service.posts().insert(
        blogId=blog_id,
        body=post,
        isDraft=False
    ).execute()
    return result["url"]

MAX_PER_RUN = 200  # Post all articles in one run

def main():
    print("Authenticating with Google...")
    creds = authenticate()
    service = build("blogger", "v3", credentials=creds)

    print("Getting blog ID...")
    blog_id = get_blog_id(service)
    print(f"Blog ID: {blog_id}")

    posted = load_posted()
    articles = sorted(ARTICLES_DIR.glob("*.json"))
    total = len(articles)
    new_posts = 0

    for i, path in enumerate(articles):
        if new_posts >= MAX_PER_RUN:
            print(f"Reached daily limit of {MAX_PER_RUN} posts. Run again tomorrow.")
            break
        article = json.loads(path.read_text(encoding="utf-8"))
        if article.get("error"):
            continue
        slug = article["slug"]
        if slug in posted:
            print(f"[{i+1}/{total}] SKIP: {article['title']}")
            continue

        # Retry up to 5 times with backoff on 429
        for attempt in range(5):
            try:
                url = post_article(service, blog_id, article)
                posted.add(slug)
                save_posted(posted)
                new_posts += 1
                print(f"[{i+1}/{total}] POSTED: {article['title']} -> {url}")
                break
            except Exception as e:
                if "429" in str(e) or "rateLimitExceeded" in str(e):
                    wait = 60 * (attempt + 1)
                    print(f"[{i+1}/{total}] Rate limited, waiting {wait}s...")
                    time.sleep(wait)
                else:
                    print(f"[{i+1}/{total}] ERROR: {article['title']} -- {e}")
                    break

        time.sleep(6)

    print(f"\nDone! Posted {new_posts} new articles to {BLOG_URL}")

if __name__ == "__main__":
    main()
