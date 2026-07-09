import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import "./Profile.css";

const ProfileMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const toggleMenu = () => setOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="profile-menu" ref={menuRef}>
      <button className="profile-trigger" onClick={toggleMenu}>
        <User size={18} />
        <span>{user.fullName?.firstName}</span>
        <ChevronDown
          size={16}
          className={`chevron ${open ? "open" : ""}`}
        />
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-name">
            {user.fullName?.firstName} {user.fullName?.lastName}
          </div>

          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
