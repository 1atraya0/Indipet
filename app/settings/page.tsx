'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'

const SETTINGS_SECTIONS = [
  {
    title: 'Hard Rules Configuration',
    icon: '⚖️',
    note: 'These rules are enforced at DB level. Modification logged in audit trail.',
    items: [
      { label: 'Rule 1: Minimum Staff for Roster', value: 'Enforced', status: 'active' },
      { label: 'Rule 2: Leave vs Critical Strength', value: 'Enforced', status: 'active' },
      { label: 'Rule 3: Shift-Attendance Lock', value: 'Enforced', status: 'active' },
      { label: 'Rule 4: Minimum Wage Guard', value: 'Enforced', status: 'active' },
    ]
  },
  {
    title: 'Notification Engine',
    icon: '🔔',
    note: '20+ system triggers configured.',
    items: [
      { label: 'Payroll Period Open', value: 'Email + SMS', status: 'active' },
      { label: 'Leave Pending > 48 hours', value: 'Push', status: 'active' },
      { label: 'Commission Pool Lock', value: 'Email', status: 'active' },
      { label: 'Min Wage Breach Alert', value: 'Email + SMS', status: 'active' },
      { label: 'Single Staff Mode', value: 'Push', status: 'active' },
    ]
  },
  {
    title: 'System Info',
    icon: '🐾',
    note: 'Indipet ERP v1.0 — Super Admin Portal',
    items: [
      { label: 'Version', value: 'v1.0.0', status: 'info' },
      { label: 'Database', value: 'Supabase (PostgreSQL)', status: 'info' },
      { label: 'Environment', value: 'Production', status: 'info' },
      { label: 'HR Admin Status', value: 'Unassigned — Absorbed by Super Admin', status: 'warning' },
    ]
  }
]

export default function SettingsPage() {
  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
        {SETTINGS_SECTIONS.map((section, si) => (
          <GlassCard key={section.title} delay={si * 0.1}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '22px' }}>{section.icon}</span>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{section.title}</h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{section.note}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {section.items.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.1 + i * 0.05 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,140,66,0.08)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span className={`badge ${item.status === 'active' ? 'badge-green' : item.status === 'warning' ? 'badge-yellow' : 'badge-blue'}`}>{item.value}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
