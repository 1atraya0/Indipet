'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { CommissionLedger } from '@/lib/types'
import { CheckCircle2, Lock } from 'lucide-react'

type LedgerWithEmployee = CommissionLedger & {
  employees: { full_name: string; employee_code: string } | null
  locations: { name: string; code: string } | null
}

const statusBadge = (s: CommissionLedger['status']) => {
  const map = { pending: 'badge-yellow', approved: 'badge-green', locked: 'badge-blue', paid: 'badge-green' }
  return <span className={`badge ${map[s]}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function CommissionPage() {
  const { data: ledger, loading, refetch } = useSupabaseTable<LedgerWithEmployee>(
    () => supabase.from('commission_ledger').select('*, employees(full_name, employee_code), locations(name, code)').order('created_at', { ascending: false }) as never,
    'commission_ledger'
  )

  const [tab, setTab] = useState<'ledger' | 'slabs'>('ledger')
  const [lockModal, setLockModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const SLABS = [
    { id: '1', designation: 'Senior Groomer', min_pct: 0, max_pct: 80, commission_rate: 3 },
    { id: '2', designation: 'Senior Groomer', min_pct: 80, max_pct: 100, commission_rate: 5 },
    { id: '3', designation: 'Senior Groomer', min_pct: 100, max_pct: 999, commission_rate: 8 },
    { id: '4', designation: 'Sales Executive', min_pct: 0, max_pct: 80, commission_rate: 4 },
    { id: '5', designation: 'Sales Executive', min_pct: 80, max_pct: 100, commission_rate: 6 },
    { id: '6', designation: 'Sales Executive', min_pct: 100, max_pct: 999, commission_rate: 10 },
  ]

  async function approveEntry(id: string) {
    setSaving(true)
    await supabase.from('commission_ledger').update({ status: 'approved', approved_by: 'super_admin' } as never).eq('id', id)
    await refetch()
    setSaving(false)
  }

  const pending = ledger.filter(l => l.status === 'pending').length
  const approved = ledger.filter(l => l.status === 'approved').length
  const totalApproved = ledger.filter(l => l.status === 'approved').reduce((a, l) => a + l.earned_amount, 0)

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Pending Approval" value={pending} icon="⏳" color="#FFB347" delay={0.05} loading={loading} />
        <StatCard label="Approved" value={approved} icon="✅" color="#34d399" delay={0.1} loading={loading} />
        <StatCard label="Total Approved" value={Math.round(totalApproved / 1000)} suffix="K" icon="💎" color="#a78bfa" delay={0.15} loading={loading} />
        <StatCard label="Active Slabs" value={SLABS.length} icon="📊" delay={0.2} loading={loading} />
      </div>

      <GlassCard delay={0.25} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            {(['ledger', 'slabs'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                color: tab === t ? 'var(--orange-light)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--orange)' : '2px solid transparent',
              }}>
                {t === 'ledger' ? '📒 Commission Ledger' : '📊 Commission Slabs'}
              </button>
            ))}
          </div>
          {tab === 'ledger' && (
            <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setLockModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px', fontSize: '12px', padding: '8px 14px' }}>
              <Lock size={12} /> Lock Pool
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'ledger' ? (
            <motion.div key="ledger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable loading={loading} data={ledger} emptyIcon="💎" emptyMessage="No commission records"
                columns={[
                  { key: 'employee', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.employees as { full_name: string } | null)?.full_name || `EMP-${row.employee_id.slice(-5).toUpperCase()}`}</span> },
                  { key: 'code', label: 'Code', render: row => (row.employees as { employee_code: string } | null)?.employee_code || '—' },
                  { key: 'store', label: 'Store', render: row => (row.locations as { name: string } | null)?.name || row.location_id },
                  { key: 'period', label: 'Period', render: row => `${monthNames[row.period_month - 1]} ${row.period_year}` },
                  { key: 'earned_amount', label: 'Earned', render: row => <span style={{ fontWeight: 700, color: 'var(--orange-light)' }}>₹{row.earned_amount.toLocaleString('en-IN')}</span> },
                  { key: 'status', label: 'Status', render: row => statusBadge(row.status) },
                  {
                    key: 'action', label: 'Action',
                    render: row => row.status === 'pending' ? (
                      <motion.button whileHover={{ scale: 1.05 }} onClick={() => !saving && approveEntry(row.id)}
                        style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(52,211,153,0.12)', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px', opacity: saving ? 0.6 : 1 }}>
                        <CheckCircle2 size={11} /> Approve
                      </motion.button>
                    ) : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                  },
                ]}
              />
            </motion.div>
          ) : (
            <motion.div key="slabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable loading={false} data={SLABS} emptyIcon="📊" emptyMessage="No slabs configured"
                columns={[
                  { key: 'designation', label: 'Designation', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.designation}</span> },
                  { key: 'min_pct', label: 'From %', render: row => `${row.min_pct}%` },
                  { key: 'max_pct', label: 'To %', render: row => row.max_pct === 999 ? '100%+' : `${row.max_pct}%` },
                  { key: 'commission_rate', label: 'Commission Rate', render: row => <span style={{ fontWeight: 700, color: 'var(--orange-light)' }}>{row.commission_rate}%</span> },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <AnimatePresence>
        {lockModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLockModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>🔒 Lock Commission Pool</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Locking the pool will freeze all pending commission entries. Ensure all approvals are complete before locking.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setLockModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={async () => {
                  await supabase.from('commission_ledger').update({ status: 'locked' } as never).eq('status', 'pending')
                  await refetch()
                  setLockModal(false)
                }}>Lock Pool</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
