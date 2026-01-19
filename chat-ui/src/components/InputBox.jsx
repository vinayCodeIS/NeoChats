import { useRef, useState } from "react";

export default function InputBox({ onSendText, onSendMedia }) {
  const [text, setText] = useState("");
  const fileRef = useRef();

  const sendText = () => {
    if (!text.trim()) return;
    onSendText(text);
    setText("");
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Max 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onSendMedia({
        name: file.name,
        type: file.type,
        data: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="input-bar">
      <input type="file" hidden ref={fileRef} accept="image/*,video/*" onChange={handleFile} />
      <button className="icon-btn" onClick={() => fileRef.current.click()}>📎</button>
      <input
        value={text}
        placeholder="Type a message"
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendText()}
      />
      <button className="send-btn" onClick={sendText}>➤</button>
    </div>
  );
}
