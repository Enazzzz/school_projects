import React, { useState, useEffect } from 'react'

export default function Navbar({
  name = "Zane Davis",
  tagline = "Building intelligent tools and clean web experiences",
}) {
  const [dark, setDark] = useState(true)

  // Runs only on the client
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const useDark = saved ? saved === 'dark' : true
    setDark(useDark)
    document.documentElement.classList.toggle('dark', useDark)
  }, [])

  function toggleTheme() {
    setDark(prev => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <header className="w-full max-w-5xl mx-auto py-6 flex items-center justify-between px-4 sm:px-6">
      <div>
        <h1 className="text-xl font-semibold">{name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{tagline}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded-md bg-gray-800/60 hover:bg-gray-700/60 transition"
          aria-label="Toggle theme"
        >
          {dark ? "🌙 Dark" : "🌤 Light"}
        </button>
      </div>
    </header>
  )
}
