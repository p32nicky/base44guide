import json
import requests
from pathlib import Path
from urllib.parse import unquote

# Load article
article = json.loads(Path('content/articles/senior-build-a-collectibles-inventory-system.json').read_text())

# Creds
pub = 'helpfulaiguru.substack.com'
sid = unquote('s%3Azkfu_NiZBWWCNKCRtPLLmHCiudawk9_U.r3CrmTrAulYUT%2F1j7YHXiw2HP6ufCFytzMlj09mFLBE')
cf = 'HnyjgrYXv8T1nFS.BD0Xof0vglMpT.hjWtgbd22KXRw-1780970575-1.2.1.1-Tu.gTEHtRJ2oOtsSdldbDFtHmkwvxmZ5W99TQSSIMYf.uYRaFxLCn1HdXoseyk6txPATLpaEmU1mT.9KzmgSkGMAOeX5g4jPzjwW.PIWttcBXtGeScHrg0gqGBgHn8XlHVZOsHmDKYZEWUPbs9et.9_TXpeNjCWrTBwEJila7223nliMRDmYOoCFdCP9dLyNX2tGHcHkKa5yNRvrXjFx97aX7PhUwtzB_FkWyS3IwDNl2adeKIHuAsFI9SgX204YrQFfV5496JvtCCGed5JQ.6MISb3tl7YegTtx.gXnXPra2On.Fni4A7EXFHooxVMsysyGJNIHXvmJyvb1lrYfpA'
lli = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxODAyMzYyMSwiaWF0IjoxNzgwOTcwOTI1LCJleHAiOjE3ODM1NjI5MjUsImF1ZCI6Imxpa2VseS1sb2dnZWQtaW4ifQ.p1Ah5bnq7fKCbl1UoNY1QpnuccMjDLoI9UsifvtOuco'

s = requests.Session()
s.cookies.set('substack.sid', sid)
s.cookies.set('cf_clearance', cf)
s.cookies.set('substack.lli', lli)
s.headers.update({'User-Agent': 'Mozilla/5.0'})

# Test auth
auth = s.get(f'https://{pub}/api/v1/publication', timeout=10)
print(f'Auth: {auth.status_code}')
if auth.status_code != 200:
    print(f'FAIL: {auth.text[:100]}')
    exit(1)

# Check article
title = article['title']
desc = article['metaDescription']
body = article['body']
image = article.get('coverImage', '')

print(f'Title: {title}')
print(f'Image: {image}')
print(f'Has senior: {"senior" in body.lower()}')
print(f'Body length: {len(body)}\n')

# Create draft with minimal body
print('Posting draft...')
payload = {
    'draft_title': title,
    'draft_subtitle': desc,
    'draft_body': '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Senior guide to building apps without coding."}]}]}',
    'audience': 'everyone',
    'section_chosen': False,
    'draft_bylines': [],
}
if image:
    payload['cover_image'] = image

print(f'Payload keys: {list(payload.keys())}')
r = s.post(f'https://{pub}/api/v1/drafts', json=payload, timeout=20)
print(f'Draft: {r.status_code}')
if r.status_code not in (200, 201):
    print(f'ERROR: {r.text[:200]}')
    exit(1)

draft_id = r.json().get('id')
print(f'Draft ID: {draft_id}')

# Publish
pub_r = s.post(f'https://{pub}/api/v1/drafts/{draft_id}/publish', json={'send_email': False}, timeout=20)
print(f'Publish: {pub_r.status_code}')
if pub_r.status_code in (200, 201):
    url = pub_r.json().get('url', f'https://{pub}/p/{draft_id}')
    print(f'SUCCESS: {url}')
else:
    print(f'ERROR: {pub_r.text[:200]}')
