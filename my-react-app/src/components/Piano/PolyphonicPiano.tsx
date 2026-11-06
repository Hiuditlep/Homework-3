// src/components/Piano/PolyphonicPiano.tsx
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { PianoKey } from "./PianoKey";
import { synthEngine } from "../../audio/PolyphonicSynth";
import "./PolyphonicPiano.css";

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

interface RecordedNote {
  midi: number;
  freqHz: number;
  deltaMs: number;
  durationMs: number;
}

export function PolyphonicPiano() {
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());

  // State cho Sequencer (Ghi âm & Phát lại)
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [sequence, setSequence] = useState<RecordedNote[]>([]);

  // Dùng useRef để track thời gian không gây re-render
  const recordState = useRef({
    lastEventTime: 0,
    activeNotes: new Map<number, { startTime: number; freqHz: number }>(),
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  // Thuật toán tạo 88 phím (A0 - C8)
  const keys = useMemo(() => {
    const generatedKeys = [];
    for (let midi = 21; midi <= 108; midi++) {
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      const noteIndex = midi % 12;
      const noteName = NOTE_NAMES[noteIndex];
      generatedKeys.push({
        midi,
        freq,
        noteName: `${noteName}${Math.floor(midi / 12) - 1}`,
        isBlack: noteName.includes("#"),
      });
    }
    return generatedKeys;
  }, []);

  // Xử lý bấm phím
  const handleNoteOn = useCallback(
    (midi: number) => {
      setActiveKeys((prev) => new Set(prev).add(midi));
      const keyInfo = keys.find((k) => k.midi === midi);
      if (keyInfo) {
        synthEngine.noteOn(midi, keyInfo.freq);

        // Ghi âm thời điểm bắt đầu nhấn
        if (isRecording) {
          const now = Date.now();
          recordState.current.activeNotes.set(midi, {
            startTime: now,
            freqHz: keyInfo.freq,
          });
        }
      }
    },
    [keys, isRecording],
  );

  // Xử lý nhả phím
  const handleNoteOff = useCallback(
    (midi: number) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
      synthEngine.noteOff(midi);

      // Tính toán trường độ (duration) và khoảng nghỉ (delta) khi nhả phím
      if (isRecording) {
        const now = Date.now();
        const activeNote = recordState.current.activeNotes.get(midi);
        if (activeNote) {
          const deltaMs =
            recordState.current.lastEventTime === 0
              ? 0
              : activeNote.startTime - recordState.current.lastEventTime;
          const durationMs = now - activeNote.startTime;

          setSequence((prev) => [
            ...prev,
            {
              midi,
              freqHz: activeNote.freqHz,
              deltaMs: Math.max(0, deltaMs),
              durationMs,
            },
          ]);

          recordState.current.lastEventTime = activeNote.startTime;
          recordState.current.activeNotes.delete(midi);
        }
      }
    },
    [isRecording],
  );

  // Bật/Tắt Ghi âm
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setSequence([]);
      recordState.current.lastEventTime = 0;
      recordState.current.activeNotes.clear();
      setIsRecording(true);
    }
  };

  // Async FIFO Replay với AbortController Cancellation
  const playSequence = async () => {
    if (sequence.length === 0 || isPlaying) return;
    setIsPlaying(true);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      for (const note of sequence) {
        if (signal.aborted) break;

        // Chờ khoảng nghỉ (deltaMs) theo tốc độ
        if (note.deltaMs > 0) {
          await new Promise((resolve) => {
            const timeout = setTimeout(resolve, note.deltaMs / speed);
            signal.addEventListener("abort", () => {
              clearTimeout(timeout);
              resolve(null);
            });
          });
        }

        if (signal.aborted) break;

        // Đánh phím
        setActiveKeys((prev) => new Set(prev).add(note.midi));
        synthEngine.noteOn(note.midi, note.freqHz);

        // Giữ phím theo trường độ (durationMs)
        await new Promise((resolve) => {
          const timeout = setTimeout(resolve, note.durationMs / speed);
          signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            resolve(null);
          });
        });

        // Nhả phím
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(note.midi);
          return next;
        });
        synthEngine.noteOff(note.midi);
      }
    } finally {
      setIsPlaying(false);
      setActiveKeys(new Set());
      abortControllerRef.current = null;
    }
  };

  const stopPlayback = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    activeKeys.forEach((midi) => synthEngine.noteOff(midi));
    setActiveKeys(new Set());
    setIsPlaying(false);
  };

  // Dọn dẹp memory khi tắt tab
  useEffect(() => {
    return () => stopPlayback();
  }, []);

  return (
    <div className="piano-wrapper">
      <h2>88-Key Polyphonic Piano & Sequencer</h2>

      {/* Cụm nút điều khiển Sequencer */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={toggleRecording}
          disabled={isPlaying}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: isRecording ? "#ef4444" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          {isRecording ? "⏹ Dừng ghi âm" : "⏺ Bắt đầu ghi âm"}
        </button>

        <button
          onClick={playSequence}
          disabled={isRecording || isPlaying || sequence.length === 0}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor:
              isRecording || isPlaying || sequence.length === 0
                ? "#94a3b8"
                : "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          ▶ Phát lại bản thu ({sequence.length} nốt)
        </button>

        {isPlaying && (
          <button
            onClick={stopPlayback}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              backgroundColor: "#f97316",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            ⏹ Hủy phát (Abort)
          </button>
        )}

        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={isPlaying || isRecording}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #cbd5e1",
          }}
        >
          <option value={0.5}>Tốc độ chậm (0.5x)</option>
          <option value={1}>Tốc độ gốc (1.0x)</option>
          <option value={2}>Tốc độ nhanh (2.0x)</option>
        </select>
      </div>

      <div className="piano-scroll-container">
        <div className="piano-keyboard">
          {keys.map((key) => (
            <PianoKey
              key={key.midi}
              midi={key.midi}
              noteName={key.noteName}
              isBlack={key.isBlack}
              isPressed={activeKeys.has(key.midi)}
              onNoteOn={handleNoteOn}
              onNoteOff={handleNoteOff}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
