export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const decodedUrl = decodeURIComponent(url);
    const response = await fetch(decodedUrl);
    if (!response.ok) throw new Error("Failed to fetch HTML");

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      // Just return non-HTML assets directly
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType || "application/octet-stream");
      return res.status(200).send(Buffer.from(buffer));
    }

    let html = await response.text();
    const base = new URL(decodedUrl);

    // Helper: rewrite any relative path
    const rewriteAsset = (tag, attr, useProxyForHTML = false) => {
      html = html.replace(
        new RegExp(`<${tag}([^>]*?)${attr}="(.*?)"`, "g"),
        (match, a, value) => {
          if (!value || value.startsWith("http") || value.startsWith("#") || value.startsWith("mailto:"))
            return match;

          const resolved = new URL(value, base).href;

          if (useProxyForHTML) {
            // HTML pages go through proxy
            return `<${tag}${a} ${attr}="/api/fetchHTML?url=${encodeURIComponent(resolved)}"`;
          } else {
            // Assets go directly to raw.githubusercontent.com
            return `<${tag}${a} ${attr}="${resolved}"`;
          }
        }
      );
    };

    // Rewrite HTML links through proxy
    ["a:href", "link:href", "script:src", "img:src", "video:src", "audio:src", "source:src", "object:src"].forEach(
      (pair) => {
        const [tag, attr] = pair.split(":");
        rewriteAsset(tag, attr, tag === "a"); // only <a> goes through proxy
      }
    );

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  } catch (err) {
    console.error(err);
    return res.status(500).send(`Error: ${err.message}`);
  }
}
