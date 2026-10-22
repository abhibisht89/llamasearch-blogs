# Shared chrome

Edit these files, then sync into every page:

```bash
python3 scripts/sync-chrome.py
```

| File | Role |
|---|---|
| `footer.html` | Site footer markup (copyright + socials) |
| `site-footer.css` | Footer + chapter prev/next styles |
| `theme-init.js` | Apply saved theme in `<head>` (before paint) |
| `theme.js` | Theme toggle click handler (+ Utterances) |
| `breadcrumb.css` | Breadcrumb bar + theme button shell |
| `section-nav.css` | In-page section nav shell (`.nav` / `.nav-reveal`) |
| `series-index.css` | Series TOC layout (hero + numbered `.blog-card` list) |

Page-specific breadcrumb and section-nav *links* stay in each HTML file. Only the shell CSS is shared.

Series index pages (`*/index.html` chapter lists) should match Tokens, Transformers & Truth: title, one description, flat chapter cards — no arc headers, stats, or badges. Link `series-index.css` for that chrome.
