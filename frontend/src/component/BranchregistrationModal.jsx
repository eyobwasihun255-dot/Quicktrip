
import { useState } from "react"
import api from "../api"
const BranchRegistrationModal = ({ onClose  }) => {
  // eslint-disable-next-line no-empty-pattern
  const [] = useState("")
  const [formData, setFormData] = useState({
    address: "",
    type: "",
    name: "",
  })
  const [locat, setlocat] = useState({latitude:"0.0",longitude:"0.0"})
  const [errors, setErrors] = useState({})

  // Handle form submission
  const addbranch = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        type: formData.type,
        location: {
          latitude: parseFloat(locat.latitude),
          longitude: parseFloat(locat.longitude)
        }
      };
      const res = await api.post(`api/branch/`, payload);
      if (res.status === 201) {
        onClose();
        
      }
    } catch (error) {
      console.error("Error creating branch:", error);
      console.log(error);
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = "Branch name is required"
    }
    if (!formData.address.trim()) {
      newErrors.address= "Address is required"
    }
    if (!formData.type) {
      newErrors.type = "type is required"
    }
    if (!locat.latitude || !locat.longitude) {
      newErrors.type = "Coordinates are required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Register New Station </h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form >
            <h3 className="section-title">Station Information</h3>
            {/* Branch name field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Branch Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name :e.target.value
                  }))}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            <h3 className="section-title">Branch Information</h3>
            <div className="form-row">
              {/* Address field */}
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className={`form-control ${errors.address ? "is-invalid" : ""}`}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address :e.target.value
                  }))}
                />
                {errors.address && <div className="error-message">{errors.address}</div>}
              </div>
            </div>
            <div className="form-row">
              {/* Type dropdown */}
              <div className="form-group">
                <select className="filter-dropdown" value={formData.type}  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    type :e.target.value
                  }))}>
                  <option value="">All Types</option>
                  <option value="m">Main </option>
                  <option value="b">Branch</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              {/* Longitude field */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Longitude
                </label>
                <input
                  type="text"
                  id="long"
                  name="long"
                  className={`form-control ${errors.coor? "is-invalid" : ""}`}
                  value={locat.longitude}
                  onChange={(e) => setlocat(prev => ({
                      ...prev,
                      longitude :e.target.value
                    }))}
                />
                {errors.coor && <div className="error-message">{errors.coor}</div>}
              </div>
              {/* Latitude field */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Latitude
                </label>
                <input
                  type="text"
                  id="name"
                  name="lat"
                  className={`form-control ${errors.coor? "is-invalid" : ""}`}
                  value={locat.latitude}
                  onChange={(e) => setlocat(prev => ({
                      ...prev,
                      latitude :e.target.value
                    }))}
                />
                {errors.coor && <div className="error-message">{errors.coor}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" onClick={addbranch}>
                Register Branch
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Modal styling for backdrop and modal content */}
      <style>{`
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 20px 0 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid var(--border-color);
        }
        .form-row {
          display: flex;
          gap: 15px;
        }
        .form-row .form-group {
          flex: 1;
        }
        .is-invalid {
          border-color: var(--danger-color);
        }
        .error-message {
          color: var(--danger-color);
          font-size: 0.875rem;
          margin-top: 5px;
        }
        .file-hint {
          font-size: 0.8rem;
          color: var(--text-light);
        }
        .file-item.document {
          width: 100%;
          height: auto;
          display: flex;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.05);
          padding: 10px;
        }
        .document-icon {
          font-size: 1.5rem;
          margin-right: 10px;
        }
        .document-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  )
}

export default BranchRegistrationModal

