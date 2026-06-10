"""
Fetch free stock images from Unsplash for senior articles.
Run: python fetch-article-images.py
"""
import json
import requests
from pathlib import Path
from urllib.parse import urlencode

ARTICLES_DIR = Path(r"C:\base44site\content\articles")
IMAGES_DIR = Path(r"C:\base44site\public\article-images")
UNSPLASH_API = "https://api.unsplash.com/search/photos"
UNSPLASH_KEY = "qo-SGPvlEFHLJH3w5sMvDqj8PAVzRz-_bvkHn1h3EFQ"  # Free tier

# Map keywords to senior-relevant stock image searches
IMAGE_QUERIES = {
    "rental property": "house rental property management",
    "airbnb": "vacation rental home",
    "genealogy": "family tree history",
    "family tree": "genealogy ancestry",
    "consulting": "business consultant meeting",
    "coaching": "life coach mentor",
    "tutoring": "teacher student learning",
    "wine collection": "wine cellar tasting",
    "book club": "reading group friends",
    "garden": "gardening plants flowers",
    "fitness": "senior exercise health",
    "meditation": "wellness peace mindfulness",
    "travel": "senior travel adventure",
    "grandkids": "grandparent grandchildren family",
    "retirement": "senior retirement relaxation",
    "volunteer": "community volunteering helping",
    "pet": "dog puppy pet care",
    "cooking": "senior kitchen cooking meal",
    "photography": "camera photography hobby",
    "writing": "author writer pen desk",
    "craft": "handmade crafting hobby",
    "hiking": "nature trail hiking outdoor",
    "bridge": "card game playing friends",
    "legacy": "senior wisdom experience",
    "mentor": "mentoring teaching guidance",
    "hobby": "passion hobbies creative",
    "business": "entrepreneur small business",
}

def get_search_term(title):
    """Extract search term from article title."""
    title_lower = title.lower()
    for keyword, search in IMAGE_QUERIES.items():
        if keyword in title_lower:
            return search
    # Fallback: check for common patterns
    if "rental" in title_lower or "property" in title_lower or "airbnb" in title_lower:
        return "vacation rental home"
    if "senior" in title_lower or "retire" in title_lower:
        return "senior people happy"
    if "app" in title_lower or "build" in title_lower:
        return "computer technology learning"
    # Default
    return "senior people technology"

def fetch_image(query):
    """Fetch best image from Unsplash."""
    params = {
        "query": query,
        "per_page": 1,
        "client_id": UNSPLASH_KEY,
    }
    try:
        r = requests.get(UNSPLASH_API, params=params, timeout=10)
        if r.status_code == 200:
            results = r.json().get("results", [])
            if results:
                return results[0]["urls"]["regular"]
    except Exception as e:
        print(f"  Image fetch failed: {e}")
    return None

def main():
    IMAGES_DIR.mkdir(exist_ok=True)

    articles = sorted(ARTICLES_DIR.glob("senior-*.json"))
    print(f"Processing {len(articles)} senior articles...\n")

    for i, article_file in enumerate(articles, 1):
        article = json.loads(article_file.read_text(encoding="utf-8"))
        if article.get("coverImage"):
            print(f"[{i}/{len(articles)}] SKIP {article['title'][:50]} (already has image)")
            continue

        title = article.get("title", "")
        query = get_search_term(title)

        print(f"[{i}/{len(articles)}] Fetching image for: {title[:50]}")
        print(f"  Query: {query}")

        image_url = fetch_image(query)
        if image_url:
            article["coverImage"] = image_url
            article_file.write_text(json.dumps(article, indent=2, ensure_ascii=False), encoding="utf-8")
            print(f"  OK: {image_url[:70]}...")
        else:
            print(f"  No image found")

    print(f"\nDone! Check articles for coverImage fields.")

if __name__ == "__main__":
    main()
