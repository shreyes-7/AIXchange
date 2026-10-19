import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = "No records found.",
  sortKey,
  sortDirection, // 'asc' | 'desc'
  onSort,
  className = "",
}) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const canSort = col.sortable && onSort;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => canSort && onSort(col.key)}
                    className={`py-3.5 px-4 font-semibold ${col.className || ""} ${
                      canSort ? "cursor-pointer select-none hover:text-white" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {canSort && (
                        <span className="text-slate-500">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={`loading-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`loading-${rIdx}-${cIdx}`} className="py-4 px-4">
                      <div className="h-4 bg-slate-800/80 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-slate-500 font-mono text-xs"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row.id || row._id || rIdx}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={`${row.id || rIdx}-${col.key}`}
                      className={`py-3.5 px-4 text-slate-300 ${col.className || ""}`}
                    >
                      {col.render ? col.render(row[col.key], row, rIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
