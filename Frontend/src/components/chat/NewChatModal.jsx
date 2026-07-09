import React, { useState } from "react";
import "./NewChatModal.css";

const NewChatModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    onCreate(title.trim());
    setTitle("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>New Chat</h3>

        {/* ✅ FORM WRAPPER */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter chat title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <div className="modal-actions">
            <button
              type="button"   /* ✅ Prevent submit */
              onClick={onClose}
              className="cancel-btn"
            >
              Cancel
            </button>

            <button
              type="submit"   /* ✅ Enter triggers this */
              className="create-btn"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChatModal;