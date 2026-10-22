#!/usr/bin/env python3
"""Sync shared chrome into every HTML page.

Source of truth:
  _shared/footer.html
  _shared/theme-init.js
  _shared/theme.js
  _shared/breadcrumb.css
  _shared/site-footer.css

Run from repo root:
  python3 scripts/sync-chrome.py
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOOTER = (ROOT / "_shared" / "footer.html").read_text(encoding="utf-8").strip() + "\n"

FOOTER_BLOCK = (
    '<!-- tcw:footer -->\n'
    '<link rel="stylesheet" href="/_shared/site-footer.css">\n'
    f"{FOOTER}"
    "<!-- /tcw:footer -->\n"
)

THEME_INIT = '<script src="/_shared/theme-init.js"></script>\n'
THEME_JS = '<script src="/_shared/theme.js"></script>\n'
BREADCRUMB_CSS = '<link rel="stylesheet" href="/_shared/breadcrumb.css">\n'
SECTION_NAV_CSS = '<link rel="stylesheet" href="/_shared/section-nav.css">\n'

# Old inline early theme (several formatting variants)
EARLY_THEME_RE = re.compile(
    r"<script>\s*\(function\s*\(\s*\)\s*\{\s*"
    r"var\s+t\s*=\s*localStorage\.getItem\(\s*['\"]tcw-theme['\"]\s*\)\s*;"
    r"[\s\S]*?</script>\s*",
    re.I,
)

# Generic theme click IIFE (not archives-specific — those also match; we replace all)
THEME_CLICK_RE = re.compile(
    r"<script>\s*/\*\s*Dark\s*/\s*light[\s\S]*?</script>\s*"
    r"|<script>\s*\(function\s*\(\s*\)\s*\{\s*"
    r"var\s+btn\s*=\s*document\.getElementById\(\s*['\"]themeToggle['\"]\s*\)\s*;"
    r"[\s\S]*?</script>\s*"
    r"|<script>\s*//\s*──\s*Dark\s*/\s*Light[\s\S]*?</script>\s*",
    re.I,
)

# Home-style theme script without IIFE wrapper comment
HOME_THEME_RE = re.compile(
    r"<script>\s*"
    r"//\s*──\s*Dark\s*/\s*Light mode toggle[\s\S]*?"
    r"</script>\s*",
    re.I,
)

BREADCRUMB_STYLE_RE = re.compile(
    r"<style\s+class=[\"']breadcrumb-styles[\"']\s*>[\s\S]*?</style>\s*",
    re.I,
)

OLD_FOOTER_RE = re.compile(
    r"(?:<!--\s*tcw:footer\s*-->[\s\S]*?<!--\s*/tcw:footer\s*-->\s*)|"
    r"(?:<link\s+rel=[\"']stylesheet[\"']\s+href=[\"']/\_shared/site-footer\.css[\"']\s*>\s*)?"
    r"<footer\s+class=[\"']site-footer[\"']\s*>[\s\S]*?</footer>\s*",
    re.I,
)

# Duplicate site-footer.css link left hanging
ORPHAN_FOOTER_CSS_RE = re.compile(
    r"<link\s+rel=[\"']stylesheet[\"']\s+href=[\"']/\_shared/site-footer\.css[\"']\s*>\s*",
    re.I,
)


def sync_page(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text

    # 1) Breadcrumb CSS: replace inline style block with shared link
    if BREADCRUMB_STYLE_RE.search(text):
        text = BREADCRUMB_STYLE_RE.sub(BREADCRUMB_CSS, text, count=1)
    elif 'href="/_shared/breadcrumb.css"' not in text and "breadcrumb-nav" in text:
        # Insert before </head> if crumb exists but no shared css yet
        if re.search(r"</head>", text, re.I):
            text = re.sub(
                r"</head>",
                BREADCRUMB_CSS + "</head>",
                text,
                count=1,
                flags=re.I,
            )

    # 2) Early theme init in <head>
    if EARLY_THEME_RE.search(text):
        text = EARLY_THEME_RE.sub(THEME_INIT, text, count=1)
    # One-liner early theme sometimes sits inside another <script> (e.g. SERIES_LIVE)
    text = re.sub(
        r"\s*\(function\s*\(\s*\)\s*\{\s*"
        r"var\s+t\s*=\s*localStorage\.getItem\(\s*['\"]tcw-theme['\"]\s*\)\s*;\s*"
        r"if\s*\(\s*t\s*===\s*['\"]light['\"]\s*\)\s*"
        r"document\.documentElement\.setAttribute\(\s*['\"]data-theme['\"]\s*,\s*['\"]light['\"]\s*\)\s*;\s*"
        r"\}\)\s*\(\s*\)\s*;",
        "",
        text,
    )
    if 'src="/_shared/theme-init.js"' not in text:
        # After breadcrumb css or before </head>
        if 'href="/_shared/breadcrumb.css"' in text:
            text = text.replace(
                BREADCRUMB_CSS.rstrip("\n"),
                BREADCRUMB_CSS.rstrip("\n") + "\n" + THEME_INIT.rstrip("\n"),
                1,
            )
        else:
            text = re.sub(
                r"</head>",
                THEME_INIT + "</head>",
                text,
                count=1,
                flags=re.I,
            )

    # 3) Remove old theme click handlers (including home + archives variants)
    text = HOME_THEME_RE.sub("", text)
    text = THEME_CLICK_RE.sub("", text)

    # 4) Footer: one shared block near end of body
    if OLD_FOOTER_RE.search(text):
        text = OLD_FOOTER_RE.sub("", text)
        # Drop orphan css links that belonged to the old footer
        # (FOOTER_BLOCK re-adds one)
        text = ORPHAN_FOOTER_CSS_RE.sub("", text)
    elif "<!-- tcw:footer -->" in text:
        text = re.sub(
            r"<!--\s*tcw:footer\s*-->[\s\S]*?<!--\s*/tcw:footer\s*-->\s*",
            "",
            text,
            count=1,
            flags=re.I,
        )

    # Ensure theme.js + footer before </body>
    # Remove existing shared script tags to avoid dupes, then re-add once
    text = re.sub(
        r'<script\s+src=["\']/_shared/theme\.js["\']\s*>\s*</script>\s*',
        "",
        text,
        flags=re.I,
    )

    injection = THEME_JS + FOOTER_BLOCK
    if re.search(r"</body>", text, re.I):
        text = re.sub(r"</body>", injection + "</body>", text, count=1, flags=re.I)
    else:
        text = text + injection

    # Section nav CSS: only pages with a real <nav class="nav ...">
    def has_real_section_nav(html: str) -> bool:
        for m in re.finditer(r"<nav([^>]*)>", html, re.I):
            cm = re.search(r'\bclass="([^"]*)"', m.group(1))
            if cm and "nav" in cm.group(1).split():
                return True
        return False

    if has_real_section_nav(text):
        if "section-nav.css" not in text:
            if 'href="/_shared/breadcrumb.css"' in text:
                text = text.replace(
                    BREADCRUMB_CSS.rstrip("\n"),
                    BREADCRUMB_CSS.rstrip("\n") + "\n" + SECTION_NAV_CSS.rstrip("\n"),
                    1,
                )
            else:
                text = re.sub(
                    r"</head>",
                    SECTION_NAV_CSS + "</head>",
                    text,
                    count=1,
                    flags=re.I,
                )
    else:
        text = re.sub(
            r'\n?<link rel="stylesheet" href="/_shared/section-nav\.css">\n?',
            "\n",
            text,
        )

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    updated = 0
    for path in sorted(ROOT.rglob("*.html")):
        if ".git" in path.parts:
            continue
        if path.resolve().is_relative_to(ROOT / "_shared"):
            # don't treat footer.html as a page
            continue
        if sync_page(path):
            updated += 1
            print("updated", path.relative_to(ROOT))
    print(f"done — {updated} pages")


if __name__ == "__main__":
    main()
