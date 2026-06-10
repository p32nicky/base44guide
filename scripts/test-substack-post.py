"""
Test posting 1 article to Substack.
Run: python test-substack-post.py
"""
import json
import time
import re
from pathlib import Path
import requests
from urllib.parse import unquote

PUBLICATION = "helpfulaiguru.substack.com"
API_BASE = f"https://{PUBLICATION}/api/v1"

# Credentials (fresh 2026-06-21)
SESSION_COOKIE = "s%3Azkfu_NiZBWWCNKCRtPLLmHCiudawk9_U.r3CrmTrAulYUT%2F1j7YHXiw2HP6ufCFytzMlj09mFLBE"
CF_CLEARANCE = "HnyjgrYXv8T1nFS.BD0Xof0vglMpT.hjWtgbd22KXRw-1780970575-1.2.1.1-Tu.gTEHtRJ2oOtsSdldbDFtHmkwvxmZ5W99TQSSIMYf.uYRaFxLCn1HdXoseyk6txPATLpaEmU1mT.9KzmgSkGMAOeX5g4jPzjwW.PIWttcBXtGeScHrg0gqGBgHn8XlHVZOsHmDKYZEWUPbs9et.9_TXpeNjCWrTBwEJila7223nliMRDmYOoCFdCP9dLyNX2tGHcHkKa5yNRvrXjFx97aX7PhUwtzB_FkWyS3IwDNl2adeKIHuAsFI9SgX204YrQFfV5496JvtCCGed5JQ.6MISb3tl7YegTtx.gXnXPra2On.Fni4A7EXFHooxVMsysyGJNIHXvmJyvb1lrYfpA"
CF_BM = ""
SUBSTACK_LLI = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxODAyMzYyMSwiaWF0IjoxNzgwOTcwOTI1LCJleHAiOjE3ODM1NjI5MjUsImF1ZCI6Imxpa2VseS1sb2dnZWQtaW4ifQ.p1Ah5bnq7fKCbl1UoNY1QpnuccMjDLoI9UsifvtOuco"

ARTICLES_DIR = Path(r"C:\base44site\content\articles")

def get_session():
    """Create session with auth."""
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
    """Convert HTML to ProseMirror."""
    import html as html_mod
    from html.parser import HTMLParser
    import json

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

def test_post():
    """Test post 1 article."""
    # Get first senior article
    articles = sorted(ARTICLES_DIR.glob("senior-*.json"))
    if not articles:
        print("No senior articles found!")
        return

    article_data = json.loads(articles[0].read_text(encoding="utf-8"))
    print(f"Article: {article_data['title']}\n")

    session = get_session()

    # Test auth
    test = session.get(f"https://{PUBLICATION}/api/v1/publication", timeout=10)
    print(f"Auth: {test.status_code}")
    if test.status_code != 200:
        print(f"Auth FAILED: {test.text[:200]}")
        return

    pub_data = test.json()
    user_id = pub_data.get("author_id") or pub_data.get("user_id")
    print(f"User ID: {user_id}\n")

    # Prepare post
    title = article_data.get("title", "")
    meta_desc = article_data.get("metaDescription", "")[:300]
    body_html = article_data.get("body", "")
    cover_image = article_data.get("coverImage", "")

    body_doc = html_to_substack(body_html)

    draft_payload = {
        "draft_title": title,
        "draft_subtitle": meta_desc,
        "draft_body": body_doc,
        "audience": "everyone",
        "section_chosen": False,
        "draft_bylines": [{"id": user_id, "is_guest": False}] if user_id else [],
    }

    if cover_image:
        draft_payload["cover_image"] = cover_image

    print("Creating draft...")
    resp = session.post(f"{API_BASE}/drafts", json=draft_payload, timeout=20)
    print(f"Draft response: {resp.status_code}")
    print(f"Response: {resp.text[:300]}\n")

    if resp.status_code not in (200, 201):
        print("FAILED to create draft")
        return

    draft_id = resp.json().get("id")
    if not draft_id:
        print("No draft ID!")
        return

    print(f"Draft ID: {draft_id}")
    print("Publishing...\n")

    pub = session.post(f"{API_BASE}/drafts/{draft_id}/publish",
                       json={"send_email": False}, timeout=20)
    print(f"Publish response: {pub.status_code}")
    print(f"Response: {pub.text[:300]}\n")

    if pub.status_code in (200, 201):
        url = pub.json().get("url", f"https://{PUBLICATION}/p/{draft_id}")
        print(f"SUCCESS!")
        print(f"URL: {url}")
    else:
        print(f"FAILED to publish: {pub.status_code}")

if __name__ == "__main__":
    test_post()
