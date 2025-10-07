// /api/fetchProject.js
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const html = await response.text();

    // Rewrite relative CSS/JS URLs to go through the same proxy
    const rewritten = html
      .replace(/<link\s+([^>]*?)href="(.*?)"/g, (match, attr, href) => {
        if (href.startsWith("http")) return match;
        const newHref = `/api/fetchProject?url=${encodeURIComponent(new URL(href, url).href)}`;
        return `<link ${attr} href="${newHref}"`;
      })
      .replace(/<script\s+([^>]*?)src="(.*?)"/g, (match, attr, src) => {
        if (src.startsWith("http")) return match;
        const newSrc = `/api/fetchProject?url=${encodeURIComponent(new URL(src, url).href)}`;
        return `<script ${attr} src="${newSrc}"`;
      });

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(rewritten);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
