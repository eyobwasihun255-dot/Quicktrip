

import { useEffect, useRef, useState } from "react";

const VehicleMap = ({ vehicles, zoom = 12 }) => {
  const mapRef = useRef(null); // Reference to the map container div
  const [map, setMap] = useState(null); // Google Map instance
  const [markers, setMarkers] = useState([]); // Array of marker instances
  const [infoWindow, setInfoWindow] = useState(null); // InfoWindow instance

  // Initialize the map and info window on mount
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 9.03, lng: 38.74 },
      zoom,
      styles: [
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    const infoWin = new window.google.maps.InfoWindow({ maxWidth: 200 });

    setMap(googleMap);
    setInfoWindow(infoWin);

    // Cleanup on unmount
    return () => {
      setMap(null);
      setInfoWindow(null);
    };
  }, []);

  // Update markers whenever vehicles or map changes
  useEffect(() => {
    if (!map || !window.google) return;

    // Remove old markers from the map
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = [];
    const bounds = new window.google.maps.LatLngBounds();

    vehicles.forEach(vehicle => {
      const position = {
        lat: parseFloat(vehicle.latitude),
        lng: parseFloat(vehicle.longitude),
      };

      // Create a marker for each vehicle
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: vehicle.plate_number,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#3a86ff",
          fillOpacity: 0.8,
          strokeColor: "#fff",
          strokeWeight: 1,
          scale: 8,
        },
      });

      // Show info window with vehicle details on marker click
      marker.addListener("click", () => {
        infoWindow.setContent(`
          <div>
            <strong>${vehicle.plate_number}</strong><br/>
            Lat: ${vehicle.latitude}, Lng: ${vehicle.longitude}
          </div>
        `);
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    // Fit map to show all markers
    if (vehicles.length > 0) {
      map.fitBounds(bounds);
    }

    setMarkers(newMarkers);
  }, [vehicles, map]);

  return (
    <div className="vehicle-map-container" style={{ height: 600, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      {/* Map will be rendered inside this div */}
      <div ref={mapRef} className="google-map" style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default VehicleMap; 