// /api/fetchHTML.js
export default async function handler(req, res) {
  const { url, ...folders } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const htmlRes = await fetch(decodeURIComponent(url));
    if (!htmlRes.ok) throw new Error("Failed to fetch HTML");

    let html = await htmlRes.text();

    // Rewrite relative links to use provided folders
    html = html.replace(/(src|href)="(.*?)"/g, (match, attr, path) => {
      if (!path || path.startsWith("http") || path.startsWith("#")) return match;

      for (let key in folders) {
        const folder = folders[key];
        return `${attr}="${folder}${path}"`;
      }

      return match;
    });

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error: ${err.message}`);
  }
}
