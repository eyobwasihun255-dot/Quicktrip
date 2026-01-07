import { useState, useEffect } from "react";
import api from "../api";
import { BRANCH } from "../constants";

const VehicleRegistrationModal = ({ onClose }) => {
  const [routes, setRoutes] = useState([]);
  const branch = localStorage.getItem(BRANCH);
  const [driver, setDriver] = useState([]);
  const [type, setType] = useState([]);
  const [user, setUser] = useState([]);
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState("");
  const [Vpicture, setVPicture] = useState(null);
  const [Vpreview, setVPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // eslint-disable-next-line no-empty-pattern
  const [] = useState("");
  const [formData, setFormData] = useState({
    branch: branch,
    name: "",
    plate_number: "",
    Model: "",
    year: "",
    color: "#000000",
    sit_number: "",
    types: "",
    insurance_date: "",
    route: "",
    long: false,
    detail: "",
    payment_rate: 0.0,
    user: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    getDriver();
    getType();
    getRoute();
  }, []);

  const getDriver = () => {
    api
      .get('api/driver/')
      .then((res) => res.data)
      .then((data) => setDriver(data))
      .catch((err) => console.error("Error fetching drivers:", err));
  };

  const getType = () => {
    api
      .get('api/level/')
      .then((res) => res.data)
      .then((data) => setType(data))
      .catch((err) => console.error("Error fetching vehicle types:", err));
  };

  const getRoute = async () => {
    try {
      const res = await api.get(`api/route/`);
      setRoutes(res.data);
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setRoutes([]);
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
    
    // Clear any previous error
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
    
    // Clear any previous error
    if (errors.insuranceDoc) {
      setErrors(prev => ({...prev, insuranceDoc: null}));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!user) {
      newErrors.user = "Driver is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Car brand is required";
    }

    if (!formData.plate_number.trim()) {
      newErrors.plate_number = "License plate is required";
    }

    if (!formData.year) {
      newErrors.year = "Year is required";
    }

    if (!formData.Model.trim()) {
      newErrors.Model = "Model is required";
    }

    if (!formData.sit_number) {
      newErrors.sit_number = "Seat number is required";
    }

    if (!formData.types) {
      newErrors.types = "Vehicle type is required";
    }

    if (!formData.route) {
      newErrors.route = "Route is required";
    }

    if (!formData.insurance_date) {
      newErrors.insurance_date = "Insurance expiry date is required";
    }

    if (!picture) {
      newErrors.insuranceDoc = "Insurance document is required";
    }

    if (!Vpicture) {
      newErrors.vehicleImage = "Vehicle image is required";
    }

    if (formData.is_long && !formData.long_detail.trim()) {
      newErrors.long_detail = "Long vehicle detail is required when marked as long";
    }

    if (formData.rate < 0) {
      newErrors.rate = "Rate cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addVehicle = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      // Append files and user
      formDataToSend.append('user', user);
      if (Vpicture) formDataToSend.append('picture', Vpicture);
      if (picture) formDataToSend.append('insurance_doc', picture);

      const res = await api.post(`api/add_vehicle/${branch}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (res.status === 201) {
        window.location.href = `/vehicles`;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response?.data) {
        // Handle server validation errors
        setErrors(error.response.data);
      } else {
        console.log(error.message || "Failed to register vehicle");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Register New Vehicle</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={addVehicle}>
            <h3 className="section-title">Driver Information</h3>

            <div className="form-group">
              <label htmlFor="driver" className="form-label">
                Driver 
              </label>
              <select 
                id="driver" 
                value={user} 
                className={`form-control ${errors.user ? "is-invalid" : ""}`}
                onChange={(e) => {
                  setUser(e.target.value);
                  setFormData(prev => ({...prev, user: e.target.value}));
                }}
                required
              >
                <option value="">-- Select Driver --</option>
                {driver.map((drivers) => (
                  <option key={drivers.id} value={drivers.id}>
                    {`${drivers.employee.Fname} ${drivers.employee.Lname}`}
                  </option>
                ))}
              </select>
              {errors.user && <div className="error-message">{errors.user}</div>}
            </div>

            <h3 className="section-title">Vehicle Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Car Brand
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="year" className="form-label">
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  className={`form-control ${errors.year ? "is-invalid" : ""}`}
                  value={formData.year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
                {errors.year && <div className="error-message">{errors.year}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="plate_number" className="form-label">
                  Plate Number
                </label>
                <input
                  type="text"
                  id="plate_number"
                  name="plate_number"
                  className={`form-control ${errors.plate_number ? "is-invalid" : ""}`}
                  value={formData.plate_number}
                  onChange={handleChange}
                  required
                />
                {errors.plate_number && <div className="error-message">{errors.plate_number}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="Model" className="form-label">
                  Model
                </label>
                <input
                  type="text"
                  id="Model"
                  name="Model"
                  className={`form-control ${errors.Model ? "is-invalid" : ""}`}
                  value={formData.Model}
                  onChange={handleChange}
                  required
                />
                {errors.Model && <div className="error-message">{errors.Model}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="color" className="form-label">
                  Color
                </label>
                <input 
                  type="color" 
                  name="color"
                  className={`form-control ${errors.color ? "is-invalid" : ""}`}
                  value={formData.color}
                  onChange={handleChange}
                />
                {errors.color && <div className="error-message">{errors.color}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="sit_number" className="form-label">
                  Seat Number
                </label>
                <input
                  type="number"
                  id="sit_number"
                  name="sit_number"
                  className={`form-control ${errors.sit_number ? "is-invalid" : ""}`}
                  value={formData.sit_number}
                  onChange={handleChange}
                  min="1"
                  required
                />
                {errors.sit_number && <div className="error-message">{errors.sit_number}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="types" className="form-label">
                  Vehicle Type
                </label>
                <select 
                  id="types" 
                  name="types"
                  className={`form-control ${errors.types ? "is-invalid" : ""}`}
                  value={formData.types}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Type --</option>
                  {type.map((tys) => (
                    <option key={tys.id} value={tys.id}>
                      {tys.detail}
                    </option>
                  ))}
                </select>
                {errors.types && <div className="error-message">{errors.types}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="route" className="form-label">
                  Route
                </label>
                <select 
                  id="route" 
                  name="route"
                  className={`form-control ${errors.route ? "is-invalid" : ""}`}
                  value={formData.route}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Route --</option>
                  {routes.map((rout) => (
                    <option key={rout.id} value={rout.id}>
                      {rout.name}
                    </option>
                  ))}
                </select>
                {errors.route && <div className="error-message">{errors.route}</div>}
              </div>
            </div>

            <h3 className="section-title">Additional Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    name="is_long"
                    className="form-check-input"
                    checked={formData.is_long}
                    onChange={handleChange}
                  />
                  Is Long Vehicle
                </label>
              </div>

              {formData.is_long && (
                <div className="form-group">
                  <label htmlFor="long_detail" className="form-label">
                    Long Vehicle Details
                  </label>
                  <input
                    type="text"
                    id="long_detail"
                    name="long_detail"
                    className={`form-control ${errors.long_detail ? "is-invalid" : ""}`}
                    value={formData.long_detail}
                    onChange={handleChange}
                  />
                  {errors.long_detail && <div className="error-message">{errors.long_detail}</div>}
               
              <label htmlFor="rate" className="form-label">
                Rate (per km)
              </label>
              <input
                type="number"
                id="rate"
                name="rate"
                className={`form-control ${errors.rate ? "is-invalid" : ""}`}
                value={formData.rate}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
              {errors.rate && <div className="error-message">{errors.rate}</div>}
            </div>

              )}
            </div>

            
            <h3 className="section-title">Insurance Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="insurance_date" className="form-label">
                  Insurance Expiry Date
                </label>
                <input
                  type="date"
                  id="insurance_date"
                  name="insurance_date"
                  className={`form-control ${errors.insurance_date ? "is-invalid" : ""}`}
                  value={formData.insurance_date}
                  onChange={handleChange}
                  required
                />
                {errors.insurance_date && <div className="error-message">{errors.insurance_date}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Upload Insurance Documents</label>
                <div className="file-upload-container">
                  <label className="file-upload-label">
                    <input 
                      type="file" 
                      onChange={handleImageChange} 
                      accept="image/*"
                      className="file-upload-input"
                    />
                    <span className="file-upload-button">Choose File</span>
                    <span className="file-upload-text">
                      {picture ? picture.name : "No file chosen"}
                    </span>
                  </label>
                </div>
                {errors.insuranceDoc && <div className="error-message">{errors.insuranceDoc}</div>}
                {preview && (
                  <div className="file-preview">
                    <img src={preview} alt="Insurance Preview" style={{maxWidth: '200px'}} />
                  </div>
                )}
              </div>
            </div>

            <h3 className="section-title">Vehicle Image</h3>

            <div className="form-group">
              <label className="form-label">Upload Vehicle Image</label>
              <div className="file-upload-container">
                <label className="file-upload-label">
                  <input 
                    type="file" 
                    onChange={handleVehicleImageChange} 
                    accept="image/*"
                    className="file-upload-input"
                  />
                  <span className="file-upload-button">Choose File</span>
                  <span className="file-upload-text">
                    {Vpicture ? Vpicture.name : "No file chosen"}
                  </span>
                </label>
              </div>
              {errors.vehicleImage && <div className="error-message">{errors.vehicleImage}</div>}
              {Vpreview && (
                <div className="file-preview">
                  <img src={Vpreview} alt="Vehicle Preview" style={{maxWidth: '200px'}} />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register Vehicle'}
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
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-title {
          margin: 0;
          font-size: 1.5rem;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 5px;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 20px 0 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
        }
        
        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .form-group {
          flex: 1;
          margin-bottom: 15px;
        }
        
        .form-check-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .form-check-input {
          margin: 0;
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
          font-size: 1rem;
        }
        
        .form-control[type="color"] {
          height: 38px;
          padding: 3px;
        }
        
        .is-invalid {
          border-color: #dc3545;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 5px;
        }
        
        .file-upload-container {
          margin-bottom: 10px;
        }
        
        .file-upload-label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .file-upload-input {
          display: none;
        }
        
        .file-upload-button {
          padding: 8px 12px;
          background: #007bff;
          color: white;
          border-radius: 4px;
          margin-right: 10px;
          cursor: pointer;
        }
        
        .file-upload-button:hover {
          background: #0069d9;
        }
        
        .file-upload-text {
          color: #666;
        }
        
        .file-preview {
          margin-top: 10px;
          text-align: center;
        }
        
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .btn-primary {
          background-color: #007bff;
          color: white;
          border: none;
        }
        
        .btn-primary:hover {
          background-color: #0069d9;
        }
        
        .btn-primary:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background-color: #6c757d;
          color: white;
          border: none;
        }
        
        .btn-secondary:hover {
          background-color: #5a6268;
        }
      `}</style>
    </div>
  );
};

export default VehicleRegistrationModal;