import "./ChatSidebar.css";
import ProfileMenu from "./ProfileMenu";
import { Trash2 } from "lucide-react";
import ThemeToggle from "../ThemeToggle";


const ChatSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  open,
  handleLogout,
  user,
}) => {
  return (
    <aside
      className={"chat-sidebar " + (open ? "open" : "")}
      aria-label="Previous chats"
    >
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button className="small-btn" onClick={onNewChat}>
          New
        </button>
      </div>

      <nav className="chat-list">
        {chats.map((c) => (
          <div
            key={c._id}
            className={
              "chat-list-item-row " + (c._id === activeChatId ? "active" : "")
            }
          >
            <button
              className="chat-select-btn"
              onClick={() => onSelectChat(c._id)}
            >
              <span className="title-line">{c.title}</span>
            </button>

            <button
              className="delete-chat-btn"
              onClick={() => onDeleteChat(c._id)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {chats.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>

      {user && <ProfileMenu user={user} onLogout={handleLogout} />}
    </aside>
  );
};

export default ChatSidebar;
