

import { useState, useContext, useEffect } from "react"
import api from '../../api';
import { USER_ROLE } from "../../constants";
import Sidebar from "../../component/sidebar";
import Header from "../../component/Header";
import VehicleRegistrationModal from "../../component/VehicleRegistrationModal";
import DriverRegistrationModal from "../../component/DriverRegistrationModal";
import VehicleManagementModal from "../../component/VehicleManagementModal";
export default function Vehicles() {
  
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showVehicleManagmentModal,  setShowVehicleManagmentModal] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [vehicles, setVehicles] = useState([])
  const [error, setError] = useState([])
  const [loading, setLoading] = useState([])
  const user_role = localStorage.getItem(USER_ROLE)
  useEffect(() => {
    getVehicle()
  }, [])
  const getVehicle = () => {
    api
      .get('api/vehicles/')
      .then((res) => res.data)
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };
  const [drivers, setDrivers] = useState(() => 
    new Set(vehicles.map(v => v.user))
  );
  const handleAddVehicle = (newVehicle) => {
    setVehicles([
      {
        id: vehicles.length + 1,
        ...newVehicle,
        registeredAt: new Date().toISOString().split("T")[0],
      },
      ...vehicles,
    ])
    setShowVehicleModal(false)
  }

  const handleAddDriver = (newDriver) => {
    setDrivers([
      {
        id: drivers.length + 1,
        ...newDriver,
        registeredAt: new Date().toISOString().split("T")[0],
      },
      ...drivers,
    ])
    setShowDriverModal(false)
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    // Search term matching (unchanged)
    const matchesSearch =
      vehicle.user?.employee?.Fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.Model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "all") return matchesSearch;

    // Handle cases where insurance_date might be null or undefined
    if (!vehicle.insurance_date) return matchesSearch && filterType === "expired";
    
    // Date comparison logic
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const expiryDate = new Date(vehicle.insurance_date);
    expiryDate.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    if (filterType === "expiringSoon") {
      return matchesSearch && daysDiff <= 30 && daysDiff >= 0;
    }
    
    if (filterType === "expired") {
      return matchesSearch && daysDiff < 0;
    }
    
    return matchesSearch;
});

  return (
    <div className="vehicles-page">
            <Sidebar />
      <div className="right">
        <Header/>
      <div className="page-header">
        <h1>Vehicle Management</h1>
        <div className="header-actions">         
            <button className="btn btn-secondary" onClick={() => setShowDriverModal(true)}>
              Register New Driver
            </button>
          <button className="btn btn-primary" onClick={() => setShowVehicleModal(true)}>
            Register New Vehicle
          </button>
        </div>
      </div>

      <div className="card">
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by driver, plate, make, model..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-container">
            <select className="filter-dropdown" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Vehicles</option>
              <option value="expiringSoon">Insurance Expiring Soon</option>
              <option value="expired">Insurance Expired</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Plate Number</th>
                <th>Vehicle</th>
                <th>Year</th>
                <th>Route</th>
                <th>Insurance Expiry</th>
                 
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.user.employee.Fname} {vehicle.user.Lname}</td>
                  <td>{vehicle.plate_number}</td>
                  <td>
                    {vehicle.Model}
                  </td>
                  <td>{vehicle.year}</td>
                  <td>{vehicle.route.name}</td>
                  <td   className={vehicle.insurance_date && vehicle.insurance_date < new Date() ? "text-danger" : ""}>
  {vehicle.insurance_date}
</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showVehicleModal && (
        <VehicleRegistrationModal onClose={() => setShowVehicleModal(false)} onSave={handleAddVehicle} />
      )}
      {showVehicleManagmentModal && (
        <VehicleManagementModal onClose={() => setShowVehicleManagmentModal(false)} vehicleId={selectedVehicleId}/>
      )}
      {showDriverModal && (
        <DriverRegistrationModal onClose={() => setShowDriverModal(false)} onSave={handleAddDriver} />
      )}
     </div>
      <style>{`
      .vehicles-page  {
          display: flex;
          min-height: 100vh;
        }
          .right {
          width :100%;
          }
           .main-content {
          flex: 1;
          display: flex;
         
        }
        
        .page-header {
         flex-direction: column;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .header-actions {
          display: flex;
          gap: 10px;
        }
        
        .search-filter-container {
          display: flex;
          margin-bottom: 20px;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .search-container {
          flex: 1;
          min-width: 250px;
        }
        
        .filter-container {
          width: 200px;
        }
        
        .action-buttons {
          display: flex;
          gap: 5px;
        }
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        
        .text-danger {
          color: var(--danger-color);
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .header-actions {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

