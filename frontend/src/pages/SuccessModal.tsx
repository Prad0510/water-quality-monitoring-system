import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: number | null;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, resultId }) => {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* 🎉 Big Green Checkmark */}
        <div style={iconContainerStyle}>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 style={{ color: "#2f855a", marginBottom: "10px" }}>Record Created!</h2>
        <p style={{ color: "#4a5568", fontSize: "16px", marginBottom: "5px" }}>
          Water quality test data has been successfully saved to the database.
        </p>
        
        {resultId && (
          <p style={idBadgeStyle}>
            Generated ID: <strong>{resultId}</strong>
          </p>
        )}

        <button onClick={onClose} style={closeButtonStyle}>
          Close & Refresh
        </button>
      </div>
    </div>
  );
};

// --- ✨ Styles ---
const overlayStyle = {
  position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  backdropFilter: 'blur(3px)' // Subtle blur on the background dashboard
};

const modalStyle = {
  backgroundColor: '#fff', padding: '40px', borderRadius: '16px',
  textAlign: 'center' as const, width: '400px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  animation: 'slideIn 0.3s ease-out' // We can add a simple CSS animation
};

const iconContainerStyle = {
  width: '80px', height: '80px', borderRadius: '50%',
  backgroundColor: '#c6f6d5', color: '#2f855a',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  margin: '0 auto 20px auto'
};

const iconStyle = { width: '40px', height: '40px' };

const idBadgeStyle = {
  display: 'inline-block', padding: '5px 12px',
  backgroundColor: '#edf2f7', borderRadius: '20px',
  fontSize: '14px', color: '#4a5568', margin: '15px 0 25px 0'
};

const closeButtonStyle = {
  backgroundColor: '#2d3748', color: '#fff', border: 'none',
  padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
  fontSize: '16px', fontWeight: 'bold'
};

export default SuccessModal;