import { useState, useEffect } from "react";
import api from "../api";
import { BRANCH } from "../constants";

const VehicleManagementModal = ({ mode = "edit", vehicleId , onClose, onSave, onDelete }) => {
  // Modes: 'create', 'edit', 'view', 'delete'
  const [routes, setRoutes] = useState([]);
  const branch = localStorage.getItem(BRANCH);
  const [drivers, setDrivers] = useState([]);
  const [types, setTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    branch: branch,
    user: "",
    name: "",
    plate_number: "",
    Model: "",
    year: "",
    color: "#000000",
    sit_number: "",
    types: "",
    insurance_date: "",
    route: "",
  });

  // File states
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState("");
  const [Vpicture, setVPicture] = useState(null);
  const [Vpreview, setVPreview] = useState("");
  
  // Error state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
    if (mode !== 'create' && vehicleId) {
      fetchVehicleData();
    }
  }, [mode, vehicleId]);

  const fetchInitialData = async () => {
    try {
      const [driversRes, typesRes, routesRes] = await Promise.all([
        api.get('api/driver/'),
        api.get('api/level/'),
        api.get('api/route/')
      ]);
      
      setDrivers(driversRes.data);
      setTypes(typesRes.data);
      setRoutes(routesRes.data);
    } catch (err) {
      console.error("Error fetching initial data:", err);
    }
  };

  const fetchVehicleData = async () => {
    try {
      const res = await api.get(`api/vehicle/${vehicleId}/`);
      const vehicle = res.data;
      
      // Set form data
      setFormData({
        branch: vehicle.branch,
        user: vehicle.user?.id || "",
        name: vehicle.name,
        plate_number: vehicle.plate_number,
        Model: vehicle.Model,
        year: vehicle.year,
        color: vehicle.color || "#000000",
        sit_number: vehicle.sit_number,
        types: vehicle.types?.id || "",
        insurance_date: vehicle.insurance_date?.split('T')[0] || "",
        route: vehicle.route?.id || "",
      });

      // Set previews if available
      if (vehicle.picture) {
        setVPreview(vehicle.picture);
      }
      if (vehicle.insurance_doc) {
        setPreview(vehicle.insurance_doc);
      }
    } catch (err) {
      console.error("Error fetching vehicle data:", err);
    }
  };

  const handleVehicleImageChange = (e) => {
    if (!e?.target?.files?.length) return;

    const file = e.target.files[0];
    
    // Validate file
    if (!file.type.match('image.*')) {
      setErrors(prev => ({...prev, vehicleImage: "Only image files are allowed"}));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({...prev, vehicleImage: "File size must be less than 5MB"}));
      return;
    }

    setVPicture(file);
    const reader = new FileReader();
    reader.onloadend = () => setVPreview(reader.result);
    reader.readAsDataURL(file);
    
    if (errors.vehicleImage) {
      setErrors(prev => ({...prev, vehicleImage: null}));
    }
  };

  const handleImageChange = (e) => {
    if (!e?.target?.files?.length) return;

    const file = e.target.files[0];
    
    // Validate file
    if (!file.type.match('image.*')) {
      setErrors(prev => ({...prev, insuranceDoc: "Only image files are allowed"}));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({...prev, insuranceDoc: "File size must be less than 5MB"}));
      return;
    }

    setPicture(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    
    if (errors.insuranceDoc) {
      setErrors(prev => ({...prev, insuranceDoc: null}));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user && mode !== 'delete') {
      newErrors.user = "Driver is required";
    }

    if (!formData.name.trim() && mode !== 'delete') {
      newErrors.name = "Car brand is required";
    }

    if (!formData.plate_number.trim() && mode !== 'delete') {
      newErrors.plate_number = "License plate is required";
    }

    if (!formData.year && mode !== 'delete') {
      newErrors.year = "Year is required";
    }

    if (!formData.Model.trim() && mode !== 'delete') {
      newErrors.Model = "Model is required";
    }

    if (!formData.sit_number && mode !== 'delete') {
      newErrors.sit_number = "Seat number is required";
    }

    if (!formData.types && mode !== 'delete') {
      newErrors.types = "Vehicle type is required";
    }

    if (!formData.route && mode !== 'delete') {
      newErrors.route = "Route is required";
    }

    if (!formData.insurance_date && mode !== 'delete') {
      newErrors.insurance_date = "Insurance expiry date is required";
    }

    if (!picture && !preview && mode !== 'delete') {
      newErrors.insuranceDoc = "Insurance document is required";
    }

    if (!Vpicture && !Vpreview && mode !== 'delete') {
      newErrors.vehicleImage = "Vehicle image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onClose();
      return;
    }

    if (mode !== 'delete' && !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (mode === 'create' || mode === 'edit') {
        const formDataToSend = new FormData();
        
        // Append all form fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formDataToSend.append(key, value);
          }
        });
        
        // Append files
        if (Vpicture) formDataToSend.append('picture', Vpicture);
        if (picture) formDataToSend.append('insurance_doc', picture);

        const endpoint = mode === 'create' 
          ? `api/vehicle/${branch}` 
          : `api/vehicle/${vehicleId}/`;
        
        const method = mode === 'create' ? 'post' : 'put';
        
        const res = await api[method](endpoint, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (res.status === 200 || res.status === 201) {
          onSave?.(res.data);
          onClose();
        }
      } else if (mode === 'delete') {
        const res = await api.delete(`api/vehicle/${vehicleId}/`);
        if (res.status === 204) {
          onDelete?.(vehicleId);
          onClose();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        console.log(error.message || "Operation failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (label, name, type = "text", options = null) => {
    const value = formData[name];
    const error = errors[name];
    
    if (mode === 'view') {
      if (options) {
        const selectedOption = options.find(opt => opt.id === value);
        return (
          <div className="form-group">
            <label className="form-label">{label}</label>
            <div className="form-control view-mode">
              {selectedOption?.detail || selectedOption?.name || selectedOption?.Fname + ' ' + selectedOption?.Lname || 'N/A'}
            </div>
          </div>
        );
      }
      return (
        <div className="form-group">
          <label className="form-label">{label}</label>
          <div className="form-control view-mode">
            {value || 'N/A'}
          </div>
        </div>
      );
    }

    if (type === "select" && options) {
      return (
        <div className="form-group">
          <label htmlFor={name} className="form-label">{label}</label>
          <select
            id={name}
            name={name}
            className={`form-control ${error ? "is-invalid" : ""}`}
            value={value}
            onChange={handleChange}
            disabled={mode === 'delete'}
            required={mode !== 'delete'}
          >
            <option value="">-- Select {label} --</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.detail || option.name || `${option.employee?.Fname} ${option.employee?.Lname}`}
              </option>
            ))}
          </select>
          {error && <div className="error-message">{error}</div>}
        </div>
      );
    }

    return (
      <div className="form-group">
        <label htmlFor={name} className="form-label">{label}</label>
        <input
          type={type}
          id={name}
          name={name}
          className={`form-control ${error ? "is-invalid" : ""}`}
          value={value}
          onChange={handleChange}
          disabled={mode === 'delete' || mode === 'view'}
          required={mode !== 'delete'}
          min={type === "number" ? "1" : undefined}
          max={type === "number" ? new Date().getFullYear() + 1 : undefined}
        />
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  };

  const renderFileField = (label, name, preview, onChange, currentPreview) => {
    if (mode === 'view') {
      return (
        <div className="form-group">
          <label className="form-label">{label}</label>
          {currentPreview ? (
            <div className="file-preview">
              <img src={currentPreview} alt={`${label} Preview`} style={{maxWidth: '200px'}} />
            </div>
          ) : (
            <div className="form-control view-mode">No file</div>
          )}
        </div>
      );
    }

    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div className="file-upload-container">
          <label className="file-upload-label">
            <input 
              type="file" 
              onChange={onChange} 
              accept="image/*"
              className="file-upload-input"
              disabled={mode === 'delete'}
            />
            <span className="file-upload-button">Choose File</span>
            <span className="file-upload-text">
              {name === 'vehicleImage' ? 
                (Vpicture ? Vpicture.name : "No file chosen") : 
                (picture ? picture.name : "No file chosen")}
            </span>
          </label>
        </div>
        {errors[name] && <div className="error-message">{errors[name]}</div>}
        {(preview || currentPreview) && (
          <div className="file-preview">
            <img src={preview || currentPreview} alt={`${label} Preview`} style={{maxWidth: '200px'}} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' && 'Register New Vehicle'}
            {mode === 'edit' && 'Edit Vehicle'}
            {mode === 'view' && 'Vehicle Details'}
            {mode === 'delete' && 'Delete Vehicle'}
          </h2>
          <button className="modal-close" onClick={onClose} disabled={isSubmitting}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <h3 className="section-title">Driver Information</h3>
            {renderField("Driver", "user", "select", drivers)}

            <h3 className="section-title">Vehicle Information</h3>
            <div className="form-row">
              {renderField("Car Brand", "name")}
              {renderField("Year", "year", "number")}
            </div>

            <div className="form-row">
              {renderField("Plate Number", "plate_number")}
              {renderField("Model", "Model")}
            </div>

            <div className="form-row">
              {renderField("Color", "color", "color")}
              {renderField("Seat Number", "sit_number", "number")}
            </div>

            <div className="form-row">
              {renderField("Vehicle Type", "types", "select", types)}
              {renderField("Route", "route", "select", routes)}
            </div>

            <h3 className="section-title">Insurance Information</h3>
            <div className="form-row">
              {renderField("Insurance Expiry Date", "insurance_date", "date")}
              {renderFileField(
                "Insurance Document", 
                "insuranceDoc", 
                preview, 
                handleImageChange,
                preview // current preview from fetched data
              )}
            </div>

            <h3 className="section-title">Vehicle Image</h3>
            {renderFileField(
              "Vehicle Image", 
              "vehicleImage", 
              Vpreview, 
              handleVehicleImageChange,
              Vpreview // current preview from fetched data
            )}

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose} 
                disabled={isSubmitting}
              >
                {mode === 'view' ? 'Close' : 'Cancel'}
              </button>
              
              {mode === 'delete' && (
                <button 
                  type="submit" 
                  className="btn btn-danger" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Vehicle'}
                </button>
              )}
              
              {(mode === 'create' || mode === 'edit') && (
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : mode === 'create' ? 'Register Vehicle' : 'Save Changes'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

  <style>{`
        .modal {          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .view-mode {
          background-color: #f8f9fa;
          padding: 8px 12px;
          border-radius: 4px;
          min-height: 38px;
        }
        
        .btn-danger {
          background-color: #dc3545;
          color: white;
        }
        
        .btn-danger:hover {
          background-color: #c82333;
        }
        
        /* Add any additional styles from your original component */
      `}</style>
    </div>
  );
};

export default VehicleManagementModal;