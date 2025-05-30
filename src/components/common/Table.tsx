import React from "react";

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (record: T) => void;
  className?: string;
  rowClassName?: (record: T) => string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyText = "No hay datos disponibles",
  onRowClick,
  className = "",
  rowClassName,
}: TableProps<T>) {
  const getValue = (record: T, key: keyof T | string): any => {
    if (typeof key === "string" && key.includes(".")) {
      return key.split(".").reduce((obj, k) => obj?.[k], record);
    }
    return record[key as keyof T];
  };

  if (loading) {
    return (
      <div 
        className="shadow-sm rounded-xl border overflow-hidden"
        style={{ 
          backgroundColor: "#F7F7F5",
          borderColor: "#E29C44"
        }}
      >
        <div className="p-12 text-center">
          <div 
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ 
              borderColor: "#E29C44",
              borderTopColor: "#CD6C50"
            }}
          ></div>
          <p style={{ color: "#9AAAB3" }}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`shadow-sm rounded-xl border overflow-hidden ${className}`}
      style={{ 
        backgroundColor: "#F7F7F5",
        borderColor: "#E29C44"
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead style={{ backgroundColor: "#CD6C50" }}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b ${
                    column.align === "center"
                      ? "text-center"
                      : column.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                  style={{ 
                    width: column.width,
                    color: "#F7F7F5",
                    borderBottomColor: "#E29C44"
                  }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "#F7F7F5" }}>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center"
                  style={{ color: "#9AAAB3" }}
                >
                  <div className="text-4xl mb-2">📊</div>
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`
                    transition-colors border-b
                    ${onRowClick ? "cursor-pointer" : ""}
                    ${rowClassName ? rowClassName(record) : ""}
                  `}
                  style={{ 
                    borderBottomColor: "#E29C44"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(226, 156, 68, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F7F7F5";
                  }}
                  onClick={() => onRowClick?.(record)}
                >
                  {columns.map((column, colIndex) => {
                    const value = getValue(record, column.key);
                    const content = column.render
                      ? column.render(value, record)
                      : value;

                    return (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          column.align === "center"
                            ? "text-center"
                            : column.align === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                        style={{ color: "#443639" }}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}