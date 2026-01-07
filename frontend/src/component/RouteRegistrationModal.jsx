// RouteRegistrationModal.jsx
// This component renders a modal dialog for registering a new route.
// It collects route information (name, fare, distance, destinations), validates input, and submits to the backend API.
// Shows error messages and disables the form while saving.

import { useState, useEffect } from "react";
import api from "../api";

const RouteRegisterModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    prize: "",
    distance: "",
    first_destination: "",
    last_destination: ""
  });
  const [branch, setBranch] = useState([]); // List of available branches
  const [errors, setErrors] = useState({}); // Form validation errors
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission state

  // Fetch branch list on mount
  useEffect(() => {
    getBranch();
  }, []);

  // Fetch branches from API
  const getBranch = () => {
    api
      .get('api/branch/')
      .then((res) => res.data)
      .then((data) => {
        setBranch(data);
        // Set initial values for destinations if branches exist
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            first_destination: data[0].id.toString(),
            last_destination: data[0].id.toString()
          }));
        }
      })
      .catch((err) => console.log(err));
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Route name is required";
    }
    if (!formData.prize.trim()) {
      newErrors.prize = "Fare is required";
    } else if (isNaN(formData.prize) || Number(formData.prize) <= 0) {
      newErrors.prize = "Fare must be a positive number";
    }
    if (!formData.distance.trim()) {
      newErrors.distance = "Distance is required";
    } else if (isNaN(formData.distance) || Number(formData.distance) <= 0) {
      newErrors.distance = "Distance must be a positive number";
    }
    if (!formData.first_destination) {
      newErrors.first_destination = "First destination is required";
    }
    if (!formData.last_destination) {
      newErrors.last_destination = "Last destination is required";
    } else if (formData.first_destination === formData.last_destination) {
      newErrors.last_destination = "Destinations must be different";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('api/route/', {
        name: formData.name,
        first_destination: formData.first_destination,
        last_destination: formData.last_destination,
        route_prize: formData.prize,
        distance: formData.distance,
      });
      if (res.status === 201) {
        onSave(); // Notify parent component about successful save
        onClose();
      }
    } catch (error) {
      console.error("Error creating route:", error);
      setErrors({
        ...errors,
        api: error.response?.data?.message || "Failed to create route"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Register New Route</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {/* Show API error if present */}
          {errors.api && (
            <div className="alert alert-danger">{errors.api}</div>
          )}
          <form onSubmit={handleSubmit}>
            <h3 className="section-title">Route Information</h3>
            {/* Route name field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Route Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Route Name"
                value={formData.name}
                onChange={handleChange}
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
              />
              {errors.name && (
                <div className="error-message">{errors.name}</div>
              )}
            </div>
            <h3 className="section-title">Route Details</h3>
            <div className="form-row">
              {/* Fare field */}
              <div className="form-group">
                <label htmlFor="prize" className="form-label">
                  Fare
                </label>
                <input
                  type="number"
                  name="prize"
                  placeholder="Fare"
                  value={formData.prize}
                  onChange={handleChange}
                  className={`form-control ${errors.prize ? "is-invalid" : ""}`}
                  min="0"
                  step="0.01"
                />
                {errors.prize && (
                  <div className="error-message">{errors.prize}</div>
                )}
              </div>
              {/* Distance field */}
              <div className="form-group">
                <label htmlFor="distance" className="form-label">
                  Distance (km)
                </label>
                <input
                  type="number"
                  name="distance"
                  placeholder="Distance"
                  value={formData.distance}
                  onChange={handleChange}
                  className={`form-control ${errors.distance ? "is-invalid" : ""}`}
                  min="0"
                  step="0.1"
                />
                {errors.distance && (
                  <div className="error-message">{errors.distance}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              {/* First destination dropdown */}
              <div className="form-group">
                <label htmlFor="first_destination" className="form-label">
                  First Destination
                </label>
                <select
                  name="first_destination"
                  className={`form-control ${errors.first_destination ? "is-invalid" : ""}`}
                  value={formData.first_destination}
                  onChange={handleChange}
                >
                  {branch.map((branchItem) => (
                    <option key={branchItem.id} value={branchItem.id}>
                      {branchItem.name}
                    </option>
                  ))}
                </select>
                {errors.first_destination && (
                  <div className="error-message">{errors.first_destination}</div>
                )}
              </div>
              {/* Last destination dropdown */}
              <div className="form-group">
                <label htmlFor="last_destination" className="form-label">
                  Last Destination
                </label>
                <select
                  name="last_destination"
                  className={`form-control ${errors.last_destination ? "is-invalid" : ""}`}
                  value={formData.last_destination}
                  onChange={handleChange}
                >
                  {branch.map((branchItem) => (
                    <option 
                      key={branchItem.id} 
                      value={branchItem.id}
                      disabled={branchItem.id.toString() === formData.first_destination}
                    >
                      {branchItem.name}
                    </option>
                  ))}
                </select>
                {errors.last_destination && (
                  <div className="error-message">{errors.last_destination}</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register Route"}
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
          width: 600px;
          max-width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          padding: 16px 24px;
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
          padding: 24px;
        }
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 20px 0 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .form-control.is-invalid {
          border-color: #dc3545;
        }
        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 4px;
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          flex: 1;
        }
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
          border: none;
        }
        .btn-primary {
          background-color: #007bff;
          color: white;
          border: none;
        }
        .btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .alert {
          padding: 12px;
          margin-bottom: 16px;
          border-radius: 4px;
        }
        .alert-danger {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>
    </div>
  );
};

export default RouteRegisterModal;