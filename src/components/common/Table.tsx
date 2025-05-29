import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
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
  emptyText = 'No hay datos disponibles',
  onRowClick,
  className = '',
  rowClassName,
}: TableProps<T>) {
  const getValue = (record: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      // Soporte para claves anidadas como 'categoria.denominacion'
      return key.split('.').reduce((obj, k) => obj?.[k], record);
    }
    return record[key as keyof T];
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-8 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' :
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`
                    hover:bg-gray-50 transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${rowClassName ? rowClassName(record) : ''}
                  `}
                  onClick={() => onRowClick?.(record)}
                >
                  {columns.map((column, colIndex) => {
                    const value = getValue(record, column.key);
                    const content = column.render ? column.render(value, record) : value;
                    
                    return (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                          column.align === 'center' ? 'text-center' :
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
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
