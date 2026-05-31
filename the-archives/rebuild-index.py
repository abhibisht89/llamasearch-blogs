#!/usr/bin/env python3
"""
rebuild-index.py
Regenerates the-archives/index.html with a clean year → numbered-list layout.

Run from inside the-archives/:
    python3 rebuild-index.py
"""

import os, re, xml.etree.ElementTree as ET
from datetime import datetime
from collections import defaultdict

XML_PATH = os.path.expanduser("~/Downloads/myl2ma.WordPress.2026-05-28.xml")
OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.html")

NS = {
    "wp":      "http://wordpress.org/export/1.2/",
    "content": "http://purl.org/rss/1.0/modules/content/",
}

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text.strip())
    text = re.sub(r"-+", "-", text)
    return text[:60].strip("-")

# ── Parse posts ────────────────────────────────────────────────────────────
tree = ET.parse(XML_PATH)
channel = tree.getroot().find("channel")

posts = []
for item in channel.findall("item"):
    pt = item.find("wp:post_type", NS)
    st = item.find("wp:status", NS)
    if pt is None or pt.text != "post": continue
    if st is None or st.text != "publish": continue

    title = (item.find("title").text or "Untitled").strip()
    date_s = (item.find("wp:post_date", NS).text or "2018-01-01").strip()
    dt = datetime.strptime(date_s[:10], "%Y-%m-%d")

    posts.append({
        "title": title,
        "date":  dt.strftime("%b %d, %Y"),
        "year":  str(dt.year),
        "slug":  slugify(title),
        "ts":    dt,
    })

posts.sort(key=lambda p: p["ts"])

by_year = defaultdict(list)
for p in posts:
    by_year[p["year"]].append(p)

total = len(posts)

# ── Build top-level index — year links only ───────────────────────────────
years_html = ""
for year in sorted(by_year.keys(), reverse=True):
    count = len(by_year[year])
    years_html += f"""
  <a class="year-card" href="{year}/">
    <span class="year-label">{year}</span>
    <span class="year-count">{count} post{'s' if count != 1 else ''}</span>
    <span class="year-arrow">→</span>
  </a>"""

# ── Build one index.html per year ─────────────────────────────────────────
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

YEAR_CSS = """
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0f; --bg-card: #12121a; --bg-card-alt: #181825;
  --bg-nav: rgba(10,10,15,0.92); --border: #2a2a3a;
  --text: #e0e0e8; --text-dim: #8888a0;
  --accent: #6c8cff; --accent2: #a78bfa; --accent3: #34d399;
  --radius: 14px;
  --mono: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: var(--sans);
       line-height: 1.7; font-size: 16px; overflow-x: hidden; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
h1, h2, h3 { font-weight: 700; line-height: 1.2; }

/* ── Breadcrumb ── */
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

/* ── Hero ── */
.hero {
  padding: 80px 24px 48px; text-align: center;
  position: relative; overflow: hidden;
}
.hero::before {
  content: ''; position: absolute; top: -200px; left: 50%;
  transform: translateX(-50%); width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(108,140,255,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.hero h1 {
  font-size: clamp(2.2rem, 5vw, 3.2rem); font-weight: 800;
  margin-bottom: 10px; letter-spacing: -0.5px;
}
.hero .sub {
  font-size: 0.9rem; color: var(--text-dim);
  font-family: var(--mono); letter-spacing: 0.5px;
}

/* ── Blog cards — same as series chapter indexes ── */
.blog-grid {
  display: grid; gap: 14px;
  padding: 32px 24px 100px;
  max-width: 900px; margin: 0 auto;
}
.blog-card {
  display: flex; align-items: center; gap: 20px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 22px 24px;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  text-decoration: none; color: inherit;
}
.blog-card:hover {
  border-color: var(--accent); transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(108,140,255,0.1); text-decoration: none;
}
.card-num {
  font-family: var(--mono); font-size: 1.3rem; font-weight: 700;
  color: var(--accent); min-width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(108,140,255,0.1); border-radius: 10px; flex-shrink: 0;
}
.card-content h3 { font-size: 1.05rem; color: var(--text); margin-bottom: 4px; }
.card-date {
  font-family: var(--mono); font-size: 0.72rem; color: var(--text-dim);
}
@media (max-width: 600px) {
  .blog-card { padding: 16px; gap: 14px; }
  .card-num { font-size: 1rem; min-width: 40px; height: 40px; }
  .card-content h3 { font-size: 0.95rem; }
}
"""

for year in sorted(by_year.keys()):
    year_posts = by_year[year]
    rows = ""
    for i, p in enumerate(year_posts, 1):
        rows += f"""
  <a class="blog-card" href="{p['slug']}/">
    <div class="card-num">{i:02d}</div>
    <div class="card-content">
      <h3>{p['title']}</h3>
      <div class="card-date">{p['date']}</div>
    </div>
  </a>"""

    year_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{year} — The Archives · llamasearch</title>
