# AI Failure Mode Audit - HW3

1. **Sai số trôi nhịp (Time Drift):** AI lập trình cơ bản thường đề xuất `setInterval` cho bộ đếm. Trong trình duyệt, hàm này sẽ bị trễ tích lũy (drift) do event loop bị nghẽn, dẫn đến hiển thị sai thời gian thực tế. Cách khắc phục là dùng `Date.now()` kết hợp `requestAnimationFrame`.
2. **Xung đột luồng (Race Condition):** AI thường không xử lý block UI giữa các State. Khi chuyển từ trạng thái `AVAILABLE` sang `RESERVED`, nếu user spam click liên tục có thể sinh ra nhiều timer đè lên nhau.
3. **Rò rỉ bộ nhớ (Memory Leak):** Khi component bị unmount, AI thường xuyên bỏ quên hàm `cleanup` để triệt tiêu requestAnimationFrame. Hậu quả là hàm loop vẫn chạy ngầm và gọi React setState vào hư không.

## Failure #04: Stale Closure in PUBG Airdrop Timer (Lab 3)

- **Prompt**: "Tạo đồng hồ đếm ngược cho sự kiện Airdrop"
- **AI Bug**: AI thường dùng `setInterval(s => s - 1, 1000)` để đếm ngược. Khi người dùng mở nhiều tab, Chrome sẽ throttle các background tab xuống còn 1 tick/phút, dẫn đến đồng hồ bị trễ hàng chục phút so với thực tế.
- **Engineering Fix**: Chuyển sang sử dụng `Date.now()` để tính delta dựa vào thời điểm chuẩn `targetEpochMs`, và lắng nghe sự kiện `visibilitychange` để đồng bộ (sync) ngay lập tức khi tab được active trở lại.

## Failure #05: 409 Conflict Rollback Missing

- **Prompt**: "Tạo tính năng mua vé Airdrop có tồn kho hạn chế"
- **AI Bug**: AI chỉ giảm `remainingStock` một chiều. Trong môi trường High-Concurrency, nhiều user cùng giành giật sẽ bị Server trả về lỗi 409 Conflict (hết hàng do người khác nhanh hơn). UI sẽ bị kẹt lại báo thành công giả.
- **Engineering Fix**: Triển khai cơ chế Optimistic UI: Tạm trừ tồn kho để UI phản hồi mượt, nhưng bọc trong block xử lý lỗi để tự động rollback (hoàn tác) lại số tồn kho cũ và báo lỗi nếu Server chối từ giao dịch.
