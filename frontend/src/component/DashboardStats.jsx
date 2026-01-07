
import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext.jsx'

const DashboardStats = ({ vehicles = [], payments = [] }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({ vehicles, payments })

  const { role, branch } = useAuth()

  useEffect(() => {
    // If props provided, prefer them; otherwise fetch
    const needFetch = vehicles.length === 0 || payments.length === 0
    if (!needFetch) return
    setLoading(true)
    // Sub-admin should see branch-scoped stats; backend enforces filtering
    Promise.all([
      api.get('api/vehicles/').then(r => r.data).catch(() => []),
      api.get('api/payments/').then(r => r.data).catch(() => []),
    ])
      .then(([veh, pay]) => setData({ vehicles: veh, payments: pay }))
      .finally(() => setLoading(false))
  }, [vehicles, payments, role, branch])

  const vehiclesSource = data.vehicles.length ? data.vehicles : vehicles
  const paymentsSource = data.payments.length ? data.payments : payments

  const drivers = new Set(vehiclesSource.map(v => v.user?.id)).size
  const totalIncome = paymentsSource
    .filter(p => p.types === 'i')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const totalTax = paymentsSource
    .filter(p => p.types === 't')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)

  const stats = {
    totalVehicles: vehiclesSource.length,
    totalRevenue: totalIncome,
    taxCollected: totalTax,
    activeDrivers: drivers,
  }
  
    return (
      <div className="grid grid-4">
        {loading && (
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-content">
              <p>Loading stats…</p>
            </div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-icon blue">🚗</div>
          <div className="stat-content">
            <h3>{stats.totalVehicles}</h3>
            <p>Total Vehicles</p>
          </div>
        </div>
  
        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div className="stat-content">
            <h3>{stats.totalRevenue} ETB</h3>
            <p>Total Revenue</p>
          </div>
        </div>
  
        <div className="stat-card">
          <div className="stat-icon pink">📊</div>
          <div className="stat-content">
            <h3>{stats.taxCollected.toLocaleString()} ETB</h3>
            <p>Tax Collected</p>
          </div>
        </div>
  
        <div className="stat-card">
          <div className="stat-icon green">👤</div>
          <div className="stat-content">
            <h3>{stats.activeDrivers}</h3>
            <p>Active Drivers</p>
          </div>
        </div>
      </div>
    )
  }
  
  export default DashboardStats
  
  