#!/usr/bin/env python3
"""
generate.py
Parses the WordPress XML export and regenerates all archive post pages.
Handles both Gutenberg block HTML and old plain-text posts correctly:
  - Strips WP block comments
  - Wraps plain-text paragraphs in <p> tags
  - Converts bare URLs to clickable <a> links

Run from inside the-archives/:
    python3 generate.py
Then re-run:
    python3 ../add-comments.py
    python3 ../add-share.py
"""

import os, re, xml.etree.ElementTree as ET
from datetime import datetime

XML_PATH = os.path.expanduser("~/Downloads/myl2ma.WordPress.2026-05-28.xml")
OUT_DIR  = os.path.dirname(os.path.abspath(__file__))

NS = {
    "wp":      "http://wordpress.org/export/1.2/",
    "content": "http://purl.org/rss/1.0/modules/content/",
}

# ── Shared CSS ─────────────────────────────────────────────────────────────
BASE_CSS = """
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0f; --bg-card: #12121a; --bg-card-alt: #181825;
  --bg-nav: rgba(10,10,15,0.92); --border: #2a2a3a;
  --text: #e0e0e8; --text-dim: #8888a0;
  --accent: #6c8cff; --accent2: #a78bfa; --accent3: #34d399;
  --accent5: #fbbf24; --radius: 12px;
  --mono: 'SF Mono','Fira Code','Cascadia Code',monospace;
  --sans: 'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
}
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: var(--sans);
       line-height: 1.8; font-size: 16px; overflow-x: hidden; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; color: var(--accent2); }
h1,h2,h3,h4 { font-weight: 700; line-height: 1.25; color: var(--text); }
h1 { font-size: clamp(1.8rem,4vw,2.8rem); }
h2 { font-size: 1.5rem; margin: 2em 0 0.5em; }
h3 { font-size: 1.2rem; color: var(--accent); margin: 1.8em 0 0.4em; }
h4 { font-size: 1rem; margin: 1.4em 0 0.3em; color: var(--text); }
p  { margin-bottom: 1em; color: var(--text-dim); }
p strong, p em, li strong { color: var(--text); }
ul,ol { margin: 0 0 1em 1.4em; color: var(--text-dim); }
li { margin-bottom: 0.35em; }
hr { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
pre { background: var(--bg-card-alt); border: 1px solid var(--border);
      border-radius: 8px; padding: 18px 20px; overflow-x: auto;
      font-family: var(--mono); font-size: 0.85rem; line-height: 1.6;
      color: var(--text); margin: 1.2em 0; }
code { font-family: var(--mono); background: var(--bg-card-alt);
       padding: 2px 6px; border-radius: 4px; font-size: 0.88em;
       color: var(--accent); }
pre code { background: none; padding: 0; font-size: inherit; color: var(--text); }
blockquote { border-left: 3px solid var(--accent); padding: 12px 20px;
             background: rgba(108,140,255,0.06); border-radius: 0 8px 8px 0;
             margin: 1.2em 0; color: var(--text-dim); font-style: italic; }
figure img { max-width: 100%; border-radius: 8px; border: 1px solid var(--border); }
figcaption { font-size: 0.82rem; color: var(--text-dim); text-align: center; margin-top: 8px; }
table { width: 100%; border-collapse: collapse; margin: 1.2em 0; font-size: 0.9rem; }
th { background: var(--bg-card-alt); color: var(--text);
     padding: 10px 14px; text-align: left; border: 1px solid var(--border); }
td { padding: 9px 14px; border: 1px solid var(--border); color: var(--text-dim); }
.container { max-width: 820px; margin: 0 auto; padding: 0 24px; }
/* breadcrumb */
.breadcrumb-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
  background: var(--bg-nav); backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); padding: 12px 24px;
  font-size: 0.85rem; border-bottom: 1px solid var(--border);
  font-family: var(--sans);
}
.breadcrumb-nav a { color: var(--accent); text-decoration: none; }
.breadcrumb-nav a:hover { text-decoration: underline; }
.breadcrumb-nav .bc-sep { margin: 0 8px; color: #555; }
.breadcrumb-nav .bc-current { color: var(--text-dim); }
body { padding-top: 44px; }
/* hero */
.hero { padding: 80px 24px 40px; }
.hero .meta { font-family: var(--mono); font-size: 0.78rem;
              color: var(--text-dim); margin-bottom: 14px; letter-spacing: 0.5px; }
.hero h1 { margin-bottom: 0; }
/* post body */
.post-body { padding: 40px 24px 60px; }
/* prev/next nav */
.post-nav { display: flex; justify-content: space-between; gap: 16px;
            padding: 24px 24px 48px; max-width: 820px; margin: 0 auto;
            border-top: 1px solid var(--border); }
.post-nav a { font-size: 0.88rem; color: var(--text-dim); }
.post-nav a:hover { color: var(--accent); }
@media (max-width: 600px) {
  .hero { padding: 70px 16px 28px; }
  .post-body { padding: 24px 16px 48px; }
}
"""

# ── Helpers ────────────────────────────────────────────────────────────────

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text.strip())
    text = re.sub(r"-+", "-", text)
    return text[:60].strip("-")


