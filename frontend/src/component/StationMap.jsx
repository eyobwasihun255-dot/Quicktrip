
import { useEffect, useRef, useState } from "react"

const StationMap = ({ stations, selectedStation, zoom = 12, onSelectStation }) => {
  const mapRef = useRef(null) // Reference to the map container div
  const [map, setMap] = useState(null) // Google Map instance
  const [markers, setMarkers] = useState([]) // Array of marker instances
  const [infoWindow, setInfoWindow] = useState(null) // InfoWindow instance

  // Initialize the map and info window on mount
  useEffect(() => {
    if (!window.google || !mapRef.current) return

    // Create the Google Map
    const googleMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 0, lng: 0 },
      zoom: zoom,
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
    })

    // Create info window
    const infoWin = new window.google.maps.InfoWindow({
      maxWidth: 200
    })

    setMap(googleMap)
    setInfoWindow(infoWin)

    // Cleanup on unmount
    return () => {
      setMap(null)
      setInfoWindow(null)
    }
  }, [])

  // Update markers whenever stations or selectedStation changes
  useEffect(() => {
    if (!map || !window.google) return

    // Remove old markers from the map
    markers.forEach(marker => marker.setMap(null))
    const newMarkers = []

    // Create bounds to fit all stations
    const bounds = new window.google.maps.LatLngBounds()

    // Create markers for each station; skip invalid coords to avoid Google Maps errors
    stations.forEach(station => {
      const lat = station?.location?.latitude
      const lng = station?.location?.longitude
      if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) {
        return
      }

      const position = { lat, lng }

      // Create marker for the station
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: station.name,
        icon: getMarkerIcon(station),
        zIndex: station.id === selectedStation?.id ? 1000 : 1
      })

      // Show info window and select station on marker click
      marker.addListener("click", () => {
        onSelectStation(station)
        infoWindow.setContent(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 5px 0; font-size: 14px;">${station.name}</h3>
            <p style="margin: 0; font-size: 12px;">Status: ${getStatusText(station.status)}</p>
          </div>
        `)
        infoWindow.open(map, marker)
      })

      newMarkers.push(marker)
      bounds.extend(position)
    })

    // Fit map to show all stations
    if (stations.length > 0) {
      map.fitBounds(bounds)
      // If only one station, set a reasonable zoom level
      if (stations.length === 1) {
        setTimeout(() => {
          map.setZoom(zoom)
        }, 100)
      }
    }

    // Center and show info window for selected station
    if (selectedStation?.location) {
      const selectedMarker = newMarkers.find(m => m.title === selectedStation.name)
      if (selectedMarker) {
        map.panTo(selectedMarker.getPosition())
        infoWindow.setContent(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 5px 0; font-size: 14px;">${selectedStation.name}</h3>
            <p style="margin: 0; font-size: 12px;">Status: ${getStatusText(selectedStation.status)}</p>
          </div>
        `)
        infoWindow.open(map, selectedMarker)
      }
    }

    setMarkers(newMarkers)
  }, [stations, selectedStation, map])

  // Helper function to get marker icon based on status
  const getMarkerIcon = (station) => {
    const isSelected = station.id === selectedStation?.id
    let color
    
    if (station.status === "a") {
      color = "#28a745" // green
    } else if (station.status === "m") {
      color = "#ffc107" // yellow
    } else {
      color = "#dc3545" // red
    }

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: isSelected ? "#3a86ff" : "white",
      strokeWeight: isSelected ? 3 : 1,
      scale: isSelected ? 10 : 7
    }
  }

  // Helper function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case "a": return "Active"
      case "m": return "Maintenance"
      default: return "Inactive"
    }
  }

  return (
    <div className="station-map-container">
      {/* Map will be rendered inside this div */}
      <div ref={mapRef} className="google-map" />
      
      {/* Legend for marker colors */}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-marker active"></div>
          <span>Active</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker maintenance"></div>
          <span>Maintenance</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker inactive"></div>
          <span>Inactive</span>
        </div>
      </div>

      <style>{`
        .station-map-container {
          position: relative;
          height: 600px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        
        .google-map {
          width: 100%;
          height: 100%;
        }
        
        .map-legend {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: rgba(255, 255, 255, 0.8);
          padding: 8px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 0.8rem;
          z-index: 1;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .legend-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .legend-marker.active {
          background-color: rgba(40, 167, 69, 0.7);
        }
        
        .legend-marker.maintenance {
          background-color: rgba(255, 193, 7, 0.7);
        }
        
        .legend-marker.inactive {
          background-color: rgba(220, 53, 69, 0.7);
        }
      `}</style>
    </div>
  )
}

export default StationMap