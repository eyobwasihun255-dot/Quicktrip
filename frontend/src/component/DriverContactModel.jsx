import { useState } from "react";

const DriverContactModal = ({ driver, onClose }) => {
  const [messageTab, setMessageTab] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // In a real app, this would send the message via API
    // For this demo, we'll simulate sending with a timeout
    setTimeout(() => {
      setMessageSent(true);
      setMessage("");

      // Reset success message after 3 seconds
      setTimeout(() => {
        setMessageSent(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal contact-modal">
        <div className="modal-header">
          <h2 className="modal-title">Driver Contact Information</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="tabs">
            <button
              className={`tab ${!messageTab ? "active" : ""}`}
              onClick={() => setMessageTab(false)}
            >
              Contact Info
            </button>
            <button
              className={`tab ${messageTab ? "active" : ""}`}
              onClick={() => setMessageTab(true)}
            >
              Send Message
            </button>
          </div>

          {!messageTab ? (
            <div className="contact-info">
              <div className="driver-profile">
                <div className="avatar">
                  <div className="avatar-placeholder">
                    {driver.employee.Fname.charAt(0)}
                  </div>
                </div>
                <h3 className="driver-name">{driver.employee.Fname}</h3>
              </div>

              <div className="info-section">
                <h4>Contact Details</h4>
                <div className="info-item">
                  <div className="info-icon">📱</div>
                  <div className="info-content">
                    <div className="info-label">Phone Number</div>
                    <div className="info-value">{driver.phone_number}</div>
                    <div className="info-actions">
                      <a href="tel:+15551234567" className="action-link">
                        Call
                      </a>
                      <a href="sms:+15551234567" className="action-link">
                        Text
                      </a>
                    </div>
                  </div>
                </div>

                 
              </div>

              <div className="info-section">
                <h4>Driver Information</h4>
                <div className="info-item">
                  <div className="info-icon">🆔</div>
                  <div className="info-content">
                    <div className="info-label">Driver ID</div>
                    <div className="info-value">{driver.id}</div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <div className="info-label">Current Station</div>
                    <div className="info-value">{driver.branch.address}</div>
                  </div>
                </div>
              </div>

              <div className="contact-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setMessageTab(true)}
                >
                  Send Message
                </button>
              </div>
            </div>
          ) : (
            <div className="message-form">
              {messageSent ? (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <p>Message sent successfully!</p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="messageSubject" className="form-label">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="messageSubject"
                      className="form-control"
                      placeholder="Enter message subject"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="messageContent" className="form-label">
                      Message
                    </label>
                    <textarea
                      id="messageContent"
                      className="form-control"
                      rows={5}
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="message-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setMessageTab(false)}
                    >
                      Back
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                    >
                      Send Message
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .contact-modal {
          max-width: 500px;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 20px;
        }

        .tab {
          padding: 10px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .tab.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        .driver-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--primary-color);
          color: white;
          font-size: 2rem;
          font-weight: bold;
        }

        .driver-name {
          font-size: 1.2rem;
          margin: 0;
        }

        .info-section {
          margin-bottom: 20px;
        }

        .info-section h4 {
          font-size: 1rem;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid var(--border-color);
        }

        .info-item {
          display: flex;
          margin-bottom: 15px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-secondary);
          border-radius: 8px;
          margin-right: 15px;
          font-size: 1.2rem;
        }

        .info-content {
          flex: 1;
        }

        .info-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }

        .info-value {
          font-weight: 500;
          margin-bottom: 5px;
        }

        .info-actions {
          display: flex;
          gap: 15px;
        }

        .action-link {
          color: var(--primary-color);
          font-size: 0.9rem;
          text-decoration: none;
        }

        .action-link:hover {
          text-decoration: underline;
        }

        .contact-actions {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .message-form {
          padding: 10px 0;
        }

        .message-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .success-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 30px 0;
          text-align: center;
        }

        .success-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: var(--success-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .success-message p {
          font-size: 1.1rem;
          color: var(--success-color);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default DriverContactModal;
