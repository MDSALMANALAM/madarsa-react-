import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet } from '../../services/api';
import '../../styles/receipt.css';

const AdmissionReceipt = () => {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const data = await apiGet(`/admission/receipt/${id}`);
        if (data.success) setReceipt(data);
      } catch (err) {
        console.error('Failed to load receipt:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="receipt-loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>;
  if (!receipt) return <div className="receipt-error"><i className="fas fa-exclamation-circle"></i> Receipt not found</div>;

  return (
    <div className="receipt-page">
      <div className="receipt-actions no-print">
        <button onClick={handlePrint} className="btn btn-primary"><i className="fas fa-print"></i> Print Receipt</button>
        <button onClick={() => window.history.back()} className="btn btn-outline"><i className="fas fa-arrow-left"></i> Go Back</button>
      </div>

      <div className="receipt-container" ref={printRef}>
        <div className="receipt-header">
          <div className="school-logo">
            <i className="fas fa-mosque"></i>
          </div>
          <div className="school-info">
            <h1>Madarsa Imdadul Uloom</h1>
            <p>Islamic Education & Modern Learning</p>
            <p><i className="fas fa-map-marker-alt"></i> {receipt.schoolAddress}</p>
            <p><i className="fas fa-phone"></i> {receipt.schoolPhone} | <i className="fas fa-envelope"></i> {receipt.schoolEmail}</p>
          </div>
        </div>

        <div className="receipt-title">
          <h2>ADMISSION APPLICATION RECEIPT</h2>
          <div className={`status-badge ${receipt.status.toLowerCase()}`}>{receipt.status}</div>
        </div>

        <div className="receipt-body">
          <div className="receipt-row highlight">
            <span className="label">Admission No:</span>
            <span className="value">{receipt.admissionNo}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Student Name:</span>
            <span className="value">{receipt.studentName}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Father's Name:</span>
            <span className="value">{receipt.fatherName}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Mother's Name:</span>
            <span className="value">{receipt.motherName}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Class Applied:</span>
            <span className="value">{receipt.className}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Date of Birth:</span>
            <span className="value">{receipt.dateOfBirth}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Gender:</span>
            <span className="value">{receipt.gender}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Address:</span>
            <span className="value">{receipt.address}, {receipt.city}, {receipt.state} - {receipt.pincode}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Contact:</span>
            <span className="value">{receipt.parentPhone}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Email:</span>
            <span className="value">{receipt.parentEmail || 'N/A'}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Submitted On:</span>
            <span className="value">{new Date(receipt.submittedAt).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="receipt-footer">
          <div className="notice">
            <h4><i className="fas fa-info-circle"></i> Important Notice</h4>
            <ul>
              <li>Please keep this receipt safe for future reference.</li>
              <li>Your application is under review. You will be notified via WhatsApp/SMS.</li>
              <li>For any queries, contact the school office with your Admission No.</li>
              <li>Bring original documents for verification during admission confirmation.</li>
            </ul>
          </div>
          <div className="signature">
            <div className="sign-box">
              <p>_____________________</p>
              <p>Authorized Signature</p>
            </div>
            <div className="sign-box">
              <p>_____________________</p>
              <p>Date & Stamp</p>
            </div>
          </div>
        </div>

        <div className="receipt-watermark">
          {receipt.status === 'PENDING' && <span>APPLICATION PENDING</span>}
          {receipt.status === 'APPROVED' && <span>APPROVED ✓</span>}
          {receipt.status === 'REJECTED' && <span>REJECTED ✗</span>}
        </div>
      </div>
    </div>
  );
};

export default AdmissionReceipt;

