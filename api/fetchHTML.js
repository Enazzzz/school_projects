// /api/fetchHTML.js
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const decodedUrl = decodeURIComponent(url);
    const response = await fetch(decodedUrl);
    if (!response.ok) throw new Error("Failed to fetch HTML");

    let html = await response.text();
    const base = new URL(decodedUrl);

    // Rewrite all relative links/assets
    const rewriteAsset = (tag, attr, useProxyForHTML = false) => {
      html = html.replace(
        new RegExp(`<${tag}([^>]*?)${attr}="(.*?)"`, "g"),
        (match, a, value) => {
          if (!value || value.startsWith("http") || value.startsWith("#") || value.startsWith("mailto:"))
            return match;

          const resolved = new URL(value, base).href;
          if (useProxyForHTML) return `<${tag}${a} ${attr}="/api/fetchHTML?url=${encodeURIComponent(resolved)}"`;
          return `<${tag}${a} ${attr}="${resolved}"`;
        }
      );
    };

    ["a:href","link:href","script:src","img:src","video:src","audio:src","source:src","object:src"].forEach(
      (pair) => {
        const [tag, attr] = pair.split(":");
        rewriteAsset(tag, attr, tag === "a");
      }
    );

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  } catch (err) {
    console.error(err);
    return res.status(500).send(`Error: ${err.message}`);
  }
}
