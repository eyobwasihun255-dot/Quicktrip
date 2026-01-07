import { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import Header from "../component/Header";
import api from "../api";
import { BRANCH } from "../constants";
import VehicleMap from "../component/VehicleMap";

export default function Loc() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);

  const userBranchId = localStorage.getItem(BRANCH);

  const fetchVehicleLocations = async () => {
    try {
      const response = await api.get("/api/tracked-vehicles/");
      const data = response.data.filter(v => v.tracking && v.latitude && v.longitude);
      setVehicles(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch vehicle locations.");
    }
  };

  useEffect(() => {
    fetchVehicleLocations();
    const interval = setInterval(fetchVehicleLocations, 10000);
    return () => clearInterval(interval);
  }, [userBranchId]);

  
  return (
    <div className="location-page">
      <Sidebar />
      <div className="right">
        <Header />
        <div className="page-header">
          <h1>Live Vehicle Location</h1>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tracked Vehicles</h2>
          </div>

          {error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="location-content">
              {vehicles.length > 0 ? (
                <>
                  <div className="location-details">
                    {vehicles.map((v) => (
                      <div className="detail-item" key={v.id}>
                        <strong>{v.plate_number}</strong> – Lat:{" "}
                        {v.latitude.toFixed(6)}, Lng: {v.longitude.toFixed(6)}
                      </div>
                    ))}
                  </div>
                  <VehicleMap vehicles={vehicles} />
                </>
              ) : (
                <div className="no-location">
                  <p>No vehicles are currently being tracked in your branch.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

  <style>{`
        .location-page {
          display: flex;
        }
        .right {
          width: 100%;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .location-content {
          padding: 20px;
        }
        .location-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .no-location {
          padding: 40px;
          text-align: center;
          background: #f0f0f0;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
