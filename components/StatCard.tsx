'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, ReactNode } from 'react'
import GlassCard from './GlassCard'

interface StatCardProps {
  label: string
  value: number | string
  unit?: string
  icon: string
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' }
  color?: string
  delay?: number
  suffix?: string
  loading?: boolean
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('en-IN') + suffix)

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.4, 0, 0.2, 1],
    })
    return controls.stop
  }, [value, count])

  return <motion.span>{rounded}</motion.span>
}

export default function StatCard({ label, value, unit, icon, trend, color = '#FF6B35', delay = 0, suffix = '', loading = false }: StatCardProps) {
  const trendColor = trend?.direction === 'up' ? '#6ee7b7' : trend?.direction === 'down' ? '#fca5a5' : '#FFB347'
  const trendSymbol = trend?.direction === 'up' ? '↑' : trend?.direction === 'down' ? '↓' : '→'

  return (
    <GlassCard delay={delay} glow>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
            {label}
          </p>
          {loading ? (
            <div className="skeleton" style={{ width: '80px', height: '36px', borderRadius: '8px' }} />
          ) : (
            <div className="stat-number" style={{ color: 'var(--text-primary)' }}>
              {typeof value === 'number' ? (
                <AnimatedNumber value={value} suffix={suffix} />
              ) : (
                <span>{value}{suffix}</span>
              )}
              {unit && <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '4px', fontWeight: 500 }}>{unit}</span>}
            </div>
          )}
          {trend && !loading && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: trendColor, fontWeight: 600 }}>
                {trendSymbol} {Math.abs(trend.value)}%
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>vs last month</span>
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
          style={{
            width: 46, height: 46,
            borderRadius: '14px',
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
          }}
        >
          {icon}
        </motion.div>
      </div>
    </GlassCard>
  )
}
