// pages/index.js
import React from 'react'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'

export async function getStaticProps() {
  const token = process.env.GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME

  if (!token || !username) {
    console.error('Missing GITHUB_TOKEN or GITHUB_USERNAME')
    return { props: { projects: [], error: 'Missing GitHub credentials.' } }
  }

  // Request repos (include topics with preview header)
  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=200`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.mercy-preview+json, application/vnd.github.v3+json'
    }
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('GitHub API error:', text)
    return { props: { projects: [], error: 'GitHub API error.' } }
  }

  const repos = await res.json()
  if (!Array.isArray(repos)) {
    console.error('Unexpected GitHub response', repos)
    return { props: { projects: [], error: 'Invalid GitHub response.' } }
  }

  // Filter: website criteria
  const websiteCandidates = repos
    .filter(r => !r.fork && !r.archived) // skip forks & archived
    .filter(r => {
      const desc = (r.description || '').toLowerCase()
      const topics = Array.isArray(r.topics) ? r.topics.map(t => t.toLowerCase()) : []
      const homepage = r.homepage && r.homepage.trim() !== ''
      const hasPages = !!r.has_pages

      const descMatch = /website|site|html|landing|demo|live/i.test(desc)
      const topicMatch = topics.some(t => /website|web|site|landing|live|demo/.test(t))
      const homepageMatch = homepage
      const pagesMatch = hasPages

      return descMatch || topicMatch || homepageMatch || pagesMatch
    })

  // Map to project data we want (avoid heavy fields)
  const projects = websiteCandidates.map(r => ({
    name: r.name,
    url: r.html_url,
    live: (r.homepage && r.homepage.startsWith('http')) ? r.homepage : (r.has_pages ? `https://${process.env.GITHUB_USERNAME}.github.io/${r.name}` : null),
    description: r.description || '',
    stars: r.stargazers_count,
    pushed_at: r.pushed_at,
    language: r.language,
    topics: r.topics || []
  }))

  // Sort newest first
  projects.sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0))

  return {
    props: {
      projects,
    },
    revalidate: 3600,
  }
}

export default function Home({ projects = [], error }, { theme }) {
  // tagline produced for you:
  const tagline = "Building intelligent tools and clean web experiences."
  const name = "Zane Davis"

  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <Navbar name={name} tagline={tagline} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <section className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-start">
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-2xl shadow-md border border-gray-800/60">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-glow to-accent flex items-center justify-center text-black font-bold">
                  ZD
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Zane Davis</h2>
                  <p className="text-sm text-gray-400 mt-1">Student · Robotics · Python · Web</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-300">
                <p>{tagline}</p>
                <p className="mt-3 text-xs text-gray-500">Profile photo placeholder — drop `public/profile.jpg` to replace.</p>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-400">
              <h3 className="text-xs uppercase tracking-wide">About</h3>
              <p className="mt-2">Clean, fast front ends and small backend glues. Projects automatically surfaced from GitHub.</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Website Projects</h2>
              <div className="text-sm text-gray-400">Auto-detected from GitHub</div>
            </div>

            {error && <div className="mt-4 text-red-400">{error}</div>}

            <ul className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2">
              {projects.length === 0 && !error && (
                <div className="mt-6 text-gray-400">No website projects detected yet.</div>
              )}
              {projects.map((p) => (
                <ProjectCard key={p.name} project={p} />
              ))}
            </ul>
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-gray-500">
          Powered by GitHub · Updated hourly
        </footer>
      </main>
    </div>
  )
}
