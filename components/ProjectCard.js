import React from 'react';
import { motion } from 'framer-motion';
//hi
export default function ProjectCard({ project }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04 }}
      className="relative overflow-hidden rounded-2xl p-6 bg-[rgba(30,0,0,0.6)] backdrop-blur-lg border border-red-700/40 shadow-lg hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-shadow duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-black to-red-800 opacity-20 animate-slow-move -z-10 rounded-2xl"></div>

      <h3 className="text-xl font-semibold text-red-300">{project.name}</h3>
      <p className="mt-2 text-gray-300 text-sm">{project.description || 'No description available'}</p>

      <div className="flex gap-3 mt-4 flex-wrap">
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500/90 text-black font-semibold transition shadow-sm hover:shadow-red-500/50"
          >
            🌐 Live
          </a>
        )}
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg bg-gray-800/80 hover:bg-gray-700/90 text-red-400 font-semibold transition shadow-sm hover:shadow-red-400/50"
        >
          🛠 GitHub
        </a>
      </div>

      <div className="flex justify-between mt-4 text-gray-400 text-xs">
        <span>{project.stars != null ? `★ ${project.stars}` : '★ —'}</span>
        <span>{project.language || '—'}</span>
      </div>
    </motion.li>
  );
}
