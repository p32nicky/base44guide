"""
Post Base44 articles to helpfulaiguru.substack.com
Uses session cookies + CSRF token (from browser)
Run: python post-to-substack.py

SETUP:
1. Log in to https://helpfulaiguru.substack.com/publish/post
2. Open DevTools > Network > copy cookie headers:
   - substack.sid
   - cf_clearance
   - substack.lli
3. Update SESSION_COOKIE, CF_CLEARANCE, SUBSTACK_LLI below
"""
import time
import json
import sqlite3
import re
from pathlib import Path
from datetime import datetime, timezone
import requests

PUBLICATION = "helpfulaiguru.substack.com"
API_BASE = f"https://{PUBLICATION}/api/v1"
BATCH = 5  # articles per run
ARTICLES_DIR = Path(r"C:\base44site\content\articles")
DB_PATH = Path(r"C:\base44site\data\substack_posted.db")

# Substack credentials (fresh 2026-06-21)
SESSION_COOKIE = "s%3Azkfu_NiZBWWCNKCRtPLLmHCiudawk9_U.r3CrmTrAulYUT%2F1j7YHXiw2HP6ufCFytzMlj09mFLBE"
CF_CLEARANCE = "HnyjgrYXv8T1nFS.BD0Xof0vglMpT.hjWtgbd22KXRw-1780970575-1.2.1.1-Tu.gTEHtRJ2oOtsSdldbDFtHmkwvxmZ5W99TQSSIMYf.uYRaFxLCn1HdXoseyk6txPATLpaEmU1mT.9KzmgSkGMAOeX5g4jPzjwW.PIWttcBXtGeScHrg0gqGBgHn8XlHVZOsHmDKYZEWUPbs9et.9_TXpeNjCWrTBwEJila7223nliMRDmYOoCFdCP9dLyNX2tGHcHkKa5yNRvrXjFx97aX7PhUwtzB_FkWyS3IwDNl2adeKIHuAsFI9SgX204YrQFfV5496JvtCCGed5JQ.6MISb3tl7YegTtx.gXnXPra2On.Fni4A7EXFHooxVMsysyGJNIHXvmJyvb1lrYfpA"
CF_BM = ""
SUBSTACK_LLI = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxODAyMzYyMSwiaWF0IjoxNzgwOTcwOTI1LCJleHAiOjE3ODM1NjI5MjUsImF1ZCI6Imxpa2VseS1sb2dnZWQtaW4ifQ.p1Ah5bnq7fKCbl1UoNY1QpnuccMjDLoI9UsifvtOuco"


def init_db():
    """Create posted tracking table."""
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS posted (
            slug TEXT PRIMARY KEY,
            posted_at TEXT,
            substack_url TEXT
        )
    """)
    conn.commit()
    conn.close()


def get_posted_slugs():
    """Get set of already-posted article slugs."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT slug FROM posted")
    slugs = set(row[0] for row in cur.fetchall())
    conn.close()
    return slugs


def mark_posted(slug, url):
    """Track posted article."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT OR REPLACE INTO posted (slug, posted_at, substack_url) VALUES (?, ?, ?)",
        (slug, datetime.now(timezone.utc).isoformat(), url)
    )
    conn.commit()
    conn.close()


def get_session():
    """Create session with cookies."""
    from urllib.parse import unquote
    s = requests.Session()
    s.cookies.set("substack.sid", unquote(SESSION_COOKIE))
    if CF_CLEARANCE:
        s.cookies.set("cf_clearance", CF_CLEARANCE)
    if CF_BM:
        s.cookies.set("__cf_bm", CF_BM)
    s.cookies.set("substack.lli", SUBSTACK_LLI)
    s.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": f"https://{PUBLICATION}/publish/post",
        "Origin": f"https://{PUBLICATION}",
    })
    return s


def html_to_substack(html_str):
    """Convert HTML to Substack's ProseMirror doc format."""
    import html as html_mod
    from html.parser import HTMLParser

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


