// /api/fetchProject.js
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/html")) {
      let html = await response.text();

      // Rewrite relative links/scripts/assets to go through the proxy
      const rewriteAsset = (tag, attr) =>
        html.replace(new RegExp(`<${tag}([^>]*?)${attr}="(.*?)"`, "g"), (match, a, value) => {
          if (!value || value.startsWith("http")) return match;
          const newUrl = `/api/fetchProject?url=${encodeURIComponent(new URL(value, url).href)}`;
          return `<${tag}${a} ${attr}="${newUrl}"`;
        });

      ["link:href", "script:src", "img:src", "video:src", "audio:src", "source:src", "object:src"].forEach(pair => {
        const [tag, attr] = pair.split(":");
        html = rewriteAsset(tag, attr);
      });

      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    }

    // For other assets, detect type based on extension
    const ext = url.split(".").pop().toLowerCase();
    let mime = "application/octet-stream";
    if (ext === "js") mime = "application/javascript";
    else if (ext === "css") mime = "text/css";
    else if (ext === "png") mime = "image/png";
    else if (ext === "jpg" || ext === "jpeg") mime = "image/jpeg";
    else if (ext === "gif") mime = "image/gif";
    else if (ext === "svg") mime = "image/svg+xml";
    else if (ext === "mp4") mime = "video/mp4";
    else if (ext === "mp3") mime = "audio/mpeg";

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=3600"); // optional caching
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
