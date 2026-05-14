'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { Bell, Search, ChevronRight, ShieldCheck, Users, CalendarDays, Clock3, Target, Wallet, BadgeCheck, ScrollText, Megaphone, Settings2, LayoutDashboard, LineChart } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ size?: number }>
  note: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/store-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, note: 'Daily command center' },
  { href: '/store-admin/people', label: 'People', icon: Users, note: 'Employee directory' },
  { href: '/store-admin/attendance', label: 'Attendance', icon: CalendarDays, note: 'Live punches & exceptions' },
  { href: '/store-admin/shifts', label: 'Shifts & Rosters', icon: Clock3, note: 'Coverage planning' },
  { href: '/store-admin/leave', label: 'Leave Management', icon: BadgeCheck, note: 'Requests & balances' },
  { href: '/store-admin/performance', label: 'Performance & Targets', icon: Target, note: 'KPI management' },
  { href: '/store-admin/incentives', label: 'Incentives', icon: Wallet, note: 'Slabs & payouts' },
  { href: '/store-admin/payroll-preview', label: 'Payroll Preview', icon: ScrollText, note: 'Store visibility only' },
  { href: '/store-admin/compliance', label: 'Compliance', icon: ShieldCheck, note: 'FOCO enforcement' },
  { href: '/store-admin/reports', label: 'Reports', icon: LineChart, note: 'Attendance & productivity' },
  { href: '/store-admin/communication', label: 'Communication', icon: Megaphone, note: 'WhatsApp, SMS, push' },
  { href: '/store-admin/settings', label: 'Settings', icon: Settings2, note: 'Store controls' },
]

const ROUTE_META: Record<string, { title: string; subtitle: string; emoji: string }> = {
  '/store-admin': { title: 'Store Admin', subtitle: 'Outlet-level workforce control and compliance', emoji: '🏪' },
  '/store-admin/dashboard': { title: 'Store Dashboard', subtitle: 'Operational snapshot for the outlet', emoji: '📊' },
  '/store-admin/people': { title: 'People', subtitle: 'Employee directory and profile governance', emoji: '👥' },
  '/store-admin/attendance': { title: 'Attendance', subtitle: 'Live punches, exceptions, and corrections', emoji: '🕐' },
  '/store-admin/shifts': { title: 'Shifts & Rosters', subtitle: 'Coverage, swaps, and roster control', emoji: '🔄' },
  '/store-admin/leave': { title: 'Leave Management', subtitle: 'Approvals, balances, and staffing impact', emoji: '📅' },
  '/store-admin/performance': { title: 'Performance & Targets', subtitle: 'Category, brand, and employee KPIs', emoji: '🎯' },
  '/store-admin/incentives': { title: 'Incentives', subtitle: 'Earned slabs, projections, and approvals', emoji: '💰' },
  '/store-admin/payroll-preview': { title: 'Payroll Preview', subtitle: 'Readonly visibility before payroll lock', emoji: '🧾' },
  '/store-admin/compliance': { title: 'Compliance', subtitle: 'FOCO checks, violations, and audit trail', emoji: '🛡️' },
  '/store-admin/reports': { title: 'Reports', subtitle: 'Store productivity and statutory snapshots', emoji: '📈' },
  '/store-admin/communication': { title: 'Communication Center', subtitle: 'Announcements and operational alerts', emoji: '📣' },
  '/store-admin/settings': { title: 'Settings', subtitle: 'Shift, devices, approvals, and holidays', emoji: '⚙️' },
}

export default function StoreAdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/store-admin'
  const meta = ROUTE_META[pathname] || ROUTE_META['/store-admin']

  return (
    <div className="portal-shell store-admin-shell" style={{ minHeight: '100vh' }}>
      <aside className="portal-sidebar glass-sidebar">
        <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,140,66,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '14px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #FF6B35, #FFB347)', boxShadow: '0 8px 24px rgba(255,107,53,0.25)' }}>🏪</div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>Indipet Store</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Store Admin Portal</p>
            </div>
          </div>
          <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,140,66,0.18)', display: 'grid', gap: '4px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Outlet: Indipet Retail Hub</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Shift: Evening · Active staff: 18</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>MFA: Enabled for managers</p>
          </div>
        </div>

        <nav style={{ padding: '14px 10px 20px', display: 'grid', gap: '10px' }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.985 }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: active ? '1px solid rgba(255,140,66,0.35)' : '1px solid transparent',
                    background: active ? 'rgba(255,107,53,0.10)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ width: 34, height: 34, borderRadius: '11px', background: active ? 'rgba(255,140,66,0.18)' : 'rgba(255,255,255,0.04)', display: 'grid', placeItems: 'center', color: active ? 'var(--orange-light)' : 'var(--text-secondary)' }}>
                    <Icon size={15} />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>{item.note}</p>
                  </div>
                  {active && <ChevronRight size={14} style={{ color: 'var(--orange-light)' }} />}
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="portal-main">
        <header className="portal-topbar glass-strong" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <span style={{ fontSize: '22px' }}>{meta.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: '18px', lineHeight: 1.15 }}>{meta.title}</h1>
              <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>{meta.subtitle}</p>
            </div>
          </div>

          <div className="portal-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="portal-search-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,140,66,0.18)', background: 'rgba(255,255,255,0.03)', minWidth: '240px' }}>
              <Search size={14} color="rgba(255,220,180,0.55)" />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Search employee, attendance, leave...</span>
            </div>
            <button className="portal-icon-button" aria-label="Notifications">
              <Bell size={15} />
            </button>
          </div>
        </header>

        <main className="portal-content" style={{ padding: '24px 24px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}