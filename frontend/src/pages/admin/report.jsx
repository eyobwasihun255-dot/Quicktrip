import { useState, useEffect } from "react";
import api from "../../api";
import { USER_ID } from '../../constants';
import Sidebar from "../../component/sidebar";
import DashboardStats from "../../component/DashboardStats";
import RevenueChart from "../../component/RevenueChart";
import PassengerChart from "../../component/PassengerChart";
import RecentVehicles from "../../component/RecentVehicles";
import Header from "../../component/Header";

function Report() {
  const [report, setReport] = useState([]);
  const [history, setHistory] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("weekly");

  const id = localStorage.getItem(USER_ID);
  const hour = new Date().getHours();
  useEffect(() => {
   
    getUser();
    getVehicle();
    getReport();
    getTravelhistory();
 
  },[]);
  const getReport = () => {
    api
      .get('api/payments/')
      .then((res) => res.data)
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };
  const getTravelhistory = () => {
    api
      .get('api/report/')
      .then((res) => res.data)
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };
  const getVehicle = () => {
    api
      .get('api/vehicles/')
      .then((res) => res.data)
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };
  
  const getUser = () => {
    api
      .get(`api/staffdetail/${id}`)
      .then((res) => res.data)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };
  
 
  if (loading) return <div>Loading...</div>;
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>  {greeting},{' '}
          {user?.employee 
            ? `${user.employee.Fname} ${user.employee.Lname}`
            : 'User'
          }!</h1>
            <div className="time-filter">
              {["daily", "weekly", "monthly", "yearly"].map((range) => (
                <button
                  key={range}
                  className={`btn ${timeRange === range ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <DashboardStats 
            vehicles = {vehicles}
            payments = {report}
          
          />

          <div className="grid grid-2">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Revenue Overview</h2>
              </div>
              <div className="chart-container">
                <RevenueChart timeRange={timeRange} payments = {report} />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Passenger Trends</h2>
              </div>
              <div className="chart-container">
                <PassengerChart timeRange={timeRange} passengerHistory = {history} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recently Registered Vehicles</h2>
              
            </div>
            <RecentVehicles  vehicles = {vehicles}/>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
        }
        
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .dashboard-content {
          flex: 1;
          padding: 20px;
          margin-top: 60px; /* Space for fixed header */
        }
        
        .dashboard-header {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .time-filter {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn-outline {
          background-color: transparent;
          border: 1px solid var(--primary-color);
          color: var(--primary-color);
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
        }

        .btn-outline:hover {
          background-color: rgba(58, 134, 255, 0.1);
        }
        
        .error-message {
          color: red;
          padding: 20px;
          text-align: center;
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
          margin-top: 20px;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 10px;
        }

        @media (min-width: 768px) {
          .dashboard-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          
          .grid-2 {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (min-width: 1024px) {
          .dashboard-content {
            padding: 20px 30px;
          }
        }
      `}</style>
    </div>
  );
}

export default Report;