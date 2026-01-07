
import { useState, useContext, useEffect } from "react"
import api from "../../api"
import TripReceiptGenerator from "../../component/TripReceiptGenerator"
import DriverContactModal from "../../component/DriverContactModel"
import Sidebar from "../../component/sidebar"
import Header from "../../component/Header"
export default function Passengers() {

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("name")
  const [selectedPassenger, setSelectedPassenger] = useState(null)
  const [showTripDetails, setShowTripDetails] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showDriverContactModal, setShowDriverContactModal] = useState(false)
  const [passengers, setPassengers] = useState([])

 
  useEffect(() => {
   
    getPassenger()
  }, []) 
  useEffect(() => {
    
    if (passengers.length > 0 && !selectedPassenger) {
      setSelectedPassenger(passengers[0])
    }
  }, [passengers, selectedPassenger])

  const filteredPassengers = passengers.filter((passenger) => {
    if (filterType === "name") {
      return passenger.nid.Fname.toLowerCase().includes(searchTerm.toLowerCase())
    } else if (filterType === "phone") {
      return passenger.phone_number === searchTerm
    } else if (filterType === "nationalId") {
      return passenger.nid.FAN.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })

  const handlePassengerSelect = (passenger) => {
    setSelectedPassenger(passenger)
    setShowTripDetails(false)
    setSelectedTrip(null)
  }
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
  const handleTripSelect = (trip) => {
    setSelectedTrip(trip)
    setShowTripDetails(true)
  }

  const handleBackToTrips = () => {
    setShowTripDetails(false)
    setSelectedTrip(null)
  }

  const handleDownloadReceipt = () => {
    setShowReceiptModal(true)
  }

  const handleContactDriver = () => {
    setShowDriverContactModal(true)
  }


  return (
    <div className="passengers-page">
      <Sidebar/>
      <div className="right">
        <Header/>
      <div className="page-header">
        <h1>Passenger Management</h1>
      </div>

      <div className="passengers-container">
        <div className="passengers-sidebar">
          <div className="search-filter-container">
            <div className="search-container">
              <input
                type="text"
                placeholder={`Search by ${filterType === "name" ? "name" : filterType === "phone" ? "phone" : "national ID"}...`}
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-container">
              <select className="filter-dropdown" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="name">Name</option>
                
                <option value="nationalId">National ID</option>
              </select>
            </div>
          </div>

          <div className="passengers-list">
            {filteredPassengers.length > 0 ? (
              filteredPassengers.map((passenger) => (
                <div
                  key={passenger.id}
                  className={`passenger-list-item ${selectedPassenger?.id === passenger.id ? "selected" : ""}`}
                  onClick={() => handlePassengerSelect(passenger)}
                >
                  <div className="passenger-name">{passenger.nid.Fname} {passenger.nid.Lname}</div>
                  <div className="passenger-id">ID: {passenger.nid.FAN}</div>
                  <div className="passenger-trips">{passenger.travel_history.length} trips</div>
                </div>
              ))
            ) : (
              <div className="empty-state">No passengers found</div>
            )}
          </div>
        </div>

        <div className="passengers-content">
          {selectedPassenger ? (
            <>
              {!showTripDetails ? (
                <>
                  <div className="passenger-header">
                    <h2>{selectedPassenger.name}</h2>
                  </div>

                  <div className="passenger-details">
                    <div className="detail-section">
                      <h3>Personal Information</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <div className="detail-label">National ID</div>
                          <div className="detail-value">{selectedPassenger.nid.FAN}</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">Phone</div>
                          <div className="detail-value">{selectedPassenger.phone_number}</div>
                        </div>
                                                <div className="detail-item">
                          <div className="detail-label">Address</div>
                          <div className="detail-value">{selectedPassenger.nid.Address}</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">Registered Date</div>
                          <div className="detail-value">
                            {new Date(selectedPassenger.date_joined).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">Total Trips</div>
                          <div className="detail-value">{selectedPassenger.travel_history.length}</div>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>Trip History</h3>
                      {selectedPassenger.travel_history.length > 0 ? (
                        <div className="trips-table-container">
                          <table className="trips-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Fare</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPassenger.travel_history.map((trip) => (
                                <tr key={trip.id}>
                                  <td>{new Date(trip.time).toLocaleDateString()}</td>
                                  <td>{trip.ticket.route.first_destination?.name}</td>
                                  <td>{trip.ticket.route.last_destination?.name}</td>
                                  <td>${trip.payment.amount}</td>
                                  <td>
                                    <button className="btn btn-sm btn-primary" onClick={() => handleTripSelect(trip)}>
                                      View Details
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
                  </div>
                </>
              ) : (
                <>
                  <div className="trip-header">
                    <button className="btn btn-sm btn-outline back-button" onClick={handleBackToTrips}>
                      ← Back to Trips
                    </button>
                    <h2>Trip Details</h2>
                  </div>

                  {selectedTrip && (
                    <div className="trip-details">
                      <div className="trip-route">
                        <div className="route-station">
                          <div className="station-marker start"></div>
                          <div className="station-details">
                            <div className="station-name">{selectedTrip.ticket.route.first_destination.name}</div>
                            <div className="station-time">Departure</div>
                          </div>
                        </div>
                        <div className="route-line"></div>
                        <div className="route-station">
                          <div className="station-marker end"></div>
                          <div className="station-details">
                            <div className="station-name">{selectedTrip.ticket.route.last_destination.name}</div>
                            <div className="station-time">Arrival</div>
                          </div>
                        </div>
                      </div>

                      <div className="trip-info-grid">
                        <div className="trip-info-item">
                          <div className="info-icon">📅</div>
                          <div className="info-content">
                            <div className="info-label">Date</div>
                            <div className="info-value">{new Date(selectedTrip.time).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="trip-info-item">
                          <div className="info-icon">🚗</div>
                          <div className="info-content">
                            <div className="info-label">Vehicle</div>
                            <div className="info-value">{selectedTrip.vehicle.name} {selectedTrip.vehicle.Model}</div>
                          </div>
                        </div>
                        <div className="trip-info-item">
                          <div className="info-icon">👤</div>
                          <div className="info-content">
                            <div className="info-label">Driver</div>
                            <div className="info-value">{selectedTrip.vehicle.user.employee.Fname}</div>
                          </div>
                        </div>
                        <div className="trip-info-item">
                          <div className="info-icon">💰</div>
                          <div className="info-content">
                            <div className="info-label">Fare</div>
                            <div className="info-value">${selectedTrip.payment.amount}</div>
                          </div>
                        </div>
                        <div className="trip-info-item">  
                          <div className="info-icon">🔄</div>
                          <div className="info-content">
                            <div className="info-label">Status</div>
                            <div className="info-value status-completed">
                              Ended
                            </div>
                          </div>
                        </div>
                        <div className="trip-info-item">
                          <div className="info-icon">🆔</div>
                          <div className="info-content">
                            <div className="info-label">Trip ID</div>
                            <div className="info-value">#{selectedTrip.id}</div>
                          </div>
                        </div>
                      </div>

                      <div className="trip-actions">
                        <button className="btn btn-primary" onClick={handleDownloadReceipt}>
                          Download Receipt
                        </button>
                        <button className="btn btn-outline" onClick={handleContactDriver}>
                          Contact Driver
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="empty-state">Select a passenger to view details</div>
          )}
        </div>
      </div>

      {showReceiptModal && selectedTrip && (
        <TripReceiptGenerator
          trip={selectedTrip}
          passenger={selectedPassenger}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {showDriverContactModal && selectedTrip && (
        <DriverContactModal driver={selectedTrip.vehicle.user} onClose={() => setShowDriverContactModal(false)} />
      )}
      </div>
      <style>{`
        .passengers-page {
          display: flex;
          flex-direction: row;
          height: calc(100vh - 120px);
        }
        .right{
         width:100%; 
         max-height : 650px;
         margin :10px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px;
        }
        
        .passengers-container {
          display: flex;
          flex: 1;
          gap: 20px;
          height: 100%;
          overflow: hidden;
        }
        
        .passengers-sidebar {
          width: 300px;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-primary);
          border-radius: 8px;
          box-shadow: var(--box-shadow);
          overflow: hidden;
        }
        
        .search-filter-container {
          padding: 15px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .passengers-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }
        
        .passenger-list-item {
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        
        .passenger-list-item:hover {
          background-color: var(--hover-bg);
        }
        
        .passenger-list-item.selected {
          background-color: var(--unread-bg);
          border-left-color: var(--primary-color);
        }
        
        .passenger-name {
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .passenger-id {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        
        .passenger-trips {
          font-size: 0.75rem;
          color: var(--primary-color);
          font-weight: 500;
        }
        
        .passengers-content {
          flex: 1;
          background-color: var(--bg-primary);
          border-radius: 8px;
          box-shadow: var(--box-shadow);
          padding: 20px;
          overflow-y: auto;
        }
        
        .passenger-header, .trip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .back-button {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .passenger-details {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .detail-section h3 {
          font-size: 1.1rem;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .detail-item {
          padding: 10px;
          background-color: var(--bg-secondary);
          border-radius: 6px;
        }
        
        .detail-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        
        .detail-value {
          font-weight: 500;
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
        
        .route-station {
          display: flex;
          align-items: center;
          gap: 15px;
          position: relative;
          z-index: 2;
        }
        
        .station-marker {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .station-marker.start {
          background-color: var(--primary-color);
        }
        
        .station-marker.end {
          background-color: var(--success-color);
        }
        
        .route-line {
          position: absolute;
          left: 30px;
          top: 30px;
          bottom: 30px;
          width: 2px;
          background-color: var(--border-color);
          z-index: 1;
        }
        
        .station-name {
          font-weight: 600;
          margin-bottom: 3px;
        }
        
        .station-time {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .trip-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .trip-info-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background-color: var(--bg-secondary);
          border-radius: 8px;
        }
        
        .info-icon {
          font-size: 1.5rem;
        }
        
        .info-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        
        .info-value {
          font-weight: 500;
        }
        
        .status-completed {
          color: var(--success-color);
        }
        
        .trip-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .empty-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: var(--text-light);
        }
        
        @media (max-width: 768px) {
          .passengers-container {
            flex-direction: column;
          }
          
          .passengers-sidebar {
            width: 100%;
            max-height: 300px;
          }
        }
        
        @media (max-width: 576px) {
          .trip-info-grid {
            grid-template-columns: 1fr;
          }
          
          .detail-grid {
            grid-template-columns: 1fr;
          }
          
          .trip-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

