import React from 'react'

export default function Navbar({ name = "Zane Davis", tagline = "Building intelligent tools and clean web experiences", theme }) {
  return (
    <header className="w-full max-w-5xl mx-auto py-6 flex items-center justify-between px-4 sm:px-6">
      <div>
        <h1 className="text-xl font-semibold">{name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{tagline}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => theme.toggleTheme()}
          className="px-3 py-1 rounded-md bg-gray-800/60 hover:bg-gray-700/60 transition"
          aria-label="Toggle theme"
        >
          {theme.dark ? "🌙 Dark" : "🌤 Light"}
        </button>
      </div>
    </header>
  )
}
