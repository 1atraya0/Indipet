'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, Search, RefreshCw } from 'lucide-react'
import { useState } from 'react'

const pageLabels: Record<string, { title: string; subtitle: string; emoji: string }> = {
  '/': { title: 'Dashboard', subtitle: 'System overview across all locations', emoji: '🏠' },
  '/employees': { title: 'Employees', subtitle: 'Manage all employee records', emoji: '🐕' },
  '/leave-attendance': { title: 'Leave & Attendance', subtitle: 'Approvals, overrides, and biometric data', emoji: '📅' },
  '/shift-roster': { title: 'Shift & Roster', subtitle: 'Generate and manage rosters', emoji: '🔄' },
  '/targets': { title: 'Targets', subtitle: 'Sales and grooming targets per store', emoji: '🎯' },
  '/store-operations': { title: 'Store Operations', subtitle: 'SOP adherence and location management', emoji: '🏪' },
  '/analytics': { title: 'Analytics', subtitle: 'Performance reports and trends', emoji: '📊' },
  '/payroll': { title: 'Payroll Engine', subtitle: 'Period control and dispatch management', emoji: '💰' },
  '/commission': { title: 'Commission Engine', subtitle: 'Eligibility, slabs, and ledger approval', emoji: '💎' },
  '/contractors': { title: 'Contractor Payments', subtitle: 'KPI validation and invoice approval', emoji: '🤝' },
  '/master-data': { title: 'Master Data', subtitle: 'Configuration and policy management', emoji: '📋' },
  '/access-control': { title: 'Access Control', subtitle: 'User accounts and role assignment', emoji: '🔐' },
  '/audit': { title: 'Audit & Compliance', subtitle: 'Full audit trail and statutory compliance', emoji: '📜' },
  '/hr-admin': { title: 'HR Admin', subtitle: 'Leave policy, disciplinary, and onboarding', emoji: '👔' },
  '/settings': { title: 'Settings', subtitle: 'System configuration', emoji: '⚙️' },
}

export default function Header() {
  const pathname = usePathname()
  const info = pageLabels[pathname] || { title: 'Indipet ERP', subtitle: '', emoji: '🐾' }
  const [notifOpen, setNotifOpen] = useState(false)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header
      className="fixed top-0 right-0 flex items-center justify-between px-6 py-4"
      style={{
        left: 'var(--sidebar-w)',
        height: '72px',
        background: 'rgba(10,4,0,0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,140,66,0.1)',
        zIndex: 30,
      }}
    >
      {/* Title */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '22px' }}>{info.emoji}</span>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {info.title}
            </h1>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
              {info.subtitle}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginRight: '8px' }}>
          {dateStr}
        </p>

        {/* Search */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 36, height: 36,
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,140,66,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,200,150,0.6)',
          }}
        >
          <Search size={15} />
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setNotifOpen(!notifOpen)}
          style={{
            width: 36, height: 36,
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,140,66,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,200,150,0.6)',
            position: 'relative',
          }}
        >
          <Bell size={15} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7,
            background: '#FF6B35',
            borderRadius: '50%',
            border: '1.5px solid var(--bg-primary)',
          }} />
        </motion.button>

        {/* Refresh */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          style={{
            width: 36, height: 36,
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,140,66,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,200,150,0.6)',
          }}
        >
          <RefreshCw size={15} />
        </motion.button>
      </div>
    </header>
  )
}
