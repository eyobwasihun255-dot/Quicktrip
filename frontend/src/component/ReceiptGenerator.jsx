import PropTypes from "prop-types";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react"
import { useRef } from "react";

const ReceiptGenerator = ({ onClose }) => {
  const [formData, setFormData] = useState({
    receiptNumber: `REC-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    vehiclePlate: "",
    vehicleModel: "",
    serviceType: "registration",
    amount: "",
    taxRate: "15",
    notes: "",
  })

  const [errors, setErrors] = useState({})
  const [receiptGenerated, setReceiptGenerated] = useState(false)
   const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const receiptRef = useRef(null);
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const calculateTotal = () => {
    if (!formData.amount) return { subtotal: 0, tax: 0, total: 0 }

    const subtotal = Number.parseFloat(formData.amount)
    const taxRate = Number.parseFloat(formData.taxRate) / 100
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    }
  }

  const { subtotal, tax, total } = calculateTotal()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required"
    }

    if (!formData.vehiclePlate.trim()) {
      newErrors.vehiclePlate = "Vehicle plate number is required"
    }

    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = "Vehicle model is required"
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(formData.amount) || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      setReceiptGenerated(true)
    }
  }

  const handlePrint = () => {
    
    window.print()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      const receiptElement = receiptRef.current;
      const canvas = await html2canvas(receiptElement, {
        scale: 1,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      
      const pdf = new jsPDF("p", "mm", "a4"); 
      const imgWidth = 150; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`receipt-${formData.receiptNumber}.pdf`);

      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="modal-backdrop">
      <div className="modal receipt-modal">
        
        <div className="modal-header">
          <h2 className="modal-title">Generate Receipt</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {!receiptGenerated ? (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="receiptNumber" className="form-label">
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    id="receiptNumber"
                    name="receiptNumber"
                    className="form-control"
                    value={formData.receiptNumber}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date" className="form-label">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customerName" className="form-label">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  className={`form-control ${errors.customerName ? "is-invalid" : ""}`}
                  value={formData.customerName}
                  onChange={handleChange}
                />
                {errors.customerName && <div className="error-message">{errors.customerName}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vehiclePlate" className="form-label">
                    Vehicle Plate
                  </label>
                  <input
                    type="text"
                    id="vehiclePlate"
                    name="vehiclePlate"
                    className={`form-control ${errors.vehiclePlate ? "is-invalid" : ""}`}
                    value={formData.vehiclePlate}
                    onChange={handleChange}
                  />
                  {errors.vehiclePlate && <div className="error-message">{errors.vehiclePlate}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="vehicleModel" className="form-label">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    id="vehicleModel"
                    name="vehicleModel"
                    className={`form-control ${errors.vehicleModel ? "is-invalid" : ""}`}
                    value={formData.vehicleModel}
                    onChange={handleChange}
                  />
                  {errors.vehicleModel && <div className="error-message">{errors.vehicleModel}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="serviceType" className="form-label">
                  Service Type
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  className="form-control"
                  value={formData.serviceType}
                  onChange={handleChange}
                >
                  <option value="registration">Vehicle Registration</option>
                  <option value="renewal">Registration Renewal</option>
                  <option value="inspection">Vehicle Inspection</option>
                  <option value="transfer">Ownership Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    step="0.01"
                    className={`form-control ${errors.amount ? "is-invalid" : ""}`}
                    value={formData.amount}
                    onChange={handleChange}
                  />
                  {errors.amount && <div className="error-message">{errors.amount}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="taxRate" className="form-label">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    step="0.1"
                    className="form-control"
                    value={formData.taxRate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="receipt-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span>${tax}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${total}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Receipt
                </button>
              </div>
            </form>
          ) : (
            <div className="receipt-preview">
              <div className="receipt">
              <div className="receipt" ref={receiptRef}>
                <div className="receipt-header">
                  <h1 className="company-name">QuickTrip</h1>
                  <p className="company-tagline">Vehicle Management System</p>
                </div>

                <div className="receipt-title">
                  <h2>RECEIPT</h2>
                </div>

                <div className="receipt-details">
                  <div className="detail-row">
                    <span className="detail-label">Receipt Number:</span>
                    <span className="detail-value">{formData.receiptNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{new Date(formData.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="receipt-customer">
                  <h3>Customer Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{formData.customerName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vehicle:</span>
                    <span className="detail-value">{formData.vehicleModel}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Plate Number:</span>
                    <span className="detail-value">{formData.vehiclePlate}</span>
                  </div>
                </div>

                <div className="receipt-service">
                  <h3>Service Details</h3>
                  <table className="service-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {formData.serviceType === "registration" && "Vehicle Registration"}
                          {formData.serviceType === "renewal" && "Registration Renewal"}
                          {formData.serviceType === "inspection" && "Vehicle Inspection"}
                          {formData.serviceType === "transfer" && "Ownership Transfer"}
                          {formData.serviceType === "other" && "Other Service"}
                        </td>
                        <td>${subtotal}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Tax ({formData.taxRate}%)</td>
                        <td>${tax}</td>
                      </tr>
                      <tr className="total-row">
                        <td>Total</td>
                        <td>${total}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {formData.notes && (
                  <div className="receipt-notes">
                    <h3>Notes</h3>
                    <p>{formData.notes}</p>
                  </div>
                )}

                <div className="receipt-footer">
                  <p>Thank you for your business!</p>
                  <p className="small">This is an official receipt from QuickTrip Vehicle Management System.</p>
                </div>
              </div>

              <div className="receipt-actions">
                <button className="btn btn-secondary" onClick={handlePrint}>
                  Print Receipt
                </button>
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download PDF
                </button>
                <button className="btn btn-outline" onClick={onClose}>
                  Close
                </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .receipt-modal {
          max-width: 700px;
        }
        
        .form-row {
          display: flex;
          gap: 15px;
        }
        
        .form-row .form-group {
          flex: 1;
        }
        
        .is-invalid {
          border-color: var(--danger-color);
        }
        
        .error-message {
          color: var(--danger-color);
          font-size: 0.875rem;
          margin-top: 5px;
        }
        
        .receipt-summary {
          margin-top: 20px;
          padding: 15px;
          background-color: rgba(0, 0, 0, 0.02);
          border-radius: 8px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .summary-row.total {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--border-color);
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .receipt-preview {
          padding: 20px;
        }
        
        .receipt {
          background-color: white;
          padding: 30px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .receipt-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 2rem;
          margin: 0;
          color: var(--primary-color);
        }
        
        .company-tagline {
          margin: 0;
          color: var(--text-light);
        }
        
        .receipt-title {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .receipt-title h2 {
          display: inline-block;
          padding: 5px 20px;
          border: 2px solid var(--primary-color);
          color: var(--primary-color);
        }
        
        .receipt-details, .receipt-customer, .receipt-service, .receipt-notes {
          margin-bottom: 20px;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 5px;
        }
        
        .detail-label {
          font-weight: 600;
          width: 150px;
        }
        
        .receipt-customer h3, .receipt-service h3, .receipt-notes h3 {
          font-size: 1.1rem;
          padding-bottom: 5px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 10px;
        }
        
        .service-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .service-table th, .service-table td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }
        
        .service-table th {
          font-weight: 600;
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        .service-table tfoot td {
          font-weight: 500;
        }
        
        .total-row td {
          font-weight: 700;
          font-size: 1.1rem;
        }
        
        .receipt-footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }
        
        .receipt-footer p {
          margin: 5px 0;
        }
        
        .receipt-footer .small {
          font-size: 0.8rem;
          color: var(--text-light);
        }
        
        .receipt-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        
        @media print {
          .modal-backdrop, .modal {
            position: static;
            background: none;
            box-shadow: none;
          }
          
          .modal-header, .receipt-actions, .modal-close {
            display: none;
          }
          
          .receipt {
            border: none;
          }
        }
      `}</style>
    </div>
  )
}

export default ReceiptGenerator

