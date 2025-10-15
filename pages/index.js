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

  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=200`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.mercy-preview+json, application/vnd.github.v3+json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('GitHub API error:', text)
    return { props: { projects: [], error: 'GitHub API error.' } }
  }

  const repos = await res.json()
  if (!Array.isArray(repos)) return { props: { projects: [], error: 'Invalid GitHub response.' } }

  // Filter: only website-like repos
  const websiteCandidates = repos
    .filter(r => !r.fork && !r.archived)
    .filter(r => {
      const desc = (r.description || '').toLowerCase()
      const topics = Array.isArray(r.topics) ? r.topics.map(t => t.toLowerCase()) : []
      const homepage = r.homepage && r.homepage.trim() !== ''
      const hasPages = !!r.has_pages

      const descMatch = /website|site|html|landing|demo|live/i.test(desc)
      const topicMatch = topics.some(t => /website|web|site|landing|live|demo/.test(t))
      return descMatch || topicMatch || homepage || hasPages
    })

  // Map to project data
  const projects = websiteCandidates.map(r => ({
    name: r.name,
    url: r.html_url,
    live: r.homepage?.startsWith('http') ? r.homepage : null, // only show live if it exists
    description: r.description || '',
    stars: r.stargazers_count,
    pushed_at: r.pushed_at,
    language: r.language,
    topics: r.topics || [],
  }))

  projects.sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0))

  return {
    props: { projects },
    revalidate: 3600,
  }
}

export default function Home({ projects = [], error }) {
  const tagline = 'Building intelligent tools and clean web experiences.'
  const name = 'Zane Davis'

  return (
    <div className="min-h-screen bg-black text-red-300 font-sans overflow-x-hidden">
      <Navbar name={name} tagline={tagline} />

      {/* subtle moving gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-r from-red-900 via-black to-red-800 opacity-20 animate-slow-move"></div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-12">
        {/* Profile / Intro */}
        <section className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="lg:w-1/3 bg-[rgba(30,0,0,0.6)] backdrop-blur-lg border border-red-700/40 rounded-2xl p-6 shadow-lg hover:shadow-red-600/50 transition-shadow duration-500">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-700 to-red-500 flex items-center justify-center text-black font-bold text-xl">
                ZD
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-red-300">{name}</h1>
                <p className="text-sm text-gray-400 mt-1">Student · Robotics · Python · Web</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-300">
              <p>{tagline}</p>
              <p className="mt-3 text-xs text-gray-500">Profile photo placeholder — drop <code>public/profile.jpg</code> to replace.</p>
            </div>
            <div className="mt-6 text-sm text-gray-400">
              <h3 className="text-xs uppercase tracking-wide">About</h3>
              <p className="mt-2">Clean, fast front ends and small backend glues. Projects automatically surfaced from GitHub.</p>
            </div>
          </div>

          {/* Projects Section */}
          <div className="lg:w-2/3 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Website Projects</h2>
              <div className="text-sm text-gray-400">Auto-detected from GitHub</div>
            </div>

            {error && <div className="mt-4 text-red-400">{error}</div>}

            <ul className="mt-4 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {projects.length === 0 && !error && (
                <div className="mt-6 text-gray-400">No website projects detected yet.</div>
              )}
              {projects.map(p => (
                <ProjectCard key={p.name} project={p} />
              ))}
            </ul>
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500 mt-12">
          Powered by GitHub · Updated hourly
        </footer>
      </main>
    </div>
  )
}
