import React from 'react';

export default function MobileMenu({ open, setOpen, toggleTheme, dark }) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 bg-black bg-opacity-90 backdrop-blur-md z-50 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-red-400 text-2xl">
        ×
      </button>
      <nav className="flex flex-col gap-6 mt-20 ml-6 text-red-300 text-lg">
        <a href="#projects" onClick={() => setOpen(false)}>Projects</a>
        <a href="#about" onClick={() => setOpen(false)}>About</a>
        <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
        <button
          onClick={() => { toggleTheme(); setOpen(false); }}
          className="mt-4 px-3 py-1 rounded-md bg-red-600/70 hover:bg-red-500/80 transition text-black"
        >
          {dark ? '🌙 Dark' : '🌤 Light'}
        </button>
      </nav>
    </div>
  );
}
