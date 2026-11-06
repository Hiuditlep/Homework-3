// src/components/FlashSaleEngine.tsx
import React, { useState, useEffect, useRef } from "react";
import { createAntiDriftTimer } from "./anti-drift-timer";

type InventoryState = "AVAILABLE" | "RESERVING" | "RESERVED" | "SOLD_OUT";

export function FlashSaleEngine() {
  const [flashSaleLeft, setFlashSaleLeft] = useState(30000); // Flash Sale 30 giây
  const [itemState, setItemState] = useState<InventoryState>("AVAILABLE");
  const [lockTimeLeft, setLockTimeLeft] = useState(0);

  const lockTimerRef = useRef<(() => void) | null>(null);

  // 1. Khởi chạy đếm ngược sự kiện Flash Sale
  useEffect(() => {
    const cancelSaleTimer = createAntiDriftTimer(30000, (remaining) => {
      setFlashSaleLeft(remaining);
      if (remaining === 0) {
        setItemState((prev) => (prev !== "SOLD_OUT" ? "SOLD_OUT" : prev));
      }
    });
    return () => cancelSaleTimer();
  }, []);

  // 2. Logic giữ chỗ (Optimistic Lock)
  const handleReserve = () => {
    if (itemState !== "AVAILABLE") return;
    setItemState("RESERVING");

    // Giả lập độ trễ mạng 500ms khi tranh giành món hàng
    setTimeout(() => {
      setItemState("RESERVED");

      // Bắt đầu đếm ngược 10s giữ hàng chờ thanh toán
      const cancelLock = createAntiDriftTimer(10000, (remaining) => {
        setLockTimeLeft(remaining);
        if (remaining === 0) {
          setItemState("AVAILABLE"); // Thu hồi nếu không thanh toán kịp
        }
      });
      lockTimerRef.current = cancelLock;
    }, 500);
  };

  // 3. Logic thanh toán chốt đơn
  const handleCheckout = () => {
    if (itemState !== "RESERVED") return;
    if (lockTimerRef.current) lockTimerRef.current(); // Dừng đếm ngược thu hồi
    setItemState("SOLD_OUT");
    alert(
      "Thanh toán ví MoMo thành công! Kiện hàng sẽ được giao qua J&T Express.",
    );
  };

  const formatMs = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const msPart = Math.floor((ms % 1000) / 10);
    return `${seconds}.${msPart.toString().padStart(2, "0")}s`;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>⚡ Mega-Sale 11.11 ⚡</h2>
      <div style={styles.timer}>
        Kết thúc sau:{" "}
        <span style={styles.highlight}>{formatMs(flashSaleLeft)}</span>
      </div>

      <div style={styles.card}>
        <h3 style={{ margin: "0 0 8px 0" }}>
          Ốp lưng chống sốc Magsafe iPhone 15
        </h3>
        <p
          style={{
            color: "#ef4444",
            fontWeight: "bold",
            fontSize: "20px",
            margin: "0 0 16px 0",
          }}
        >
          Giá sốc: 1.000đ
        </p>

        {itemState === "AVAILABLE" && flashSaleLeft > 0 && (
          <button onClick={handleReserve} style={styles.btnReserve}>
            Săn Ngay
          </button>
        )}

        {itemState === "RESERVING" && (
          <button disabled style={styles.btnDisabled}>
            Đang giành hàng...
          </button>
        )}

        {itemState === "RESERVED" && (
          <div style={styles.checkoutBox}>
            <p
              style={{
                fontSize: "14px",
                color: "#b91c1c",
                marginBottom: "8px",
              }}
            >
              Đã giữ hàng! Thanh toán trong:{" "}
              <strong>{formatMs(lockTimeLeft)}</strong>
            </p>
            <button onClick={handleCheckout} style={styles.btnCheckout}>
              Thanh toán bằng MoMo
            </button>
          </div>
        )}

        {itemState === "SOLD_OUT" && (
          <button disabled style={styles.btnSoldOut}>
            Hết Hàng
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "sans-serif",
    maxWidth: "500px",
    padding: "24px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  header: { color: "#ea580c", textAlign: "center", marginTop: 0 },
  timer: {
    textAlign: "center",
    fontSize: "18px",
    marginBottom: "24px",
    fontWeight: 600,
  },
  highlight: { color: "#dc2626", fontFamily: "monospace", fontSize: "24px" },
  card: { border: "1px solid #cbd5e1", padding: "16px", borderRadius: "6px" },
  btnReserve: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#ea580c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
  btnDisabled: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#cbd5e1",
    color: "#475569",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  checkoutBox: {
    backgroundColor: "#fee2e2",
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #fca5a5",
  },
  btnCheckout: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#a81c51",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnSoldOut: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#94a3b8",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
  },
};
