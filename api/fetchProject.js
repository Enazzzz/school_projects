export default async function handler(req, res) {
  const { owner, repo, path } = req.query;

  if (!owner || !repo || !path) {
    return res.status(400).json({ error: "Missing required parameters: owner, repo, path" });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // optional if repo is private

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(GITHUB_TOKEN && { Authorization: `token ${GITHUB_TOKEN}` }),
      },
    });

    const data = await response.json();

    if (!data.content) {
      return res.status(404).json({ error: "File not found or invalid response from GitHub" });
    }

    const html = Buffer.from(data.content, "base64").toString("utf-8");

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
