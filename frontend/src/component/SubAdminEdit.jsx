import { useState, useEffect } from "react";
import api from "../api";

const SubAdminEdit = ({ onClose, onSave, subAdmin }) => {
  const [branchs, setBranchs] = useState([]);
  const [errors, setErrors] = useState({});
  const [ setBranch] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    position: "",
    branch: null,
  });

  const formatApiError = (error) => {
    const data = error?.response?.data
    if (!data) return "An error occurred"
    if (typeof data === "string") return data

    if (Array.isArray(data)) {
      return data.filter(Boolean).join("\n") || "An error occurred"
    }

    if (typeof data === "object") {
      const nfe = data.non_field_errors
      if (Array.isArray(nfe) && nfe.length) return nfe[0]

      const [firstKey] = Object.keys(data)
      if (firstKey) {
        const val = data[firstKey]
        if (Array.isArray(val)) return `${firstKey}: ${val[0]}`
        if (val && typeof val === "object") return `${firstKey}: ${JSON.stringify(val)}`
        return `${firstKey}: ${String(val)}`
      }
    }

    return "An error occurred"
  }

  useEffect(() => {
    getBranch();
    if (subAdmin) {
      setFormData({
        position: subAdmin.employee?.position || "",
        branch: subAdmin.branch?.id || null,
      });
      setBranch(subAdmin.branch);
    }
  }, [subAdmin]);

  const getBranch = () => {
    api
      .get(`api/edit_branch/`)
      .then((res) => res.data)
      .then((data) => {
        setBranchs(data);
      })
      .catch((err) => console.log(err));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }

    if (!formData.branch) {
      newErrors.branch = "Branch is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // First update the employee position
      await api.patch(`api/employee-detail/${subAdmin.employee.id}/`, {
        position: formData.position,
      });

      // Then update the user's branch
      const res = await api.patch(`api/userss/${subAdmin.id}/`, {
        // UserDetailView uses UserSerializers; FK fields accept pk integers.
        branch: formData.branch,
      });

      if (res.status === 200) {
        setMessage({
          type: "success",
          text: "Sub-Admin updated successfully!",
        });
        onSave(); // Notify parent component of successful update
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: formatApiError(error),
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit {subAdmin.employee.position}</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {message.text && (
              <div
                className={`alert ${
                  message.type === "success" ? "alert-success" : "alert-danger"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Current Sub-Admin
              </label>
              <input
                type="text"
                className="form-control"
                value={
                  subAdmin
                    ? `${subAdmin.employee?.Fname || ""} ${
                        subAdmin.employee?.Lname || ""
                      }`
                    : ""
                }
                readOnly
              />
            </div>

            <h3 className="section-title">Role & Station</h3>

            <div className="form-group">
              <label htmlFor="position" className="form-label">
                Job Position
              </label>
              <select
                className={`form-control ${
                  errors.position ? "is-invalid" : ""
                }`}
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              >
                <option value="">Select Position</option>
                <option value="Station Manager">Station Manager</option>
                <option value="Branch Operator">Branch Operator</option>
              </select>
              {errors.position && (
                <div className="error-message">{errors.position}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="branch" className="form-label">
                Branch
              </label>
              <select
                className={`form-control ${errors.branch ? "is-invalid" : ""}`}
                value={formData.branch || ""}
                onChange={(e) =>
                  setFormData({ ...formData, branch: parseInt(e.target.value) })
                }
                required
              >
                <option value="">Select a branch</option>
                {branchs.map((br) => (
                  <option key={br.id} value={br.id}>
                    {br.name}
                  </option>
                ))}
              </select>
              {errors.branch && (
                <div className="error-message">{errors.branch}</div>
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

export default SubAdminEdit;