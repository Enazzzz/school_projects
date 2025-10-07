export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const decodedUrl = decodeURIComponent(url);

    // Only allow githubusercontent URLs (optional, safety)
    if (!decodedUrl.includes("raw.githubusercontent.com")) {
      return res.status(400).send("Only raw.githubusercontent.com URLs allowed");
    }

    // Fetch the content
    const response = await fetch(decodedUrl);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    // Determine content type by file extension
    let contentType = "application/octet-stream";
    if (decodedUrl.endsWith(".html") || decodedUrl.endsWith(".htm")) contentType = "text/html";
    else if (decodedUrl.endsWith(".js")) contentType = "text/javascript";
    else if (decodedUrl.endsWith(".css")) contentType = "text/css";
    else if (decodedUrl.endsWith(".png")) contentType = "image/png";
    else if (decodedUrl.endsWith(".jpg") || decodedUrl.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (decodedUrl.endsWith(".gif")) contentType = "image/gif";
    else if (decodedUrl.endsWith(".svg")) contentType = "image/svg+xml";

    res.setHeader("Content-Type", contentType);

    if (contentType === "text/html") {
      let html = await response.text();

      // Rewrite relative links to go through proxy
      const baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf("/") + 1);
      html = html.replace(/(src|href)=["'](.*?)["']/g, (match, attr, path) => {
        if (!path || path.startsWith("http") || path.startsWith("#")) return match;
        const resolved = new URL(path, baseUrl).href;
        return `${attr}="/api/proxy?url=${encodeURIComponent(resolved)}"`;
      });

      return res.status(200).send(html);
    }

    // For other files: buffer and send
    const buffer = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error(err);
    return res.status(500).send(`Error: ${err.message}`);
  }
}
