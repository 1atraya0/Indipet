'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { WarningRecord, AdvanceSalary } from '@/lib/types'
import { Plus, X } from 'lucide-react'

type WarningWithEmployee = WarningRecord & {
  employees: { full_name: string; employee_code: string } | null
}

type AdvanceWithEmployee = AdvanceSalary & {
  employees: { full_name: string; employee_code: string } | null
}

const LEAVE_POLICIES = [
  { id: '1', type: 'PL', name: 'Privileged Leave', entitlement: 15, encashable: true, carry_forward: 10 },
  { id: '2', type: 'CL', name: 'Casual Leave', entitlement: 12, encashable: false, carry_forward: 0 },
  { id: '3', type: 'ML', name: 'Medical Leave', entitlement: 7, encashable: false, carry_forward: 0 },
  { id: '4', type: 'CO', name: 'Compensatory Off', entitlement: 0, encashable: false, carry_forward: 3 },
  { id: '5', type: 'LOP', name: 'Loss of Pay', entitlement: 0, encashable: false, carry_forward: 0 },
]

const tabs = ['warnings', 'advance', 'leave_policy'] as const
const tabLabels = { warnings: '⚠️ Disciplinary', advance: '💵 Advance Salary', leave_policy: '📋 Leave Policies' }

export default function HRAdminPage() {
  const { data: warnings, loading: wLoading, refetch: refetchWarnings } = useSupabaseTable<WarningWithEmployee>(
    () => supabase.from('warning_records').select('*, employees(full_name, employee_code)').order('issued_at', { ascending: false }) as never,
    'warning_records'
  )
  const { data: advances, loading: aLoading, refetch: refetchAdvances } = useSupabaseTable<AdvanceWithEmployee>(
    () => supabase.from('advance_salary').select('*, employees(full_name, employee_code)').order('created_at', { ascending: false }) as never,
    'advance_salary'
  )

  const [tab, setTab] = useState<typeof tabs[number]>('warnings')
  const [warnModal, setWarnModal] = useState(false)
  const [warnForm, setWarnForm] = useState({ employee_id: '', reason: '', action_type: 'warning' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loading = wLoading || aLoading

  async function submitWarning(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase.from('warning_records').insert([{
        employee_id: warnForm.employee_id,
        reason: warnForm.reason,
        issued_by: 'super_admin',
        issued_at: new Date().toISOString(),
        action_type: warnForm.action_type,
      }] as never)
      if (err) throw new Error(err.message)
      setWarnModal(false)
      setWarnForm({ employee_id: '', reason: '', action_type: 'warning' })
      await refetchWarnings()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to issue warning')
    } finally { setSaving(false) }
  }

  async function approveAdvance(id: string) {
    await supabase.from('advance_salary').update({ status: 'approved', approved_by: 'super_admin' } as never).eq('id', id)
    await refetchAdvances()
  }

  const activeWarnings = warnings.length
  const activeAdvances = advances.filter(a => a.status === 'active' || a.status === 'approved').length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Disciplinary Records" value={activeWarnings} icon="⚠️" color="#f87171" delay={0.05} loading={loading} />
        <StatCard label="Active Advances" value={activeAdvances} icon="💵" color="#FFB347" delay={0.1} loading={loading} />
        <StatCard label="Leave Types" value={LEAVE_POLICIES.length} icon="📋" color="#34d399" delay={0.15} />
        <StatCard label="Total Advances" value={Math.round(advances.reduce((a, x) => a + x.amount, 0) / 1000)} suffix="K" icon="💰" color="#a78bfa" delay={0.2} loading={aLoading} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,107,53,0.07)', border: '1px solid rgba(255,107,53,0.2)', display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <span style={{ fontSize: '16px' }}>🐾</span>
        <p style={{ fontSize: '12.5px', color: 'var(--orange-light)', margin: 0 }}>
          <strong>HR Admin functions absorbed by Super Admin</strong> at go-live. When HR Admin is hired, these will transfer to their role automatically.
        </p>
      </motion.div>

      <GlassCard delay={0.3} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto' }}>
          <div style={{ display: 'flex' }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, whiteSpace: 'nowrap',
                color: tab === t ? 'var(--orange-light)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--orange)' : '2px solid transparent',
              }}>
                {tabLabels[t]}
              </button>
            ))}
          </div>
          {tab === 'warnings' && (
            <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setWarnModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px', fontSize: '12px', padding: '8px 14px', flexShrink: 0 }}>
              <Plus size={12} /> Issue Warning
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'warnings' && (
            <motion.div key="warnings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable data={warnings} loading={wLoading} emptyIcon="✅" emptyMessage="No disciplinary records"
                columns={[
                  { key: 'employee', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.employees as { full_name: string } | null)?.full_name || `EMP-${row.employee_id.slice(-5).toUpperCase()}`}</span> },
                  { key: 'code', label: 'Code', render: row => (row.employees as { employee_code: string } | null)?.employee_code || '—' },
                  { key: 'action_type', label: 'Action', render: row => <span className={`badge ${row.action_type === 'warning' ? 'badge-yellow' : row.action_type === 'suspension' ? 'badge-orange' : 'badge-red'}`}>{row.action_type.charAt(0).toUpperCase() + row.action_type.slice(1)}</span> },
                  { key: 'reason', label: 'Reason' },
                  { key: 'issued_at', label: 'Date', render: row => new Date(row.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  { key: 'issued_by', label: 'Issued By' },
                ]}
              />
            </motion.div>
          )}
          {tab === 'advance' && (
            <motion.div key="advance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable data={advances} loading={aLoading} emptyIcon="💵" emptyMessage="No advance records"
                columns={[
                  { key: 'employee', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.employees as { full_name: string } | null)?.full_name || `EMP-${row.employee_id.slice(-5).toUpperCase()}`}</span> },
                  { key: 'code', label: 'Code', render: row => (row.employees as { employee_code: string } | null)?.employee_code || '—' },
                  { key: 'amount', label: 'Amount', render: row => <span style={{ fontWeight: 700, color: 'var(--orange-light)' }}>₹{row.amount.toLocaleString('en-IN')}</span> },
                  { key: 'status', label: 'Status', render: row => {
                    const map: Record<string, string> = { pending: 'badge-yellow', approved: 'badge-blue', active: 'badge-orange', recovered: 'badge-green', written_off: 'badge-red' }
                    return <span className={`badge ${map[row.status] || 'badge-yellow'}`}>{row.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                  }},
                  { key: 'recovery', label: 'Recovery From', render: row => row.recovery_start_month && row.recovery_start_year ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][row.recovery_start_month - 1]} ${row.recovery_start_year}` : '—' },
                  { key: 'action', label: 'Action', render: row => row.status === 'pending' ? (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => approveAdvance(row.id)}
                      style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(52,211,153,0.12)', color: '#6ee7b7' }}>
                      Approve
                    </motion.button>
                  ) : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span> },
                ]}
              />
            </motion.div>
          )}
          {tab === 'leave_policy' && (
            <motion.div key="leave_policy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable data={LEAVE_POLICIES} loading={false} emptyIcon="📋" emptyMessage="No leave policies"
                columns={[
                  { key: 'type', label: 'Type', render: row => <span className="badge badge-blue">{row.type}</span> },
                  { key: 'name', label: 'Name', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span> },
                  { key: 'entitlement', label: 'Annual Days', render: row => row.entitlement ? `${row.entitlement} days` : '—' },
                  { key: 'carry_forward', label: 'Carry Forward', render: row => row.carry_forward ? `${row.carry_forward} days` : 'None' },
                  { key: 'encashable', label: 'Encashable', render: row => row.encashable ? <span className="badge badge-green">Yes</span> : <span className="badge badge-red">No</span> },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <AnimatePresence>
        {warnModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setWarnModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>⚠️ Issue Warning</h2>
                <button onClick={() => setWarnModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{error}</p>}
              <form onSubmit={submitWarning} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employee ID</label>
                  <input required className="glass-input" placeholder="emp-001" value={warnForm.employee_id} onChange={e => setWarnForm(p => ({ ...p, employee_id: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action Type</label>
                  <select className="glass-input" value={warnForm.action_type} onChange={e => setWarnForm(p => ({ ...p, action_type: e.target.value }))}>
                    <option value="warning">Warning</option>
                    <option value="suspension">Suspension</option>
                    <option value="termination">Termination</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reason</label>
                  <textarea required className="glass-input" rows={3} placeholder="Detailed reason for disciplinary action..." value={warnForm.reason} onChange={e => setWarnForm(p => ({ ...p, reason: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setWarnModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Saving...' : 'Issue Warning'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
