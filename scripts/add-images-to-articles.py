"""
Add stock image URLs to senior articles from free sources.
Uses: Unsplash direct links + Pexels
"""
import json
from pathlib import Path

ARTICLES_DIR = Path(r"C:\base44site\content\articles")

# Curated free stock image URLs for senior topics
SENIOR_IMAGES = {
    "rental": "https://images.unsplash.com/photo-1570129477492-45ac003000c0?w=800",  # Property
    "family": "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",  # Family
    "garden": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",  # Gardening
    "travel": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",  # Travel
    "learning": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",  # Laptop
    "business": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",  # Business
    "senior": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",  # People
    "hobby": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",  # Creative
    "health": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",  # Health
    "default": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",  # Default
}

def get_image_url(title):
    """Pick best image for article title."""
    title_lower = title.lower()
    for keyword, url in SENIOR_IMAGES.items():
        if keyword in title_lower:
            return url
    return SENIOR_IMAGES["default"]

def main():
    articles = sorted(ARTICLES_DIR.glob("senior-*.json"))
    print(f"Adding images to {len(articles)} senior articles...\n")

    for i, article_file in enumerate(articles, 1):
        article = json.loads(article_file.read_text(encoding="utf-8"))
        if article.get("coverImage"):
            print(f"[{i}/{len(articles)}] SKIP (has image): {article['title'][:50]}")
            continue

        image_url = get_image_url(article["title"])
        article["coverImage"] = image_url
        article_file.write_text(json.dumps(article, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[{i}/{len(articles)}] Added: {article['title'][:50]}")

    print(f"\nDone! All articles now have images.")

if __name__ == "__main__":
    main()
