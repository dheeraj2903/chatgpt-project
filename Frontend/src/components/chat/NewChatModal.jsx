import React, { useState } from "react";
import "./NewChatModal.css";

const NewChatModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState("");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>New Chat</h3>

        <input
          type="text"
          placeholder="Enter chat title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>

          <button
            onClick={() => {
              if (!title.trim()) return;
              onCreate(title.trim());
              setTitle("");
            }}
            className="create-btn"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
