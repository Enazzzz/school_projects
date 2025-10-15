import '../styles/globals.css'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    // default to dark; respect saved preference if any
    const saved = localStorage.getItem('theme')
    const useDark = saved ? saved === 'dark' : true
    setDark(useDark)
    document.documentElement.classList.toggle('dark', useDark)
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className={dark ? 'dark' : ''}>
      <Component {...pageProps} theme={{ dark, toggleTheme }} />
    </div>
  )
}
