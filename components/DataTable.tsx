'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => ReactNode
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: string
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: '14px', width: `${60 + Math.random() * 40}%`, borderRadius: '6px' }} />
        </td>
      ))}
    </tr>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
  columns, data, loading = false, emptyMessage = 'No records found', emptyIcon = '🐾'
}: DataTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: '0 0 20px 20px' }}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{emptyIcon}</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <motion.tr
                key={row.id ?? i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                {columns.map((col) => (
                  <td key={String(col.key)}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
