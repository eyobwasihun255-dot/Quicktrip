// src/components/NotificationPopup.jsx 
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api";
import { USER_ID } from "../constants";

const NotificationPopup = () => {
  const [notification, setNotification] = useState(null);
  const [hasShown, setHasShown] = useState(false); 
  const navigate = useNavigate();
  const userId = localStorage.getItem(USER_ID);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        if (hasShown) return; 

        const res = await api.get(`api/notifications/${userId}/`);
        const data = await res.data;
        if (data.length > 0) {
          setNotification(data[0]); 
          setHasShown(true);       
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    const interval = setInterval(fetchNotification, 30000);
    return () => clearInterval(interval);
  }, [userId, hasShown]);

  const handleGoToPayment = () => {
    setNotification(null);         // dismiss before navigating
    navigate("/payment");
  };

  if (!notification) return null;

  return (
    <div style={overlayStyle}>
      <div style={popupStyle}>
        <p>{notification.message}</p>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleGoToPayment} style={buttonStyle}>Go to Payment</button>
          <button onClick={() => setNotification(null)} style={closeButtonStyle}>Dismiss</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.6)", // dark background
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9998
};

const popupStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "2rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  zIndex: 9999,
  maxWidth: "400px",
  width: "80%",
  textAlign: "center"
};

const buttonStyle = {
  marginRight: "10px",
  padding: "8px 12px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

const closeButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#6c757d"
};

export default NotificationPopup;
