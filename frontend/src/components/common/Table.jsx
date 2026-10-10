import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

const Table = ({
  columns = [],
  data = [],
  sortBy,
  sortOrder = 'DESC',
  onSort,
  isLoading = false,
  emptyText = 'No records found',
  emptyDescription = 'There are no items to display matching your criteria.',
  onRowClick,
}) => {
  const handleHeaderClick = (col) => {
    if (!col.sortable || !onSort) return;
    const currentOrder = sortBy === col.key ? sortOrder : 'ASC';
    const nextOrder = sortBy === col.key && currentOrder.toUpperCase() === 'ASC' ? 'DESC' : 'ASC';
    onSort(col.key, nextOrder);
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {columns.map((col) => {
                const isCurrentSort = sortBy === col.key;
                const isAsc = isCurrentSort && sortOrder.toUpperCase() === 'ASC';
                const isDesc = isCurrentSort && sortOrder.toUpperCase() === 'DESC';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => handleHeaderClick(col)}
                    className={`py-3.5 px-4 text-slate-600 ${
                      col.sortable
                        ? 'cursor-pointer hover:bg-slate-100/80 transition-colors select-none'
                        : ''
                    } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className="inline-flex">
                          {isAsc ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-600 font-bold" />
                          ) : isDesc ? (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-600 font-bold" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <LoadingSkeleton rows={5} columns={columns.length} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  <EmptyState title={emptyText} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key] || '—'}
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
};

export default Table;
