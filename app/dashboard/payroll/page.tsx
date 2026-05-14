'use client'

import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { PayrollPeriod } from '@/lib/types'
import { Lock, Unlock, Send, AlertTriangle, X, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const statusBadge = (s: PayrollPeriod['status']) => {
  const map = { open: 'badge-yellow', locked: 'badge-blue', processing: 'badge-orange', dispatched: 'badge-green', blocked: 'badge-red' }
  return <span className={`badge ${map[s]}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
}

export default function PayrollPage() {
  const { data: periods, loading, refetch } = useSupabaseTable<PayrollPeriod>(
    () => supabase.from('payroll_periods').select('*').order('period_year', { ascending: false }).order('period_month', { ascending: false }),
    'payroll_periods'
  )

  const [dispatchModal, setDispatchModal] = useState<PayrollPeriod | null>(null)
  const [unlockModal, setUnlockModal] = useState<PayrollPeriod | null>(null)
  const [unlockReason, setUnlockReason] = useState('')
  const [saving, setSaving] = useState(false)

  async function lockPeriod(id: string) {
    await supabase.from('payroll_periods').update({ status: 'locked' } as never).eq('id', id)
    await refetch()
  }

  async function dispatchPayroll(period: PayrollPeriod) {
    setSaving(true)
    await supabase.from('payroll_periods').update({ status: 'dispatched', dispatched_at: new Date().toISOString() } as never).eq('id', period.id)
    await refetch()
    setSaving(false)
    setDispatchModal(null)
  }

  async function unlockPeriod(period: PayrollPeriod) {
    setSaving(true)
    await supabase.from('payroll_periods').update({ status: 'open', blocked_reason: null } as never).eq('id', period.id)
    await refetch()
    setSaving(false)
    setUnlockModal(null)
    setUnlockReason('')
  }

  const open = periods.filter(p => p.status === 'open').length
  const blocked = periods.filter(p => p.status === 'blocked').length
  const dispatched = periods.filter(p => p.status === 'dispatched').length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Open Periods" value={open} icon="📅" color="#FFB347" delay={0.05} loading={loading} />
        <StatCard label="Blocked" value={blocked} icon="🚫" color="#f87171" delay={0.1} loading={loading} />
        <StatCard label="Dispatched" value={dispatched} icon="✅" color="#34d399" delay={0.15} loading={loading} />
        <StatCard label="Total Periods" value={periods.length} icon="💰" delay={0.2} loading={loading} />
      </div>

      {blocked > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-start' }}>
          <AlertTriangle size={15} style={{ color: '#fca5a5', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fca5a5', margin: 0 }}>Hard Rule 4 Triggered — Payroll Blocked</p>
            <p style={{ fontSize: '11.5px', color: 'rgba(252,165,165,0.7)', marginTop: '3px' }}>Minimum wage breach detected. Resolve compliance exceptions before payroll can proceed.</p>
          </div>
        </motion.div>
      )}

      <GlassCard delay={0.25} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,140,66,0.1)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>💰 Payroll Periods</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Manage lock dates and dispatch to Finance</p>
        </div>
        <DataTable
          loading={loading}
          data={periods}
          emptyIcon="💰"
          emptyMessage="No payroll periods"
          columns={[
            { key: 'period', label: 'Period', render: row => <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{monthNames[row.period_month - 1]} {row.period_year}</span> },
            { key: 'start_date', label: 'Start', render: row => new Date(row.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
            { key: 'end_date', label: 'End', render: row => new Date(row.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
            { key: 'lock_date', label: 'Lock Date', render: row => new Date(row.lock_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
            { key: 'status', label: 'Status', render: row => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {statusBadge(row.status)}
                {row.blocked_reason && <span style={{ fontSize: '10px', color: '#fca5a5', lineHeight: 1.3 }}>{row.blocked_reason}</span>}
              </div>
            )},
            { key: 'dispatched_at', label: 'Dispatched', render: row => row.dispatched_at ? new Date(row.dispatched_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—' },
            {
              key: 'actions', label: 'Actions',
              render: row => (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {row.status === 'open' && (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => lockPeriod(row.id)}
                      style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={11} /> Lock
                    </motion.button>
                  )}
                  {row.status === 'locked' && (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setDispatchModal(row)}
                      style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(52,211,153,0.12)', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Send size={11} /> Dispatch
                    </motion.button>
                  )}
                  {row.status === 'blocked' && (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setUnlockModal(row)}
                      style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.12)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Unlock size={11} /> Unblock
                    </motion.button>
                  )}
                </div>
              )
            },
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {dispatchModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDispatchModal(null)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📤</div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Dispatch Payroll</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {dispatchModal && `${monthNames[dispatchModal.period_month - 1]} ${dispatchModal.period_year}`} payroll will be sent to Finance.
                </p>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.15)', marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>⚠️ Finance does not have an HRMS portal login. They will receive a structured report. This action cannot be undone.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setDispatchModal(null)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2 }} disabled={saving} onClick={() => dispatchModal && dispatchPayroll(dispatchModal)}>
                  <Send size={13} style={{ display: 'inline', marginRight: '6px' }} />{saving ? 'Processing...' : 'Confirm Dispatch'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {unlockModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUnlockModal(null)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🔓 Unblock Payroll Period</h2>
                <button onClick={() => setUnlockModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Confirm compliance exceptions have been resolved before unblocking.</p>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resolution Details *</label>
                <textarea className="glass-input" rows={3} placeholder="Minimum wage updated for affected employees..." value={unlockReason} onChange={e => setUnlockReason(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setUnlockModal(null)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2 }} disabled={!unlockReason || saving} onClick={() => unlockModal && unlockPeriod(unlockModal)}>
                  <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '6px' }} />{saving ? 'Saving...' : 'Unblock Period'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
