import React from "react";
import { Lock } from "lucide-react";
import "./modal.css";

const LoginRequiredModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        
        <div className="modal-icon">
          <Lock size={26} />
        </div>

        <h2 className="gradient-text">Login Required</h2>

        <p>Please login to create a new chat.</p>

        <div className="modal-buttons">
          <button className="login-btn" onClick={onLogin}>
            Login
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
