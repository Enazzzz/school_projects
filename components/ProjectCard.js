import React from 'react'
import { motion } from 'framer-motion'

export default function ProjectCard({ project }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-card rounded-xl p-5 shadow-md border border-gray-800/60"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium">{project.name}</h3>
          <p className="mt-1 text-sm text-gray-400">
            {project.description || 'No description provided.'}
          </p>
          <div className="flex items-center gap-3 mt-3 text-sm">
            {project.live ? (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1 rounded-md bg-gradient-to-r from-glow to-accent text-black font-medium"
              >
                🌐 Live
              </a>
            ) : (
              <span className="px-2 py-1 rounded-md text-gray-400">No live URL</span>
            )}
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 underline"
            >
              GitHub
            </a>
            <span className="text-gray-500">★ {project.stars ?? 0}</span>
            <span className="text-gray-500">{project.language || '—'}</span>
          </div>
        </div>

        <div className="text-right text-xs text-gray-400">
          <div>Updated</div>
          <div className="mt-1">{project.pushed_at ? new Date(project.pushed_at).toLocaleDateString() : '—'}</div>
        </div>
      </div>
    </motion.li>
  )
}
