export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch HTML");

    let html = await response.text();
    const base = new URL(url);

    const rewriteAsset = (tag, attr) =>
      html.replace(new RegExp(`<${tag}([^>]*?)${attr}="(.*?)"`, "g"), (match, a, value) => {
        if (!value || value.startsWith("http") || value.startsWith("mailto:") || value.startsWith("#")) return match;
        const newUrl = `/api/fetchHTML?url=${encodeURIComponent(new URL(value, base).href)}`;
        return `<${tag}${a} ${attr}="${newUrl}"`;
      });

    ["link:href", "script:src", "img:src", "video:src", "audio:src", "source:src", "object:src", "a:href"].forEach(pair => {
      const [tag, attr] = pair.split(":");
      html = rewriteAsset(tag, attr);
    });

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
