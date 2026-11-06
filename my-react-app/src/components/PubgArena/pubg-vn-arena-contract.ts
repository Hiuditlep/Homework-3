// KRAFTON x PUBG VIETNAM ARENA DOMAIN CONTRACT:
export type DropPhase = "WARMUP" | "AIRDROP_LIVE" | "LOOTED_OUT" | "EXPIRED";

export interface PubgCrateDrop {
  readonly id: string;
  readonly title: string; // e.g. 'PVS Finals VIP Pass + 5,000 G-Coin'
  readonly priceVnd: number; // Formatted via Intl.NumberFormat('vi-VN')
  readonly remainingStock: number;
  readonly dropEpochMs: number;
}

export interface PubgVnSquadStanding {
  readonly squadId: string; // 'te' | 'ces' | 'ge' | 'agg'
  readonly squadName: string;
  readonly wwcdCount: number; // Winner Winner Chicken Dinner!
  readonly placementPts: number;
  readonly killPts: number;
}
