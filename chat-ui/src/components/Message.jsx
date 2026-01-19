export default function Message({ message, isYou }) {
  return (
    <div className={`msg ${isYou ? "me" : "other"} fade-in`}>
      <div className="sender">{message.sender}</div>

      {message.type === "text" && <div>{message.text}</div>}

      {message.type === "media" &&
        message.file.type.startsWith("image") && (
          <img src={message.file.data} alt="" />
        )}

      {message.type === "media" &&
        message.file.type.startsWith("video") && (
          <video src={message.file.data} controls />
        )}

      <div className="time">{message.time}</div>
    </div>
  );
}
