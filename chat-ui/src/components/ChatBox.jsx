import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import VoiceRecorder from "./VoiceRecorder";

/* ================= ENCRYPTION ================= */
async function getKey(secret) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("chat-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(text, secret) {
  const key = await getKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(text)
  );
  return { iv: [...iv], data: [...new Uint8Array(cipher)] };
}

async function decrypt(payload, secret) {
  const key = await getKey(secret);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(payload.iv) },
    key,
    new Uint8Array(payload.data)
  );
  return new TextDecoder().decode(plain);
}
/* ================================================= */

export default function ChatBox({ user, chatId, onBack }) {
  const [messages, setMessages] = useState([]);
  const channelRef = useRef(null);
  const endRef = useRef(null);

  // Init BroadcastChannel once
  if (!channelRef.current) {
    channelRef.current = new BroadcastChannel("secure-chat");
  }

  /* LOAD + RECEIVE */
  useEffect(() => {
    const stored = localStorage.getItem(`chat_${chatId}`);
    setMessages(stored ? JSON.parse(stored) : []);

    const channel = channelRef.current;

    channel.onmessage = async (e) => {
      const msg = e.data;
      const key = `chat_${msg.chatId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");

      // Prevent duplicates
      if (existing.find((m) => m.id === msg.id)) return;

      // 🔥 OPTIMISTIC UI (instant)
      if (msg.type === "text") {
        const temp = { ...msg, text: "Decrypting…", _pending: true };
        existing.push(temp);
        localStorage.setItem(key, JSON.stringify(existing));

        if (msg.chatId === chatId) {
          setMessages([...existing]);
        }

        // Decrypt in background
        decrypt(msg.encrypted, user.passphrase).then((text) => {
          const updated = existing.map((m) =>
            m.id === msg.id ? { ...m, text, _pending: false } : m
          );
          localStorage.setItem(key, JSON.stringify(updated));
          if (msg.chatId === chatId) {
            setMessages([...updated]);
          }
        });

        return;
      }

      // Media / Voice
      existing.push(msg);
      localStorage.setItem(key, JSON.stringify(existing));
      if (msg.chatId === chatId) {
        setMessages([...existing]);
      }
    };

    return () => {
      channel.onmessage = null;
    };
  }, [chatId, user.passphrase]);

  /* AUTO SCROLL */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* SEND TEXT */
  const sendText = async (text) => {
    if (!text.trim()) return;

    const encrypted = await encrypt(text, user.passphrase);

    const msg = {
      id: Date.now(),
      chatId,
      type: "text",
      sender: user.username,
      encrypted,
      time: new Date().toLocaleTimeString(),
    };

    const key = `chat_${chatId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");

    existing.push({ ...msg, text });
    localStorage.setItem(key, JSON.stringify(existing));
    setMessages([...existing]);

    channelRef.current.postMessage(msg);
  };

  /* SEND MEDIA */
  const sendMedia = (file) => {
    const msg = {
      id: Date.now(),
      chatId,
      type: "media",
      sender: user.username,
      file,
      time: new Date().toLocaleTimeString(),
    };

    const key = `chat_${chatId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");

    existing.push(msg);
    localStorage.setItem(key, JSON.stringify(existing));
    setMessages([...existing]);

    channelRef.current.postMessage(msg);
  };

  /* SEND VOICE */
  const sendVoice = (audio) => {
    const msg = {
      id: Date.now(),
      chatId,
      type: "voice",
      sender: user.username,
      audio,
      time: new Date().toLocaleTimeString(),
    };

    const key = `chat_${chatId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");

    existing.push(msg);
    localStorage.setItem(key, JSON.stringify(existing));
    setMessages([...existing]);

    channelRef.current.postMessage(msg);
  };

  return (
    <div className="chat">
      {/* HEADER */}
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="header-icon" onClick={onBack}>←</button>
          <span className="chat-title">{chatId}</span>
        </div>

        <button
          className="header-icon"
          title="Logout"
          onClick={() => {
            localStorage.removeItem("chat_user");
            window.location.reload();
          }}
        >
          ⎋
        </button>
      </div>

      {/* BODY */}
      <div className="chat-body">
        {messages.map((m) => (
          <Message
            key={m.id}
            message={m}
            isYou={m.sender === user.username}
          />
        ))}
        <div ref={endRef}></div>
      </div>

      {/* INPUTS */}
      <VoiceRecorder onSend={sendVoice} />
      <InputBox onSendText={sendText} onSendMedia={sendMedia} />
    </div>
  );
}