<style>{YEAR_CSS}</style>
</head>
<body>
<nav class="breadcrumb-nav">
  <a href="../../">The Context Window</a>
  <span class="bc-sep">/</span>
  <a href="../">The Archives</a>
  <span class="bc-sep">/</span>
  <span class="bc-current">{year}</span>
</nav>
<div class="hero">
  <h1>{year}</h1>
  <p class="sub">{len(year_posts)} post{'s' if len(year_posts) != 1 else ''}</p>
</div>
<div class="blog-grid">{rows}
</div>
</body>
</html>
"""
    year_dir = os.path.join(OUT_DIR, year)
    os.makedirs(year_dir, exist_ok=True)
    with open(os.path.join(year_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(year_html)
    print(f"  Year page written → {year}/index.html")

# ── Write top-level index.html ─────────────────────────────────────────────
html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Archives — Early Writing · llamasearch</title>
<style>
*, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
:root {{
  --bg: #0a0a0f; --bg-card: #12121a; --border: #2a2a3a;
  --text: #e0e0e8; --text-dim: #8888a0; --accent: #6c8cff;
  --radius: 12px;
  --mono: 'SF Mono','Fira Code','Cascadia Code',monospace;
  --sans: 'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
}}
html {{ scroll-behavior: smooth; }}
body {{ background: var(--bg); color: var(--text); font-family: var(--sans);
       line-height: 1.7; font-size: 16px; overflow-x: hidden; }}
a {{ color: var(--accent); text-decoration: none; }}
a:hover {{ text-decoration: underline; }}
.breadcrumb {{
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: rgba(10,10,15,0.92); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border); padding: 10px 24px;
  display: flex; align-items: center; gap: 8px;
  font-size: 0.82rem; font-family: var(--mono); color: #8888a0;
}}
.breadcrumb a {{ color: #8888a0; }}
.breadcrumb a:hover {{ color: var(--accent); text-decoration: none; }}
.breadcrumb .sep {{ color: #3a3a4a; }}
.breadcrumb .cur {{ color: var(--text); }}
.hero {{
  padding: 110px 24px 52px; text-align: center;
  position: relative; overflow: hidden;
}}
.hero::before {{
  content: ''; position: absolute; top: -200px; left: 50%;
  transform: translateX(-50%); width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(108,140,255,0.12) 0%, transparent 70%);
  pointer-events: none;
}}
.hero .badge {{
  display: inline-block; font-family: var(--mono); font-size: 0.75rem;
  letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 14px;
  border-radius: 20px; background: rgba(108,140,255,0.1); color: var(--accent);
  border: 1px solid rgba(108,140,255,0.2); margin-bottom: 18px;
}}
.hero h1 {{
  font-size: clamp(2rem,5vw,3rem); font-weight: 800;
  letter-spacing: -0.5px; margin-bottom: 14px;
}}
.hero .subtitle {{
  font-size: 1.05rem; color: var(--text-dim);
  max-width: 580px; margin: 0 auto 14px;
}}
.hero .note {{
  font-size: 0.88rem; color: var(--text-dim); max-width: 600px;
  margin: 0 auto; font-style: italic; opacity: 0.75; line-height: 1.7;
}}

/* ── Year cards ── */
.year-grid {{
  max-width: 820px; margin: 0 auto; padding: 32px 24px 100px;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}}
.year-card {{
  display: flex; flex-direction: column; justify-content: space-between;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 24px 22px;
  text-decoration: none; color: inherit;
  transition: border-color 0.2s, transform 0.2s;
  position: relative;
}}
.year-card:hover {{
  border-color: var(--accent); transform: translateY(-2px);
  text-decoration: none;
}}
.year-label {{
  font-size: 2rem; font-weight: 800; color: var(--text);
  font-family: var(--mono); letter-spacing: -1px;
  display: block; margin-bottom: 8px;
}}
.year-count {{
  font-family: var(--mono); font-size: 0.78rem; color: var(--text-dim);
}}
.year-arrow {{
  position: absolute; right: 18px; top: 50%;
  transform: translateY(-50%); color: var(--accent);
  font-size: 1.2rem; opacity: 0; transition: opacity 0.2s;
}}
.year-card:hover .year-arrow {{ opacity: 1; }}
</style>
</head>
<body>

<nav class="breadcrumb">
  <a href="../">The Context Window</a>
  <span class="sep">/</span>
  <span class="cur">The Archives</span>
</nav>

<div class="hero">
  <span class="badge">Archives · 2018 – 2024</span>
  <h1>The Archives</h1>
  <p class="subtitle">{total} posts from the early years — ML fundamentals, NLP, PyTorch, backpropagation, and more.</p>
  <p class="note">Originally published on <a href="https://llamasearch.uk" target="_blank" rel="noopener">llamasearch.uk</a>, which I'm no longer maintaining. Ported here so everything is in one place. Rougher writing than the newer series — early explorations — but the ideas hold up.</p>
</div>

<div class="year-grid">
{years_html}
</div>

</body>
</html>
"""

with open(OUT_PATH, "w", encoding="utf-8") as f:
    f.write(html)

print(f"Written → {OUT_PATH}")
print(f"Total posts: {total}")
