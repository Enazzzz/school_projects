import React, { useState, useEffect } from 'react';
import MobileMenu from './MobileMenu';

export default function Navbar({ name = 'Zane Davis' }) {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const useDark = saved ? saved === 'dark' : true;
    setDark(useDark);
    document.documentElement.classList.toggle('dark', useDark);
  }, []);

  const toggleTheme = () => {
    setDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-[rgba(0,0,0,0.7)] backdrop-blur-md border-b border-red-700/40 flex items-center justify-between px-6 py-4 shadow-md">
      <h1 className="text-xl font-semibold text-red-300">{name}</h1>
      <nav className="hidden md:flex gap-4 text-gray-300 font-medium">
        <a href="#projects" className="hover:text-red-400 transition">Projects</a>
        <a href="#about" className="hover:text-red-400 transition">About</a>
        <a href="#contact" className="hover:text-red-400 transition">Contact</a>
      </nav>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded-md bg-gray-800/60 hover:bg-gray-700/60 transition text-black dark:text-red-300"
        >
          {dark ? '🌙 Dark' : '🌤 Light'}
        </button>
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden px-3 py-1 rounded-md bg-gray-800/60 hover:bg-gray-700/60 transition text-black dark:text-red-300"
        >
          ☰
        </button>
      </div>

      <MobileMenu open={menuOpen} setOpen={setMenuOpen} toggleTheme={toggleTheme} dark={dark} />
    </header>
  );
}
