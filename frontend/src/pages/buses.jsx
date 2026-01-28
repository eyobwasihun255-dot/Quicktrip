import { useEffect, useState } from "react"
import api from "../api"
import Sidebar from "../component/sidebar"
import Header from "../component/Header"

import BusPriceModal from "../component/BusPriceModal"
export default function Buses() {
  const [buses, setBuses] = useState([])
  const [selectedBus, setSelectedBus] = useState(null)
  const [showAddBus, setShowAddBus] = useState(false)
  const [newBusName, setNewBusName] = useState("")
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [routes, setRoutes] = useState([])
  const [modalRouteId, setModalRouteId] = useState(null)
  const [modalPrice, setModalPrice] = useState("")
  const [busNameDraft, setBusNameDraft] = useState("")
  const [busActionLoading, setBusActionLoading] = useState(false)
  const [showEditBusModal, setShowEditBusModal] = useState(false)
  const [editingBus, setEditingBus] = useState(null)
  const [showChangeModal, setShowChangeModal] = useState(false)
const [busVehicles, setBusVehicles] = useState([])
   const [notify, setNotify] = useState(""); // message text

  const [busPrices, setBusPrices] = useState([]);

  const getBusDisplayName = (bus) => {
    const raw = bus?.name ?? bus?.bus_name ?? bus?.busName ?? bus?.title
    const value = (raw ?? "").toString().trim()
    return value || (bus?.id ? `Bus ${bus.id}` : "Unnamed Bus")
  }
 const showNotification = (msg) => {
  setNotify(msg);
  setTimeout(() => setNotify(""), 2000); // disappears after 2 seconds
};

  const getRouteDistance = (route) => {
    const raw =
      route?.distance ??
      route?.km ??
      route?.kms ??
      route?.route_distance ??
      route?.total_distance ??
      route?.length
    const parsed = typeof raw === 'number' ? raw : Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  }

  const longDistanceRoutes = (Array.isArray(routes) ? routes : []).filter((r) => {
    const distance = getRouteDistance(r)
    return distance !== null && distance > 400
  })

  useEffect(() => {
    api.get("/api/long-buses/")
      .then(res => {
        const data = res?.data
        if (Array.isArray(data)) return setBuses(data)
        if (Array.isArray(data?.results)) return setBuses(data.results)
        return setBuses([])
      })
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    if (showAddBus || showChangeModal) {
      api.get('/api/route/')
        .then(res => setRoutes(res.data))
        .catch(err => console.error(err))
    }
  }, [showAddBus, showChangeModal])

  const handleBusClick = (bus) => {
    setSelectedBus(bus)
  }

  const openEditBusModal = (bus) => {
    if (!bus?.id) return
    setSelectedBus(bus)
    setEditingBus(bus)
    setBusNameDraft(getBusDisplayName(bus))
    setShowEditBusModal(true)
  }

  const closeEditBusModal = () => {
    setShowEditBusModal(false)
    setEditingBus(null)
    setBusNameDraft("")
  }
  const openChangeModal = async (bus) => {
  setSelectedBus(bus)
  setShowChangeModal(true)
  try {
      const res = await api.get(`/api/long/${bus.id}/vehicles/`)
  setBusVehicles(res.data)
const pricesRes = await api.get(`/api/long-bus-prices/${bus.id}/`);
setBusPrices(pricesRes.data);

  } catch (err) {
    console.error(err)
  }

}

  const saveBusName = async () => {
    if (!editingBus?.id) return
    const nextName = busNameDraft.trim()
    if (!nextName || nextName === getBusDisplayName(editingBus)) {
      closeEditBusModal()
      return
    }

    try {
      setBusActionLoading(true)
      const res = await api.patch(`/api/long-buses/${editingBus.id}/`, { name: nextName })
      const updated = res.data
      setBuses(buses.map(b => b.id === editingBus.id ? updated : b))
      if (selectedBus?.id === editingBus.id) setSelectedBus(updated)
      setEditingBus(updated)
      closeEditBusModal()
    } catch (err) {
      console.error(err.response?.data || err)
    } finally {
      setBusActionLoading(false)
    }
  }

  const deleteBusByItem = async (bus) => {
    if (!bus?.id) return
    const ok = window.confirm(`Delete bus "${getBusDisplayName(bus)}"? This cannot be undone.`)
    if (!ok) return

    try {
      setBusActionLoading(true)
      await api.delete(`/api/long-buses/${bus.id}/`)
      setBuses(buses.filter(b => b.id !== bus.id))
      if (selectedBus?.id === bus.id) {
        setSelectedBus(null)
      }
      if (editingBus?.id === bus.id) closeEditBusModal()
    } catch (err) {
      console.error(err.response?.data || err)
    } finally {
      setBusActionLoading(false)
    }
  }

  const addBus = async () => {
    if (!newBusName.trim() || !modalRouteId || !modalPrice) return
    try {
      setLoading(true)
      const busRes = await api.post("/api/long-buses/", { name: newBusName })
      const createdBus = busRes.data

      await api.post('/api/long-bus-prices/', {
        long_bus: createdBus.id,
        route: modalRouteId,
        price: parseFloat(modalPrice)
      })

      setBuses([...buses, createdBus])
      // reset modal state
      setNewBusName("")
      setModalRouteId(null)
      setModalPrice("")
      setShowAddBus(false)
    } catch (err) {
      console.error(err.response?.data || err)
    } finally {
      setLoading(false)
    }
  }

  const filteredBuses = (Array.isArray(buses) ? buses : []).filter((bus) => {
    const name = getBusDisplayName(bus).toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <div className="passengers-page">
      <Sidebar />
      <div className="right">
        <Header />

        <div className="page-header">
          <div>
            <h1>Bus Management</h1>
            <p className="page-subtitle">Manage fleet, routes, and pricing</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowAddBus(true)}>Add Bus</button>
          </div>
        </div>

        <div className="passengers-container">
          <div className="passengers-sidebar card">
            <div className="search-filter-container">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search buses..."
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="passengers-list">
              {filteredBuses.length > 0 ? (
                filteredBuses.map(bus => (
                  <div
                    key={bus.id}
                    className={`passenger-list-item ${selectedBus?.id === bus.id ? "selected" : ""}`}
                    onClick={() => handleBusClick(bus)}
                  >
                    <div className="bus-list-row">
                      <div className="bus-list-info">
                        <div className="passenger-name">{getBusDisplayName(bus)}</div>
                        <div className="passenger-id">
                          BUS-ID: {bus.id}
                        </div>
                      </div>
                      <div className="bus-list-actions">
                        <button
                          type="button"
                          className="btn btn-edit btn-sm"
                          disabled={busActionLoading}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            openEditBusModal(bus)
                          }}
                        >
                          Edit
                        </button>
                        <button
                        className="btn btn-warning btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openChangeModal(bus)
                        }}
                      >
                        Change
                      </button>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          disabled={busActionLoading}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            deleteBusByItem(bus)
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No buses found</div>
              )}
            </div>
          </div>

        </div>

        {showEditBusModal && editingBus && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h2>Edit Bus</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <label>
                  <span>Bus Name</span>
                  <input
                    type="text"
                    className="form-control"
                    value={busNameDraft}
                    onChange={(e) => setBusNameDraft(e.target.value)}
                  />
                </label>
                <button
                  className="btn btn-primary"
                  onClick={saveBusName}
                  disabled={busActionLoading || !busNameDraft.trim()}
                  style={{ width: '100%', padding: '8px' }}
                >
                  {busActionLoading ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={closeEditBusModal}
                  disabled={busActionLoading}
                  style={{ width: '100%', padding: '8px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddBus && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h2>Add New Long-Distance Bus</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <label>
                  <span>Bus Name</span>
                  <input
                    type="text"
                    placeholder="Bus Name"
                    value={newBusName}
                    onChange={e => setNewBusName(e.target.value)}
                    className="form-control"
                  />
                </label>

                <label>
                  <span>Route</span>
                  <select
                    className="form-control"
                    value={modalRouteId ?? ''}
                    onChange={(e) => setModalRouteId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Select a route</option>
                    {longDistanceRoutes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {(r.name || r.route_name || `Route ${r.id}`)}{getRouteDistance(r) !== null ? ` (${getRouteDistance(r)} km)` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Price</span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Price"
                    value={modalPrice}
                    onChange={(e) => setModalPrice(e.target.value)}
                  />
                </label>

                <button
                  className="btn btn-primary"
                  onClick={addBus}
                  disabled={loading || !newBusName.trim() || !modalRouteId || !modalPrice}
                  style={{ width: '100%', padding: '8px' }}
                >
                  {loading ? "Adding..." : "Add Bus with Route & Price"}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowAddBus(false)}
                  style={{ width: '100%', padding: '8px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      {showChangeModal && selectedBus && (
  <BusPriceModal
    bus={selectedBus}
    prices={busPrices}
    setPrices={setBusPrices}
    vehicles={busVehicles}
    setVehicles={setBusVehicles}
    routes={routes}
    longDistanceRoutes={longDistanceRoutes}
    getRouteDistance={getRouteDistance}
    onClose={() => setShowChangeModal(false)}
  />
)}




      </div>
      <style>{`
        .passengers-page { display: flex; flex-direction: row; height: calc(100vh - 120px); }
        .right{ width:100%; max-height: 650px; margin:10px; }
        .page-header { display:flex; justify-content:space-between; align-items:center; margin:20px; }
        .page-subtitle{ color: var(--text-secondary); margin-top:4px; font-size:0.95rem; }
        .header-actions{ display:flex; gap:10px; }
        .passengers-container { display:flex; flex:1; gap:20px; height:100%; overflow:hidden; }
        .passengers-sidebar { width:100%; display:flex; flex-direction:column; background-color:var(--bg-primary); border-radius:8px; box-shadow:var(--box-shadow); overflow:hidden; }
        .search-filter-container { padding:15px; border-bottom:1px solid var(--border-color); display:flex; flex-direction:column; gap:10px; }
        .passengers-list { flex:1; overflow-y:auto; padding:10px; }
        .passenger-list-item { padding:12px; border-radius:6px; margin-bottom:8px; cursor:pointer; transition:all 0.2s; border-left:3px solid transparent; }
        .passenger-list-item:hover { background-color: var(--hover-bg); }
        .passenger-list-item.selected { background-color: var(--unread-bg); border-left-color: var(--primary-color); }
        .passenger-name { font-weight:600; margin-bottom:5px; }
        .passenger-id { font-size:0.85rem; color: var(--text-secondary); margin-bottom:5px; }
        .bus-list-row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .bus-list-info { min-width:0; }
        .bus-list-actions { display:flex; gap:8px; flex-shrink:0; }
        .btn-sm { padding: 6px 10px; font-size: 0.85rem; }
        .passengers-content { flex:1; background-color: var(--bg-primary); border-radius:8px; box-shadow: var(--box-shadow); padding:20px; overflow-y:auto; }
        .passenger-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid var(--border-color); }
        .detail-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:15px; }
        .detail-item { padding:10px; background-color: var(--bg-secondary); border-radius:6px; }
        .detail-label { font-size:0.8rem; color: var(--text-secondary); margin-bottom:5px; }
        .detail-value { font-weight:500; }
        .trips-table-container { overflow-x:auto; }
        .trips-table { width:100%; border-collapse:collapse; }
        .trips-table th, .trips-table td { padding:12px 15px; text-align:left; border-bottom:1px solid var(--border-color); }
        .trips-table th { background-color: var(--bg-secondary); font-weight:600; }
        .trips-table tr:hover { background-color: var(--hover-bg); }
        .empty-state { display:flex; justify-content:center; align-items:center; height:200px; color: var(--text-light); }
        .modal-backdrop { position:fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999; }
        .modal-card { background:#fff; padding:20px; width:400px; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.2); }
        @media (max-width: 768px) { .passengers-container { flex-direction: column; } .passengers-sidebar { width:100%; max-height:300px; } }
        @media (max-width: 576px) { .detail-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
