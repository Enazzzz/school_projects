// /api/proxy.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url, base } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const decodedUrl = decodeURIComponent(url);
    const response = await fetch(decodedUrl);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    let contentType = response.headers.get("content-type");

    // If HTML, rewrite relative links
    if (contentType && contentType.includes("text/html")) {
      let html = await response.text();
      const baseUrl = base ? decodeURIComponent(base) : new URL(decodedUrl).origin + "/";

      html = html.replace(/(src|href)=["'](.*?)["']/g, (match, attr, path) => {
        if (!path || path.startsWith("http") || path.startsWith("#")) return match;

        // Resolve relative to base URL
        const resolved = new URL(path, baseUrl).href;
        return `${attr}="/api/proxy?url=${encodeURIComponent(resolved)}&base=${encodeURIComponent(baseUrl)}"`;
      });

      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    }

    // Otherwise, just pipe the file (CSS, JS, images, etc.)
    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error: ${err.message}`);
  }
}
