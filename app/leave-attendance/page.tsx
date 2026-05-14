'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { LeaveRequest, Attendance } from '@/lib/types'
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react'

const leaveTypeColor: Record<string, string> = { PL: '#60a5fa', CL: '#34d399', ML: '#a78bfa', CO: '#FFB347', LOP: '#f87171' }

const statusBadge = (s: LeaveRequest['status']) => {
  const map = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red', cancelled: 'badge-red' }
  return <span className={`badge ${map[s]}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
}

export default function LeaveAttendancePage() {
  const { data: leaves, loading: leavesLoading, refetch: refetchLeaves } = useSupabaseTable<LeaveRequest>(
    () => supabase.from('leave_requests').select('*').order('created_at', { ascending: false }),
    'leave_requests'
  )
  const { data: attendance, loading: attLoading, refetch: refetchAtt } = useSupabaseTable<Attendance>(
    () => supabase.from('attendance').select('*').order('date', { ascending: false }),
    'attendance'
  )

  const [tab, setTab] = useState<'leave' | 'attendance'>('leave')
  const [overrideModal, setOverrideModal] = useState<{ id: string; empId: string } | null>(null)
  const [overrideReason, setOverrideReason] = useState('')
  const [saving, setSaving] = useState(false)

  async function approveLeave(id: string) {
    await supabase.from('leave_requests').update({ status: 'approved', approved_by: 'super_admin', approved_at: new Date().toISOString() } as never).eq('id', id)
    await refetchLeaves()
  }

  async function rejectLeave(id: string) {
    await supabase.from('leave_requests').update({ status: 'rejected', approved_by: 'super_admin', approved_at: new Date().toISOString() } as never).eq('id', id)
    await refetchLeaves()
  }

  async function confirmOverride() {
    if (!overrideModal) return
    setSaving(true)
    await supabase.from('attendance').update({ biometric_override: true, override_reason: overrideReason } as never).eq('id', overrideModal.id)
    await refetchAtt()
    setSaving(false)
    setOverrideModal(null)
    setOverrideReason('')
  }

  const pending = leaves.filter(l => l.status === 'pending').length
  const approved = leaves.filter(l => l.status === 'approved').length
  const plCount = leaves.filter(l => l.leave_type === 'PL').length
  const presentCount = attendance.filter(a => a.status === 'present').length
  const attRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Pending Approvals" value={pending} icon="⏳" color="#FFB347" delay={0.05} loading={leavesLoading} />
        <StatCard label="Approved" value={approved} icon="✅" color="#34d399" delay={0.1} loading={leavesLoading} />
        <StatCard label="PL Requests" value={plCount} icon="🌴" color="#60a5fa" delay={0.15} loading={leavesLoading} />
        <StatCard label="Attendance Rate" value={attRate} suffix="%" icon="📊" color="#a78bfa" delay={0.2} loading={attLoading} />
      </div>

      <GlassCard delay={0.25} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,140,66,0.1)' }}>
          {(['leave', 'attendance'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '16px 24px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em',
              color: tab === t ? 'var(--orange-light)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--orange)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}>
              {t === 'leave' ? '📅 Leave Requests' : '🕐 Attendance'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'leave' ? (
            <motion.div key="leave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable
                loading={leavesLoading}
                data={leaves}
                emptyIcon="📅"
                emptyMessage="No leave requests"
                columns={[
                  { key: 'employee_id', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>EMP-{row.employee_id.slice(-5).toUpperCase()}</span> },
                  { key: 'leave_type', label: 'Type', render: row => <span className="badge" style={{ background: `${leaveTypeColor[row.leave_type]}18`, color: leaveTypeColor[row.leave_type], border: `1px solid ${leaveTypeColor[row.leave_type]}30` }}>{row.leave_type}</span> },
                  { key: 'from_date', label: 'From', render: row => new Date(row.from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
                  { key: 'to_date', label: 'To', render: row => new Date(row.to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
                  { key: 'days', label: 'Days', render: row => <span style={{ fontWeight: 600 }}>{row.days}d</span> },
                  { key: 'reason', label: 'Reason' },
                  { key: 'status', label: 'Status', render: row => statusBadge(row.status) },
                  {
                    key: 'actions', label: 'Action',
                    render: row => row.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => approveLeave(row.id)}
                          style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(52,211,153,0.12)', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={11} /> Approve
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => rejectLeave(row.id)}
                          style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.12)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <XCircle size={11} /> Reject
                        </motion.button>
                      </div>
                    ) : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                  },
                ]}
              />
            </motion.div>
          ) : (
            <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable
                loading={attLoading}
                data={attendance}
                emptyIcon="🕐"
                emptyMessage="No attendance records"
                columns={[
                  { key: 'employee_id', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>EMP-{row.employee_id.slice(-5).toUpperCase()}</span> },
                  { key: 'date', label: 'Date', render: row => new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
                  { key: 'check_in', label: 'Check In', render: row => row.check_in || '—' },
                  { key: 'check_out', label: 'Check Out', render: row => row.check_out || '—' },
                  { key: 'status', label: 'Status', render: row => {
                    const colorMap: Record<string, string> = { present: 'badge-green', half_day: 'badge-yellow', on_leave: 'badge-blue', absent: 'badge-red', holiday: 'badge-blue' }
                    return <span className={`badge ${colorMap[row.status] || 'badge-red'}`}>{row.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                  }},
                  { key: 'biometric_verified', label: 'Biometric', render: row => row.biometric_verified
                    ? <span className="badge badge-green"><CheckCircle2 size={10} /> Verified</span>
                    : row.biometric_override
                      ? <span className="badge badge-yellow"><AlertTriangle size={10} /> Overridden</span>
                      : <span className="badge badge-red"><AlertTriangle size={10} /> Failed</span>
                  },
                  { key: 'override', label: 'Override', render: row => !row.biometric_verified && !row.biometric_override ? (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setOverrideModal({ id: row.id, empId: row.employee_id })}
                      style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(255,107,53,0.12)', color: '#FFB347' }}>
                      Override
                    </motion.button>
                  ) : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span> }
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <AnimatePresence>
        {overrideModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOverrideModal(null)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>⚠️ Biometric Override</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>EMP-{overrideModal.empId.slice(-5).toUpperCase()} — will be logged in audit trail</p>
                </div>
                <button onClick={() => setOverrideModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Override Reason *</label>
                <textarea className="glass-input" rows={3} placeholder="Device malfunction, manual verification done..." value={overrideReason} onChange={e => setOverrideReason(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setOverrideModal(null)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={confirmOverride} disabled={!overrideReason || saving}>
                  {saving ? 'Saving...' : '✓ Confirm Override'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
