// src/components/Piano/PianoKey.tsx
import React, { memo } from "react";

interface PianoKeyProps {
  midi: number;
  noteName: string;
  isBlack: boolean;
  isPressed: boolean;
  onNoteOn: (midi: number) => void;
  onNoteOff: (midi: number) => void;
}

export const PianoKey = memo(function PianoKey({
  midi,
  noteName,
  isBlack,
  isPressed,
  onNoteOn,
  onNoteOff,
}: PianoKeyProps) {
  return (
    <button
      type="button"
      className={`piano-key ${isBlack ? "key-black" : "key-white"} ${isPressed ? "pressed" : ""}`}
      aria-pressed={isPressed}
      onPointerDown={(e) => {
        e.preventDefault();
        onNoteOn(midi);
      }}
      onPointerUp={() => onNoteOff(midi)}
      onPointerLeave={() => onNoteOff(midi)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="note-name">{noteName}</span>
    </button>
  );
});
