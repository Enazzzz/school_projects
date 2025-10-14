// pages/index.js
import React from "react";

export async function getStaticProps() {
  const token = process.env.GITHUB_TOKEN; // Your GitHub Personal Access Token (read-only)

  const res = await fetch("https://api.github.com/users/YOUR_GITHUB_USERNAME/repos?per_page=100", {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  const repos = await res.json();

  // Helper to fetch README for each repo (to search for keywords)
  async function getReadme(owner, repo) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3.raw",
      },
    });
    if (res.ok) return res.text();
    return "";
  }

  // Filter repos based on description or README containing "website" or "html"
  const filteredRepos = [];

  for (const repo of repos) {
    const description = repo.description ? repo.description.toLowerCase() : "";
    if (description.includes("website") || description.includes("html")) {
      filteredRepos.push(repo);
      continue;
    }

    // If description doesn't match, check README
    const readme = await getReadme(repo.owner.login, repo.name);
    if (readme.toLowerCase().includes("website") || readme.toLowerCase().includes("html")) {
      filteredRepos.push(repo);
    }
  }

  // Map to necessary data
  const projects = filteredRepos.map((repo) => ({
    name: repo.name,
    url: repo.html_url,
    live: repo.homepage || null, // Some repos set 'homepage' field to live site URL
  }));

  return {
    props: { projects },
    revalidate: 3600, // Rebuild the page every hour
  };
}

export default function Home({ projects }) {
  return (
    <main style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>My Websites</h1>
      {projects.length === 0 && <p>No matching websites found.</p>}
      <ul>
        {projects.map(({ name, url, live }) => (
          <li key={name} style={{ marginBottom: 15 }}>
            <strong>{name}</strong>
            <br />
            {live ? (
              <a href={live} target="_blank" rel="noopener noreferrer">
                Live Site
              </a>
            ) : (
              <span>No live site URL</span>
            )}{" "}
            |{" "}
            <a href={url} target="_blank" rel="noopener noreferrer">
              GitHub Repo
            </a>
          </li>
        ))}
      </ul>
      <footer style={{ marginTop: 40, fontSize: 12, color: "#666" }}>
        Data updates hourly. Powered by GitHub API.
      </footer>
    </main>
  );
}