def linkify(text):
    """Convert bare http/https URLs to clickable <a> tags."""
    url_pattern = re.compile(
        r'(?<!["\'=>])(https?://[^\s<>"\')\]]+)'
    )
    return url_pattern.sub(
        lambda m: f'<a href="{m.group(1)}" target="_blank" rel="noopener">{m.group(1)}</a>',
        text
    )


def clean_wp_content(html):
    """
    Strip WordPress block comments and ensure content is proper HTML.
    - If content already has HTML tags → just strip block comments + linkify bare URLs
    - If content is plain text → wrap in <p> tags and linkify URLs
    """
    if not html:
        return "<p><em>No content.</em></p>"

    # Remove WP block comments: <!-- wp:xxx --> and <!-- /wp:xxx -->
    html = re.sub(r"<!--\s*/?wp:[^>]*-->", "", html)
    html = re.sub(r"\n{3,}", "\n\n", html).strip()

    # Check if the content has any HTML tags
    has_html = bool(re.search(r"<(p|h[1-6]|ul|ol|li|div|pre|code|blockquote|figure|table)\b", html, re.I))

    if has_html:
        # Content already has HTML — just linkify any remaining bare URLs
        return linkify(html)
    else:
        # Plain text — convert to HTML paragraphs and linkify URLs
        paragraphs = [p.strip() for p in re.split(r"\n\n+", html) if p.strip()]
        result = []
        for para in paragraphs:
            # If the whole paragraph is a bare URL, make it a standalone link
            if re.match(r'^https?://\S+$', para):
                result.append(f'<p><a href="{para}" target="_blank" rel="noopener">{para}</a></p>')
            else:
                # Linkify any inline URLs and wrap in <p>
                para = linkify(para)
                # Convert single newlines within a paragraph to <br>
                para = para.replace("\n", "<br>")
                result.append(f"<p>{para}</p>")
        return "\n".join(result)


def build_post_html(title, date_str, content, year, prev_link, prev_title, next_link, next_title):
    prev_html = f'<a href="{prev_link}">← {prev_title[:55]}</a>' if prev_link else "<span></span>"
    next_html = f'<a href="{next_link}">{next_title[:55]} →</a>' if next_link else "<span></span>"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — The Archives · llamasearch</title>
<style>{BASE_CSS}</style>
</head>
<body>

<nav class="breadcrumb-nav">
  <a href="../../../">The Context Window</a>
  <span class="bc-sep">/</span>
  <a href="../../">The Archives</a>
  <span class="bc-sep">/</span>
  <a href="../">{year}</a>
  <span class="bc-sep">/</span>
  <span class="bc-current">{title[:45]}</span>
</nav>

<header class="hero container">
  <div class="meta">{date_str}</div>
  <h1>{title}</h1>
</header>

<article class="post-body container">
{content}
</article>

<div class="post-nav">
  {prev_html}
  {next_html}
</div>

</body>
</html>
"""


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    print(f"Parsing: {XML_PATH}")
    tree = ET.parse(XML_PATH)
    channel = tree.getroot().find("channel")

    posts = []
    for item in channel.findall("item"):
        pt = item.find("wp:post_type", NS)
        st = item.find("wp:status", NS)
        if pt is None or pt.text != "post": continue
        if st is None or st.text != "publish": continue

        title   = (item.find("title").text or "Untitled").strip()
        date_s  = (item.find("wp:post_date", NS).text or "2018-01-01").strip()
        content = clean_wp_content(item.find("content:encoded", NS).text or "")

        try:
            dt = datetime.strptime(date_s[:10], "%Y-%m-%d")
        except ValueError:
            dt = datetime(2018, 1, 1)

        posts.append({
            "title":   title,
            "date":    dt.strftime("%b %d, %Y"),
            "year":    str(dt.year),
            "slug":    slugify(title),
            "content": content,
        })

    posts.sort(key=lambda p: p["date"])

    # Group by year
    from collections import defaultdict
    by_year = defaultdict(list)
    for p in posts:
        by_year[p["year"]].append(p)

    total = 0
    for year, year_posts in by_year.items():
        year_dir = os.path.join(OUT_DIR, year)
        os.makedirs(year_dir, exist_ok=True)

        for idx, post in enumerate(year_posts):
            post_dir = os.path.join(year_dir, post["slug"])
            os.makedirs(post_dir, exist_ok=True)

            prev_p = year_posts[idx - 1] if idx > 0 else None
            next_p = year_posts[idx + 1] if idx < len(year_posts) - 1 else None

            html = build_post_html(
                title      = post["title"],
                date_str   = post["date"],
                content    = post["content"],
                year       = year,
                prev_link  = f"../{prev_p['slug']}/" if prev_p else "",
                prev_title = prev_p["title"] if prev_p else "",
                next_link  = f"../{next_p['slug']}/" if next_p else "",
                next_title = next_p["title"] if next_p else "",
            )

            with open(os.path.join(post_dir, "index.html"), "w", encoding="utf-8") as f:
                f.write(html)
            total += 1

        print(f"  {year}: {len(year_posts)} posts")

    print(f"\nDone. Total: {total} posts regenerated.")
    print("Now run: python3 ../add-comments.py && python3 ../add-share.py")


if __name__ == "__main__":
    main()
