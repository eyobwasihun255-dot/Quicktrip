import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Topbar from "../../component/topbar"
import api from "../../api"
import'./style/home.css'
import Sidebar from "../../component/sidebar"
import Header from "../../component/Header"
import StationMap from "../../component/StationMap"
import BranchRegistrationModal from "../../component/BranchregistrationModal"
import RouteRegisterModal from "../../component/RouteRegistrationModal"

function Home(){



  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStation, setSelectedStation] = useState(null)
  const [mapZoom, setMapZoom] = useState(1)
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [showRouteModal, setShowRouteModal] = useState(false)
   const [stations, setBranch] =  useState([])
   const [passengers, setPassengers] = useState([])
   const [vehicles, setVehicles] = useState([]);
   const [report, setReport] = useState([]);
   const [subAdmins, setSubAdmins] = useState([])
   useEffect(()=>{
    getVehicle()
    getStaffs()
    getBranch()
    getPassenger()
    getReport()
   
   },[])
   const getReport = () => {
    api
      .get('api/payments/')
      .then((res) => res.data)
      .then((data) => {
        setReport(data);
        
      })
      .catch((err) => alert(err));
  };
   const getPassenger = () => {
    api
      .get('api/passengers/')
      .then((res) => res.data)
      .then((data) => {
        setPassengers(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };
  const getVehicle = () => {
    api
      .get('api/vehicles/')
      .then((res) => res.data)
      .then((data) => {
        setVehicles(data);
        
      })
      .catch((err) => {
      
      });
  };
  const getStaffs = () => {
    api
      .get('api/staffs/')
      .then((res) => res.data)
      .then((data) => {
        setSubAdmins(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };
  
  const countPassengersByBranch = (passengerData ,bid ) => {
    var counts = 0 ;
    
    passengerData.forEach(passenger => {
      if (!passenger?.travel_history?.length) return ['No travel history'];
    
    return passenger.travel_history.map(history => {
       
       if (history.branch === bid) {
        counts ++;
      }}
    );
    
      
    });
    return counts;
  };

  const countRevenuesByBranch = (revenue ,bid ) => {
    var counts = 0 ;
    
    revenue.forEach(rev => {
      if (rev.branch === bid && rev.types ==='i' ) {
        counts = (counts + Number(rev.amount));
      }
   
      
    });
    return counts;
  };
  const countVehiclesByBranch = (vehicless ,bid ) => {
    var counts = 0 ;
    
    vehicless.forEach(vehicle => {
         if (vehicle.branch.id === bid) {
        counts ++;
      }
  });
  return counts ;
};
const getManger = (sub, bid) => {
  const manager = sub.find(s => 
    s.branch.id === bid && s.employee.position === "Station Manager"
  );
  return manager ? `${manager.employee.Fname}  ${manager.employee.Lname}` : "Not Assigned";
};
  useEffect(() => {
    // Set the first station as selected by default if none is selected
    if (stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0])
    }
  }, [stations, selectedStation])

  const filteredStations = stations.filter(
    (station) =>
      station.name.includes(searchTerm.toLowerCase()) ||
      station.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const handleBranch = (newBranch) => {
    setBranch([
      {
        id: stations.length + 1,
        ...newBranch,
        registeredAt: new Date().toISOString().split("T")[0],
      },
      ...stations,
    ])
    setShowBranchModal(false)
  }
  const handleRoute = (newRoute) => {
    
    setShowRouteModal(false)
  }

  const handleStationSelect = (station) => {
    setSelectedStation(station)
  }

  const handleZoomIn = () => {
    setMapZoom((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setMapZoom((prev) => Math.max(prev - 0.2, 0.6))
  }

   const getBranch = () => {
    api
      .get('api/branch/')
      .then((res) => res.data)
      .then((data) => {
        setBranch(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };
   return  <>
    <div className="stations-page">
      <Sidebar/>
      <div className="right">
      <Header/>
      <div className="page-header">
        <h1>Station Management</h1>
       
        <div className="view-controls">
          <button
            className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setShowRouteModal(true)}
          >
            Add Route
          </button>
          <button
            className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setShowBranchModal(true)}
           
          >
            Add Branch
          </button>
         
        </div>
      </div>

      <div className="stations-container">
        <div className="stations-sidebar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search stations..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="stations-list">
            {filteredStations.length > 0 ? (
              filteredStations.map((station) => (
                <div
                  key={station.id}
                  className={`station-list-item ${selectedStation?.id === station.id ? "selected" : ""}`}
                  onClick={() => handleStationSelect(station)}
                >
                  <div className="station-name">{station.name}</div>
                  
                  <div className={`station-status ${station.type}`}>
                    {station.type.charAt(0).toUpperCase() }
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No stations found</div>
            )}
          </div>
        </div>

        <div className="stations-content">
          {selectedStation ? (
            <>
              <div className="station-header">
                <h2>{selectedStation.name}</h2>
                <div className={`status-badge ${selectedStation.type}`}>
                  {selectedStation.type.charAt(0).toUpperCase() + selectedStation.type.slice(1)}
                </div>
              </div>

              <div className={`station-details ${viewMode}`}>
                <div className="detail-card">
                  <div className="detail-icon passenger">👥</div>
                  <div className="detail-content">
                    <div className="detail-value">{countPassengersByBranch(passengers, selectedStation.id)}</div>
                    <div className="detail-label">Total Passengers</div>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon revenue">💰</div>
                  <div className="detail-content">
                    <div className="detail-value">${countRevenuesByBranch(report, selectedStation.id)}</div>
                    <div className="detail-label">Total Revenue</div>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon vehicles">🚗</div>
                  <div className="detail-content">
                    <div className="detail-value">{countVehiclesByBranch(vehicles, selectedStation.id)}</div>
                    <div className="detail-label">Registered Vehicles</div>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon manager">👤</div>
                  <div className="detail-content">
                    <div className="detail-value">{getManger(subAdmins, selectedStation.id)}</div>
                    <div className="detail-label">Station Manager</div>
                  </div>
                </div>
              </div>

              <div className="station-address">
                <h3>Address</h3>
                <p>{selectedStation.address}</p>
              </div>

              <div className="map-container">
                <div className="map-header">
                  <h3>Location</h3>
                  <div className="map-controls">
                    <button className="btn btn-sm btn-outline" onClick={handleZoomOut}>
                      -
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={handleZoomIn}>
                      +
                    </button>
                  </div>
                </div>
                <StationMap
                  stations={stations}
                  selectedStation={selectedStation}
                  zoom={mapZoom}
                  onSelectStation={handleStationSelect}
                />
              </div>

              <div className="station-last-updated">
                Last updated: {new Date(selectedStation.id).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="empty-state">Select a station to view details</div>
          )}
        </div>
      </div>
      </div>
      {showBranchModal && (
        <BranchRegistrationModal onClose={() => setShowBranchModal(false)} onSave={handleBranch} />
      )}
      {showRouteModal && (
        <RouteRegisterModal onClose={() => setShowRouteModal(false)} onSave={handleRoute} />
      )}
      <style>{`
        .stations-page {
          display: flex;
   
          height: calc(100vh - 120px);
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px;
        }
        
        .view-controls {
          display: flex;
          gap: 10px;
        }
        
        .stations-container {
          display: flex;
          flex: 1;
          gap: 20px;
          height: 100%;
          overflow: hidden;
        }
        
        .stations-sidebar {
          width: 300px;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-primary);
          border-radius: 8px;
          box-shadow: var(--box-shadow);
          overflow: hidden;
        }
        
        .search-container {
          padding: 15px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .stations-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }
        
        .station-list-item {
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        
        .station-list-item:hover {
          background-color: var(--hover-bg);
        }
        
        .station-list-item.selected {
          background-color: var(--unread-bg);
          border-left-color: var(--primary-color);
        }
        
        .station-name {
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .station-manager {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        
        .station-status {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 10px;
          display: inline-block;
        }
        
        .station-status.active {
          background-color: rgba(40, 167, 69, 0.1);
          color: var(--success-color);
        }
        
        .station-status.maintenance {
          background-color: rgba(255, 193, 7, 0.1);
          color: var(--warning-color);
        }
        
        .station-status.inactive {
          background-color: rgba(220, 53, 69, 0.1);
          color: var(--danger-color);
        }
        .right{
        margin:10px;
        height:100%;
        display: flex;
          flex-direction: column;
          width :100%;
        }
        .stations-content {
          flex: 1;
          background-color: var(--bg-primary);
          border-radius: 8px;
          box-shadow: var(--box-shadow);
          padding: 20px;
          overflow-y: auto;
        }
        
        .station-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .status-badge {
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .status-badge.active {
          background-color: rgba(40, 167, 69, 0.1);
          color: var(--success-color);
        }
        
        .status-badge.maintenance {
          background-color: rgba(255, 193, 7, 0.1);
          color: var(--warning-color);
        }
        
        .status-badge.inactive {
          background-color: rgba(220, 53, 69, 0.1);
          color: var(--danger-color);
        }
        
        .station-details {
          display: grid;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .station-details.grid {
          grid-template-columns: repeat(4, 1fr);
        }
        
        .station-details.list {
          grid-template-columns: 1fr;
        }
        
        .detail-card {
          display: flex;
          align-items: center;
          padding: 15px;
          background-color: var(--bg-secondary);
          border-radius: 8px;
        }
        
        .detail-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 1.2rem;
        }
        
        .detail-icon.passenger {
          background-color: rgba(58, 134, 255, 0.1);
          color: var(--primary-color);
        }
        
        .detail-icon.revenue {
          background-color: rgba(40, 167, 69, 0.1);
          color: var(--success-color);
        }
        
        .detail-icon.vehicles {
          background-color: rgba(255, 193, 7, 0.1);
          color: var(--warning-color);
        }
        
        .detail-icon.manager {
          background-color: rgba(131, 56, 236, 0.1);
          color: var(--secondary-color);
        }
        
        .detail-content {
          flex: 1;
        }
        
        .detail-value {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .detail-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .station-address {
          margin-bottom: 20px;
        }
        
        .station-address h3 {
          font-size: 1rem;
          margin-bottom: 5px;
        }
        
        .map-container {
          margin-bottom: 20px;
        }
        
        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .map-header h3 {
          font-size: 1rem;
          margin: 0;
        }
        
        .map-controls {
          display: flex;
          gap: 5px;
        }
        
        .station-last-updated {
          font-size: 0.8rem;
          color: var(--text-light);
          text-align: right;
        }
        
        .empty-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: var(--text-light);
        }
        
        @media (max-width: 992px) {
          .station-details.grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .stations-container {
            flex-direction: column;
          }
          
          .stations-sidebar {
            width: 100%;
            max-height: 300px;
          }
          
          .stations-content {
            margin-top: 0;
          }
        }
        
        @media (max-width: 576px) {
          .station-details.grid {
            grid-template-columns: 1fr;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .station-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>
    </div>
    </>

}
export default Home