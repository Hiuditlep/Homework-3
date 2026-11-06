import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  KeyboardEvent,
} from "react";
import type { ColumnDef, DataGridProps } from "./data-grid-contract";

type SortDirection = "ascending" | "descending" | "none";

export function DataGrid<T extends Record<string, any>>({
  data,
  columns,
  onRowSelect,
  ariaLabel,
  pageSize = 5,
}: DataGridProps<T>) {
  // State: Filter & Pagination
  const [filterQuery, setFilterQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<SortDirection>("none");

  // State: Keyboard focus (row index 0 = header row, 1..N = body rows)
  const [focusedCell, setFocusedCell] = useState<{ r: number; c: number }>({
    r: 0,
    c: 0,
  });
  const gridTableRef = useRef<HTMLTableElement | null>(null);

  // 1. Filtering logic
  const filteredData = useMemo(() => {
    if (!filterQuery.trim()) return data;
    const query = filterQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.accessorKey];
        return value != null && String(value).toLowerCase().includes(query);
      }),
    );
  }, [data, columns, filterQuery]);

  // 2. Sorting logic
  const sortedData = useMemo(() => {
    if (!sortKey || sortOrder === "none") return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const compare = aVal < bVal ? -1 : 1;
      return sortOrder === "ascending" ? compare : -compare;
    });
  }, [filteredData, sortKey, sortOrder]);

  // 3. Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setFocusedCell((prev) => ({ ...prev, r: 0 }));
  }, [filterQuery]);

  // Focus element whenever focusedCell changes
  useEffect(() => {
    if (!gridTableRef.current) return;
    const targetCell = gridTableRef.current.querySelector<HTMLElement>(
      `[data-row="${focusedCell.r}"][data-col="${focusedCell.c}"]`,
    );
    if (targetCell) {
      targetCell.focus();
    }
  }, [focusedCell, currentPage]);

  const handleSortToggle = (colKey: keyof T) => {
    if (sortKey !== colKey) {
      setSortKey(colKey);
      setSortOrder("ascending");
    } else if (sortOrder === "ascending") {
      setSortOrder("descending");
    } else {
      setSortKey(null);
      setSortOrder("none");
    }
  };

  // Keyboard navigation handler for the Grid
  const handleKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    const maxRow = paginatedData.length; // 0 is header, 1..length are data rows
    const maxCol = columns.length - 1;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        setFocusedCell((prev) => ({ ...prev, r: Math.max(0, prev.r - 1) }));
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedCell((prev) => ({
          ...prev,
          r: Math.min(maxRow, prev.r + 1),
        }));
        break;
      case "ArrowLeft":
        e.preventDefault();
        setFocusedCell((prev) => ({ ...prev, c: Math.max(0, prev.c - 1) }));
        break;
      case "ArrowRight":
        e.preventDefault();
        setFocusedCell((prev) => ({
          ...prev,
          c: Math.min(maxCol, prev.c + 1),
        }));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedCell.r === 0) {
          // In header: trigger sort if column is sortable
          const targetCol = columns[focusedCell.c];
          if (targetCol.sortable) {
            handleSortToggle(targetCol.accessorKey);
          }
        } else {
          // In body: select row
          const selectedRow = paginatedData[focusedCell.r - 1];
          if (selectedRow && onRowSelect) {
            onRowSelect(selectedRow);
          }
        }
        break;
      default:
        break;
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Controls: Filter & Search (WCAG Labelled) */}
      <div style={styles.toolbar}>
        <label htmlFor="data-grid-search" style={styles.label}>
          Tìm kiếm dữ liệu:
        </label>
        <input
          id="data-grid-search"
          type="search"
          style={styles.input}
          placeholder="Lọc dữ liệu bảng..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          aria-controls="data-grid-table"
        />
      </div>

      {/* Screen reader live notification for data status */}
      <div style={styles.srOnly} aria-live="polite" aria-atomic="true">
        Đang hiển thị {paginatedData.length} trên tổng số {filteredData.length}{" "}
        kết quả. Trang {currentPage} trên {totalPages}.
      </div>

      {/* Semantic Native Table with ARIA Grid Roles */}
      <div style={styles.tableWrapper}>
        <table
          id="data-grid-table"
          ref={gridTableRef}
          role="grid"
          aria-label={ariaLabel}
          onKeyDown={handleKeyDown}
          style={styles.table}
        >
          <thead>
            <tr role="row">
              {columns.map((col, colIdx) => {
                const isSorted = sortKey === col.accessorKey;
                const currentSort = isSorted ? sortOrder : "none";
                const isFocused =
                  focusedCell.r === 0 && focusedCell.c === colIdx;

                return (
                  <th
                    key={String(col.accessorKey)}
                    scope="col"
                    role="columnheader"
                    data-row={0}
                    data-col={colIdx}
                    tabIndex={isFocused ? 0 : -1}
                    aria-sort={col.sortable ? currentSort : undefined}
                    style={{
                      ...styles.th,
                      ...(isFocused ? styles.cellFocused : {}),
                    }}
                    onClick={() => {
                      setFocusedCell({ r: 0, c: colIdx });
                      if (col.sortable) handleSortToggle(col.accessorKey);
                    }}
                  >
                    <div style={styles.thContent}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span aria-hidden="true" style={styles.sortIcon}>
                          {currentSort === "ascending"
                            ? "▲"
                            : currentSort === "descending"
                              ? "▼"
                              : "⇅"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr role="row">
                <td
                  role="gridcell"
                  colSpan={columns.length}
                  style={styles.emptyCell}
                  tabIndex={0}
                  data-row={1}
                  data-col={0}
                >
                  Không tìm thấy kết quả phù hợp.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const actualRowIdx = rowIdx + 1; // 1-based indexing for data rows
                return (
                  <tr
                    key={row.id ?? actualRowIdx}
                    role="row"
                    style={styles.tr}
                    onClick={() => onRowSelect?.(row)}
                  >
                    {columns.map((col, colIdx) => {
                      const isFocused =
                        focusedCell.r === actualRowIdx &&
                        focusedCell.c === colIdx;
                      return (
                        <td
                          key={String(col.accessorKey)}
                          role="gridcell"
                          data-row={actualRowIdx}
                          data-col={colIdx}
                          tabIndex={isFocused ? 0 : -1}
                          style={{
                            ...styles.td,
                            ...(isFocused ? styles.cellFocused : {}),
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFocusedCell({ r: actualRowIdx, c: colIdx });
                            onRowSelect?.(row);
                          }}
                        >
                          {String(row[col.accessorKey] ?? "")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <nav aria-label="Điều hướng phân trang" style={styles.paginationNav}>
        <button
          type="button"
          style={styles.button}
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          aria-label="Trang trước"
        >
          Trước
        </button>
        <span style={styles.pageInfo}>
          Trang <strong>{currentPage}</strong> / {totalPages}
        </span>
        <button
          type="button"
          style={styles.button}
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          aria-label="Trang tiếp theo"
        >
          Sau
        </button>
      </nav>
    </div>
  );
}

// Inline styles complying with WCAG 2.2 AA Contrast (>= 4.5:1)
const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    maxWidth: "900px",
    margin: "20px auto",
    color: "#0f172a", // Text contrast ~ 15:1 against white
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  label: {
    fontWeight: 600,
    fontSize: "14px",
    color: "#0f172a",
  },
  input: {
    padding: "8px 12px",
    border: "1.5px solid #475569", // Contrast > 4.5:1
    borderRadius: "4px",
    fontSize: "14px",
    minWidth: "280px",
    outlineColor: "#1d4ed8",
  },
  tableWrapper: {
    overflowX: "auto",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#ffffff",
    textAlign: "left",
  },
  th: {
    backgroundColor: "#0f172a", // High contrast header
    color: "#ffffff",
    padding: "12px 16px",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    userSelect: "none",
  },
  thContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  sortIcon: {
    fontSize: "12px",
  },
  tr: {
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#1e293b",
    cursor: "pointer",
  },
  cellFocused: {
    outline: "3px solid #2563eb", // Strong focus visible ring
    outlineOffset: "-3px",
    backgroundColor: "#eff6ff",
  },
  emptyCell: {
    textAlign: "center",
    padding: "24px",
    color: "#475569",
  },
  paginationNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "16px",
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "14px",
  },
  pageInfo: {
    fontSize: "14px",
    color: "#0f172a",
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
};
