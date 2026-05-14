'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { CalendarDays, Clock3, FileText, Home, LifeBuoy, LogOut, Megaphone, ReceiptText, ShieldCheck, Sparkles, UserRound, Wallet } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ size?: number }>
}

const NAV_ITEMS: NavItem[] = [
  { href: '/employee/home', label: 'Home', icon: Home },
  { href: '/employee/attendance', label: 'My Attendance', icon: CalendarDays },
  { href: '/employee/shifts', label: 'My Shifts', icon: Clock3 },
  { href: '/employee/leave', label: 'My Leave', icon: FileText },
  { href: '/employee/payroll', label: 'My Payroll', icon: ReceiptText },
  { href: '/employee/incentives', label: 'My Incentives', icon: Wallet },
  { href: '/employee/performance', label: 'My Performance', icon: Sparkles },
  { href: '/employee/documents', label: 'Documents', icon: ShieldCheck },
  { href: '/employee/helpdesk', label: 'Helpdesk', icon: LifeBuoy },
  { href: '/employee/policies', label: 'Policies', icon: Megaphone },
  { href: '/employee/profile', label: 'Profile', icon: UserRound },
]

const ROUTE_META: Record<string, { title: string; subtitle: string; emoji: string }> = {
  '/employee': { title: 'Employee Portal', subtitle: 'Mobile-first self-service for retail staff', emoji: '📱' },
  '/employee/home': { title: 'Home', subtitle: 'Quick punch, attendance status, and alerts', emoji: '🏠' },
  '/employee/attendance': { title: 'My Attendance', subtitle: 'Punching, history, and corrections', emoji: '🕒' },
  '/employee/shifts': { title: 'My Shifts', subtitle: 'Today, weekly roster, and swaps', emoji: '🗓️' },
  '/employee/leave': { title: 'My Leave', subtitle: 'Balances, applications, and approvals', emoji: '📅' },
  '/employee/payroll': { title: 'My Payroll', subtitle: 'Salary, payslips, and statutory breakdown', emoji: '💸' },
  '/employee/incentives': { title: 'My Incentives', subtitle: 'Live earnings and target progress', emoji: '🎯' },
  '/employee/performance': { title: 'My Performance', subtitle: 'KPI score and monthly review', emoji: '📈' },
  '/employee/documents': { title: 'Documents', subtitle: 'ID proof, payslips, and forms', emoji: '📂' },
  '/employee/helpdesk': { title: 'Helpdesk', subtitle: 'Salary, attendance, or exit support', emoji: '🛟' },
  '/employee/policies': { title: 'Policies', subtitle: 'Handbook and acknowledgements', emoji: '📣' },
  '/employee/profile': { title: 'Profile', subtitle: 'Personal and bank details', emoji: '👤' },
}

export default function EmployeeChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/employee'
  const meta = ROUTE_META[pathname] || ROUTE_META['/employee']

  return (
    <div className="portal-shell employee-shell" style={{ minHeight: '100vh' }}>
      <aside className="portal-sidebar employee-sidebar glass-sidebar">
        <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,140,66,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '14px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #FF6B35, #FFB347)', boxShadow: '0 8px 24px rgba(255,107,53,0.25)' }}>🐾</div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>Indipet ESS</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Employee Self Service</p>
            </div>
          </div>
          <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,140,66,0.18)', display: 'grid', gap: '4px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Mobile-first access</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>OTP · QR · Biometric ready</p>
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
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</p>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div style={{ margin: '0 10px 14px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,66,0.12)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Link href="/employee/attendance" className="badge badge-orange" style={{ textDecoration: 'none' }}>Punch</Link>
          <Link href="/employee/leave" className="badge badge-blue" style={{ textDecoration: 'none' }}>Leave</Link>
          <Link href="/employee/helpdesk" className="badge badge-green" style={{ textDecoration: 'none' }}>Helpdesk</Link>
        </div>

        <div style={{ margin: '0 10px 14px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,140,66,0.12)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LogOut size={15} color="var(--text-muted)" />
          <Link href="/login" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>Logout</Link>
        </div>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="portal-pill" style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,66,0.18)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Attendance lock: active
            </div>
          </div>
        </header>

        <main className="portal-content" style={{ padding: '24px 24px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}