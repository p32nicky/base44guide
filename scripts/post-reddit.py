"""
Post articles to Reddit r/Base44Guide
Reads from senior-articles-generated (same as Substack)
Tracks in SQLite
"""
import json
import praw
import sqlite3
from pathlib import Path
from datetime import datetime

REDDIT_CLIENT_ID = "weFtQwJPb1wsdq2IXexp7Q"
REDDIT_SECRET = "a-mqkbBtpHICVo--xQWIAPENM_bSUw"
REDDIT_USER = "Basic-Strain-6922"
REDDIT_PASS = "Nd2354zx!!??"
SUBREDDIT = "Base44Guide"

ARTICLES_DIR = Path("scripts/senior-articles-generated")
DB_PATH = Path("data/reddit_posted.db")

def get_reddit():
    """Authenticate with Reddit."""
    reddit = praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_SECRET,
        user_agent="Base44Guide",
        username=REDDIT_USER,
        password=REDDIT_PASS
    )
    return reddit

def init_db():
    """Create posting tracker."""
    DB_PATH.parent.mkdir(exist_ok=True)
    db = sqlite3.connect(str(DB_PATH))
    db.execute("""CREATE TABLE IF NOT EXISTS posted (
        slug TEXT PRIMARY KEY,
        posted_at TEXT,
        reddit_url TEXT
    )""")
    db.commit()
    db.close()

def get_unposted_articles():
    """Get articles not yet posted to Reddit."""
    db = sqlite3.connect(str(DB_PATH))
    posted = {row[0] for row in db.execute("SELECT slug FROM posted").fetchall()}
    db.close()

    articles = []
    for f in sorted(ARTICLES_DIR.glob("senior-*.json")):
        data = json.loads(f.read_text(encoding="utf-8"))
        if data["slug"] not in posted:
            articles.append(data)

    return articles

def post_to_reddit(reddit, article):
    """Post article to Reddit."""
    title = article["title"]
    body = article["body"]

    # Extract first 500 chars of body for preview
    import re
    text = re.sub('<[^<]+?>', '', body)  # Strip HTML
    preview = text[:300] + "..."

    # Format post
    post_text = f"{preview}\n\n[Read full article](https://helpfulaiguru.substack.com)\n\nBuilt with Base44 - the AI-powered no-code app builder"

    try:
        subreddit = reddit.subreddit(SUBREDDIT)
        submission = subreddit.submit(
            title=title,
            selftext=post_text
        )
        return submission.url
    except Exception as e:
        print(f"  Error: {e}")
        return None

def main():
    """Post unposted articles to Reddit."""
    init_db()

    try:
        reddit = get_reddit()
        print("Auth OK\n")
    except Exception as e:
        print(f"Auth FAILED: {e}")
        return

    articles = get_unposted_articles()
    if not articles:
        print("No unposted articles!")
        return

    # Limit to 5 per day
    articles = articles[:5]

    print(f"Found {len(articles)} unposted articles (posting 5/day)\n")

    db = sqlite3.connect(str(DB_PATH))

    for i, article in enumerate(articles, 1):
        print(f"[{i}/{len(articles)}] {article['title'][:50]}...")

        url = post_to_reddit(reddit, article)
        if url:
            db.execute("INSERT OR REPLACE INTO posted VALUES (?, ?, ?)",
                      (article["slug"], datetime.now().isoformat(), url))
            db.commit()
            print(f"  OK: {url}")
        else:
            print(f"  FAIL")

    db.close()
    print(f"\nDone! Posted {len(articles)} articles to r/{SUBREDDIT}")

if __name__ == "__main__":
    main()
