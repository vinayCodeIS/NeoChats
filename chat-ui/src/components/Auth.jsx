import { useState } from "react";

export default function Auth({ onAuth }) {
  const [username, setUsername] = useState("");
  const [passphrase, setPassphrase] = useState("");

  const login = () => {
    if (!username || passphrase.length < 4) {
      alert("Enter username & passphrase (min 4 chars)");
      return;
    }
    const user = { username, passphrase };
    localStorage.setItem("chat_user", JSON.stringify(user));
    onAuth(user);
  };

  return (
    <div className="auth">
      <h2>🔐 Neon Chat</h2>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input
        type="password"
        placeholder="Shared passphrase"
        onChange={e => setPassphrase(e.target.value)}
      />
      <button className="glow-btn" onClick={login}>Enter</button>
    </div>
  );
}
