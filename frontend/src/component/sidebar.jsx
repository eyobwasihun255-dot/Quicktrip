import { useState } from "react"
import { USER_ROLE } from "../constants"



const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const user_role = localStorage.getItem(USER_ROLE)
  const isAdmin = user_role === "a"
  const isSubAdmin = user_role === "s"
  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }


  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h2 className="logo">QuickTrip</h2>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <div className="sidebar-content">
       

        <nav className="sidebar-nav">
          <ul>
            <li >
            <a href="/home">
            <span className="icon"><i className="fa-solid fa-chart-simple"></i>    </span>
                <span className="text">Dashboard</span>
              </a>
            </li>

             {isAdmin && (
              <>
               
                <li >
                <a href="/branchs">
                <span className="icon"><i className="fa-solid fa-building"></i>    </span>
                    <span className="text">Stations & Trips</span>
                </a>
                </li>
                 <li >
                <a href="/buses">
                <span className="icon"><i className="fa-solid fa-bus"></i>    </span>
                    <span className="text">Buses</span>
                </a>
                </li>
                <li >
                   <a href="/passengers">
                   <span className="icon"><i className="fa-solid fa-user"></i>    </span>
                       <span className="text">Passengers</span>
                   </a>
                   </li>
                
                <li>
                  <a href="/subadmin">
                  <span className="icon"><i className="fa-solid fa-user-tie"></i>    </span>
                <span className="text">Sub-Admins</span>
                </a>
                </li>      
                <li>
                <a href="/revenue">
                <span className="icon"><i className="fa-solid fa-file-invoice"></i>    </span>
                    <span className="text">Revenue</span>
                 </a>
                </li>
                <li >
                  <a href="/vehicles">
                  <span className="icon"><i className="fa-solid fa-van-shuttle"></i>    </span>
                      <span className="text">Vehicles</span>
                  </a>
                </li>
                <li >
                  <a href="/ticket">
                  <span className="icon"><i className="fa-solid fa-ticket"></i>    </span>
                      <span className="text">Ticket</span>
                  </a>
                </li>
                <li >
                  <a href="/location">
                  <span className="icon"><i className="fa-solid fa-location-dot"></i>    </span>
                      <span className="text">Track Location</span>
                  </a>
                </li>
                <li >
                  <a href="/payment">
                  <span className="icon"><i className="fa-solid fa-money-bill"></i>    </span>
                      <span className="text">Payment</span>
                  </a>
                </li>
                </>
               )}
                {isSubAdmin&& (
                   <>               
                   <li >
                   <a href="/vehicles">
                   <span className="icon"><i className="fa-solid fa-bus"></i>    </span>
                       <span className="text">Vehicles</span>
                   </a>
                   </li>
                    <li >
                   <a href="/passengers">
                   <span className="icon"><i className="fa-solid fa-user"></i>    </span>
                       <span className="text">Passengers</span>
                   </a>
                   </li>
                 
                   <li >
                   <a href="/ticket">
                   <span className="icon"><i className="fa-solid fa-ticket"></i>    </span>
                       <span className="text">Ticket</span>
                   </a>
                   </li>
                   <li >
                   <a href="/location">
                   <span className="icon"><i className="fa-solid fa-location-dot"></i>    </span>
                       <span className="text">Track Location</span>
                   </a>
                   </li>
                   <li >
                   <a href="/payment">
                   <span className="icon"><i className="fa-solid fa-money-bill"></i>    </span>
                       <span className="text">Payment</span>
                   </a>
                   </li>
                   </>

                )}
              
            
            <li >
            <a href="/setting">
            <span className="icon"><i className="fa-solid fa-cog"></i>    </span>
                <span className="text">Settings</span>
            </a>
            </li>
            <li>
                  <a href="/logout">
                  <span className="icon"><i className="fa-solid fa-sign-out"></i>    </span>               

                <span className="text">Log out</span>
                </a>
                </li>
          </ul>
        </nav>
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background-color: var(--sidebar-bg);
          border-right: 1px solid var(--border-color);
          transition: width 0.3s ease;
    
          flex-direction: column;
          position: sticky;
          top: 0;
        }
        
        .sidebar.collapsed {
          width: 80px;
        }
        
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
          white-space: nowrap;
          overflow: hidden;
        }
        
        .toggle-btn {
          background: none;
          border: none;
          color: var(--text-color);
          cursor: pointer;
          font-size: 1.2rem;
        }
        
        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 0;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          padding: 0 20px 20px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 20px;
        }
        
        .avatar {
          width: 40px;
          height: 40px;
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
        
        .user-details {
          white-space: nowrap;
          overflow: hidden;
        }
        
        .user-details h3 {
          font-size: 1rem;
          margin: 0;
        }
        
        .user-details p {
          font-size: 0.8rem;
          color: var(--text-light);
          margin: 0;
        }
        
        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .sidebar-nav li {
          margin-bottom: 5px;
        }
        
        .sidebar-nav a {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: var(--text-color);
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .sidebar-nav a:hover {
          background-color: rgba(58, 134, 255, 0.1);
          color: var(--primary-color);
        }
        
        .sidebar-nav li.active a {
          background-color: rgba(58, 134, 255, 0.1);
          color: var(--primary-color);
          font-weight: 500;
        }
        
        .icon {
          margin-right: 10px;
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
        }
        
        .text {
          white-space: nowrap;
          overflow: hidden;
        }
        
        .sidebar.collapsed .text,
        .sidebar.collapsed .user-details {
          display: none;
        }
        
        .sidebar.collapsed .user-info {
          justify-content: center;
        }
        
        .sidebar.collapsed .avatar {
          margin-right: 0;
        }
        
        .sidebar.collapsed .sidebar-nav a {
          justify-content: center;
        }
        
        .sidebar.collapsed .icon {
          margin-right: 0;
        }
        
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            z-index: 1000;
            transform: translateX(-100%);
          }
          
          .sidebar.collapsed {
            transform: translateX(0);
            width: 80px;
          }
        }
      `}</style>
    </div>
  )
}

export default Sidebar

