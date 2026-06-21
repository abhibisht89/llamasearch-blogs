/** Legacy chapter page — redirect to main TOC (one-click navigation). */
const params = new URLSearchParams(location.search);
const chapter = params.get("chapter");
if (chapter) {
  location.replace(`watson.html#${chapter}`);
} else {
  location.replace("watson.html");
}
