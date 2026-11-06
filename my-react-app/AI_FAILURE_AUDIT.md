# AI Failure Mode Audit - HW3

1. **Sai số trôi nhịp (Time Drift):** AI lập trình cơ bản thường đề xuất `setInterval` cho bộ đếm. Trong trình duyệt, hàm này sẽ bị trễ tích lũy (drift) do event loop bị nghẽn, dẫn đến hiển thị sai thời gian thực tế. Cách khắc phục là dùng `Date.now()` kết hợp `requestAnimationFrame`.
2. **Xung đột luồng (Race Condition):** AI thường không xử lý block UI giữa các State. Khi chuyển từ trạng thái `AVAILABLE` sang `RESERVED`, nếu user spam click liên tục có thể sinh ra nhiều timer đè lên nhau.
3. **Rò rỉ bộ nhớ (Memory Leak):** Khi component bị unmount, AI thường xuyên bỏ quên hàm `cleanup` để triệt tiêu requestAnimationFrame. Hậu quả là hàm loop vẫn chạy ngầm và gọi React setState vào hư không.
