
import { useState, useContext, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Sidebar from "../component/sidebar"
import Header from "../component/Header"
import api from "../api"
import { USER_ID } from "../constants"
import { USER_ROLE } from "../constants"
export default function Settings() {
  const location = useLocation()
  const user_role = localStorage.getItem(USER_ROLE)
  const isAdmin = user_role === "a"
  const [activeTab, setActiveTab] = useState("password")
  const id = localStorage.getItem(USER_ID);
  const [profileData, setProfileData] = useState({
    address: "",
    phone: "",
   })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await api.patch('/api/user/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Password change failed',
        errors: error.response?.data || {}
      };
    }
  };
  const [notifications, setNotifications] = useState([])
  const [message, setMessage] = useState({ type: "", text: "" })
  const getNotification = () => {
    api
      .get(`api/ad_notif/${id}`)
      .then((res) => res.data)
      .then((data) => {
        setNotifications(data);
        console.log(data);
      })
      .catch((err) => console.log(err));
  };
  useEffect(()=>{
    getNotification();
  },[])

  useEffect(() => {
    const hash = location.hash?.replace('#', '') || '';
    if (hash === 'notifications') {
      setActiveTab('notifications');
    } else if (hash === 'profile' && isAdmin) {
      setActiveTab('profile');
    } else if (hash === 'password') {
      setActiveTab('password');
    }
  }, [location.hash, isAdmin]);
  useEffect(() => {
   

    // Populate profile data from user
    setProfileData({
      name: "eyob" || "",
      email: "eyob@gmail.com" || "",
      phone: "0913" || "",
      photo: "" || null,
    })
  }, [])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }


  const handleAddressSubmit= async(e) => {
    e.preventDefault()
    try {
      const res = await api.put(`api/staffdetail/${id}`, {
        
          employee: {
            address: profileData.address
          }
        });
    
      if (res.status === 200) {
        setMessage({
          type: "success",
          text: "Profile Address updated successfully!",
        })
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
   
    setTimeout(() => {
      setMessage({ type: "", text: "" })
    }, 3000)
  }
  const handlePhoneSubmit= async(e) => {
    e.preventDefault()
    try {
      const res = await api.put(`api/staffdetail/${id}`, {
        phone_number : profileData.phone
      });
      if (res.status === 200) {
        setMessage({
          type: "success",
          text: "Phone number updated successfully!",
        })
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
   
    setTimeout(() => {
      setMessage({ type: "", text: "" })
    }, 3000)
  }

  const handlePasswordSubmit =async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "error",  
        text: "New passwords do not match!",
      })
      return
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      setMessage({ 
        type: 'error',
        text: result.message,
        errors: result.errors
      });
    }
    setTimeout(() => {
      setMessage({ type: "", text: "" })
    }, 3000)
  }

  
  const handleMarkAsRead =async (id) => {

    try {
      const res = await api.put(`api/ad_notifs/${id}`, {
        read : true
      });
      if (res.status === 201) {
        setNotifications(
          notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        )
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const handleDeleteAllRead = () => {
    setNotifications(notifications.filter((notification) => !notification.read))
  }

 
  return (
    <div className="settings-page">
        <Sidebar/>
        <div className="right">
            <Header/>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="card">
      {message.text && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
              {message.text}
            </div>
          )}

        <div className="tabs">
        {isAdmin&& (
          <div className={`tab ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
            Profile
          </div>)}
          <div className={`tab ${activeTab === "password" ? "active" : ""}`} onClick={() => setActiveTab("password")}>
            Password
          </div>
          <div
            className={`tab ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </div>
         
                   </div>

        <div className="tab-content">
        
  
          {activeTab === "profile" && isAdmin&& (
            <form >
              
              {message.text && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
              {message.text}
            </div>
          )}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-control"
                  value={profileData.address}
                  onChange={handleProfileChange}
                />
              </div>
             

              <button  onClick ={handleAddressSubmit}type="submit" className="btn btn-primary">
                Update address
              </button>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                />
              </div>


              <button onClick={handlePhoneSubmit} type="submit" className="btn btn-primary">
                Update phone number
              </button>
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  className="form-control"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="form-control"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="password-requirements">
                <h3>Password Requirements:</h3>
                <ul>
                  <li>At least 8 characters long</li>
                  <li>Contains at least one uppercase letter</li>
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character</li>
                </ul>
              </div>

              <button type="submit" className="btn btn-primary">
                Update Password
              </button>
            </form>
          )}

          {activeTab === "notifications" && (
            <div className="notifications-tab">
              <div className="notifications-list-section">
                <div className="notifications-list-header">
                  <h2>Recent Notifications</h2>
                  <div className="notification-actions">
                    <button className="btn btn-sm btn-secondary" onClick={handleMarkAllAsRead}>
                      Mark All as Read
                    </button>
                    
                  </div>
                </div>

                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications
                      .sort((a, b) => new Date(b.time) - new Date(a.time))
                      .map((notification) => (
                        <div key={notification.id} className={`notification-item ${notification.read ? "" : "unread"}`}>
                          <div className="notification-content">
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">{new Date(notification.date).toLocaleString()}</div>
                          </div>
                          <div className="notification-actions">
                            {!notification.read && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                Mark as Read
                              </button>
                            )}
                           
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="empty-state">No notifications to display</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <style>{`
        .settings-page {
        display : flex;
              
        }
        .right {
         width :100%;
         margin : 10px;}
        .password-requirements {
          margin-top: 20px;
          padding: 15px;
          background-color: var(--bg-secondary);
          border-radius: 8px;
        }
         .alert {
          padding: 10px 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .alert-success {
          background-color: #d4edda;
          color: #155724;
        }
        
        .alert-error {
          background-color: #f8d7da;
          color: #721c24;
        }
        .password-requirements h3 {
          font-size: 1rem;
          margin-bottom: 10px;
        }
        
        .password-requirements ul {
          margin-left: 20px;
        }
        
        .password-requirements li {
          margin-bottom: 5px;
        }
        
        .notifications-tab {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .notifications-header h2,
        .notifications-list-header h2 {
          font-size: 1.2rem;
          margin-bottom: 15px;
        }
        
        .notification-preferences {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .form-check {
          display: flex;
          align-items: center;
        }
        
        .form-check input {
          margin-right: 10px;
        }
        
        .notifications-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .notification-actions {
          display: flex;
          gap: 10px;
        }
        
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .notification-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-radius: 8px;
          background-color: var(--bg-secondary);
          border-left: 3px solid transparent;
        }
        
        .notification-item.unread {
          border-left-color: var(--primary-color);
          background-color: var(--unread-bg);
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-title {
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .notification-message {
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        
        .notification-time {
          font-size: 0.8rem;
          color: var(--text-light);
        }
        
        .empty-state {
          padding: 30px;
          text-align: center;
          background-color: var(--bg-secondary);
          border-radius: 8px;
          color: var(--text-light);
        }
        
        @media (max-width: 768px) {
          .notification-preferences {
            grid-template-columns: 1fr;
          }
          
          .notifications-list-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .notification-item {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .notification-actions {
            margin-top: 10px;
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  )
}

