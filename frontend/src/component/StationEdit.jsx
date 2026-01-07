// StationEdit.jsx
// This component renders a modal dialog for editing a station's details (name, address, type, latitude, longitude).
// It fetches the current station data, validates user input, and submits changes to the backend API.
// Shows error messages and disables the form while saving.

import { useState, useEffect } from "react";
import api from "../api";

function StationEdit({ onClose, station, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate form with station data when station changes
  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name || "",
        address: station.address || "",
        type: station.type || "",
        latitude: station.latitude || "",
        longitude: station.longitude || "",
      });
    }
  }, [station]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.put(`api/branchdetail/${station.id}`, formData);
      if (res.status === 200) {
        onSave(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update station. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Edit Station</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Station name field */}
          <div className="form-group">
            <label htmlFor="name">Station Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          {/* Address field */}
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          {/* Type field */}
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="b">Branch</option>
              <option value="m">Main</option>
            </select>
          </div>
          {/* Latitude field */}
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              step="any"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
            />
          </div>
          {/* Longitude field */}
          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              step="any"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
            />
          </div>
          {/* Error message */}
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      {/* Modal styling for overlay and modal content */}
      <style>{`
        .modal-overlay {
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
          padding: 20px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        input, select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .error-message {
          color: #dc3545;
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f8d7da;
          border-radius: 4px;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        .btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default StationEdit; 