// /api/fetchProject.js
import fetch from "node-fetch";
import path from "path";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const contentType = response.headers.get("content-type");

    // For HTML, we rewrite relative asset paths
    if (contentType && contentType.includes("text/html")) {
      let html = await response.text();

      // Rewrite CSS links
      html = html.replace(/<link\s+([^>]*?)href="(.*?)"/g, (match, attr, href) => {
        if (href.startsWith("http")) return match;
        const newHref = `/api/fetchProject?url=${encodeURIComponent(new URL(href, url).href)}`;
        return `<link ${attr} href="${newHref}"`;
      });

      // Rewrite JS scripts
      html = html.replace(/<script\s+([^>]*?)src="(.*?)"/g, (match, attr, src) => {
        if (src.startsWith("http")) return match;
        const newSrc = `/api/fetchProject?url=${encodeURIComponent(new URL(src, url).href)}`;
        return `<script ${attr} src="${newSrc}"`;
      });

      // Rewrite images, videos, audio, source, object
      html = html.replace(/<(img|video|audio|source|object)\s+([^>]*?)src="(.*?)"/g, (match, tag, attr, src) => {
        if (src.startsWith("http")) return match;
        const newSrc = `/api/fetchProject?url=${encodeURIComponent(new URL(src, url).href)}`;
        return `<${tag} ${attr} src="${newSrc}"`;
      });

      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    }

    // For other assets (CSS, JS, images, etc.), serve with the correct content-type
    const buffer = await response.arrayBuffer();
    const ext = path.extname(url).toLowerCase();

    let mime = "application/octet-stream";
    if (ext === ".js") mime = "application/javascript";
    else if (ext === ".css") mime = "text/css";
    else if (ext === ".png") mime = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
    else if (ext === ".gif") mime = "image/gif";
    else if (ext === ".svg") mime = "image/svg+xml";
    else if (ext === ".mp4") mime = "video/mp4";
    else if (ext === ".mp3") mime = "audio/mpeg";

    res.setHeader("Content-Type", mime);
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
