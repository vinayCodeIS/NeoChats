import { useRef, useState } from "react";

export default function VoiceRecorder({ onSend }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      // Check support
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        alert("Voice recording not supported in this browser");
        return;
      }

      // Ask permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);

        onSend(audioUrl);

        // cleanup
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        chunksRef.current = [];
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone permission denied or unavailable");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <button
      className={`voice-btn ${recording ? "recording" : ""}`}
      onClick={recording ? stopRecording : startRecording}
      title={recording ? "Stop recording" : "Record voice"}
    >
      {recording ? "⏹️" : "🎤"}
    </button>
  );
}
