
import { useState , useEffect } from "react"
import api from "../api"

const SubAdminModal = ({ onClose }) => {

  const [user,setUser] = useState("")
  const [employee, setEmployee] = useState({Fname:"",Lname:"",address:"",position:""})
  const [phone_number,setPhone_number] = useState("")
  const [branchs,setBranchs] = useState([])
  const [errors, setErrors] = useState({})
  const [branch , setBranch] = useState(null)
  const [selectedUser , setselectedUser] = useState(null)
  const [message, setMessage] = useState({ type: "", text: "" })

  const formatApiError = (error) => {
    const data = error?.response?.data
    if (!data) return "An error occurred"
    if (typeof data === "string") return data

    if (Array.isArray(data)) {
      return data.filter(Boolean).join("\n") || "An error occurred"
    }

    if (typeof data === "object") {
      // Prefer DRF's non_field_errors if present
      const nfe = data.non_field_errors
      if (Array.isArray(nfe) && nfe.length) return nfe[0]

      // Otherwise show the first field error
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
  // Auto-hide messages after a short delay
  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: "", text: "" }), 4000)
      return () => clearTimeout(t)
    }
  }, [message])
  const [searchterm ,setSearchTerm] = useState("")
  
  useEffect(()=>{
    getBranch()
  
  },[])
  const getUser = () => {
        
    api
      .get(`api/nids/${searchterm}`)
      .then((res) => res.data)
      .then((data) => {
        setUser(data)
        console.log(data);
      })
      .catch((err) => console.log(err));
  };
  const getBranch= () => {
        
    api
      .get(`api/branch/`)
      .then((res) => res.data)
      .then((data) => {
        setBranchs(data)
        console.log(data);
      })
      .catch((err) => console.log(err));
  };

 

  const validateForm = () => {
    const newErrors = {}

    if (!employee.Fname.trim()) {
      newErrors.fname = "Name is required"
    }

    if (!phone_number.trim()) {
      newErrors.phone_number = "Phone number is required"
    }

    if (!employee.address.trim()) {
      newErrors.station = "Station name is required"
    }

    if (!employee.position || !employee.position.trim()) {
      newErrors.position = "Position is required"
    }

    if (!branch?.id) {
      newErrors.branch = "Branch is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const addUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
  
    try {
      const res = await api.post(`api/staffs/`, {
        user_type: "s",
        phone_number: phone_number,
        // Backend usersSerializer expects: { branch: { id: <pk> } }
        branch: branch?.id ? { id: branch.id } : null,
        password: "1234",
        employee,
        nid: selectedUser,
      });
      
      if (res.status === 201) {
        setMessage({
          type: "success",
          text: "Registered successfully!",
        });
         
        
        // window.location.href = `/subadmin`; // Consider using navigate instead
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
          <h2 className="modal-title">Add New Sub-Admin</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Top-level status message */}
          {message.text && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={addUser}>

            <h3 className="section-title">Personal Information</h3>
            
          <div className="form-group">
              <label htmlFor="nationalId" className="form-label">
                National ID Number
              </label>
              <input
                type="text"
                value={searchterm}
                className={`form-control ${errors.position? "is-invalid" : ""}`}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search for existing records"
               />
               
        
              {errors.nationalId && <div className="error-message">{errors.nationalId}</div>}
        <button onClick={getUser} className="btn btn-primary">Search</button> 
        {user.length > 0 && (
          <div className="search-results">
            {user.map(item => (
              <div 
                key={item.id} 
                className="form-label"
                onClick={() => {setselectedUser(item.id); setEmployee({
                  ...employee,
                  Fname: item.Fname || employee.Fname,
                  Lname: item.Lname || employee.Lname
                                          });}}
              >
                {item.Fname} {item.Lname}, FAN : {item.FAN}
                
              </div>  
            ))}
          </div>
        )}
       
            </div>
          
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="name"
                name="firstname"
                className={`form-control ${errors.fname ? "is-invalid" : ""}`}
                value={employee.Fname}
                onChange={(e) => setEmployee(prevUser => ({...prevUser,Fname: e.target.value }))}
              />
              {errors.fname && <div className="error-message">{errors.fname}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="name"
                name="lastname"
                className={`form-control ${errors.lname ? "is-invalid" : ""}`}
                value={employee.Lname}
                onChange={(e) => setEmployee(prevUser => ({...prevUser,Lname: e.target.value }))}
              />
              {errors.lname && <div className="error-message">{errors.lname}</div>}
            </div>

           
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="number"
                  id="phone"
                  name="phone"
                  className={`form-control ${errors.phone_number ? "is-invalid" : ""}`}
                  value={phone_number}
                  onChange={(e) => setPhone_number(e.target.value )}
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>
              <div className="form-group">
              <label htmlFor="station" className="form-label">
                Address
              </label>
              <input
                type="text"
                id="station"
                name="station"
                className={`form-control ${errors.station ? "is-invalid" : ""}`}
                value={employee.address}
                onChange={(e) => setEmployee(prevUser => ({...prevUser,address: e.target.value }))}
              />
              {errors.station && <div className="error-message">{errors.station}</div>}
            </div>
            

            
            

            <h3 className="section-title">Role & Station</h3>

            <div className="form-group">
              <label htmlFor="station" className="form-label">
                Job Position
              </label>
               <select className={`form-control ${errors.position? "is-invalid" : ""}`} value={employee.position} onChange={(e) => setEmployee(prevUser => ({...prevUser,position: e.target.value }))}>
              <option value="">All Types</option>
              <option value="Station Manager">Station Manager</option>
              <option value="Branch Operator">Branch Operator</option>
            </select>
              {errors.position && <div className="error-message">{errors.position}</div>}
            </div>


            
            <div className="form-group">
           <select
  className={`form-control ${errors.lname ? "is-invalid" : ""}`}
  id="options"
  value={branch?.id || ""}
  onChange={(e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const branchData = JSON.parse(selectedOption.dataset.branch);
    setBranch(branchData);
  }}
  required
>
  <option value="">Select a branch</option>
  {branchs.map((br) => (
    <option 
      key={br.id} 
      value={br.id}
      data-branch={JSON.stringify(br)}
    >
      {br.name}
    </option>
  ))}
</select>
            </div>
           


            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Sub-Admin
              </button>
            </div>
          </form>
        </div>
      </div>

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
      `}</style>
    </div>
  )
}

export default SubAdminModal

