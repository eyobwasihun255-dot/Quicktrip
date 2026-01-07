
import { useState,  useEffect, useRef } from "react"
import Sidebar from "../../component/sidebar"
import Header from "../../component/Header"


export default function Loc() {
 
  const mapRef = useRef(null)

  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [tracking, setTracking] = useState(false)
  const [trackingInterval, setTrackingInterval] = useState(null)

  useEffect(() => {
    // Clean up tracking interval on unmount
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval)
      }
    }
  }, [trackingInterval])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setTracking(true)

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
        setError(null)
      },
      (err) => {
        setError(`Error getting location: ${err.message}`)
        setTracking(false)
      },
    )

    // Set up interval for continuous tracking
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ lat: latitude, lng: longitude })
          setError(null)
        },
        (err) => {
          setError(`Error getting location: ${err.message}`)
        },
      )
    }, 10000) // Update every 10 seconds

    setTrackingInterval(interval)
  }

  const stopTracking = () => {
    setTracking(false)
    if (trackingInterval) {
      clearInterval(trackingInterval)
      setTrackingInterval(null)
    }
  }

  useEffect(() => {
    if (!mapRef.current || !location) return

    const ctx = mapRef.current.getContext("2d")
    const width = mapRef.current.width
    const height = mapRef.current.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1

    // Vertical grid lines
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw current location
    const x = width / 2
    const y = height / 2

    // Draw outer circle (accuracy radius)
    ctx.beginPath()
    ctx.arc(x, y, 50, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(58, 134, 255, 0.1)"
    ctx.fill()

    // Draw location marker
    ctx.beginPath()
    ctx.arc(x, y, 10, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(58, 134, 255, 0.7)"
    ctx.fill()
    ctx.strokeStyle = "white"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw pulsing effect
    if (tracking) {
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(58, 134, 255, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw coordinates
    ctx.font = "14px Arial"
    ctx.fillStyle = "#333"
    ctx.textAlign = "center"
    ctx.fillText(`Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`, x, y + 40)
  }, [location, tracking])


  return (
    <div className="location-page">
        <Sidebar/>
        <div className="right">
            <Header/>
      <div className="page-header">
        <h1>Track Location</h1>
        <div className="tracking-controls">
          {!tracking ? (
            <button className="btn btn-primary" onClick={startTracking}>
              Start Tracking
            </button>
          ) : (
            <button className="btn btn-danger" onClick={stopTracking}>
              Stop Tracking
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Current Location</h2>
          {tracking && <span className="tracking-badge">Live Tracking</span>}
        </div>

        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="location-content">
            {location ? (
              <>
                <div className="location-details">
                  <div className="detail-item">
                    <span className="detail-label">Latitude:</span>
                    <span className="detail-value">{location.lat.toFixed(6)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Longitude:</span>
                    <span className="detail-value">{location.lng.toFixed(6)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="map-container">
                  <canvas ref={mapRef} width={800} height={400} style={{ width: "100%", height: "100%" }}></canvas>

                  <div className="map-disclaimer">
                    <p>
                      Note: This is a simplified map visualization. In a production environment, this would use the
                      Google Maps API.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-location">
                <p>No location data available. Click "Start Tracking" to begin.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Location Tracking Information</h2>
        </div>
        <div className="card-content">
          <p>Location tracking is used for operational purposes. This information is used to:</p>
          <ul>
            <li>Track driver locations in real-time</li>
            <li>Coordinate vehicle inspections and registrations</li>
            <li>Ensure efficient operations across all stations</li>
            <li>Provide accurate location data to customers</li>
          </ul>
          <p>Location data is only visible to administrators and is not shared with third parties.</p>
        </div>
      </div>
      </div>
      <style>{`
        .location-page {
          display: flex;
        }
          .right {
          width :100%;
          }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .tracking-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          background-color: rgba(40, 167, 69, 0.1);
          color: var(--success-color);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
        
        .location-content {
          padding: 20px;
        }
        
        .location-details {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
        }
        
        .detail-label {
          font-size: 0.875rem;
          color: var(--text-light);
        }
        
        .detail-value {
          font-size: 1.25rem;
          font-weight: 500;
        }
        
        .map-container {
          position: relative;
          height: 400px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        
        .map-disclaimer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px;
          font-size: 0.8rem;
          text-align: center;
        }
        
        .no-location {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 8px;
        }
        
        .card-content {
          padding: 20px;
        }
        
        .card-content ul {
          margin-left: 20px;
          margin-bottom: 15px;
        }
        
        .card-content li {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  )
}

