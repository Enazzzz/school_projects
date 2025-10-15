import React from 'react';
import { motion } from 'framer-motion';

export default function ProjectCard({ project }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      className="bg-[rgba(30,0,0,0.6)] backdrop-blur-lg border border-red-700/30 rounded-2xl p-5 shadow-lg hover:shadow-red-600/50 transition-all duration-300 relative overflow-hidden"
    >
      {/* Subtle moving gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-black to-red-800 opacity-20 animate-slow-move -z-10 rounded-2xl"></div>

      <h3 className="text-xl font-semibold text-red-300">{project.name}</h3>
      <p className="mt-2 text-gray-300 text-sm">{project.description || 'No description available'}</p>

      <div className="flex gap-3 mt-4 flex-wrap">
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-500/90 text-black font-semibold transition"
          >
            🌐 Live
          </a>
        )}
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700/90 text-red-400 font-semibold transition"
        >
          🛠 GitHub
        </a>
      </div>

      <div className="flex justify-between mt-3 text-gray-400 text-xs">
        <span>{project.stars != null ? `★ ${project.stars}` : '★ —'}</span>
        <span>{project.language || '—'}</span>
      </div>
    </motion.li>
  );
}
