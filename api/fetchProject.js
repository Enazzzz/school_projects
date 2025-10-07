import fetch from "node-fetch";

export default async function handler(req, res) {
  const { owner, repo, path } = req.query;

  if (!owner || !repo || !path) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // optional for private repos
  const headers = {
    Accept: "application/vnd.github.v3+json",
    ...(GITHUB_TOKEN && { Authorization: `token ${GITHUB_TOKEN}` }),
  };

  async function fetchFile(filePath) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=main`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    if (!data.content) throw new Error(`Failed to fetch ${filePath}`);
    return Buffer.from(data.content, "base64").toString("utf-8");
  }

  try {
    let html = await fetchFile(path);

    // Rewrite linked CSS files
    html = html.replace(/<link\s+([^>]*?)href="(.*?)"/g, (match, attr, href) => {
      if (href.startsWith("http")) return match; // external CSS
      const newHref = `/api/fetchProjectFull?owner=${owner}&repo=${repo}&path=${encodeURIComponent(href)}`;
      return `<link ${attr} href="${newHref}"`;
    });

    // Rewrite JS files
    html = html.replace(/<script\s+([^>]*?)src="(.*?)"/g, (match, attr, src) => {
      if (src.startsWith("http")) return match; // external JS
      const newSrc = `/api/fetchProjectFull?owner=${owner}&repo=${repo}&path=${encodeURIComponent(src)}`;
      return `<script ${attr} src="${newSrc}"`;
    });

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
