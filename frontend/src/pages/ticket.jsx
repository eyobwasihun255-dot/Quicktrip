import { useState, useEffect } from "react"
import api from '../api';
import Sidebar from "../component/sidebar";
import Header from "../component/Header";

export default function TicketPurchase() {
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [tickets, setTickets] = useState([])
  const [routes, setRoutes] = useState([])
  const [levels, setLevels] = useState([])
  const [ticketTypes, setTicketTypes] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchTickets();
    fetchLevel();
    fetchRoutes();
    fetchTicketTypes();
  }, [])

  const fetchTickets = () => {
    api.get('api/tickets/')
      .then((res) => {
        setTickets(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchRoutes = () => {
    api.get('api/route/')
      .then((res) => setRoutes(res.data))
      .catch((err) => setError(err.message));
  };
  
  const fetchLevel= () => {
    api.get('api/level/')
      .then((res) => setLevels(res.data))
      .catch((err) => setError(err.message));
  };

  const fetchTicketTypes = () => {
 
    setTicketTypes([
      { value: "L", label: "Long Distance" },
      { value: "S", label: "Short Distance" }
    ]);
  };const [loadings, setLoadings] = useState(false);

  const initiatePayment = async () => {
    setLoadings(true);
    try {
     
      const response = await fetch('http://127.0.0.1:8000/api/payment/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500.00 }),
      });
      window.location.href = response.url;  
    } catch (error) {
      console.log("Payment initiation failed!");
      setLoadings(false);
    }
  };


  const handlePurchaseTicket = (newTicket) => {
    api.post('api/tickets/', newTicket)
      .then((res) => {
        setTickets([res.data, ...tickets]);
        setShowTicketModal(false);
      })
      .catch((err) => setError(err.message));
  }
  const filteredTickets = tickets.filter((ticket) => {
    
    const routeName = ticket.route?.name?.toLowerCase() || '';
    const ticketType = ticket.ticket_type?.toLowerCase() || '';
    const username = ticket.user?.username?.toLowerCase() || '';
    
    const matchesSearch =
      routeName.includes(searchTerm.toLowerCase()) ||
      ticketType.includes(searchTerm.toLowerCase()) ||
      username.includes(searchTerm.toLowerCase());
  
    if (filterType === "all") return matchesSearch;
    if (filterType === "L") return matchesSearch && ticket.ticket_type?.toUpperCase() === "L";
    if (filterType === "S") return matchesSearch && ticket.ticket_type?.toUpperCase() === "S";
    
    return matchesSearch;
  });

  return (
    <div className="tickets-page">
      <Sidebar />
      <div className="right">
        <Header />
        <div className="page-header">
          <h1>Ticket Purchase</h1>
          <div className="header-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowTicketModal(true)}
            >
              Buy New Ticket
            </button>
          </div>
        </div>

        <div className="card">
          <div className="search-filter-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by route ..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket Type</th>
                  <th>Route</th>
                  <th>Level</th>
                  <th>Quantity</th>
                  <th>Date/Time</th>
                  <th>Total Price</th>
                  <th>Purchased By</th>
                  <th>Purchase Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8">Loading tickets...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8">Error: {error}</td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="8">No tickets found</td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.get_ticket_type_display || (ticket.ticket_type === "L" ? "Long" : "Short")}</td>
                      <td>{ticket.route?.name || "N/A"}</td>
                      <td>{ticket.level?.level || "N/A"}</td>
                      <td>{ticket.Quantity}</td>
                      <td>
                        {ticket.takeoff_date} at {ticket.takeoff_time}
                      </td>
                      <td>{Number(ticket.total_prize)} ETB</td>
                      <td>{ticket.user?.phone_number || "Guest"}</td>
                      <td>{new Date(ticket.bought_date).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showTicketModal && (
          <TicketPurchaseModal 
            onClose={() => setShowTicketModal(false)} 
            pay = {()=>initiatePayment()}
            routes={routes}
            levels = {levels}
            ticketTypes={ticketTypes}
          />
        )}
      </div>

      <style>{`
        .tickets-page {
          display: flex;
          min-height: 100vh;
        }
        .right {
          width: 100%;
        }
        .page-header {
          flex-direction: column;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .header-actions {
          display: flex;
          gap: 10px;
        }
        .search-filter-container {
          display: flex;
          margin-bottom: 20px;
          gap: 10px;
          flex-wrap: wrap;
        }
        .search-container {
          flex: 1;
          min-width: 250px;
        }
        .filter-container {
          width: 200px;
        }
        .table-container {
          overflow-x: auto;
        }
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .header-actions {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
function TicketPurchaseModal({ onClose, pay, routes, levels, ticketTypes }) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    ticket_type: "S",
    Quantity: 1,
    takeoff_time: "",
    takeoff_date: "",
    total_prize: 0
  });

  const [pformData, setpFormData] = useState({
    status: 'c',
    transaction_id: "12132xw1212",
    types: 'i',
    remark: 'Ticket Purchase',
  });

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 2) {
        searchUsers();
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchUsers = async () => {
    setIsSearching(true);
    try {
      const response = await api.get(`api/getUser/${searchTerm}`);
      setUsers(response.data);
      setShowDropdown(response.data.length > 0);
    } catch (err) {
      console.log(err);
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(user.phone_number);
    setShowDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      if (!selectedUser) {
        console.log("Please select a user first");
        return;
      }

      pformData['user'] = selectedUser.id;
      pformData['branch'] = selectedRoute.first_destination;
      pformData['amount'] = formData.total_prize;
      
      formData['user'] = selectedUser.id;
      formData['route'] = selectedRoute.id;
      formData['level'] = selectedLevel.id;

      api.post(`api/addpayments/`, pformData);
      api.post(`api/ticket/`, formData);
      
      // Call the pay function if provided
      if (pay) {
        pay();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Purchase New Ticket</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group search-container">
            <label>Search User:</label>
            <div className="search-input-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedUser(null);
                  setShowDropdown(e.target.value.length > 0);
                }}
                placeholder="Enter phone number"
              />
              {isSearching && <div className="search-spinner">Searching...</div>}
              {showDropdown && users.length > 0 && (
                <div className="search-dropdown">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className="dropdown-item"
                      onClick={() => handleUserSelect(user)}
                    >
                      {user.phone_number} {user.name && `(${user.name})`}
                    </div>
                  ))}
                </div>
              )}
              {showDropdown && users.length === 0 && !isSearching && (
                <div className="search-dropdown">
                  <div className="dropdown-item no-results">No users found</div>
                </div>
              )}
            </div>
            {selectedUser && (
              <div className="selected-user">
                Selected: {selectedUser.phone_number} {selectedUser.name && `(${selectedUser.name})`}
              </div>
            )}
          </div>

          {/* Rest of your form fields remain the same */}
          <div className="form-group">
            <label>Ticket Type</label>
            <select
              name="ticket_type"
              value={formData.ticket_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Ticket Type</option>
              {ticketTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Route</label>
            <select
              id="options"
              value={selectedRoute?.id || ""}
              onChange={(e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const routeData = JSON.parse(selectedOption.dataset.branch);
                setSelectedRoute(routeData);
              }}
              required
            >
              <option value="">Select a route</option>
              {routes.map((br) => (
                <option
                  key={br.id}
                  value={br.id}
                  data-branch={JSON.stringify(br)}
                >
                  {br.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Level</label>
            <select
              id="options"
              value={selectedLevel?.id || ""}
              onChange={(e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const levelData = JSON.parse(selectedOption.dataset.branch);
                setSelectedLevel(levelData);
              }}
              required
            >
              <option value="">Select a level</option>
              {levels.map((br) => (
                <option
                  key={br.id}
                  value={br.id}
                  data-branch={JSON.stringify(br)}
                >
                  {br.detail}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="Quantity"
              min="1"
              value={formData.Quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Takeoff Date</label>
            <input
              type="date"
              name="takeoff_date"
              value={formData.takeoff_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Takeoff Time</label>
            <input
              type="time"
              name="takeoff_time"
              value={formData.takeoff_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Total Price: {selectedRoute && selectedLevel ? selectedRoute.route_prize * formData.Quantity * selectedLevel.prize : 0}</label>
            <input
              type="number"
              name="total_prize"
              value={formData.total_prize}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Proceed payments
            </button>
          </div>
        </form>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal {
            background: white;
            padding: 20px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
          }
          .form-group {
            margin-bottom: 15px;
            position: relative;
          }
          .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
          }
          .form-group select,
          .form-group input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
          }
          .search-container {
            position: relative;
          }
          .search-input-container {
            position: relative;
          }
          .search-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            max-height: 200px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .dropdown-item {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
          }
          .dropdown-item:hover {
            background-color: #f5f5f5;
          }
          .no-results {
            color: #999;
            padding: 8px 12px;
          }
          .selected-user {
            margin-top: 5px;
            padding: 5px;
            background: #f0f8ff;
            border-radius: 4px;
            font-size: 0.9em;
          }
          .search-spinner {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
            font-size: 0.8em;
          }
        `}</style>
      </div>
    </div>
  );
}