# Lab 2: Task Decomposition & Implementation Plan

Tài liệu này trình bày cấu trúc phân rã tác vụ (Work Breakdown Structure) cho 3 bài tập trong Lab 2, đảm bảo tuân thủ nghiêm ngặt các tiêu chí về Accessibility (WCAG 2.2 AA), Concurrency và State Management.

## HW 1: Production Enterprise Data-Grid

**Mục tiêu:** Xây dựng Data-Grid chuẩn công nghiệp, điểm Lighthouse Accessibility 100/100.

- **Task 1.1: Thiết lập cấu trúc dữ liệu cốt lõi (TypeScript Contract)**
  - Định nghĩa interface `ColumnDef<T>` và `DataGridProps<T>`.
- **Task 1.2: Xây dựng Semantic UI (Zero div-soup)**
  - Triển khai cấu trúc native HTML: `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`.
  - Áp dụng CSS đảm bảo độ tương phản (Contrast Ratio >= 4.5:1).
- **Task 1.3: Triển khai các tính năng xử lý dữ liệu**
  - Viết logic Lọc (Global Text Search).
  - Viết logic Sắp xếp (Sort: Ascending/Descending/None).
  - Viết logic Phân trang (Pagination với page size tự định nghĩa).
- **Task 1.4: Tích hợp Accessibility (WCAG 2.2 AA)**
  - Bổ sung `aria-label`, `role="grid"`, `role="row"`, `role="columnheader"`.
  - Thiết lập vùng thông báo `aria-live="polite"` cho Screen Reader khi dữ liệu/trang thay đổi.
- **Task 1.5: Tích hợp Keyboard Navigation (Điều hướng bàn phím)**
  - Quản lý tiêu điểm (Roving tabIndex) để chỉ focus 1 ô tại 1 thời điểm.
  - Lắng nghe sự kiện mũi tên (Arrow keys) để di chuyển dọc/ngang.
  - Lắng nghe sự kiện `Enter`/`Space` để kích hoạt sắp xếp hoặc chọn dòng.

---

## HW 2: Concurrent FIFO Audio Visualizer Queue Engine

**Mục tiêu:** Xây dựng hệ thống tải và giải mã âm thanh đồng thời không gây rò rỉ bộ nhớ.

- **Task 2.1: Xây dựng Core Queue Engine (Controller)**
  - Khởi tạo `AudioContext` và mô hình Singleton `AudioTaskQueue`.
  - Triển khai cơ chế tải FIFO sử dụng `Promise` và `fetch`.
  - Tích hợp `AbortController` để hủy tải mạng khi người dùng skip bài.
- **Task 2.2: Triển khai Audio Processing & Visualization**
  - Tích hợp `AnalyserNode` (FFT 256/512 bins) để lấy dữ liệu tần số.
  - Sử dụng Canvas API để vẽ phổ âm thanh.
  - Sử dụng `requestAnimationFrame` để render 60fps mượt mà, không giật lag.
- **Task 2.3: Quản lý bộ nhớ & Garbage Collection**
  - Triển khai hàm `cleanup()` để ngắt kết nối `AudioBufferSourceNode`.
  - Hủy `requestAnimationFrame` ngay khi component unmount hoặc đổi bài.

---

## HW 3: High-Concurrency Flash-Sale E-Commerce Engine

**Mục tiêu:** Mô phỏng quy trình Flash-Sale với độ chính xác thời gian mili-giây và khóa trạng thái tồn kho.

- **Task 3.1: Xây dựng Core Timer Engine (Zero-Drift)**
  - Phân tích rủi ro trễ nhịp của `setInterval`.
  - Thay thế bằng engine `createAntiDriftTimer` sử dụng `requestAnimationFrame` kết hợp `Date.now()`.
- **Task 3.2: Thiết kế Finite State Machine (Quản lý trạng thái tồn kho)**
  - Định nghĩa các trạng thái: `AVAILABLE` -> `RESERVING` -> `RESERVED` -> `SOLD_OUT`.
  - Khóa Optimistic Lock: Cho phép người dùng giành hàng, giữ chỗ trong 10 giây.
  - Tự động hoàn trả về `AVAILABLE` nếu quá 10 giây không thanh toán.
- **Task 3.3: Triển khai giao diện và tích hợp giả lập luồng mua hàng**
  - Cập nhật UI phản hồi tương ứng theo 4 trạng thái tồn kho.
  - Giả lập độ trễ mạng (Network delay simulation) khi người dùng nhấn "Săn ngay".
  - Giả lập tích hợp cổng thanh toán MoMo và đơn vị vận chuyển J&T Express.
- **Task 3.4: Viết tài liệu Audit & Thực hiện Atomic Commits**
  - Soạn thảo báo cáo `AI_FAILURE_AUDIT.md` (Sai số trôi nhịp, Xung đột luồng, Rò rỉ bộ nhớ).
  - Commit từng tính năng nhỏ độc lập (chuẩn Conventional Commits).
