
import { useContext } from "react"
import { ThemeContext } from "../context/ThemeContext"

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext)

  return (
    <button
      className="theme-toggle"
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <span className="theme-icon">☀️</span> : <span className="theme-icon">🌙</span>}

  <style>{`
        .theme-toggle {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          margin-right: 10px;
          transition: background-color 0.2s;
        }
        
        .theme-toggle:hover {
          background-color: var(--hover-bg);
        }
        
        .theme-icon {
          font-size: 1.2rem;
        }
      `}</style>
    </button>
  )
}

export default ThemeToggle

