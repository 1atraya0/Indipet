'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CalendarDays, Clock, Target, Store,
  BarChart3, DollarSign, Award, Handshake, Database, Shield,
  FileSearch, UserCheck, ChevronRight, Settings, LogOut,
  AlertTriangle
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', emoji: '🏠' },
  { href: '/employees', icon: Users, label: 'Employees', emoji: '🐕' },
  { href: '/leave-attendance', icon: CalendarDays, label: 'Leave & Attendance', emoji: '📅' },
  { href: '/leave-attendance/calendar', icon: CalendarDays, label: 'Holidays', emoji: '🗓️' },
  { href: '/shift-roster', icon: Clock, label: 'Shift & Roster', emoji: '🔄' },
  { href: '/targets', icon: Target, label: 'Targets', emoji: '🎯' },
  { href: '/store-operations', icon: Store, label: 'Store Operations', emoji: '🏪' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics', emoji: '📊' },
]

const governanceItems = [
  { href: '/payroll', icon: DollarSign, label: 'Payroll Engine', emoji: '💰' },
  { href: '/commission', icon: Award, label: 'Commission', emoji: '💎' },
  { href: '/contractors', icon: Handshake, label: 'Contractors', emoji: '🤝' },
  { href: '/master-data', icon: Database, label: 'Master Data', emoji: '📋' },
  { href: '/access-control', icon: Shield, label: 'Access Control', emoji: '🔐' },
  { href: '/audit', icon: FileSearch, label: 'Audit & Compliance', emoji: '📜' },
]

const hrItems = [
  { href: '/hr-admin', icon: UserCheck, label: 'HR Admin', emoji: '👔' },
]

interface NavGroupProps {
  title: string
  items: typeof navItems
  pathname: string
}

function NavGroup({ title, items, pathname }: NavGroupProps) {
  return (
    <div className="mb-2">
      <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px', marginBottom: '4px', marginTop: '16px' }}>
        {title}
      </p>
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`nav-item flex items-center gap-3 px-3 py-2.5 mx-2 mb-0.5 cursor-pointer ${active ? 'nav-item-active' : ''}`}
            >
              <span style={{ fontSize: '15px' }}>{item.emoji}</span>
              <span style={{ fontSize: '13px', fontWeight: active ? 600 : 500, letterSpacing: '0.01em' }}>
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  style={{ marginLeft: 'auto' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ChevronRight size={12} style={{ color: 'var(--orange-light)' }} />
                </motion.div>
              )}
            </motion.div>
          </Link>
        )
      })}
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="glass-sidebar fixed left-0 top-0 h-full flex flex-col"
      style={{ width: 'var(--sidebar-w)', zIndex: 40 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,140,66,0.1)' }}>
        <motion.div
          animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #FF6B35, #FFB347)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 4px 16px rgba(255,107,53,0.4)'
          }}
        >
          🐾
        </motion.div>
        <div>
          <p style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            Indipet
          </p>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Super Admin
          </p>
        </div>
      </div>

      {/* Hard Rules Alert */}
      <div className="mx-3 mt-3 px-3 py-2.5" style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <AlertTriangle size={13} style={{ color: '#fca5a5', flexShrink: 0 }} />
        <p style={{ fontSize: '11px', color: '#fca5a5', lineHeight: 1.4 }}>
          4 Hard Rules Active
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'thin' }}>
        <NavGroup title="Operations" items={navItems} pathname={pathname} />
        <NavGroup title="Governance" items={governanceItems} pathname={pathname} />
        <NavGroup title="HR Admin" items={hrItems} pathname={pathname} />
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,140,66,0.1)', padding: '12px 8px' }}>
        <Link href="/settings">
          <div className="nav-item flex items-center gap-3 px-3 py-2.5 mx-2 cursor-pointer" style={{ borderRadius: '12px' }}>
            <span style={{ fontSize: '15px' }}>⚙️</span>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Settings</span>
          </div>
        </Link>
        <div
          className="nav-item flex items-center gap-3 px-3 py-2.5 mx-2 cursor-pointer"
          style={{ borderRadius: '12px', marginTop: '2px' }}
        >
          <span style={{ fontSize: '15px' }}>👋</span>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Super Admin</p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>admin@indipet.in</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
