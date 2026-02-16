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
import { useOutletContext } from "react-router-dom";
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

  // const isLoggedIn = document.cookie.includes("token");  // Checking User is Loggedin by token
  // const isLoggedIn = !!user;

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState(null);

  const navigate = useNavigate();

  // const activeChat = chats.find((c) => c._id === activeChatId) || null;

  // const handleNewChat = async () => {
  //   // if (!isLoggedIn) {
  //   //   setShowModal(true);
  //   //   return;
  //   // }

  //   let title = window.prompt("Enter a title for the new chat:", "");
  //   if (title) title = title.trim();
  //   if (!title) return;

  //   const response = await api.post(
  //     "/api/chat",
  //     {
  //       title,
  //     },
  //     {
  //       withCredentials: true,
  //     },
  //   );

  //   getMessages(response.data.chat._id);

  //   dispatch(
  //     startNewChat({
  //       title: response.data.chat.title,
  //       _id: response.data.chat._id,
  //     }),
  //   );
  //   setMessages([]);
  //   setSidebarOpen(false);
  // };

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

      setUser(null); // ✅ instant UI update
      dispatch(setChats([]));
      setMessages([]);

      toast.success("Logged out successfully 👋");

      navigate("/"); // ✅ no reload
    } catch {
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
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
          localStorage.removeItem("wasLoggedIn");
        });
    }

    const tempSocket = io(import.meta.env.VITE_API_URL || "/", {
      withCredentials: true,
    });

    tempSocket.on("ai-response", (messagePayload) => {
      console.log("Received AI response:", messagePayload);

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
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    console.log("Sending message:", trimmed);
    if (!trimmed || !activeChatId || isSending || !socket) return;
    dispatch(sendingStarted());

    const newMessages = [
      ...messages,
      {
        type: "user",
        content: trimmed,
      },
    ];

    console.log("New messages:", newMessages);
    setMessages(newMessages);
    dispatch(setInput(""));

    socket.emit("ai-message", {
      chat: activeChatId,
      content: trimmed,
    });
  };

  const getMessages = async (chatId) => {
    const response = await api.get(`/api/chat/messages/${chatId}`, {
      withCredentials: true,
    });

    console.log("fetched messages:", response.data.messages);

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
          // setMessages([]);
          getMessages(id);
          setSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        open={sidebarOpen}
        user={user}
        handleLogout={handleLogout}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteChatId}
        onClose={() => setDeleteChatId(null)}
        onConfirm={confirmDeleteChat}
      />

      <main className="chat-main" role="main">
        {messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="chip">Early Preview</div>
            <h1>ChatGPT Clone</h1>
            <p>
              Ask anything. Paste text, brainstorm ideas, or get quick
              explanations. Your chats stay in the sidebar so you can pick up
              where you left off.
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
        <ChatMessages messages={messages} isSending={isSending} />
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
