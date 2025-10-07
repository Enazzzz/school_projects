export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const decodedUrl = decodeURIComponent(url);

    if (!decodedUrl.includes("raw.githubusercontent.com")) {
      return res.status(400).send("Only raw.githubusercontent.com URLs allowed");
    }

    const response = await fetch(decodedUrl);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    // Determine content type
    let contentType = "application/octet-stream";
    if (decodedUrl.endsWith(".html") || decodedUrl.endsWith(".htm")) contentType = "text/html";
    else if (decodedUrl.endsWith(".js")) contentType = "text/javascript";
    else if (decodedUrl.endsWith(".css")) contentType = "text/css";
    else if (decodedUrl.endsWith(".png")) contentType = "image/png";
    else if (decodedUrl.endsWith(".jpg") || decodedUrl.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (decodedUrl.endsWith(".gif")) contentType = "image/gif";
    else if (decodedUrl.endsWith(".svg")) contentType = "image/svg+xml";
    else if (decodedUrl.endsWith(".json")) contentType = "application/json";

    res.setHeader("Content-Type", contentType);

    const baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf("/") + 1);

    // HTML rewriting
    if (contentType === "text/html") {
      let html = await response.text();
      html = html.replace(/(src|href)=["'](.*?)["']/g, (match, attr, path) => {
        if (!path || path.startsWith("http") || path.startsWith("#")) return match;
        const resolved = new URL(path, baseUrl).href;
        return `${attr}="/api/proxy?url=${encodeURIComponent(resolved)}"`;
      });
      return res.status(200).send(html);
    }

    // CSS rewriting
    if (contentType === "text/css") {
      let css = await response.text();
      css = css.replace(/url\((['"]?)(.*?)\1\)/g, (match, quote, path) => {
        if (!path || path.startsWith("http") || path.startsWith("data:")) return match;
        const resolved = new URL(path, baseUrl).href;
        return `url("/api/proxy?url=${encodeURIComponent(resolved)}")`;
      });
      return res.status(200).send(css);
    }

    // JS rewriting for simple relative images or JSON paths
    if (contentType === "text/javascript") {
      let js = await response.text();

      // new Image().src = 'path'
      js = js.replace(/new\s+Image\(\)\.src\s*=\s*['"](.*?)['"]/g, (match, path) => {
        if (!path || path.startsWith("http") || path.startsWith("data:")) return match;
        const resolved = new URL(path, baseUrl).href;
        return `new Image().src="/api/proxy?url=${encodeURIComponent(resolved)}"`;
      });

      // fetch('path')
      js = js.replace(/fetch\(['"](.*?)['"]/g, (match, path) => {
        if (!path || path.startsWith("http")) return match;
        const resolved = new URL(path, baseUrl).href;
        return `fetch("/api/proxy?url=${encodeURIComponent(resolved)}"`;
      });

      return res.status(200).send(js);
    }

    // Other files (images, JSON)
    const buffer = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error(err);
    return res.status(500).send(`Error: ${err.message}`);
  }
}
