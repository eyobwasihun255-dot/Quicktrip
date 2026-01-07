

import { useState, useContext } from "react"

import { ThemeContext } from "../context/ThemeContext"
import ThemeToggle from "./ThemeToggle"
import NotificationBell from "./NotificationBell"

const Header = ({  }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { darkMode } = useContext(ThemeContext)

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="header-right">
        <ThemeToggle />
        <NotificationBell />

       
      </div>

      <style>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .user-dropdown {
          position: relative;
        }
        
        .dropdown-toggle {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          color: var(--text-primary);
        }
        
        .dropdown-toggle:hover {
          background-color: var(--hover-bg);
        }
        
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 10px;
        }
        
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--primary-color);
          color: white;
          font-weight: bold;
        }
        
        .user-name {
          margin-right: 5px;
        }
        
        .dropdown-arrow {
          font-size: 0.7rem;
          color: var(--text-light);
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          width: 240px;
          background-color: var(--bg-primary);
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          margin-top: 5px;
          border: 1px solid var(--border-color);
        }
        
        .dropdown-header {
          padding: 15px;
          display: flex;
          align-items: center;
        }
        
        .user-info h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--text-primary);
        }
        
        .user-info p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-light);
          word-break: break-word;
        }
        
        .dropdown-divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 5px 0;
        }
        
        .dropdown-item {
          display: block;
          padding: 10px 15px;
          color: var(--text-primary);
          text-decoration: none;
          transition: background-color 0.2s;
        }
        
        .dropdown-item:hover {
          background-color: var(--hover-bg);
        }
        
        .text-danger {
          color: var(--danger-color);
        }
        
        @media (max-width: 768px) {
          .header {
            padding: 12px 15px;
          }
          
          .page-title {
            font-size: 1.25rem;
          }
          
          .dropdown-menu {
            width: 220px;
          }
        }

        @media (max-width: 576px) {
          .user-name {
            display: none;
          }
          
          .dropdown-menu {
            right: -10px;
            width: 200px;
          }
        }

        @media (max-width: 480px) {
          .header {
            justify-content: center;
          }
          
          .header-left, .header-right {
            width: 100%;
            justify-content: center;
          }
          
          .header-left {
            margin-bottom: 10px;
          }
          
          .dropdown-menu {
            right: -50%;
            transform: translateX(50%);
          }
        }
      `}</style>
    </header>
  )
}

export default Header

