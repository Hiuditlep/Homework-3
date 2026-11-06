import React, { useState } from "react";
import { DataGrid } from "./components/DataGrid";
import type { ColumnDef } from "./components/data-grid-contract";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { FlashSaleEngine } from "./components/FlashSaleEngine"; // <-- Thêm import Bài 3

interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
}

const columns: ColumnDef<Employee>[] = [
  { header: "ID", accessorKey: "id", sortable: true },
  { header: "Họ và Tên", accessorKey: "name", sortable: true },
  { header: "Vị trí", accessorKey: "role", sortable: true },
  { header: "Phòng ban", accessorKey: "department", sortable: false },
];

const mockData: Employee[] = [
  {
    id: 101,
    name: "Nguyễn Văn A",
    role: "Frontend Engineer",
    department: "Kỹ thuật",
  },
  {
    id: 102,
    name: "Trần Thị B",
    role: "UI/UX Designer",
    department: "Thiết kế",
  },
  {
    id: 103,
    name: "Lê Hoàng C",
    role: "Fullstack Developer",
    department: "Kỹ thuật",
  },
  {
    id: 104,
    name: "Phạm Minh D",
    role: "Product Manager",
    department: "Sản phẩm",
  },
  {
    id: 105,
    name: "Hoàng Anh E",
    role: "QA Automation",
    department: "Kiểm thử",
  },
  { id: 106, name: "Đỗ Hải F", role: "DevOps Engineer", department: "Hạ tầng" },
];

export default function App() {
  // Thêm hw3 vào state
  const [activeTab, setActiveTab] = useState<"hw1" | "hw2" | "hw3">("hw1");

  return (
    <main style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Menu chuyển bài */}
      <nav
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "32px",
          borderBottom: "2px solid #e2e8f0",
          paddingBottom: "16px",
        }}
      >
        <button
          onClick={() => setActiveTab("hw1")}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: activeTab === "hw1" ? "bold" : "normal",
            backgroundColor: activeTab === "hw1" ? "#eff6ff" : "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: "4px",
          }}
        >
          HW 1: Data-Grid
        </button>
        <button
          onClick={() => setActiveTab("hw2")}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: activeTab === "hw2" ? "bold" : "normal",
            backgroundColor: activeTab === "hw2" ? "#eff6ff" : "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: "4px",
          }}
        >
          HW 2: Audio Visualizer
        </button>

        {/* <-- Thêm nút cho Bài 3 --> */}
        <button
          onClick={() => setActiveTab("hw3")}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: activeTab === "hw3" ? "bold" : "normal",
            backgroundColor: activeTab === "hw3" ? "#eff6ff" : "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: "4px",
          }}
        >
          HW 3: Flash-Sale Engine
        </button>
      </nav>

      {/* Giao diện Bài 1 - Giữ nguyên như cũ */}
      {activeTab === "hw1" && (
        <section>
          <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
            Enterprise Data-Grid Demo (WCAG 2.2 AA)
          </h1>
          <DataGrid<Employee>
            data={mockData}
            columns={columns}
            ariaLabel="Bảng danh sách nhân viên công ty"
            pageSize={4}
            onRowSelect={(item) => console.log("Đã chọn nhân viên:", item)}
          />
        </section>
      )}

      {/* Giao diện Bài 2 */}
      {activeTab === "hw2" && (
        <section>
          <AudioVisualizer />
        </section>
      )}

      {/* <-- Thêm Giao diện Bài 3 --> */}
      {activeTab === "hw3" && (
        <section>
          <FlashSaleEngine />
        </section>
      )}
    </main>
  );
}
