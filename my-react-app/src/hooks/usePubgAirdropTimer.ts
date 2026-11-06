import { useEffect, useState } from "react";

// EVOLVED FROM LAB 2 HW3 (createAntiDriftTimer) FOR REACT 19:
export function usePubgAirdropTimer(targetEpochMs: number, serverOffsetMs = 0) {
  const calcRemaining = () =>
    Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs));

  const [remainingMs, setRemainingMs] = useState(calcRemaining);

  useEffect(() => {
    const syncClock = () => setRemainingMs(calcRemaining());
    syncClock();

    // Khung đếm cơ bản
    const timerId = window.setInterval(syncClock, 200);

    // Đồng bộ lại ngay lập tức khi tab được mở lên lại (wake up)
    const onWake = () => {
      if (document.visibilityState === "visible") syncClock();
    };

    document.addEventListener("visibilitychange", onWake);

    return () => {
      window.clearInterval(timerId);
      document.removeEventListener("visibilitychange", onWake);
    };
  }, [targetEpochMs, serverOffsetMs]);

  return { remainingMs, isLive: remainingMs === 0 };
}
