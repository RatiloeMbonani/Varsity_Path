import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface ResultTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function ResultTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No results recorded yet.',
  className = '',
}: ResultTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[#5F86A6] bg-[#EDF4FA]/50 rounded-xl border border-dashed border-[#CFE3F1]">
        {emptyMessage}
      </div>
    );
  }

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`overflow-x-auto rounded-xl border border-[#CFE3F1] bg-white ${className}`}>
      <table className="w-full text-sm text-[#243A5E]">
        <thead>
          <tr className="bg-[#EDF4FA] border-b border-[#CFE3F1] text-xs font-semibold text-[#5F86A6] uppercase tracking-wider">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 ${alignClass[col.align || 'left']} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EDF4FA]">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="hover:bg-[#EDF4FA]/40 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 px-4 ${alignClass[col.align || 'left']} ${col.className || ''}`}
                >
                  {col.render
                    ? col.render(item)
                    : (item as Record<string, any>)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
