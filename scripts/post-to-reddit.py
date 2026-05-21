"""
Posts Base44 articles to r/Base44Guide via PRAW.
Run: python scripts/post-to-reddit.py
Tracks posted articles in scripts/reddit-posted.json
"""
import json
import os
import time
from pathlib import Path

import praw

CLIENT_ID     = "weFtQwJPb1wsdq2IXexp7Q"
CLIENT_SECRET = "a-mqkbBtpHICVo--xQWIAPENM_bSUw"
USERNAME      = "Basic-Strain-6922"
PASSWORD      = "Nd2354zx!!??"
SUBREDDIT     = "Base44Guide"
SITE_URL      = "https://base44guide.io"
ARTICLES_DIR  = Path(r"C:\base44site\content\articles")
POSTED_FILE   = Path(r"C:\base44site\scripts\reddit-posted.json")
MAX_PER_RUN   = 25  # Reddit rate limits — don't post too many at once

def load_posted():
    if POSTED_FILE.exists():
        return set(json.loads(POSTED_FILE.read_text()))
    return set()

def save_posted(posted):
    POSTED_FILE.write_text(json.dumps(list(posted), indent=2))

def main():
    reddit = praw.Reddit(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        username=USERNAME,
        password=PASSWORD,
        user_agent=f"base44guide/1.0 by u/{USERNAME}",
        redirect_uri="http://localhost:8080",
    )
    subreddit = reddit.subreddit(SUBREDDIT)
    posted = load_posted()

    articles = sorted(ARTICLES_DIR.glob("*.json"))
    new_posts = 0

    for path in articles:
        if new_posts >= MAX_PER_RUN:
            print(f"Reached limit of {MAX_PER_RUN} posts. Run again tomorrow.")
            break

        article = json.loads(path.read_text(encoding="utf-8"))
        if article.get("error"):
            continue

        slug = article["slug"]
        if slug in posted:
            continue

        title = article["title"]
        url = f"{SITE_URL}/articles/{slug}"
        # Reddit title: keep under 300 chars
        post_title = f"{title} [No-Code Guide]"[:300]

        try:
            print(f"Posting: {title[:70]}")
            subreddit.submit(title=post_title, url=url, resubmit=False)
            posted.add(slug)
            save_posted(posted)
            new_posts += 1
            print(f"  OK ({new_posts}/{MAX_PER_RUN})")
            time.sleep(12)  # Reddit rate limit
        except Exception as e:
            err = str(e)
            if "DUPLICATE" in err or "already been submitted" in err.lower():
                posted.add(slug)
                save_posted(posted)
                print(f"  Already posted — skipping")
            elif "SUBREDDIT_NOTALLOWED" in err or "banned" in err.lower():
                print(f"  ERROR: Not allowed to post in r/{SUBREDDIT}")
                break
            else:
                print(f"  ERROR: {err}")
            time.sleep(6)

    print(f"\nDone! Posted {new_posts} new articles to r/{SUBREDDIT}")
    print(f"Total posted: {len(posted)}")

if __name__ == "__main__":
    main()
