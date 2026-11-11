// [OK] DETERMINISTIC FINITE STATE MACHINE CONTRACT:
export type RelationshipPhase =
  | "FRIENDS"
  | "DATING_NO_LOVE" // 'Hẹn hò nhưng không yêu'
  | "OFFICIAL_LOVE" // Verified mutual commitment
  | "GHOSTED_EXIT"; // Unmounted & memory freed

// Asymmetric Effort Formula ('Em cố 100 lần < Ai đó 1 phần'):
export interface EffortSignal {
  readonly id: string;
  readonly actor: "EM" | "AI_DO";
  readonly steps: number; // e.g. 1000 steps vs 1 step
  readonly multiplier: number; // // 0.05 vs 100.0
}
