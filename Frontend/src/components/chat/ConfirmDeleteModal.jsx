import React from "react";
import "./ConfirmDeleteModal.css";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <h3>Delete Chat?</h3>
        <p>This action cannot be undone.</p>

        <div className="confirm-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="delete-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
