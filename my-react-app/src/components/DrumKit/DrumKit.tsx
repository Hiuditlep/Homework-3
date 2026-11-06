import React, { useState, useMemo, useCallback } from "react";
import { useDrumKeyboard } from "../../hooks/useDrumKeyboard";
import "./DrumKit.css"; // Import file CSS tách biệt

const DRUM_PADS = [
  { id: "Kick", code: "KeyW", label: "W", color: "#ef4444" },
  { id: "Snare", code: "KeyA", label: "A", color: "#3b82f6" },
  { id: "HiHat", code: "KeyS", label: "S", color: "#eab308" },
  { id: "Tom", code: "KeyD", label: "D", color: "#22c55e" },
  { id: "Crash", code: "KeyJ", label: "J", color: "#a855f7" },
  { id: "Ride", code: "KeyK", label: "K", color: "#f97316" },
  { id: "Cowbell", code: "KeyL", label: "L", color: "#06b6d4" },
];

export function DrumKit() {
  const [activePads, setActivePads] = useState<Record<string, boolean>>({});
  const [hitLog, setHitLog] = useState<string>("Chưa có thao tác");

  // Ánh xạ e.code vật lý sang ID của mặt trống
  const padMap = useMemo(() => {
    const map = new Map<string, { id: string }>();
    DRUM_PADS.forEach((pad) => map.set(pad.code, { id: pad.id }));
    return map;
  }, []);

  const handleTriggerPad = useCallback((id: string) => {
    // 1. Kích hoạt hiệu ứng sáng nút
    setActivePads((prev) => ({ ...prev, [id]: true }));

    // 2. Ghi nhận log cho Screen Reader
    setHitLog(`Đã gõ: ${id}`);

    // 3. Tự động tắt hiệu ứng sau 150ms
    setTimeout(() => {
      setActivePads((prev) => ({ ...prev, [id]: false }));
    }, 150);
  }, []);

  // Gọi Hook quản lý sự kiện bàn phím
  useDrumKeyboard(padMap, handleTriggerPad, true);

  return (
    <div className="drum-kit-container">
      <h2>Production Studio Drum Kit</h2>
      <div className="drum-pads-grid">
        {DRUM_PADS.map((pad) => (
          <button
            key={pad.id}
            type="button"
            className={`drum-pad ${activePads[pad.id] ? "active" : ""}`}
            style={{ "--pad-color": pad.color } as React.CSSProperties}
            onPointerDown={() => handleTriggerPad(pad.id)}
            aria-pressed={activePads[pad.id] || false}
          >
            <span className="pad-label">{pad.label}</span>
            <span className="pad-id">{pad.id}</span>
          </button>
        ))}
      </div>

      {/* Vùng Deaf / Hard-of-Hearing Visual Hit Log */}
      <div className="accessible-hit-log">
        <label>Visual Hit Log (Screen Reader Accessible):</label>
        <output aria-live="polite" className="hit-output">
          {hitLog}
        </output>
      </div>
    </div>
  );
}
