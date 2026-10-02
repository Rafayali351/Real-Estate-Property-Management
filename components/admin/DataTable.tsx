import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';

interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="bg-obsidian-card border border-white/10 rounded-2xl overflow-hidden shadow-card-glass">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-obsidian-charcoal/80 border-b border-white/10 text-slate-muted uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="px-5 py-4">
                        <Skeleton className="h-4 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading &&
              data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                  {columns.map((col, cIdx) => {
                    let content: React.ReactNode = null;
                    if (typeof col.accessor === 'function') {
                      content = col.accessor(row);
                    } else if (col.accessor) {
                      content = String(row[col.accessor] ?? '');
                    }
                    return (
                      <td key={cIdx} className={`px-5 py-4 ${col.className || ''}`}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="p-4 border-t border-white/10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
