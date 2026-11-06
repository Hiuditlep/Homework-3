import React, { useEffect, useRef, useState } from "react";
import { audioQueue } from "./audio-queue-controller";

export function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  // Hàm vẽ 60fps với requestAnimationFrame
  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#0f172a"; // Nền đen
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 50}, 99, 235)`; // Sóng màu xanh
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dọn dẹp bài cũ trước khi phát bài mới
    stopAudio();

    const localUrl = URL.createObjectURL(file);
    setLoadingMsg(`Đang đưa vào hàng đợi: ${file.name}...`);

    try {
      // 1. Gửi vào hàng đợi tải & giải mã
      const audioBuffer = await audioQueue.enqueue(localUrl);
      setLoadingMsg("");

      const audioCtx = audioQueue.Context;

      // Khởi tạo Analyser (FFT 256)
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Khởi tạo Source Node
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      sourceNodeRef.current = source;

      // 2. Bắt đầu phát và kích hoạt Canvas 60fps
      source.start(0);
      setIsPlaying(true);
      drawVisualizer();

      source.onended = () => {
        stopAudio();
      };
    } catch (error) {
      console.error("Lỗi xử lý audio:", error);
      setLoadingMsg("Có lỗi xảy ra khi xử lý âm thanh.");
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    audioQueue.cleanup();
    setIsPlaying(false);
  };

  // Cleanup khi tắt component (Tránh rò rỉ bộ nhớ)
  useEffect(() => {
    return () => stopAudio();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Audio Visualizer Queue Engine</h2>
      <div style={styles.controls}>
        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          style={styles.fileInput}
        />
        {isPlaying && (
          <button onClick={stopAudio} style={styles.stopBtn}>
            Dừng phát
          </button>
        )}
      </div>
      {loadingMsg && <p style={styles.msg}>{loadingMsg}</p>}

      <canvas ref={canvasRef} width={800} height={300} style={styles.canvas} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" },
  title: { fontSize: "20px", marginBottom: "16px" },
  controls: { display: "flex", gap: "16px", marginBottom: "16px" },
  fileInput: {
    padding: "8px",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
  },
  stopBtn: {
    padding: "8px 16px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  msg: { color: "#2563eb", fontSize: "14px", marginBottom: "16px" },
  canvas: {
    width: "100%",
    height: "300px",
    backgroundColor: "#0f172a",
    borderRadius: "8px",
    display: "block",
  },
};
