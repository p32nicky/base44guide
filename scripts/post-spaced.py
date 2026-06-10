"""
Post articles to Substack with 5-minute spacing between posts.
Run: python scripts/post-spaced.py
"""
import json
import time
from pathlib import Path
from urllib.parse import unquote
from datetime import datetime
import requests
from html.parser import HTMLParser
import html as html_mod

PUBLICATION = "helpfulaiguru.substack.com"
API_BASE = f"https://{PUBLICATION}/api/v1"

# Credentials
SESSION_COOKIE = "s%3Azkfu_NiZBWWCNKCRtPLLmHCiudawk9_U.r3CrmTrAulYUT%2F1j7YHXiw2HP6ufCFytzMlj09mFLBE"
CF_CLEARANCE = "HnyjgrYXv8T1nFS.BD0Xof0vglMpT.hjWtgbd22KXRw-1780970575-1.2.1.1-Tu.gTEHtRJ2oOtsSdldbDFtHmkwvxmZ5W99TQSSIMYf.uYRaFxLCn1HdXoseyk6txPATLpaEmU1mT.9KzmgSkGMAOeX5g4jPzjwW.PIWttcBXtGeScHrg0gqGBgHn8XlHVZOsHmDKYZEWUPbs9et.9_TXpeNjCWrTBwEJila7223nliMRDmYOoCFdCP9dLyNX2tGHcHkKa5yNRvrXjFx97aX7PhUwtzB_FkWyS3IwDNl2adeKIHuAsFI9SgX204YrQFfV5496JvtCCGed5JQ.6MISb3tl7YegTtx.gXnXPra2On.Fni4A7EXFHooxVMsysyGJNIHXvmJyvb1lrYfpA"
SUBSTACK_LLI = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxODAyMzYyMSwiaWF0IjoxNzgwOTcwOTI1LCJleHAiOjE3ODM1NjI5MjUsImF1ZCI6Imxpa2VseS1sb2dnZWQtaW4ifQ.p1Ah5bnq7fKCbl1UoNY1QpnuccMjDLoI9UsifvtOuco"

ARTICLES_DIR = Path("scripts/senior-articles-generated")
SPACING_SECONDS = 180  # 3 minutes

def get_session():
    """Create authenticated session."""
    s = requests.Session()
    s.cookies.set("substack.sid", unquote(SESSION_COOKIE))
    s.cookies.set("cf_clearance", CF_CLEARANCE)
    s.cookies.set("substack.lli", SUBSTACK_LLI)
    s.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    return s

def html_to_substack(html_str):
    """Convert HTML to ProseMirror JSON."""
    class Parser(HTMLParser):
        def __init__(self):
            super().__init__()
            self.nodes = []
            self._current = []
            self._marks = []
            self._list_items = []
            self._in_list = False

        def _text_node(self, text):
            if not text: return None
            node = {"type": "text", "text": text}
            if self._marks:
                node["marks"] = list(self._marks)
            return node

        def _flush(self):
            content = [n for n in self._current if n]
            if content:
                self.nodes.append({"type": "paragraph", "content": content})
            self._current = []

        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            if tag in ("h1","h2","h3","h4"):
                self._flush()
            elif tag == "p":
                self._flush()
            elif tag == "ul":
                self._in_list = True
                self._list_items = []
            elif tag == "li":
                self._current = []
            elif tag in ("strong","b"):
                self._marks.append({"type": "bold"})
            elif tag == "a":
                href = attrs.get("href", "")
                self._marks.append({"type": "link", "attrs": {"href": href}})

        def handle_endtag(self, tag):
            if tag in ("h1","h2","h3","h4"):
                level = int(tag[1])
                content = [n for n in self._current if n]
                if content:
                    self.nodes.append({"type": "heading", "attrs": {"level": level}, "content": content})
                self._current = []
            elif tag == "p":
                content = [n for n in self._current if n]
                if content:
                    self.nodes.append({"type": "paragraph", "content": content})
                self._current = []
            elif tag == "li":
                content = [n for n in self._current if n]
                if content:
                    self._list_items.append({"type": "listItem", "content": [{"type": "paragraph", "content": content}]})
                self._current = []
            elif tag == "ul":
                if self._list_items:
                    self.nodes.append({"type": "bulletList", "content": self._list_items})
                self._list_items = []
                self._in_list = False
            elif tag in ("strong","b"):
                self._marks = [m for m in self._marks if m["type"] != "bold"]
            elif tag == "a":
                self._marks = [m for m in self._marks if m["type"] != "link"]

        def handle_data(self, data):
            data = html_mod.unescape(data)
            if data.strip():
                node = self._text_node(data)
                if node:
                    self._current.append(node)

    p = Parser()
    p.feed(html_str)
    p._flush()
    doc = {"type": "doc", "content": p.nodes or [{"type": "paragraph", "content": [{"type": "text", "text": " "}]}]}
    return json.dumps(doc)

