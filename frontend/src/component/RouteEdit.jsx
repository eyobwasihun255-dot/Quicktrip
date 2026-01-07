
import { useState, useEffect } from "react";
import api from "../api";

const RouteEdit = ({onClose, onSave, route}) => {
  const [errors, setErrors] = useState({}); // Form validation errors
  const [message, setMessage] = useState({ type: "", text: "" }); // Success/error message
  const [formData, setFormData] = useState({
    name : '',
    route_prize: '',
  });

  // Populate form with route data when route changes
  useEffect(() => {
    if (route) {
      setFormData({
        name: route?.name || '',
        route_prize: route?.route_prize || '',
      });
    }
  }, [route]);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = "Route is required";
    }
    if (!formData.route_prize) {
      newErrors.route_prize = "Branch is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await api.patch(`api/editRoute/${route.id}/`, {
        name : formData.name,
        route_prize: formData.route_prize,
      });     
      if (res.status === 200) {
        setMessage({
          type: "success",
          text: "Route updated successfully!",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred",
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit {route.name} </h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Show success or error message */}
            {message.text && (
              <div
                className={`alert ${
                  message.type === "success" ? "alert-success" : "alert-danger"
                }`}
              >
                {message.text}
              </div>
            )}
            {/* Current route name (read-only) */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Current Route
              </label>
              <input
                type="text"
                className="form-control"
                value={
                   route 
                    ? `${route?.name|| ""} `
                    : ""
                }
                readOnly
              />
            </div>
            <h3 className="section-title">Name and price</h3>
            {/* Editable name field */}
            <div className="form-group">
              <label htmlFor="route" className="form-label">
                Name
              </label>
             <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })}
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  min="0"
                  step="0.1"
                />
              {errors.name && (
                <div className="error-message">{errors.name}</div>
              )}
            </div>
            {/* Editable price field */}
            <div className="form-group">
              <label htmlFor="driver" className="form-label">
                Price
              </label>
             <input
                  type="text"
                  name="price"
                  placeholder="Price"
                  value={formData.route_prize}
                  onChange={(e) =>
                  setFormData({ ...formData,route_prize: parseFloat(e.target.value) })}
                  className={`form-control ${errors.route_prize ? "is-invalid" : ""}`}
                  min="0"
                  step="0.1"
                />
              {errors.route_prize && (
                <div className="error-message">{errors.route_prize}</div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Modal styling for backdrop and modal content */}
      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          border-radius: 8px;
          width: 500px;
          max-width: 90%;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-title {
          margin: 0;
          font-size: 1.25rem;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .modal-body {
          padding: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .is-invalid {
          border-color: #dc3545;
        }
        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 5px;
        }
        .modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
        }
        .btn-primary {
          background: #007bff;
          color: white;
          border: none;
        }
        .alert {
          padding: 10px 15px;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        .alert-success {
          background: #d4edda;
          color: #155724;
        }
        .alert-danger {
          background: #f8d7da;
          color: #721c24;
        }
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 20px 0 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
        }
      `}</style>
    </div>
  );
};

export default RouteEdit;