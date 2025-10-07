export default async function handler(req, res) {
  const { url, base } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const decodedUrl = decodeURIComponent(url);
    const response = await fetch(decodedUrl);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    let contentType = response.headers.get("content-type") || "";

    // Determine content type based on file extension if needed
    if (!contentType || contentType === "application/octet-stream") {
      if (decodedUrl.endsWith(".html") || decodedUrl.endsWith(".htm")) contentType = "text/html";
      else if (decodedUrl.endsWith(".js")) contentType = "text/javascript";
      else if (decodedUrl.endsWith(".css")) contentType = "text/css";
      else if (decodedUrl.endsWith(".png")) contentType = "image/png";
      else if (decodedUrl.endsWith(".jpg") || decodedUrl.endsWith(".jpeg")) contentType = "image/jpeg";
      else if (decodedUrl.endsWith(".gif")) contentType = "image/gif";
      else if (decodedUrl.endsWith(".svg")) contentType = "image/svg+xml";
      else contentType = "application/octet-stream"; // fallback
    }

    if (contentType.startsWith("text/html")) {
      let html = await response.text();
      const baseUrl = base ? decodeURIComponent(base) : new URL(decodedUrl).origin + "/";

      // Rewrite relative links to go through proxy
      html = html.replace(/(src|href)=["'](.*?)["']/g, (match, attr, path) => {
        if (!path || path.startsWith("http") || path.startsWith("#")) return match;
        const resolved = new URL(path, baseUrl).href;
        return `${attr}="/api/proxy?url=${encodeURIComponent(resolved)}&base=${encodeURIComponent(baseUrl)}"`;
      });

      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    }

    // For everything else (images, CSS, JS)
    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", contentType);
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error: ${err.message}`);
  }
}
