import React, { useState, useMemo } from "react";
import type {
  PubgVnSquadStanding,
  PubgCrateDrop,
  DropPhase,
} from "./pubg-vn-arena-contract";
import { usePubgAirdropTimer } from "../../hooks/usePubgAirdropTimer";

// Mock data Leaderboard PUBG VN
const initialLeaderboard: PubgVnSquadStanding[] = [
  {
    squadId: "te",
    squadName: "The Expendables",
    wwcdCount: 3,
    placementPts: 45,
    killPts: 60,
  },
  {
    squadId: "ces",
    squadName: "Cerberus Esports",
    wwcdCount: 5,
    placementPts: 50,
    killPts: 85,
  },
  {
    squadId: "ge",
    squadName: "Genius Esports",
    wwcdCount: 1,
    placementPts: 30,
    killPts: 40,
  },
  {
    squadId: "agg",
    squadName: "All Gamers Global",
    wwcdCount: 2,
    placementPts: 40,
    killPts: 55,
  },
];

export function PubgArena() {
  // Setup Airdrop rơi sau 10 giây kể từ khi mở component
  const [airdropTarget] = useState(() => Date.now() + 10000);
  const { remainingMs, isLive } = usePubgAirdropTimer(airdropTarget);

  const [crate, setCrate] = useState<PubgCrateDrop>({
    id: "crate-001",
    title: "PVS Finals VIP Pass + 5,000 G-Coin",
    priceVnd: 250000,
    remainingStock: 5, // Chỉ có 5 vé
    dropEpochMs: airdropTarget,
  });

  const [claimStatus, setClaimStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Tính toán Phase
  let phase: DropPhase = "WARMUP";
  if (isLive) {
    phase = crate.remainingStock > 0 ? "AIRDROP_LIVE" : "LOOTED_OUT";
  }

  // Logic Optimistic Claim & 409 Rollback
  const handleClaim = () => {
    if (phase !== "AIRDROP_LIVE" || isProcessing) return;

    setIsProcessing(true);
    setClaimStatus("Đang xử lý...");

    // 1. Optimistic Deduction (Trừ số lượng ngay trên giao diện)
    const previousStock = crate.remainingStock;
    setCrate((prev) => ({ ...prev, remainingStock: prev.remainingStock - 1 }));

    // 2. Giả lập gọi API Server (tỉ lệ tạch 409 Conflict là 30%)
    setTimeout(() => {
      const isConflict = Math.random() < 0.3;

      if (isConflict) {
        // Rollback lại số lượng nếu có người khác nẫng tay trên
        setCrate((prev) => ({ ...prev, remainingStock: previousStock }));
        setClaimStatus(
          "❌ Lỗi 409: Có người khác đã hòm mất! Đã hoàn tác (Rollback).",
        );
      } else {
        setClaimStatus("✅ Thành công! Vé đã được chuyển vào hành trang.");
      }
      setIsProcessing(false);
    }, 800);
  };

  // Tính điểm tổng (WWCD * 10 + Placement + Kills) và sắp xếp Leaderboard
  const sortedLeaderboard = useMemo(() => {
    return [...initialLeaderboard].sort((a, b) => {
      const scoreA = a.wwcdCount * 10 + a.placementPts + a.killPts;
      const scoreB = b.wwcdCount * 10 + b.placementPts + b.killPts;
      return scoreB - scoreA; // Giảm dần
    });
  }, []);

  const formatVnd = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        maxWidth: "800px",
        padding: "24px",
        background: "#111827",
        color: "white",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ color: "#f59e0b", textAlign: "center" }}>
        🏆 KRAFTON x PUBG Vietnam Championship
      </h2>

      {/* KHU VỰC SĂN VÉ */}
      <div
        style={{
          border: "2px solid #374151",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "24px",
          background: "#1f2937",
        }}
      >
        <h3 style={{ margin: "0 0 12px 0", color: "#60a5fa" }}>
          🎁 Airdrop Arena: {crate.title}
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
              Giá:{" "}
              <strong style={{ color: "#10b981" }}>
                {formatVnd(crate.priceVnd)}
              </strong>
            </p>
            <p style={{ margin: "0", color: "#9ca3af" }}>
              Còn lại:{" "}
              <strong style={{ color: "white" }}>{crate.remainingStock}</strong>{" "}
              kiện
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            {phase === "WARMUP" && (
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#f87171",
                  fontFamily: "monospace",
                }}
              >
                {(remainingMs / 1000).toFixed(1)}s
              </div>
            )}

            {phase === "AIRDROP_LIVE" && (
              <button
                onClick={handleClaim}
                disabled={isProcessing}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  background: isProcessing ? "#4b5563" : "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                }}
              >
                {isProcessing ? "Đang Claim..." : "⚡ CLAIM NGAY ⚡"}
              </button>
            )}

            {phase === "LOOTED_OUT" && (
              <button
                disabled
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  background: "#374151",
                  color: "#9ca3af",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                HẾT HÀNG
              </button>
            )}
          </div>
        </div>

        {claimStatus && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "4px",
              background: claimStatus.includes("409") ? "#7f1d1d" : "#064e3b",
            }}
          >
            {claimStatus}
          </div>
        )}
      </div>

      {/* BẢNG XẾP HẠNG LEADERBOARD */}
      <div>
        <h3
          style={{
            borderBottom: "1px solid #374151",
            paddingBottom: "12px",
            color: "#e5e7eb",
          }}
        >
          📊 Live PVS Leaderboard
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ color: "#9ca3af", borderBottom: "1px solid #374151" }}>
              <th style={{ padding: "12px 8px" }}>Hạng</th>
              <th style={{ padding: "12px 8px" }}>Đội tuyển (Squad)</th>
              <th style={{ padding: "12px 8px" }}>WWCD</th>
              <th style={{ padding: "12px 8px" }}>Điểm Kill</th>
              <th style={{ padding: "12px 8px" }}>Tổng Điểm</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.map((squad, index) => {
              const totalScore =
                squad.wwcdCount * 10 + squad.placementPts + squad.killPts;
              return (
                <tr
                  key={squad.squadId}
                  style={{
                    borderBottom: "1px solid #1f2937",
                    background:
                      index === 0 ? "rgba(245, 158, 11, 0.1)" : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 8px",
                      fontWeight: "bold",
                      color: index === 0 ? "#f59e0b" : "white",
                    }}
                  >
                    #{index + 1}
                  </td>
                  <td style={{ padding: "12px 8px", fontWeight: "bold" }}>
                    {squad.squadName}
                  </td>
                  <td style={{ padding: "12px 8px", color: "#fcd34d" }}>
                    🍗 {squad.wwcdCount}
                  </td>
                  <td style={{ padding: "12px 8px" }}>{squad.killPts}</td>
                  <td
                    style={{
                      padding: "12px 8px",
                      fontWeight: "bold",
                      color: "#60a5fa",
                    }}
                  >
                    {totalScore}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
