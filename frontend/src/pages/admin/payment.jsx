
import { useState, useContext, useEffect } from "react"
import Sidebar from "../../component/sidebar"
import Header from "../../component/Header"
import api from "../../api"
import PaymentReceiptGenerator from "../../component/PaymentRecieptGenerator"
export default function Payments() {
 const [activeTab, setActiveTab] = useState("p")
  const [searchTerm, setSearchTerm] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showReceiptGenerator , setshowReceiptGenerator] = useState(false)
  const [ selectedPayment , setSelectedpayment]  = useState([])
  const [payments, setPayments] = useState([])
  const [pformData, setpFormData] = useState({
    status: 'c',
    transaction_id: "12132xw1212",
    types: 'i',
    remark :'Ticket Purchase',

  });
  useEffect(()=>{
    getPayment()
  },[])
  const getPayment = () => {
    api
      .get('api/driver_payments/')
      .then((res) => res.data)
      .then((data) => {
        setPayments(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };
 

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.user.employee.Fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.remark.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && payment.status === activeTab
  })

 
  const handlePayment = (pid , driver) => {
    setSelectedDriver(driver)
    setShowPaymentModal(true)

    try {
      const response = api.put(`/api/pay/${pid}/`, { status: 'c'});
    
      
    } catch (err) {
      console.log(err.response?.data?.detail || "Error deactivating user");
    } finally {
      
    }
  };

const [loadings, setLoadings] = useState(false);
  const processPayment = async() => {
    // In a real app, this would process the payment via API
    setLoadings(true);
    try {
     
      const response = await fetch('https://quicktrip-e761.onrender.com/api/payment/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500.00 }),
      });
      window.location.href = response.url;  
    } catch (error) {
      alert("Payment initiation failed!");
      setLoadings(false);
    }
    setShowPaymentModal(false)
  }


  return (
    <div className="payments-page">
        <Sidebar/>
        <div className="right">
            <Header/>
      <div className="page-header">
        <h1>Driver Payments</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="tabs">
            <button className={`tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
              All Payments
            </button>
            <button
              className={`tab ${activeTab === "p" ? "active" : ""}`}
              onClick={() => setActiveTab("p")}
            >
              Pending
            </button>
            <button
              className={`tab ${activeTab === "c" ? "active" : ""}`}
              onClick={() => setActiveTab("c")}
            >
              Completed
            </button>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search by driver, plate number..."
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
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.user?.employee.Fname}</td>
                    <td>{payment.vehicle != null ?payment.vehicle.plate_number :"N/A  "}</td>
                    <td>${payment.amount}</td>
                    <td>{payment.remark}</td>
                    <td>{new Date(payment.time).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status === "p" ? "Pending" : "Completed"}
                      </span>
                    </td>
                    <td>
                      {payment.status === "p" ? (
                        <button className="btn btn-sm btn-primary" onClick={() => handlePayment(payment.id ,payment)}>
                          Process Payment
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-secondary"onClick={() => {setSelectedpayment(payment),setshowReceiptGenerator(true)}} >View Receipt</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No payments found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPaymentModal && (
        <div className="modal-backdrop">
          <div className="modal payment-modal">
            <div className="modal-header">
              <h2 className="modal-title">Process Payment</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-details">
                <div className="detail-row">
                  <span className="detail-label">Driver:</span>
                  <span className="detail-value">{selectedDriver.user.employee.Fname} {selectedDriver.user.employee.Lname}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Vehicle:</span>
                  <span className="detail-value">{selectedDriver.vehicle.plate_number}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">${selectedDriver.amount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedDriver.remark}</span>
                </div>
              </div>

              <div className="payment-methods">
                <h3>Payment Method</h3>
                <div className="payment-method-options">
                  <label className="payment-method-option">
                    <input type="radio" name="paymentMethod" value="bank" defaultChecked />
                    <div className="payment-method-content">
                      <span className="payment-method-icon">🏦</span>
                      <span className="payment-method-name">Bank Transfer</span>
                    </div>
                  </label>
                  <label className="payment-method-option">
                    <input type="radio" name="paymentMethod" value="cash" />
                    <div className="payment-method-content">
                      <span className="payment-method-icon">💵</span>
                      <span className="payment-method-name">Cash</span>
                    </div>
                  </label>
                  <label className="payment-method-option">
                    <input type="radio" name="paymentMethod" value="mobile" />
                    <div className="payment-method-content">
                      <span className="payment-method-icon">📱</span>
                      <span className="payment-method-name">Mobile Money</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  Payment Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows="3"
                  placeholder="Add any additional notes about this payment"
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={processPayment}>
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      {showReceiptGenerator && <PaymentReceiptGenerator payment={selectedPayment} onClose={() => setshowReceiptGenerator(false)} />}
      <style>{`
        .payments-page {
          display: flex;

        }
          .right {
           width :100%;
           display: flex;
           flex-direction : column;
          }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .tabs {
          display: flex;
          gap: 10px;
        }
        
        .tab {
          background: none;
          border: none;
          padding: 8px 15px;
          cursor: pointer;
          border-radius: 4px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        
        .tab:hover {
          background-color: var(--hover-bg);
        }
        
        .tab.active {
          background-color: var(--primary-color);
          color: white;
        }
        
        .search-container {
          width: 300px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .status-badge.p {
          background-color: rgba(255, 193, 7, 0.1);
          color: var(--warning-color);
        }
        
        .status-badge.c{
          background-color: rgba(40, 167, 69, 0.1);
          color: var(--success-color);
        }
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 20px;
          color: var(--text-light);
        }
        
        .payment-modal {
          max-width: 500px;
        }
        
        .payment-details {
          margin-bottom: 20px;
          padding: 15px;
          background-color: var(--bg-secondary);
          border-radius: 8px;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        
        .detail-row:last-child {
          margin-bottom: 0;
        }
        
        .detail-label {
          width: 100px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        .detail-value {
          flex: 1;
          font-weight: 500;
        }
        
        .payment-methods h3 {
          font-size: 1rem;
          margin-bottom: 10px;
        }
        
        .payment-method-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .payment-method-option {
          flex: 1;
          min-width: 120px;
          cursor: pointer;
        }
        
        .payment-method-option input {
          display: none;
        }
        
        .payment-method-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .payment-method-option input:checked + .payment-method-content {
          border-color: var(--primary-color);
          background-color: rgba(58, 134, 255, 0.05);
        }
        
        .payment-method-icon {
          font-size: 1.5rem;
          margin-bottom: 5px;
        }
        
        .payment-method-name {
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .search-container {
            width: 100%;
          }
          
          .payment-method-options {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

