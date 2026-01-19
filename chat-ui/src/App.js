import { useState } from "react";
import Auth from "./components/Auth";
import ChatList from "./components/ChatList";
import ChatBox from "./components/ChatBox";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("chat_user"));
    } catch {
      return null;
    }
  });

  const [activeChat, setActiveChat] = useState(null);

  // ✅ HARD GUARD: ChatList & ChatBox NEVER render without user
  if (!user || !user.username) {
    return <Auth onAuth={setUser} />;
  }

  return (
    <div className="app-shell">
      <ChatList user={user} onSelect={setActiveChat} />

      {activeChat && (
        <ChatBox
          user={user}
          chatId={activeChat}
          onBack={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
