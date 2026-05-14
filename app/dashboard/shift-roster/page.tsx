'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { Roster, Shift } from '@/lib/types'
import { X, AlertTriangle } from 'lucide-react'

type RosterWithJoins = Roster & {
  employees: { full_name: string } | null
  locations: { name: string } | null
  shifts: { name: string; start_time: string; end_time: string } | null
}

const statusBadge = (s: Roster['status']) => {
  const map = { scheduled: 'badge-yellow', confirmed: 'badge-green', overridden: 'badge-orange' }
  return <span className={`badge ${map[s]}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
}

export default function ShiftRosterPage() {
  const { data: rosters, loading: rosterLoading, refetch: refetchRosters } = useSupabaseTable<RosterWithJoins>(
    () => supabase.from('rosters').select('*, employees(full_name), locations(name), shifts(name, start_time, end_time)').order('date', { ascending: false }) as never,
    'rosters'
  )
  const { data: shifts, loading: shiftLoading } = useSupabaseTable<Shift>(
    () => supabase.from('shifts').select('*').order('name'),
    'shifts'
  )

  const [tab, setTab] = useState<'roster' | 'shifts'>('roster')
  const [generateModal, setGenerateModal] = useState(false)
  const [generateForm, setGenerateForm] = useState({ location: '', week: '' })
  const [overrideModal, setOverrideModal] = useState<string | null>(null)
  const [overrideReason, setOverrideReason] = useState('')
  const [saving, setSaving] = useState(false)

  const loading = rosterLoading || shiftLoading

  async function confirmOverride(id: string) {
    setSaving(true)
    await supabase.from('rosters').update({ status: 'overridden', override_reason: overrideReason } as never).eq('id', id)
    await refetchRosters()
    setSaving(false)
    setOverrideModal(null)
    setOverrideReason('')
  }

  const confirmed = rosters.filter(r => r.status === 'confirmed').length
  const overridden = rosters.filter(r => r.status === 'overridden').length
  const activeShifts = shifts.filter(s => s.is_active).length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Scheduled Today" value={rosters.length} icon="📆" delay={0.05} loading={loading} />
        <StatCard label="Confirmed" value={confirmed} icon="✅" color="#34d399" delay={0.1} loading={loading} />
        <StatCard label="Overridden" value={overridden} icon="⚠️" color="#FFB347" delay={0.15} loading={loading} />
        <StatCard label="Active Shifts" value={activeShifts} icon="🔄" color="#a78bfa" delay={0.2} loading={loading} />
      </div>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <AlertTriangle size={15} style={{ color: '#fca5a5', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#fca5a5', margin: 0 }}>Hard Rule 1 Active</p>
          <p style={{ fontSize: '11px', color: 'rgba(252,165,165,0.7)', marginTop: '2px' }}>Roster generation will be blocked if any store falls below minimum staff strength. Override requires logged reason.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setGenerateModal(true)} style={{ marginLeft: 'auto', flexShrink: 0 }}>
          Generate Roster
        </motion.button>
      </motion.div>

      <GlassCard delay={0.3} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)' }}>
          {(['roster', 'shifts'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, color: tab === t ? 'var(--orange-light)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--orange)' : '2px solid transparent',
            }}>
              {t === 'roster' ? '📋 Roster' : '⏰ Shift Policies'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'roster' ? (
            <motion.div key="roster" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable
                loading={rosterLoading}
                data={rosters}
                emptyIcon="📆"
                emptyMessage="No roster entries"
                columns={[
                  { key: 'employee', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.employees as { full_name: string } | null)?.full_name || `EMP-${row.employee_id.slice(-5).toUpperCase()}`}</span> },
                  { key: 'location', label: 'Location', render: row => (row.locations as { name: string } | null)?.name || row.location_id },
                  { key: 'shift', label: 'Shift', render: row => {
                    const s = row.shifts as { name: string; start_time: string; end_time: string } | null
                    return s ? `${s.name} (${s.start_time}–${s.end_time})` : row.shift_id
                  }},
                  { key: 'date', label: 'Date', render: row => new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  { key: 'status', label: 'Status', render: row => statusBadge(row.status) },
                  {
                    key: 'action', label: 'Override',
                    render: row => (
                      <motion.button whileHover={{ scale: 1.05 }} onClick={() => setOverrideModal(row.id)}
                        style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(255,107,53,0.12)', color: '#FFB347' }}>
                        Override
                      </motion.button>
                    )
                  },
                ]}
              />
            </motion.div>
          ) : (
            <motion.div key="shifts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable
                loading={shiftLoading}
                data={shifts}
                emptyIcon="⏰"
                emptyMessage="No shifts configured"
                columns={[
                  { key: 'name', label: 'Shift Name', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span> },
                  { key: 'start_time', label: 'Start' },
                  { key: 'end_time', label: 'End' },
                  { key: 'location_id', label: 'Location', render: row => row.location_id ? <span className="badge badge-blue">{row.location_id}</span> : <span className="badge badge-orange">All</span> },
                  { key: 'is_active', label: 'Status', render: row => row.is_active ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Inactive</span> },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <AnimatePresence>
        {generateModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGenerateModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>📆 Generate Roster</h2>
                <button onClick={() => setGenerateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location</label>
                  <select className="glass-input" value={generateForm.location} onChange={e => setGenerateForm(p => ({ ...p, location: e.target.value }))}>
                    <option value="">All Locations</option>
                    {Array.from(new Set(rosters.map(r => r.location_id))).map(lid => (
                      <option key={lid} value={lid}>{lid}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Week Starting</label>
                  <input type="date" className="glass-input" value={generateForm.week} onChange={e => setGenerateForm(p => ({ ...p, week: e.target.value }))} />
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.15)', display: 'flex', gap: '8px' }}>
                  <AlertTriangle size={13} style={{ color: '#FFB347', flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>System will verify minimum staff strength before generating. Blocked stores will appear in a review list.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setGenerateModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={() => setGenerateModal(false)}>🔄 Generate</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {overrideModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOverrideModal(null)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>⚠️ Roster Override</h2>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reason for Override *</label>
                <textarea className="glass-input" rows={3} placeholder="Critical staffing need, emergency cover..." value={overrideReason} onChange={e => setOverrideReason(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setOverrideModal(null)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2 }} disabled={!overrideReason || saving} onClick={() => overrideModal && confirmOverride(overrideModal)}>
                  {saving ? 'Saving...' : 'Confirm Override'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
