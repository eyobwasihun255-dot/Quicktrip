import { useEffect, useState } from "react";
import api from "../api";
import NotificationItem from "../component/NotificationItem";
import { USER_ID } from "../constants";

function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem(USER_ID);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    setError("");
    api
      .get(`api/ad_notif/${userId}`)
      .then((res) => res.data)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load notifications"))
      .finally(() => setLoading(false));
  };

  const handleMarkAsRead = (notifId) => {
    api
      .put(`api/ad_notifs/${notifId}`, { read: true })
      .then((res) => {
        if (res.status === 200) {
          setItems((prev) =>
            prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
          );
        }
      })
      .catch(() => setError("Failed to mark as read"));
  };

  const handleMarkAll = () => {
    api
      .put(`api/ad_notifs/mark_all_read/`, { user_id: userId })
      .then((res) => {
        if (res.status === 200) {
          setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        }
      })
      .catch(() => setError("Failed to mark all as read"));
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2>Notifications</h2>
        <div className="page-actions">
          <button className="btn" onClick={fetchNotifications} disabled={loading}>
            Refresh
          </button>
          <button className="btn" onClick={handleMarkAll} disabled={loading}>
            Mark all as read
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">No notifications</div>
      ) : (
        <div className="notification-list">
          {items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
