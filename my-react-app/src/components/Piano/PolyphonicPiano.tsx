// src/components/Piano/PolyphonicPiano.tsx
import React, { useState, useCallback, useMemo } from "react";
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

export function PolyphonicPiano() {
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());

  // Algorithmic 88-Key Generation (A0 to C8)
  const keys = useMemo(() => {
    const generatedKeys = [];
    // Piano bắt đầu từ MIDI 21 (A0) đến 108 (C8)
    for (let midi = 21; midi <= 108; midi++) {
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      const noteIndex = midi % 12;
      const noteName = NOTE_NAMES[noteIndex];
      const isBlack = noteName.includes("#");
      const octave = Math.floor(midi / 12) - 1;

      generatedKeys.push({
        midi,
        freq,
        noteName: `${noteName}${octave}`,
        isBlack,
      });
    }
    return generatedKeys;
  }, []);

  const handleNoteOn = useCallback(
    (midi: number) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.add(midi);
        return next;
      });
      const keyInfo = keys.find((k) => k.midi === midi);
      if (keyInfo) {
        synthEngine.noteOn(midi, keyInfo.freq);
      }
    },
    [keys],
  );

  const handleNoteOff = useCallback((midi: number) => {
    setActiveKeys((prev) => {
      if (!prev.has(midi)) return prev;
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
    synthEngine.noteOff(midi);
  }, []);

  return (
    <div className="piano-wrapper">
      <h2>88-Key Polyphonic Piano & Sequencer</h2>
      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px" }}>
        React.memo Rendering Isolation | 8-Voice FIFO Stealing | Algorithmic
        Generation
      </p>

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
