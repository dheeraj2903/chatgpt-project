import { useEffect, useState } from "react";
import ChatMobileBar from "../components/chat/ChatMobileBar.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import ChatMessages from "../components/chat/ChatMessages.jsx";
import ChatComposer from "../components/chat/ChatComposer.jsx";
import LoginRequiredModal from "../components/chat/LoginRequiredModal.jsx";
import NewChatModal from "../components/chat/NewChatModal.jsx";
import ConfirmDeleteModal from "../components/chat/ConfirmDeleteModal.jsx";
import "../components/chat/ChatLayout.css";

import api from "../utils/api.js";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  setChats,
} from "../store/chatSlice.js";

const Home = () => {
  const dispatch = useDispatch();

  const chats = useSelector((state) => state.chat.chats);
  const activeChatId = useSelector((state) => state.chat.activeChatId);
  const input = useSelector((state) => state.chat.input);
  const isSending = useSelector((state) => state.chat.isSending);

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState(null);

  const navigate = useNavigate();

  const handleResetHome = () => {
    dispatch(selectChat(null));
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    setShowNewChatModal(true);
  };

  const createChat = async (title) => {
    try {
      const response = await api.post("/api/chat", { title });

      dispatch(
        startNewChat({
          _id: response.data.chat._id,
          title: response.data.chat.title,
        }),
      );

      setMessages([]);
      setShowNewChatModal(false);
    } catch (err) {
      toast.error("Chat creation Failed");
    }
  };

  const handleDeleteChat = async (chatId) => {
    setDeleteChatId(chatId);
  };

  const confirmDeleteChat = async () => {
    try {
      await api.delete(`/api/chat/${deleteChatId}`);

      dispatch(setChats(chats.filter((c) => c._id !== deleteChatId)));

      if (deleteChatId === activeChatId) {
        dispatch(selectChat(null));
        setMessages([]);
      }

      toast.success("Chat deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteChatId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");

      localStorage.removeItem("wasLoggedIn");

      setUser(null);
      dispatch(setChats([]));
      dispatch(selectChat(null)); 
      setMessages([]);

      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
     console.log("HOME MOUNT");
    const wasLoggedIn = localStorage.getItem("wasLoggedIn");

    if (wasLoggedIn) {
      api
        .get("/api/auth/me")
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("wasLoggedIn", "true");
          return api.get("/api/chat");
        })
        .then((chatRes) => {
          dispatch(setChats(chatRes.data.chats.reverse()));
        })
        .catch(() => {
          setUser(null);
          dispatch(setChats([]));
          dispatch(selectChat(null));
          localStorage.removeItem("wasLoggedIn");
        });
    }

    const tempSocket = io(import.meta.env.VITE_API_URL || "/", {
      withCredentials: true,
    });

    tempSocket.on("ai-response", (messagePayload) => {
      setMessages((prevMessage) => [
        ...prevMessage,
        {
          type: "ai",
          content: messagePayload.content,
        },
      ]);
      dispatch(sendingFinished());
    });

    setSocket(tempSocket);

    return () => {
      if (tempSocket) tempSocket.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeChatId || isSending || !socket) return;
    dispatch(sendingStarted());

    const newMessages = [
      ...messages,
      {
        type: "user",
        content: trimmed,
      },
    ];

    setMessages(newMessages);
    dispatch(setInput(""));

    socket.emit("ai-message", {
      chat: activeChatId,
      content: trimmed,
    });
  };

  const getMessages = async (chatId) => {
    if (!chatId) return; // Guard clause
    const response = await api.get(`/api/chat/messages/${chatId}`, {
      withCredentials: true,
    });

    setMessages(
      response.data.messages.map((m) => ({
        type: m.role === "user" ? "user" : "ai",
        content: m.content,
      })),
    );
  };

  return (
    <div className="chat-layout minimal">
      <ChatMobileBar
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onNewChat={handleNewChat}
      />

      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          dispatch(selectChat(id));
          getMessages(id);
          setSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        open={sidebarOpen}
        user={user}
        handleLogout={handleLogout}
        onLogoClick={handleResetHome}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteChatId}
        onClose={() => setDeleteChatId(null)}
        onConfirm={confirmDeleteChat}
      />

      <main className="chat-main" role="main">
        {(!activeChatId || messages.length === 0) && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="chip">Early Preview</div>
            <h1
              onClick={handleResetHome}
              className="welcome-title"
              style={{ cursor: "pointer" }}
            >
              Aurora AI
            </h1>
            <p>
              Your intelligent workspace. Brainstorm ideas, analyze data, or clear doubts instantly.

            </p>
          </div>
        )}

        <LoginRequiredModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onLogin={() => navigate("/login")}
        />
        <NewChatModal
          isOpen={showNewChatModal}
          onClose={() => setShowNewChatModal(false)}
          onCreate={createChat}
        />

        {activeChatId && (
          <ChatMessages messages={messages} isSending={isSending} />
        )}

        {activeChatId && (
          <ChatComposer
            input={input}
            setInput={(v) => dispatch(setInput(v))}
            onSend={sendMessage}
            isSending={isSending}
          />
        )}
      </main>

      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
