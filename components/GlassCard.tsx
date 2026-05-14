'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  delay?: number
  onClick?: () => void
  style?: React.CSSProperties
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export default function GlassCard({ children, className = '', glow = false, delay = 0, onClick, style, onMouseEnter, onMouseLeave }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={onClick ? { y: -2 } : {}}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`glass-card ${glow ? 'glow-orange-sm' : ''} ${className}`}
      style={{ padding: '24px', cursor: onClick ? 'pointer' : 'default', ...style }}
    >
      {children}
    </motion.div>
  )
}
