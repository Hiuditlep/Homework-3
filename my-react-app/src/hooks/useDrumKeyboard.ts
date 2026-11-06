import { useEffect } from "react";

export function useDrumKeyboard(
  padMap: Map<string, { id: string }>,
  onTriggerPad: (id: string) => void,
  isEnabled = true,
) {
  useEffect(() => {
    if (!isEnabled) return undefined;

    const onKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu là sự kiện lặp do đè phím (Anti-Repeat Guard)
      if (e.repeat) return;

      // Bỏ qua nếu đang gõ chữ trong form
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;

      // Sử dụng W3C e.code thay vì keyCode cũ
      const pad = padMap.get(e.code);

      if (pad) {
        e.preventDefault();
        onTriggerPad(pad.id);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [padMap, onTriggerPad, isEnabled]);
}