def get_unposted_articles():
    """Get list of unposted senior articles."""
    # Load posted history
    db_path = Path("data/substack_posted.db")
    posted = set()

    if db_path.exists():
        import sqlite3
        db = sqlite3.connect(str(db_path))
        posted = {row[0] for row in db.execute("SELECT slug FROM posted").fetchall()}
        db.close()

    # Get all senior articles
    articles = []
    for f in sorted(ARTICLES_DIR.glob("senior-*.json")):
        data = json.loads(f.read_text(encoding="utf-8"))
        if data["slug"] not in posted:
            articles.append(data)

    return articles

def post_article(article, session):
    """Post single article to Substack."""
    title = article["title"]
    meta_desc = article.get("metaDescription", "")[:300]
    body_html = article.get("body", "")
    cover_image = article.get("coverImage", "")

    body_doc = html_to_substack(body_html)

    # Inject image node if available
    if cover_image:
        try:
            body_json = json.loads(body_doc)
            image_node = {
                "type": "image",
                "attrs": {
                    "src": cover_image,
                    "alt": title,
                }
            }
            if body_json.get("content") and len(body_json["content"]) > 0:
                body_json["content"].insert(1, image_node)
            body_doc = json.dumps(body_json)
        except:
            pass

    draft_payload = {
        "draft_title": title,
        "draft_subtitle": meta_desc,
        "draft_body": body_doc,
        "audience": "everyone",
        "section_chosen": False,
        "draft_bylines": [],
    }

    if cover_image:
        draft_payload["cover_image"] = cover_image

    # Create draft
    resp = session.post(f"{API_BASE}/drafts", json=draft_payload, timeout=20)
    if resp.status_code not in (200, 201):
        return None

    draft_id = resp.json().get("id")
    if not draft_id:
        return None

    # Publish
    pub = session.post(f"{API_BASE}/drafts/{draft_id}/publish",
                       json={"send_email": False}, timeout=20)
    if pub.status_code in (200, 201):
        url = pub.json().get("url", f"https://{PUBLICATION}/p/{draft_id}")
        return url

    return None

def main():
    """Main posting loop - continuous, picks up new articles as they're generated."""
    session = get_session()

    # Test auth
    test = session.get(f"https://{PUBLICATION}/api/v1/publication", timeout=10)
    if test.status_code != 200:
        print(f"Auth FAILED: {test.status_code}")
        return

    print(f"Auth OK")
    print(f"Spacing: {SPACING_SECONDS}s between posts")
    print(f"Running continuously - will pick up new articles as they're generated\n")

    # Post articles with spacing
    import sqlite3
    db_path = Path("data/substack_posted.db")
    db_path.parent.mkdir(exist_ok=True)
    db = sqlite3.connect(str(db_path))
    db.execute("""CREATE TABLE IF NOT EXISTS posted (
        slug TEXT PRIMARY KEY,
        posted_at TEXT,
        substack_url TEXT
    )""")

    total_posted = 0

    while True:
        articles = get_unposted_articles()

        if not articles:
            print(f"\nNo unposted articles. Waiting 30s to check again... (Total posted: {total_posted})", flush=True)
            time.sleep(30)
            continue

        print(f"\nFound {len(articles)} unposted articles\n")

        for i, article in enumerate(articles):
            print(f"[{total_posted+i+1}] {article['title'][:50]}...", flush=True)

            url = post_article(article, session)
            if url:
                db.execute("INSERT OR REPLACE INTO posted VALUES (?, ?, ?)",
                          (article["slug"], datetime.now().isoformat(), url))
                db.commit()
                print(f"  OK: {url}")
                total_posted += 1
            else:
                print(f"  FAIL")

            # Wait before next post (except on last)
            if i < len(articles) - 1:
                print(f"  Waiting {SPACING_SECONDS}s...", flush=True)
                time.sleep(SPACING_SECONDS)

    db.close()

if __name__ == "__main__":
    main()
