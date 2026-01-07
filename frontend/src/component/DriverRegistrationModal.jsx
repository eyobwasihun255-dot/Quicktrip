import { useState } from "react";
import api from "../api";
import { BRANCH } from "../constants";

const DriverRegistrationModal = ({ onClose, onSave }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState("");
  const [Lpicture] = useState(null);
  const [Lpreview, setLPreview] = useState("");
  const [employee, setEmployee] = useState({
    Fname: "",
    Lname: "",
    address: "",
    position: "Driver",
    Emergency_contact_name: "",
    Emergency_contact: "",
    Work_experience: ""
  });
  const [credentials, setCredentials] = useState({
    expiry_date: "",
    type: "",
    did: "",
    doc: null
  });
  const [phone_number, setPhone_number] = useState("");
  // const branchId = localStorage.getItem(BRANCH);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [errors, setErrors] = useState({});


  const getUsers = () => {
    api.get(`api/nids/${searchTerm}`)
      .then((res) => res.data)
      .then((data) => setUsers(data))
      .catch((err) => console.log(err));
  };

  const handlePhotoChange = (e) => {
    if (!e?.target?.files?.length) return;

    const file = e.target.files[0];
    
    // Validate file
    if (!file.type.match('image.*')) {
      setErrors(prev => ({...prev, photo: "Only image files are allowed"}));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({...prev, photo: "File size must be less than 5MB"}));
      return;
    }

    setPicture(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    
    if (errors.photo) {
      setErrors(prev => ({...prev, photo: null}));
    }
  };

  const handleLicenseFileChange = (e) => {
    if (!e?.target?.files?.length) return;

    const file = e.target.files[0];
    
    // Validate file
    if (!file.type.match('image.*|application/pdf')) {
      setErrors(prev => ({...prev, licenseFile: "Only image or PDF files are allowed"}));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({...prev, licenseFile: "File size must be less than 5MB"}));
      return;
    }

    // Store file in credentials.doc
    setCredentials(prev => ({
      ...prev,
      doc: file
    }));
    const reader = new FileReader();
    reader.onloadend = () => setLPreview(reader.result);
    reader.readAsDataURL(file);
    
    if (errors.licenseFile) {
      setErrors(prev => ({...prev, licenseFile: null}));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!employee.Fname.trim()) newErrors.Fname = "First name is required";
    if (!employee.Lname.trim()) newErrors.Lname = "Last name is required";
    if (!phone_number) newErrors.phone_number = "Phone number is required";
    if (!selectedUserId) newErrors.nid = "National ID is required";
    if (!credentials.did.trim()) newErrors.licenseNumber = "License number is required";
    if (!credentials.expiry_date) newErrors.licenseExpiry = "License expiry date is required";
    if (!credentials.doc) newErrors.licenseFile = "License file is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addDriver = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      
      // Basic info
      formDataToSend.append('user_type', 'd');
      formDataToSend.append('phone_number', phone_number);
      const branchId = localStorage.getItem(BRANCH);
    if (!branchId) {
      throw alert("Branch ID not found in local storage");
    }
      formDataToSend.append('branch', JSON.stringify({ id: Number(branchId) }));
      formDataToSend.append('password', '1234');
      formDataToSend.append('nid', selectedUserId);
      
      formDataToSend.append('employee.Fname', employee.Fname);
    formDataToSend.append('employee.Lname', employee.Lname);
    formDataToSend.append('employee.address', employee.address);
    formDataToSend.append('employee.position', employee.position);
    formDataToSend.append('employee.Emergency_contact_name', employee.Emergency_contact_name);
    formDataToSend.append('employee.Emergency_contact', employee.Emergency_contact);
    formDataToSend.append('employee.Work_experience', employee.Work_experience);

      Object.entries(credentials).forEach(([key, value]) => {
        if (key === 'doc' && value instanceof File) {
          formDataToSend.append(`credentials.doc`, value, value.name);
        } else {
          formDataToSend.append(`credentials.${key}`, value);
        }
      });

      // Add driver photo if exists
      if (picture) {
        formDataToSend.append('employee.picture', picture);
      }

      const res = await api.post('api/add_driver/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 201) {
        setMessage({type: "success", text: "Driver registered successfully!"});
        onSave?.();
        onClose();
      }
    } catch (error) {
      console.error("Error:", error);
      const serverData = error.response?.data;

      const collectMessages = (data) => {
        if (!data) return [];
        if (typeof data === 'string') return [data];
        if (Array.isArray(data)) return data.flatMap(collectMessages);
        if (typeof data === 'object') {
          return Object.values(data).flatMap(collectMessages);
        }
        return [];
      };

      const messages = collectMessages(serverData);

      // Surface field-level errors for convenience
      setErrors((prev) => ({
        ...prev,
        licenseNumber: serverData?.credentials?.did?.[0] || prev.licenseNumber,
      }));

      setMessage({
        type: "error", 
        text: messages.join(" | ") || "Registration failed"
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal driver-modal">
        <div className="modal-header">
          <h2 className="modal-title">Register New Driver</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {message.text && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={addDriver}>
            <h3 className="section-title">Personal Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="Fname" className="form-label">First Name*</label>
                <input
                  type="text"
                  id="Fname"
                  name="Fname"
                  className={`form-control ${errors.Fname ? "is-invalid" : ""}`}
                  value={employee.Fname}
                  onChange={(e) => setEmployee({...employee, Fname: e.target.value})}
                />
                {errors.Fname && <div className="error-message">{errors.Fname}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="Lname" className="form-label">Last Name*</label>
                <input
                  type="text"
                  id="Lname"
                  name="Lname"
                  className={`form-control ${errors.Lname ? "is-invalid" : ""}`}
                  value={employee.Lname}
                  onChange={(e) => setEmployee({...employee, Lname: e.target.value})}
                />
                {errors.Lname && <div className="error-message">{errors.Lname}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">National ID*</label>
                <div className="search-container">
                  <input
                    type="text"
                    value={searchTerm}
                    className={`form-control ${errors.nid ? "is-invalid" : ""}`}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search existing records"
                  />
                  <button 
                    type="button" 
                    onClick={getUsers} 
                    className="btn btn-primary search-button"
                  >
                    Search
                  </button>
                </div>
                {errors.nid && <div className="error-message">{errors.nid}</div>}
                
                {users.length > 0 && (
                  <div className="search-results">
                    {users.map(user => (
                      <div 
                        key={user.id} 
                        className={`search-result-item ${selectedUserId === user.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setEmployee({
                            ...employee,
                            Fname: user.Fname || employee.Fname,
                            Lname: user.Lname || employee.Lname
                                                    });
                       
                        }}
                      >
                        {user.Fname} {user.Lname}, FAN: {user.FAN}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone_number" className="form-label">Phone Number*</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  className={`form-control ${errors.phone_number ? "is-invalid" : ""}`}
                  value={phone_number}
                  onChange={(e) => setPhone_number(e.target.value)}
                />
                {errors.phone_number && <div className="error-message">{errors.phone_number}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-control"
                  value={employee.address}
                  onChange={(e) => setEmployee({...employee, address: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="year" className="form-label">Work Experience</label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  className="form-control"
                  value={employee.Work_experience}
                  onChange={(e) => setEmployee({...employee, Work_experience: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Driver Photo</label>
                <div className="file-upload-container">
                  <label className="file-upload-label">
                    <input 
                      type="file" 
                      onChange={handlePhotoChange} 
                      accept="image/*"
                      className="file-upload-input"
                    />
                    <span className="file-upload-button">Choose File</span>
                    <span className="file-upload-text">
                      {picture ? picture.name : "No file chosen"}
                    </span>
                  </label>
                </div>
                {errors.photo && <div className="error-message">{errors.photo}</div>}
                {preview && (
                  <div className="file-preview">
                    <img src={preview} alt="Driver Preview" style={{maxWidth: '200px'}} />
                  </div>
                )}
              </div>
            </div>
            <h3 className="section-title">Emergency Contact</h3>
            <div className="form-row">
            <div className="form-group">
                <label htmlFor="Emergency_contact_name" className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  id="Emergency_contact_name"
                  name="Emergency_contact_name"
                  className="form-control"
                  value={employee.Emergency_contact_name}
                  onChange={(e) => setEmployee({...employee, Emergency_contact_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="Emergency_contact_name" className="form-label">Emergency Contact Phone Number</label>
                <input
                  type="text"
                  id="Emergency_contact"
                  name="Emergency_contact"
                  className="form-control"
                  value={employee.Emergency_contact}
                  onChange={(e) => setEmployee({...employee, Emergency_contact: e.target.value})}
                />
              </div>
            </div>

            <h3 className="section-title">License Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="did" className="form-label">License Number*</label>
                <input
                  type="text"
                  id="did"
                  name="did"
                  className={`form-control ${errors.licenseNumber ? "is-invalid" : ""}`}
                  value={credentials.did}
                  onChange={(e) => setCredentials({...credentials, did: e.target.value})}
                />
                {errors.licenseNumber && <div className="error-message">{errors.licenseNumber}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="expiry_date" className="form-label">Expiry Date*</label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  className={`form-control ${errors.licenseExpiry ? "is-invalid" : ""}`}
                  value={credentials.expiry_date}
                  onChange={(e) => setCredentials({...credentials, expiry_date: e.target.value})}
                />
                {errors.licenseExpiry && <div className="error-message">{errors.licenseExpiry}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">License Type*</label>
              <select
                id="type"
                name="type"
                className={`form-control ${errors.licenseType ? "is-invalid" : ""}`}
                value={credentials.type}
                onChange={(e) => setCredentials({...credentials, type: e.target.value})}
              >
                <option value="">-- Select --</option>
                <option value="d">Driver License</option>
                <option value="p">Passport</option>
                <option value="i">Institute Id</option>
                <option value="g">Government Id</option>
                <option value="o">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Upload License Document*</label>
              <div className="file-upload-container">
                <label className="file-upload-label">
                  <input 
                    type="file" 
                    onChange={handleLicenseFileChange} 
                    accept="image/*,application/pdf"
                    className="file-upload-input"
                  />
                  <span className="file-upload-button">Choose File</span>
                  <span className="file-upload-text">
                    {credentials.doc ? credentials.doc.name : "No file chosen"}
                  </span>
                </label>
              </div>
              {errors.licenseFile && <div className="error-message">{errors.licenseFile}</div>}
              {Lpreview && (
                  <div className="file-preview">
                    <img src={Lpreview} alt="Driver Preview" style={{maxWidth: '200px'}} />
                  </div>
                )}
            </div>

            <div className="form-note">
              <p>Fields marked with * are required</p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Register Driver
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Styles remain the same as in your previous version */}
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
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .alert {
          padding: 10px 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .alert-success {
          background-color: #d4edda;
          color: #155724;
        }
        
        .alert-error {
          background-color: #f8d7da;
          color: #721c24;
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
        
        .is-invalid {
          border-color: #dc3545;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 5px;
        }
        
        .search-container {
          display: flex;
          gap: 10px;
        }
        
        .search-button {
          white-space: nowrap;
        }
        
        .search-results {
          margin-top: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .search-result-item {
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        
        .search-result-item:hover {
          background-color: #f5f5f5;
        }
        
        .search-result-item.selected {
          background-color: #e7f4ff;
        }
        
        .file-upload {
          border: 2px dashed #ddd;
          border-radius: 4px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
        
        .file-upload input[type="file"] {
          display: none;
        }
        
        .file-hint {
          font-size: 0.8rem;
          color: #666;
          margin-top: 5px;
        }
        
        .file-preview {
          margin-top: 10px;
        }
        
        .file-item {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .file-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
        
        .form-note {
          font-size: 0.85rem;
          color: #666;
          margin: 15px 0 10px;
        }
        
        .modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
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
        
        .btn-secondary {
          background-color: #6c757d;
          color: white;
          border: none;
        }
        
        .btn-secondary:hover {
          background-color: #5a6268;
        }
        
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DriverRegistrationModal;