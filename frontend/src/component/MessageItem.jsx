
const MessageItem = ({ message, isCurrentUser }) => {
    return (
      <div className={`message-item ${isCurrentUser ? "current-user" : "other-user"}`}>
        <div className="message-bubble">
          <div className="message-text">{message.text}</div>
          <div className="message-time">{message.time}</div>
        </div>
  
        <style>{`
          .message-item {
            display: flex;
            margin-bottom: 10px;
            max-width: 80%;
          }
          
          .current-user {
            margin-left: auto;
          }
          
          .other-user {
            margin-right: auto;
          }
          
          .message-bubble {
            padding: 10px 15px;
            border-radius: 18px;
            position: relative;
          }
          
          .current-user .message-bubble {
            background-color: var(--primary-color);
            color: white;
            border-bottom-right-radius: 4px;
          }
          
          .other-user .message-bubble {
            background-color: var(--message-bg);
            color: var(--text-primary);
            border-bottom-left-radius: 4px;
          }
          
          .message-text {
            margin-bottom: 5px;
          }
          
          .message-time {
            font-size: 0.7rem;
            opacity: 0.8;
            text-align: right;
          }
        `}</style>
      </div>
    )
  }
  
  export default MessageItem
  
  