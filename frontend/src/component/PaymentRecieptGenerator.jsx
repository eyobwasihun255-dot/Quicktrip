import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const PaymentReceiptGenerator = ({ payment, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const receiptRef = useRef(null);

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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentTypeDisplay = (type) => {
    return {
      'i': 'Income',
      'e': 'Expense',
      't': 'Tax'
    }[type] || type;
  };

  const getStatusDisplay = (status) => {
    return {
      'p': 'Pending',
      'c': 'Completed'
    }[status] || status;
  };

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      const receiptElement = receiptRef.current;
      const canvas = await html2canvas(receiptElement, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 180; // Adjusted width for better fit
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 15, 10, imgWidth, imgHeight);
      pdf.save(`payment-receipt-${payment.transaction_id}.pdf`);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal receipt-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">Payment Receipt</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close receipt"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="receipt" ref={receiptRef}>
            <div className="receipt-header">
              <h1 className="company-name">QuickTrip</h1>
              <p className="company-tagline">Payment Receipt</p>
            </div>

            <div className="receipt-title">
              <h2>PAYMENT RECEIPT</h2>
              <div className="receipt-number">#{payment.transaction_id}</div>
            </div>

            <div className="receipt-details">
              <div className="detail-row">
                <span className="detail-label">Date & Time:</span>
                <span className="detail-value">{formatDate(payment.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-${payment.status}`}>
                  {getStatusDisplay(payment.status)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Type:</span>
                <span className="detail-value">
                  {getPaymentTypeDisplay(payment.types)}
                </span>
              </div>
            </div>

            <div className="receipt-section">
              <h3>Payment Details</h3>
              {payment.user && (
                <div className="detail-row">
                  <span className="detail-label">User:</span>
                  <span className="detail-value">
                    {payment.user.employee.Fname} {payment.user.employee.Lname}
                  </span>
                </div>
              )}
              {payment.vehicle && (
                <div className="detail-row">
                  <span className="detail-label">Vehicle:</span>
                  <span className="detail-value">
                    {payment.vehicle.name} ({payment.vehicle.plate_number})
                  </span>
                </div>
              )}
              {payment.branch && (
                <div className="detail-row">
                  <span className="detail-label">Branch:</span>
                  <span className="detail-value">{payment.branch.name}</span>
                </div>
              )}
            </div>

            <div className="receipt-payment">
              <div className="payment-row">
                <span className="payment-label">Amount:</span>
                <span className="payment-value">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              {payment.types === 'i' && (
                <div className="payment-row">
                  <span className="payment-label">Tax (15%):</span>
                  <span className="payment-value">
                    {formatCurrency(payment.amount * 0.15)}
                  </span>
                </div>
              )}
              <div className="payment-row total">
                <span className="payment-label">
                  {payment.types === 'i' ? 'Total Received:' : 'Total Amount:'}
                </span>
                <span className="payment-value">
                  {formatCurrency(
                  payment.amount
                  )}
                </span>
              </div>
            </div>

            {payment.remark && (
              <div className="receipt-section">
                <h3>Remarks</h3>
                <div className="remark-text">{payment.remark}</div>
              </div>
            )}

            <div className="receipt-footer">
              <p>Thank you for your {payment.types === 'i' ? 'payment' : 'transaction'}!</p>
              <p className="small">
                This is an official receipt from QuickTrip Payment System.
              </p>
              <div className="receipt-barcode">*QT{payment.id}*</div>
            </div>
          </div>

          <div className="receipt-actions">
            {success && (
              <div className="success-message" aria-live="polite">
                <div className="success-icon">✓</div>
                <p>Receipt downloaded successfully!</p>
              </div>
            )}

            {error && (
              <div className="error-message" aria-live="assertive">
                <div className="error-icon">!</div>
                <p>{error}</p>
              </div>
            )}

            {!success && !error && (
              <>
                <button
                  className={`btn btn-primary download-btn ${
                    loading ? "loading" : ""
                  }`}
                  onClick={handleDownload}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? "Generating PDF..." : "Download PDF Receipt"}
                </button>
                <button className="btn btn-outline" onClick={onClose}>
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .receipt-modal {
          max-width: 600px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-title {
          margin: 0;
          font-size: 1.5rem;
          color: #2c3e50;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #7f8c8d;
        }

        .modal-body {
          padding: 20px;
        }

        .receipt {
          background-color: white;
          padding: 30px;
          border: 1px solid #e0e0e0;
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
          color: #3498db;
        }

        .company-tagline {
          margin: 5px 0 0;
          color: #7f8c8d;
        }

        .receipt-title {
          text-align: center;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .receipt-title h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .receipt-number {
          font-size: 1.1rem;
          font-weight: 600;
          color: #7f8c8d;
        }

        .receipt-details,
        .receipt-section {
          margin-bottom: 20px;
        }

        .receipt-section h3 {
          font-size: 1.1rem;
          padding-bottom: 5px;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 10px;
          color: #2c3e50;
        }

        .detail-row {
          display: flex;
          margin-bottom: 8px;
        }

        .detail-label {
          font-weight: 600;
          width: 150px;
          color: #34495e;
        }

        .detail-value {
          flex: 1;
        }

        .status-p {
          color: #f39c12;
        }

        .status-c {
          color: #27ae60;
        }

        .receipt-payment {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .payment-label {
          font-weight: 500;
        }

        .payment-row.total {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #e0e0e0;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .remark-text {
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
          font-style: italic;
        }

        .receipt-footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .receipt-footer p {
          margin: 5px 0;
        }

        .receipt-footer .small {
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        .receipt-barcode {
          font-family: monospace;
          font-size: 1.2rem;
          margin-top: 15px;
          letter-spacing: 2px;
          color: #2c3e50;
        }

        .receipt-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background-color: #2980b9;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid #bdc3c7;
          color: #34495e;
        }

        .btn-outline:hover {
          background-color: #f8f9fa;
        }

        .download-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 200px;
        }

        .download-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #27ae60;
          font-weight: 500;
          padding: 10px;
          background-color: rgba(39, 174, 96, 0.1);
          border-radius: 4px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #e74c3c;
          font-weight: 500;
          padding: 10px;
          background-color: rgba(231, 76, 60, 0.1);
          border-radius: 4px;
        }

        .success-icon,
        .error-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .success-icon {
          background-color: #27ae60;
          color: white;
        }

        .error-icon {
          background-color: #e74c3c;
          color: white;
        }

        @media (max-width: 576px) {
          .receipt-actions {
            flex-direction: column;
          }

          .detail-row {
            flex-direction: column;
            gap: 2px;
          }

          .detail-label {
            width: 100%;
          }

          .receipt {
            padding: 20px 15px;
          }
        }
      `}</style>
    </div>
  );
};

PaymentReceiptGenerator.propTypes = {
  payment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    transaction_id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['p', 'c']).isRequired,
    types: PropTypes.oneOf(['i', 'e', 't']).isRequired,
    amount: PropTypes.number.isRequired,
    remark: PropTypes.string,
    user: PropTypes.shape({
      employee: PropTypes.shape({
        Fname: PropTypes.string.isRequired,
        Lname: PropTypes.string.isRequired,
      }),
    }),
    vehicle: PropTypes.shape({
      name: PropTypes.string,
      plate_number: PropTypes.string,
    }),
    branch: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PaymentReceiptGenerator;