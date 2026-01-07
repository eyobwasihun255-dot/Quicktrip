import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api';

const fixLeafletIcons = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };
  
  const createVehicleIcon = (isActive) => {
    return new L.Icon({
      iconUrl: isActive ? '/images/active-vehicle.png' : '/images/inactive-vehicle.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };
  
  const MapViewUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
  };
  
  const VehicleTracker = () => {
    useEffect(() => {
      fixLeafletIcons();
    }, []);
  

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const center = useMemo(() => {
      if (vehicles.length === 0) return [0, 0];
      
      const avgLat = vehicles.reduce((sum, v) => sum + v.location.latitude, 0) / vehicles.length;
      const avgLng = vehicles.reduce((sum, v) => sum + v.location.longitude, 0) / vehicles.length;
      
      return [avgLat, avgLng];
    }, [vehicles]);
  
   
    const fetchVehicles = () => {
        api
          .get(`api/loc/`)
          .then((res) => res.data)
          .then((data) => {
            setVehicles(data);
            console.log(data);
            setError(null);
          })
          .catch((err) =>  setError(err.message || 'Failed to fetch vehicles'))
          .finally (
            setLoading(false)
          )
      };
  

    useEffect(() => {
      fetchVehicles();
      const interval = setInterval(fetchVehicles, 30000); 
      return () => clearInterval(interval);
    }, []);
  
    if (loading) return <div className="loading">Loading vehicles...</div>;
    if (error) return <div className="error">Error: {error}</div>;
  
    return (
      <div className="vehicle-tracker">
        <h1>Live Vehicle Tracker</h1>
        
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '80vh', width: '100%' }}
          preferCanvas={true} // Better performance for multiple markers
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapViewUpdater center={center} />
          
          {vehicles.map(vehicle => (
            <Marker
              key={vehicle.id}
              position={[vehicle.location.latitude, vehicle.location.longitude]}
              icon={createVehicleIcon(vehicle.is_active)}
            >
              <Popup>
                <div className="vehicle-info">
                  <h3>{vehicle.name}</h3>
                  <p><strong>License:</strong> {vehicle.plate_number}</p>
                  <p>
                    <strong>Status:</strong> 
                    <span className={vehicle.is_active ? 'active' : 'inactive'}>
                      {vehicle.is_active ? ' Active' : ' Inactive'}
                    </span>
                  </p>
                  <p><strong>Last updated:</strong> {new Date(vehicle.last_updated).toLocaleString()}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
  
       
      </div>
    );
  };
  
  export default VehicleTracker;