def post_article(article, session, user_id=None):
    """Create draft + publish article to Substack."""
    title = article["title"]
    meta_desc = article.get("metaDescription", "")[:300]
    body_html = article.get("body", "")

    # Append affiliate CTA if not present
    if "[base44guide.io]" not in body_html.lower():
        body_html += f'<p><a href="https://base44guide.io">Read more Base44 guides</a></p>'

    body_doc = html_to_substack(body_html)

    # Inject image node after h1 if we have a cover image
    cover_image = article.get("coverImage", "")
    if cover_image:
        try:
            body_json = json.loads(body_doc)
            # Insert image node after first heading
            image_node = {
                "type": "image",
                "attrs": {
                    "src": cover_image,
                    "alt": title,
                }
            }
            # Insert after h1 (usually first node)
            if body_json.get("content") and len(body_json["content"]) > 0:
                body_json["content"].insert(1, image_node)
            body_doc = json.dumps(body_json)
        except:
            pass  # If injection fails, use body_doc as-is

    draft_payload = {
        "draft_title": title,
        "draft_subtitle": meta_desc,
        "draft_body": body_doc,
        "audience": "everyone",
        "section_chosen": False,
        "draft_bylines": [{"id": user_id, "is_guest": False}] if user_id else [],
    }

    # Add cover image if available
    if cover_image:
        draft_payload["cover_image"] = cover_image

    # Create draft
    resp = session.post(f"{API_BASE}/drafts", json=draft_payload, timeout=20)
    if resp.status_code not in (200, 201):
        return {"error": f"Draft {resp.status_code}: {resp.text[:200]}"}

    draft_id = resp.json().get("id")
    if not draft_id:
        return {"error": "No draft ID returned"}

    # Publish draft
    pub = session.post(f"{API_BASE}/drafts/{draft_id}/publish",
                       json={"send_email": False}, timeout=20)
    if pub.status_code in (200, 201):
        url = pub.json().get("url", f"https://{PUBLICATION}/p/{draft_id}")
        return {"url": url}

    return {"error": f"Publish {pub.status_code}: {pub.text[:200]}"}


def get_next_unposted(limit=BATCH):
    """Load unposted SENIOR articles from content/articles/senior-*.json"""
    posted = get_posted_slugs()
    articles = []

    for json_file in sorted(ARTICLES_DIR.glob("senior-*.json"))[:limit*2]:  # lookahead
        try:
            article = json.loads(json_file.read_text(encoding="utf-8"))
            slug = article.get("slug") or json_file.stem

            # Skip if already posted or has error
            if slug in posted or article.get("error"):
                continue

            articles.append(article)
            if len(articles) >= limit:
                break
        except Exception as e:
            print(f"  Skip {json_file.name}: {e}")

    return articles


def main():
    init_db()
    session = get_session()

    # Test auth
    test = session.get(f"https://{PUBLICATION}/api/v1/publication", timeout=10)
    if test.status_code != 200:
        print(f"Auth failed: {test.status_code}")
        print(f"  Update SESSION_COOKIE, CF_CLEARANCE, SUBSTACK_LLI in script")
        return

    pub_data = test.json()
    user_id = pub_data.get("author_id") or pub_data.get("user_id")
    print(f"Auth OK | User: {user_id}\n")

    articles = get_next_unposted(BATCH)
    if not articles:
        print("All articles posted!")
        return

    print(f"Posting {len(articles)} articles to {PUBLICATION}...\n")
    posted = 0

    for i, article in enumerate(articles, 1):
        slug = article.get("slug") or "unknown"
        title = article.get("title", "Untitled")[:60]
        print(f"[{i}/{len(articles)}] {title}")

        result = post_article(article, session, user_id)
        if "url" in result:
            mark_posted(slug, result["url"])
            posted += 1
            print(f"  OK: {result['url']}\n")
        else:
            print(f"  ERROR: {result['error']}\n")

        time.sleep(3)

    remaining = len([f for f in ARTICLES_DIR.glob("*.json") if json.loads(f.read_text()).get("slug") not in get_posted_slugs()])
    print(f"\nDone! Posted {posted}/{len(articles)}")
    print(f"{remaining} articles remaining")


if __name__ == "__main__":
    main()
