
const NotificationItem = ({ notification, onMarkAsRead }) => {
    return (
      <div className={`notification-item ${notification.read ? "" : "unread"}`}>
        <div className="notification-content">
          <div className="notification-title">{notification.title}</div>
          <div className="notification-message">{notification.message}</div>
          <div className="notification-time">{notification.time}</div>
        </div>
  
        {!notification.read && (
          <button className="mark-read-btn" onClick={() => onMarkAsRead(notification.id)} aria-label="Mark as read">
            ✓
          </button>
        )}
  
        <style>{`
          .notification-item {
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color);
            transition: background-color 0.2s;
          }
          
          .notification-item:last-child {
            border-bottom: none;
          }
          
          .notification-item:hover {
            background-color: var(--hover-bg);
          }
          
          .notification-item.unread {
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
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 5px;
          }
          
          .notification-time {
            font-size: 0.8rem;
            color: var(--text-light);
          }
          
          .mark-read-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            margin-left: 10px;
            font-size: 0.8rem;
          }
          
          .mark-read-btn:hover {
            background-color: var(--primary-hover);
          }
        `}</style>
      </div>
    )
  }
  
  export default NotificationItem
  
  