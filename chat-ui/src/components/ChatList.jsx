import { useEffect, useState } from "react";

const chats = ["Friends", "Family", "Work"];

export default function ChatList({ user, onSelect }) {
  const [online, setOnline] = useState({});

  useEffect(() => {
    const ch = new BroadcastChannel("presence");
    ch.postMessage({ user: user.username, online: true });

    ch.onmessage = e => {
      setOnline(p => ({ ...p, [e.data.user]: e.data.online }));
    };

    const interval = setInterval(() => {
      ch.postMessage({ user: user.username, online: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [user.username]);

  return (
    <div className="chat-list">
      <div className="chatlist-header">
        {user.username}
        <span className="status-dot online" />
      </div>

      {chats.map(c => (
        <div
          key={c}
          className="chat-item animated-btn"
          onClick={() => onSelect(c)}
        >
          {c}
        </div>
      ))}
    </div>
  );
}
