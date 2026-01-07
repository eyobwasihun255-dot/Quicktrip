import { useState, useEffect } from "react";
import NotificationItem from "./NotificationItem";
import MessageItem from "./MessageItem";
import api from "../api";
import { USER_ID } from "../constants";
import { BRANCH } from "../constants";
import { USER_ROLE } from "../constants";
const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [conversations, setConversations] = useState({});
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
  const [messageText, setMessageText] = useState("");
  const id = localStorage.getItem(USER_ID);
  const user_role = localStorage.getItem(USER_ROLE);
  const isSubAdmin = user_role === "s"
  const br = localStorage.getItem(BRANCH)
  useEffect(() => {
    getSubAdmins();
    getNotification();
    getMessages();
  }, []);

  const getNotification = () => {
    api
      .get(`api/ad_notif/${id}`)
      .then((res) => res.data)
      .then((data) => {
        setNotifications(data);
      })
      .catch((err) => console.log(err));
  };

  const getSubAdmins = () => {
    api
      .get(`api/staffs/`)
      .then((res) => res.data)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const filteredSubAdmins = list.filter((user) => {
          const branchId = user?.branch?.id;
          return (
            user?.user_type === "s" &&
            Number(branchId) === Number(br) &&
            String(user?.id) !== String(id)
          );
        });
        setSubAdmins(
          filteredSubAdmins.map((subAdmin) => ({
            id: subAdmin.id,
            name: subAdmin.employee?.Fname || "Unknown",
            avatar: null,
            lastMessage: "",
            time: "",
            unread: false,
          }))
        );
      })
      .catch((err) => console.log(err));
  };

  const getMessages = () => {
    api
      .get(`api/messages/${id}`)
      .then((res) => res.data)
      .then((data) => {
        const convos = {};
        const subAdminMap = {};

        data.forEach((msg) => {
          const otherUserId =
            msg.sender.id === parseInt(id) ? msg.receiver.id : msg.sender.id;

          if (!convos[otherUserId]) {
            convos[otherUserId] = [];
          }
          convos[otherUserId].push({
            id: msg.id,
            text: msg.content,
            sender: msg.sender.id ,
            read: msg.read,
            timestamp: msg.timestamp,
          });

          if (
            !subAdminMap[otherUserId] ||
            new Date(msg.timestamp) >
              new Date(subAdminMap[otherUserId].timestamp)
          ) {
            subAdminMap[otherUserId] = {
              lastMessage: msg.content,
              time: formatMessageTime(msg.timestamp),
              unread: !msg.read && msg.sender.id !== parseInt(id),
            };
          }
        });

        setSubAdmins((prev) =>
          prev.map((subAdmin) => ({
            ...subAdmin,
            lastMessage: subAdminMap[subAdmin.id]?.lastMessage || "",
            time: subAdminMap[subAdmin.id]?.time || "",
            unread: subAdminMap[subAdmin.id]?.unread || false,
          }))
        );

        setConversations(convos);
      })
      .catch((err) => console.log(err));
  };

  const formatMessageTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const unreadMessagesCount = subAdmins.filter((sa) => sa.unread).length;
  const totalUnreadCount = unreadNotificationsCount + unreadMessagesCount;

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (selectedSubAdmin) {
      setSelectedSubAdmin(null);
    }
  };

  const handleMarkAsRead = (id) => {
    api
      .put(`api/ad_notifs/${id}`, { read: true })
      .then((res) => {
        if (res.status === 200) {
          setNotifications(
            notifications.map((notification) =>
              notification.id === id
                ? { ...notification, read: true }
                : notification
            )
          );
        }
      })
      .catch((err) => console.log(err));
  };

  const handleMarkAllAsRead = () => {
    api
      .put(`api/ad_notifs/mark_all_read/`, { user_id: id })
      .then((res) => {
        if (res.status === 200) {
          setNotifications(notifications.map((n) => ({ ...n, read: true })));
        }
      })
      .catch((err) => console.log(err));
  };

  const selectSubAdmin = (id) => {
    setSelectedSubAdmin(id);

    if (conversations[id]) {
      const unreadMessages = conversations[id].filter(
        (msg) => !msg.read && msg.sender !== id
      );
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg) => msg.id);
        api
          .put(`api/messages/mark_read/`, { message_ids: messageIds })
          .then(() => {
            // Update local state
            setConversations((prev) => ({
              ...prev,
              [id]: prev[id].map((msg) =>
                messageIds.includes(msg.id) ? { ...msg, read: false  } : msg
              ),
            }));

            // Update subAdmin unread status
            setSubAdmins((prev) =>
              prev.map((sa) => (sa.id === id ? { ...sa, unread: false } : sa))
            );
          })
          .catch((err) => console.error(err));
      }
    }
  };

  const sendMessage = () => {
    if (!messageText.trim() || !selectedSubAdmin) return;

    const newMessage = {
      sender: parseInt(id),
      receiver: selectedSubAdmin,
      content: messageText,
    };

    api
      .post(`api/messages/`, newMessage)
      .then((res) => res.data)
      .then((data) => {
        const formattedMessage = {
          id: data.id,
          text: data.content,
          time: new Date(data.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: "admin",
          read: true,
          timestamp: data.timestamp,
        };

        setConversations((prev) => ({
          ...prev,
          [selectedSubAdmin]: [
            ...(prev[selectedSubAdmin] || []),
            formattedMessage,
          ],
        }));

        // Update last message in subAdmins
        setSubAdmins((prev) =>
          prev.map((sa) =>
            sa.id === selectedSubAdmin
              ? {
                  ...sa,
                  lastMessage: data.content,
                  time: formatMessageTime(data.timestamp),
                }
              : sa
          )
        );

        setMessageText("");
      })
      .catch((err) => console.log(err));
  };

  // ... rest of your component (JSX and styles) remains the same ...
  return (
    <div className="notification-bell-container">
      <button
        className={`notification-bell ${
          totalUnreadCount > 0 ? "has-notifications" : ""
        }`}
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {totalUnreadCount > 0 && (
          <span className="notification-badge">{totalUnreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          {!selectedSubAdmin ? (
            <>
              <div className="notification-header">
                <div className="tabs">
                  <button
                    className={`tab ${
                      activeTab === "notifications" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("notifications")}
                  >
                    Notifications
                    {unreadNotificationsCount > 0 && (
                      <span className="tab-badge">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                  {isSubAdmin ? (
                  <button
                    className={`tab ${
                      activeTab === "messages" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("messages")}
                  >
                    Messages
                    {unreadMessagesCount > 0 && (
                      <span className="tab-badge">{unreadMessagesCount}</span>
                    )}
                  </button>):("")}
                </div>

                {activeTab === "notifications" &&
                  unreadNotificationsCount > 0 && (
                    <button
                      className="mark-all-read"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
              </div>

              <div className="notification-body">
                {activeTab === "notifications" ? (
                  notifications.length > 0 ? (
                    <div className="notification-list">
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">No notifications</div>
                  )
                ) : subAdmins.length > 0 ? (
                  <div className="sub-admin-list">
                    {subAdmins.map((subAdmin) => (
                      <div
                        key={subAdmin.id}
                        className={`sub-admin-item ${
                          subAdmin.unread ? "unread" : ""
                        }`}
                        onClick={() => selectSubAdmin(subAdmin.id)}
                      >
                        <div className="sub-admin-avatar">
                          {subAdmin.avatar ? (
                            <img
                              src={subAdmin.avatar || "/placeholder.svg"}
                              alt={subAdmin.name}
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              {subAdmin.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="sub-admin-info">
                          <div className="sub-admin-name">{subAdmin.name}</div>
                          <div className="sub-admin-message">
                            {subAdmin.lastMessage}
                          </div>
                        </div>
                        <div className="sub-admin-time">{subAdmin.time}</div>
                        {subAdmin.unread && (
                          <div className="unread-indicator"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No messages</div>
                )}
              </div>

              <div className="notification-footer">
                {activeTab === "notifications" ? (
                  <a href="/setting#notifications" className="view-all">
                    View all notifications
                  </a>
                ) : (
                  <a href="/messages" className="view-all">
                    View all messages
                  </a>
                )}
              </div>
            </>
          ) : (
            <div className="message-view">
    <div className="message-header">
      <button className="back-button" onClick={() => setSelectedSubAdmin(null)}>
        ←
      </button>
      <div className="message-recipient">
        {subAdmins.find((sa) => sa.id === selectedSubAdmin)?.name}
      </div>
    </div>
      <div className="message-body">
      {conversations[selectedSubAdmin]?.length > 0 ? (
        conversations[selectedSubAdmin].map((message) => (
          <div
            key={message.id}
            className={`message-bubble ${
              message.sender === "admin" ? "sent" : "received"
            }`}
          >
            <div className="message-content">{message.text}</div>
            <div className="message-time">
              {formatMessageTime(message.timestamp)}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-conversation">No messages yet</div>
      )}
    </div>

    <div className="message-footer">
      <input
        type="text"
        className="message-input"
        placeholder="Type a message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
      />
      <button className="send-button" onClick={sendMessage}>
        Send
      </button>
    </div>
  </div>
          )}
        </div>
      )}

      <style>{`
        .notification-bell-container {
          position: relative;
        }

        .notification-bell {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          position: relative;
          transition: background-color 0.2s;
        }

        .notification-bell:hover {
          background-color: var(--hover-bg);
        }

        .bell-icon {
          font-size: 1.2rem;
        }

        .has-notifications .bell-icon {
          animation: bell-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
          animation-iteration-count: 1;
        }

        @keyframes bell-shake {
          0% {
            transform: rotate(0);
          }
          15% {
            transform: rotate(5deg);
          }
          30% {
            transform: rotate(-5deg);
          }
          45% {
            transform: rotate(4deg);
          }
          60% {
            transform: rotate(-4deg);
          }
          75% {
            transform: rotate(2deg);
          }
          85% {
            transform: rotate(-2deg);
          }
          92% {
            transform: rotate(1deg);
          }
          100% {
            transform: rotate(0);
          }
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--danger-color);
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 320px;
          background-color: var(--bg-primary);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin-top: 10px;
          z-index: 1000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 500px;
        }

        .notification-header {
          padding: 15px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tabs {
          display: flex;
          gap: 10px;
        }

        .tab {
          background: none;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-secondary);
          position: relative;
          transition: color 0.2s;
        }

        .tab.active {
          color: var(--primary-color);
        }

        .tab-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: var(--danger-color);
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mark-all-read {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 0.8rem;
          cursor: pointer;
        }

        .notification-body {
          flex: 1;
          overflow-y: auto;
        }

        .empty-state {
          padding: 30px;
          text-align: center;
          color: var(--text-light);
        }

        .notification-footer {
          padding: 10px 15px;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }

        .view-all {
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.9rem;
        }

        .sub-admin-list {
          display: flex;
          flex-direction: column;
        }

        .sub-admin-item {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s;
        }

        .sub-admin-item:hover {
          background-color: var(--hover-bg);
        }

        .sub-admin-item.unread {
          background-color: var(--unread-bg);
        }

        .sub-admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .sub-admin-avatar img {
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

        .sub-admin-info {
          flex: 1;
          min-width: 0;
        }

        .sub-admin-name {
          font-weight: 600;
          margin-bottom: 3px;
        }

        .sub-admin-message {
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sub-admin-time {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-left: 10px;
        }

        .unread-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--primary-color);
          position: absolute;
          top: 50%;
          right: 15px;
          transform: translateY(-50%);
        }

        .message-view {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 500px;
        }

        .message-header {
          padding: 15px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
        }

        .back-button {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          margin-right: 10px;
          color: var(--text-primary);
        }

        .message-recipient {
          font-weight: 600;
        }

        .message-body {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          display: flex;
          flex-direction: column;
        }

        .message-footer {
          padding: 10px 15px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 10px;
        }

        .message-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          outline: none;
          background-color: var(--input-bg);
          color: var(--text-primary);
        }

        .message-input:focus {
          border-color: var(--primary-color);
        }

        .send-button {
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 20px;
          padding: 8px 15px;
          cursor: pointer;
          font-weight: 500;
        }

        .send-button:hover {
          background-color: var(--primary-hover);
        }

        @media (max-width: 576px) {
          .notification-dropdown {
            width: 300px;
            right: -100%;
          }
        }

        @media (max-width: 480px) {
          .notification-dropdown {
            width: 280px;
            right: -120%;
          }

          .notification-header {
            padding: 10px;
          }

          .mark-all-read {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
