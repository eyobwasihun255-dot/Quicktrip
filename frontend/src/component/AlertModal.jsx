// AlertModal.jsx
// This component renders a modal dialog for alerting the user, typically for confirming destructive actions like deletion.
// It displays a title, message, and Cancel/Delete buttons. The modal is only shown when isOpen is true.

import React from 'react';

const AlertModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null; // Do not render if not open

  return (
    <div className="alert-modal-backdrop">
      <div className="alert-modal">
        <div className="alert-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="alert-modal-body">
          <p>{message}</p>
        </div>
        <div className="alert-modal-footer">
          {/* Cancel and Delete buttons */}
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
      {/* Modal styling for backdrop and modal content */}
      <style>{`
        .alert-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        }
        .alert-modal {
          background: white;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .alert-modal-header {
          padding: 1rem;
          border-bottom: 1px solid #dee2e6;
        }
        .alert-modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #dc3545;
        }
        .alert-modal-body {
          padding: 1rem;
        }
        .alert-modal-body p {
          margin: 0;
          color: #666;
        }
        .alert-modal-footer {
          padding: 1rem;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        .btn {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        .btn-secondary:hover {
          background-color: #5a6268;
        }
        .btn-danger {
          background-color: #dc3545;
          color: white;
        }
        .btn-danger:hover {
          background-color: #c82333;
        }
      `}</style>
    </div>
  );
};

export default AlertModal; 