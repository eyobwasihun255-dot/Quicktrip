import { useState, useEffect } from "react"
 
import api from "../api"

import Sidebar from "../component/sidebar"
import Header from "../component/Header"
import StationMap from "../component/StationMap"
import BranchRegistrationModal from "../component/BranchregistrationModal"
import RouteRegisterModal from "../component/RouteRegistrationModal"
import RouteEdit from "../component/RouteEdit"
import AlertModal from "../component/AlertModal"
import StationEdit from "../component/StationEdit"

function Home(){



  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStation, setSelectedStation] = useState(null)
  const [mapZoom, setMapZoom] = useState(1)
  const [viewMode] = useState("grid") // grid or list
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [showRouteModal, setShowRouteModal] = useState(false)
   const [stations, setBranch] =  useState([])
   const [passengers, setPassengers] = useState([])
   const [vehicles, setVehicles] = useState([]);
   const [report, setReport] = useState([]);
   const [subAdmins, setSubAdmins] = useState([])
   const [showEditModal, setEditModal] = useState(false);
  const [selectedroute, setselectedroute] = useState([]);
      const [routes, setRoutes] = useState([]);
   const [showDeleteAlert, setShowDeleteAlert] = useState(false);
   const [routeToDelete, setRouteToDelete] = useState(null);
   const [deleteMessage, setDeleteMessage] = useState({ type: "", text: "" });
   const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
   const [showStationEditModal, setShowStationEditModal] = useState(false);

   useEffect(()=>{
    getVehicle()
    getStaffs()
    getBranch()
    getPassenger()
    getReport()
   
   },[])

   useEffect(() => {
    if (deleteMessage.text) {
      const timer = setTimeout(() => {
        setDeleteMessage({ type: "", text: "" });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [deleteMessage]);

  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => {
        setStatusMessage({ type: "", text: "" });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

   const getReport = () => {
    api
      .get('api/payments/')
      .then((res) => res.data)
      .then((data) => {
        setReport(data);
        
      })
      .catch((err) => console.log(err));
  };
   const getPassenger = () => {
    api
      .get('api/passengers/')
      .then((res) => res.data)
      .then((data) => {
        setPassengers(data);
        console.log(data);
      })
      .catch((err) => console.log(err));
  };
  const getVehicle = () => {
    api
      .get('api/vehicles/')
      .then((res) => res.data)
      .then((data) => {
        setVehicles(data);
        
      })
      .catch(() => {
      
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
      .catch((err) => console.log(err));
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
    const fetchRoute = async (sid )  => {
    try {
      const res = await api.get(`api/stationRoute/${sid}`);
      setRoutes(res.data);
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setRoutes([]);
    }
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
  const deleteRoute = async (rid) => {
    try {
      const res = await api.delete(`api/editRoute/${rid}/`);
      if (res.status === 200 || res.status === 204) {
        setDeleteMessage({ type: "success", text: "Route deleted successfully!" });
        // Refresh the routes list
        await fetchRoute(selectedStation.id);
      } else {
        throw new Error(`Unexpected response status: ${res.status}`);
      }
    } catch (err) {
      console.error("Error deleting route:", err);
      setDeleteMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to delete route. Please try again." 
      });
    }
  };
  const countVehiclesByBranch = (vehicless ,bid ) => {
    var counts = 0 ;
    
    vehicless.forEach(vehicle => {
         if (vehicle?.branch?.id === bid) {
        counts ++;
      }
  });
  return counts ;
};
const getManger = (sub, bid) => {
  if (!Array.isArray(sub) || sub.length === 0) return "Not Assigned";
  const manager = sub.find(s => s?.branch?.id === bid && s?.employee?.position === "Station Manager");
  return manager ? `${manager.employee?.Fname || ''} ${manager.employee?.Lname || ''}`.trim() : "Not Assigned";
};
  useEffect(() => {
    // Set the first station as selected by default if none is selected
    if (stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0])
    }
  }, [stations, selectedStation])

  const filteredStations = stations.filter(
    (station) =>
      station.name?.includes(searchTerm.toLowerCase()) ||
      station.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address?.toLowerCase().includes(searchTerm.toLowerCase()),
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
  const handleRoute = () => {
    
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
      .catch((err) => console.log(err));
  };
   const handleDeleteClick = (route) => {
    setRouteToDelete(route);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    if (routeToDelete) {
      await deleteRoute(routeToDelete.id);
      setShowDeleteAlert(false);
      setRouteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteAlert(false);
    setRouteToDelete(null);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'a': return 'status-active';
      case 'm': return 'status-maintenance';
      case 'i': return 'status-inactive';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'a': return 'Active';
      case 'm': return 'Maintenance';
      case 'i': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const toggleStationStatus = async (station) => {
    try {
      const res = await api.patch(`api/branch/${station.id}/toggle-status/`);
      if (res.status === 200) {
        // Update the station status in the local state
        const updatedStations = stations.map(s => {
          if (s.id === station.id) {
            return { ...s, status: res.data.new_status };
          }
          return s;
        });
        setBranch(updatedStations);
        setStatusMessage({ 
          type: "success", 
          text: res.data.message 
        });
      }
    } catch (err) {
      setStatusMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to update station status" 
      });
    }
  };

  const handleStationEdit = (updatedStation) => {
    setBranch(stations.map(station => 
      station.id === updatedStation.id ? updatedStation : station
    ));
    setStatusMessage({ type: "success", text: "Station updated successfully!" });
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
                  onClick={() => {handleStationSelect(station), fetchRoute(station.id)}}
                >
                  <div className="station-header-container">
                    <div className="station-name">{station.name}</div>
                    <button 
                      className={`status-toggle ${getStatusColor(station.status)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStationStatus(station);
                      }}
                    >
                      {getStatusText(station.status)}
                    </button>
                  </div>
                  <div className={`station-status ${station.type}`}>
                    {station.type === 'b' ? `Branch` : "Main"}
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
                <div className="header-controls">
                  <button 
                    className="btn btn-edit"
                    onClick={() => setShowStationEditModal(true)}
                  >
                    Edit Station
                  </button>
                  <div className={`status-badge ${selectedStation.type}`}>
                    {selectedStation.type.charAt(0).toUpperCase() + selectedStation.type.slice(1)}
                  </div>
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
                    <div className="detail-value">{countRevenuesByBranch(report, selectedStation.id)} ETB</div>
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
              {deleteMessage.text && (
        <div className={`alert ${deleteMessage.type === "success" ? "alert-success" : "alert-error"}`}>
          {deleteMessage.text}
        </div>
      )}
      {statusMessage.text && (
        <div className={`alert ${statusMessage.type === "success" ? "alert-success" : "alert-error"}`}>
          {statusMessage.text}
        </div>
      )}
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
              <div className="detail-section">
                      <h3>Route</h3>
                      {routes.length > 0 ? (
                        <div className="trips-table-container">
                          <table className="trips-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Distance </th>
                                <th>Price</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {routes.map((route) => (
                                <tr key={route.id}>
                                   <td>{route.name}</td>
                                  <td>{route.first_destination?.name}</td>
                                  <td>{route.last_destination?.name}</td>
                                  <td>{route.distance} Km</td>
                                  <td>{route.route_prize} ETB</td>
                                  <td className="tableButton">
                                     <button className={`btn btn-edit`} onClick={() => {setEditModal(true),setselectedroute(route)}}>Edit</button>
                                     <button 
                                       className="btn btn-delete" 
                                       onClick={() => handleDeleteClick(route)}
                                     >
                                       Delete
                                     </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-state">No trip history available</div>
                      )}
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
        {showEditModal && (
        <RouteEdit onClose={() => setEditModal(false)} onSave={handleBranch} route={selectedroute} />
      )}
      {showRouteModal && (
        <RouteRegisterModal onClose={() => setShowRouteModal(false)} onSave={handleRoute} />
      )}
      {showDeleteAlert && (
        <AlertModal
          isOpen={showDeleteAlert}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Route"
          message={`Are you sure you want to delete the route "${routeToDelete?.name}"? This action cannot be undone.`}
        />
      )}
      {showStationEditModal && (
        <StationEdit 
          station={selectedStation}
          onClose={() => setShowStationEditModal(false)}
          onSave={handleStationEdit}
        />
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
          .tableButton {
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
        
        .trips-table-container {
          overflow-x: auto;
        }
        
        .trips-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .trips-table th, .trips-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }
        
        .trips-table th {
          background-color: var(--bg-secondary);
          font-weight: 600;
        }
        
        .trips-table tr:hover {
          background-color: var(--hover-bg);
        }
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        
        .trip-details {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .trip-route {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 20px;
          background-color: var(--bg-secondary);
          border-radius: 8px;
          position: relative;
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
        
        .btn-delete {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .btn-delete:hover {
          background-color: #c82333;
        }
        
        .btn-edit {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .btn-edit:hover {
          background-color: #0056b3;
        }

        .alert {
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 4px;
          text-align: center;
        }

        .alert-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .station-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .status-toggle {
          padding: 4px 8px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .status-active {
          background-color: #d4edda;
          color: #155724;
        }

        .status-active:hover {
          background-color: #c3e6cb;
        }

        .status-maintenance {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-maintenance:hover {
          background-color: #ffeeba;
        }

        .status-inactive {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-inactive:hover {
          background-color: #f5c6cb;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }
      `}</style>
    </div>
    </>

}
export default Home