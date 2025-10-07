// /api/fetchRepo.js
import fetch from "node-fetch";

const cache = {}; // simple in-memory cache

async function getRepoFiles(owner, repo, path = "") {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();

  let files = [];
  for (const item of data) {
    if (item.type === "file") {
      files.push({
        name: item.name,
        path: item.path,
        download_url: item.download_url
      });
    } else if (item.type === "dir") {
      const subFiles = await getRepoFiles(owner, repo, item.path);
      files = files.concat(subFiles);
    }
  }
  return files;
}

export default async function handler(req, res) {
  const { owner, repo } = req.query;
  if (!owner || !repo) return res.status(400).json({ error: "Missing owner or repo" });

  const cacheKey = `${owner}/${repo}`;
  if (cache[cacheKey]) {
    return res.status(200).json(cache[cacheKey]);
  }

  try {
    const files = await getRepoFiles(owner, repo);
    const result = {
      html: {},
      css: [],
      js: [],
      images: []
    };

    for (const f of files) {
      const ext = f.name.split(".").pop().toLowerCase();
      if (ext === "html") result.html[f.name] = f.download_url;
      else if (ext === "css") result.css.push(f.download_url);
      else if (ext === "js") result.js.push(f.download_url);
      else if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) result.images.push(f.download_url);
    }

    cache[cacheKey] = result; // cache in memory
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

