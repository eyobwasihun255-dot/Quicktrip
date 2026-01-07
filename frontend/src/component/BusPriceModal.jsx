import { useState, useEffect } from "react"
import api from "../api"

export default function BusPriceModal({
  bus,
  prices,
  setPrices,
  vehicles = [],
  onClose
}) {
  const [loading, setLoading] = useState(false)
  const [newRouteId, setNewRouteId] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [routes, setRoutes] = useState([])
const [editingQueue, setEditingQueue] = useState(null)
const [takeoffTime, setTakeoffTime] = useState("")

  const [editingVehicle, setEditingVehicle] = useState(null)
  const [vehicleRoute, setVehicleRoute] = useState("")

  // Fetch routes
  useEffect(() => {
    api.get("/api/route/")
      .then(res => setRoutes(res.data))
      .catch(err => console.error(err))
  }, [])

  /* ---------------- PRICES ---------------- */

  const updatePriceLocal = (id, value) => {
    setPrices(prices.map(p =>
      p.id === id ? { ...p, price: value } : p
    ))
  }
  const saveTakeoffTime = () => {
  api.patch(`/api/queue/${editingQueue}/takeoff-time/`, {
    takeoff_time: takeoffTime
  }).then(() => {
    setEditingQueue(null)
  })
}


  const savePrice = (priceId, price) => {
    setLoading(true)
    api.patch(`/api/long-bus-prices/${priceId}/`, { price })
      .then(res => {
        setPrices(prices.map(p => p.id === priceId ? res.data : p))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const addPrice = () => {
    if (!newRouteId || !newPrice) return

    setLoading(true)
    api.post("/api/long-bus-prices/", {
      long_bus: bus.id,
      route: parseInt(newRouteId),
      price: parseFloat(newPrice)
    })
      .then(res => {
        setPrices([...prices, res.data])
        setNewRouteId("")
        setNewPrice("")
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  /* ---------------- VEHICLES ---------------- */

  const startEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle.id)
    setVehicleRoute(vehicle.route || "")
  }

  const saveVehicleRoute = (vehicleId) => {
  if (!vehicleRoute) return

  setLoading(true)
  api.patch(`api/vehicle/${vehicleId}`, {
    route: Number(vehicleRoute)  // <-- convert string to number
  })
    .then(() => {
      setVehicles(prev =>
        prev.map(v =>
          v.id === vehicleId ? { ...v, route: Number(vehicleRoute) } : v
        )
      )
      setEditingVehicle(null)
      setLoading(false)
    })
    .catch(err => {
      console.error(err.response?.data || err)
      setLoading(false)
    })
}


  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2>{bus.name} – Details</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* ROUTES & PRICES */}
        <h3>Routes & Prices</h3>

        {prices.length ? prices.map(p => (
          <div key={p.id} style={rowStyle}>
            <div style={{ flex: 2 }}>{p.route_name}</div>
            <input
              type="number"
              value={p.price}
              onChange={e => updatePriceLocal(p.id, e.target.value)}
              style={inputStyle}
            />
            <button onClick={() => savePrice(p.id, p.price)} disabled={loading}>
              Save
            </button>
          </div>
        )) : <p>No routes assigned</p>}

        {/* ADD PRICE */}
        <div style={sectionStyle}>
          <h4>Add New Route Price</h4>
          <select
            value={newRouteId}
            onChange={e => setNewRouteId(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select route</option>
            {longDistanceRoutes.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}{getRouteDistance(r) !== null ? ` (${getRouteDistance(r)} km)` : ''}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Price"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            style={inputStyle}
          />

          <button onClick={addPrice} disabled={loading}>Add</button>
        </div>
        
        {/* VEHICLES */}
        <h3 style={{ marginTop: "30px" }}>Vehicles</h3>

        {vehicles.length ? vehicles.map(v => (
          <div key={v.id} style={vehicleRow}>
            <div><strong>{v.plate_number}</strong></div>
    <div>{v.route_name}</div>
    <div>{v.queue?.branch || "—"}</div>
    <div>{v.driver_name}</div>
    <div>{v.driver_phone}</div>
    <div>
      {v.queue?.takeoff_time ? (
        <span>{v.queue.takeoff_time}</span>
      ) : (
        <span>Not set</span>
      )}
    </div>
{editingQueue && (
  <div className="mini-modal">
    <input
      type="time"
      value={takeoffTime}
      onChange={e => setTakeoffTime(e.target.value)}
    />
    <button onClick={saveTakeoffTime}>Save</button>
    <button onClick={() => setEditingQueue(null)}>Cancel</button>
  </div>
)}
    <button onClick={() => {
      setEditingQueue(v.queue?.id)
      setTakeoffTime(v.queue?.takeoff_time || "")
    }}>
      Set Time
    </button>
            {editingVehicle === v.id ? (
              <>
                <select
                  value={vehicleRoute}
                  onChange={e => setVehicleRoute(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Select route</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <button onClick={() => saveVehicleRoute(v.id)} disabled={loading}>
                  Save
                </button>
              </>
            ) : (
              <button onClick={() => startEditVehicle(v)}>
                Change Route
              </button>
            )}
          </div>
        )) : <p>No vehicles assigned</p>}
      </div>
      

    </div>
  )
}

/* ---------------- STYLES ---------------- */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
}

const modalStyle = {
  background: "#fff",
  borderRadius: "8px",
  padding: "20px",
  width: "650px",
  maxHeight: "85%",
  overflowY: "auto"
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "15px"
}

const rowStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  marginBottom: "10px"
}

const vehicleRow = {
  display: "grid",
  gridTemplateColumns: "1.5fr 2fr 1.5fr 2fr 1fr",
  gap: "10px",
  alignItems: "center",
  marginBottom: "10px"
}

const inputStyle = {
  padding: "5px",
  width: "100px"
}

const selectStyle = {
  padding: "5px",
  minWidth: "150px"
}

const sectionStyle = {
  marginTop: "20px",
  borderTop: "1px solid #ccc",
  paddingTop: "15px"
}
