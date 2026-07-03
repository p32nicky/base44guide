"""
Post Substack Notes (public short posts) 2x daily.
Picks random note from library, posts to followers.
Tracked in SQLite.
"""
import json
import random
import sqlite3
import requests
from pathlib import Path
from urllib.parse import unquote
from datetime import datetime

PUBLICATION = "helpfulaiguru.substack.com"
API_BASE = f"https://{PUBLICATION}/api/v1"

# Credentials
SESSION_COOKIE = "s%3Azkfu_NiZBWWCNKCRtPLLmHCiudawk9_U.r3CrmTrAulYUT%2F1j7YHXiw2HP6ufCFytzMlj09mFLBE"
CF_CLEARANCE = "HnyjgrYXv8T1nFS.BD0Xof0vglMpT.hjWtgbd22KXRw-1780970575-1.2.1.1-Tu.gTEHtRJ2oOtsSdldbDFtHmkwvxmZ5W99TQSSIMYf.uYRaFxLCn1HdXoseyk6txPATLpaEmU1mT.9KzmgSkGMAOeX5g4jPzjwW.PIWttcBXtGeScHrg0gqGBgHn8XlHVZOsHmDKYZEWUPbs9et.9_TXpeNjCWrTBwEJila7223nliMRDmYOoCFdCP9dLyNX2tGHcHkKa5yNRvrXjFx97aX7PhUwtzB_FkWyS3IwDNl2adeKIHuAsFI9SgX204YrQFfV5496JvtCCGed5JQ.6MISb3tl7YegTtx.gXnXPra2On.Fni4A7EXFHooxVMsysyGJNIHXvmJyvb1lrYfpA"
SUBSTACK_LLI = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxODAyMzYyMSwiaWF0IjoxNzgwOTcwOTI1LCJleHAiOjE3ODM1NjI5MjUsImF1ZCI6Imxpa2VseS1sb2dnZWQtaW4ifQ.p1Ah5bnq7fKCbl1UoNY1QpnuccMjDLoI9UsifvtOuco"

NOTES_FILE = Path("scripts/notes-library.json")
DB_PATH = Path("data/substack_notes.db")

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

def init_db():
    """Create notes tracking table."""
    DB_PATH.parent.mkdir(exist_ok=True)
    db = sqlite3.connect(str(DB_PATH))
    db.execute("""CREATE TABLE IF NOT EXISTS notes_posted (
        id INTEGER PRIMARY KEY,
        note TEXT,
        posted_at TEXT,
        substack_url TEXT
    )""")
    db.commit()
    db.close()

def get_notes():
    """Load notes from library."""
    if NOTES_FILE.exists():
        return json.loads(NOTES_FILE.read_text())
    return []

def get_unposted_note():
    """Get a random note that hasn't been posted recently."""
    notes = get_notes()
    if not notes:
        return None

    db = sqlite3.connect(str(DB_PATH))
    posted = {row[0] for row in db.execute("SELECT note FROM notes_posted").fetchall()}
    db.close()

    unposted = [n for n in notes if n not in posted]

    # If all posted, reset and allow re-posting
    if not unposted:
        db = sqlite3.connect(str(DB_PATH))
        db.execute("DELETE FROM notes_posted")
        db.commit()
        db.close()
        unposted = notes

    return random.choice(unposted) if unposted else None

def html_to_doc(text):
    """Convert text to ProseMirror JSON."""
    return '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"' + text.replace('"', '\\"') + '"}]}]}'

def post_note(session, note):
    """Post a note as Substack post (short post)."""
    body_doc = html_to_doc(note)

    payload = {
        "draft_title": "Note",
        "draft_subtitle": note[:100],
        "draft_body": body_doc,
        "audience": "everyone",
        "section_chosen": False,
        "draft_bylines": [],
    }

    # Create draft
    resp = session.post(f"{API_BASE}/drafts", json=payload, timeout=20)
    if resp.status_code not in (200, 201):
        print(f"  FAIL: {resp.status_code}")
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

    print(f"  FAIL: {pub.status_code}")
    return None

def main():
    """Post a random note."""
    init_db()

    session = get_session()

    # Test auth
    test = session.get(f"https://{PUBLICATION}/api/v1/publication", timeout=10)
    if test.status_code != 200:
        print(f"Auth FAILED: {test.status_code}")
        return

    print("Auth OK\n")

    # Get unposted note
    note = get_unposted_note()
    if not note:
        print("No notes available!")
        return

    print(f"Posting note...\n{note}\n")

    url = post_note(session, note)
    if url:
        # Track in DB
        db = sqlite3.connect(str(DB_PATH))
        db.execute("INSERT INTO notes_posted (note, posted_at, substack_url) VALUES (?, ?, ?)",
                  (note, datetime.now().isoformat(), url))
        db.commit()
        db.close()

        print(f"OK: {url}")
    else:
        print("Failed to post note")

if __name__ == "__main__":
    main()
