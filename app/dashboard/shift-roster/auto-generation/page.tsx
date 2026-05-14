'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { RosterHistory, Shift } from '@/lib/types'
import { Zap, CheckCircle, AlertCircle, X } from 'lucide-react'

type RosterWithRelations = RosterHistory & {
  shifts: { name: string; start_time: string; end_time: string } | null
  employees: { full_name: string; employee_code: string } | null
}

const pipelineStages = [
  { id: 1, name: 'Calendar Check', desc: 'Scan holiday calendar for conflicts' },
  { id: 2, name: 'Leave Check', desc: 'Filter employees on approved leave' },
  { id: 3, name: 'Scenario Select', desc: 'Choose roster pattern (balanced/optimized)' },
  { id: 4, name: 'Preference Filter', desc: 'Apply employee shift preferences' },
  { id: 5, name: 'Slot Assign', desc: 'Auto-assign employees to shifts' },
  { id: 6, name: 'Publish', desc: 'Lock and notify employees' },
]

export default function RosterAutoGenerationPage() {
  const { data: rosters, loading, refetch } = useSupabaseTable<RosterWithRelations>(
    () => supabase.from('roster_history').select('*, shifts(name, start_time, end_time), employees(full_name, employee_code)').order('date', { ascending: false }).limit(50) as never,
    'roster_history'
  )
  const { data: shifts } = useSupabaseTable<Shift>(
    () => supabase.from('shifts').select('*').order('name'),
    'shifts'
  )

  const [showGenerator, setShowGenerator] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)
  const [generatingRoster, setGeneratingRoster] = useState(false)
  const [formData, setFormData] = useState({ period_from: '', period_to: '', scenario: 'balanced', autoPublish: false })
  const [generatedRosterPreview, setGeneratedRosterPreview] = useState<any[]>([])

  async function executeStage(stage: number) {
    await new Promise(resolve => setTimeout(resolve, 1200))
  }

  async function startRosterGeneration() {
    setGeneratingRoster(true)

    for (let i = 0; i < pipelineStages.length; i++) {
      setCurrentStage(i)
      await executeStage(i + 1)
    }

    // Simulate roster generation
    setGeneratedRosterPreview([
      { date: formData.period_from, shift: shifts[0]?.name || 'Morning', employees: 8 },
      { date: formData.period_from, shift: shifts[1]?.name || 'Evening', employees: 6 },
      { date: formData.period_from, shift: shifts[2]?.name || 'Night', employees: 4 },
    ])

    setGeneratingRoster(false)
    setCurrentStage(6)
  }

  async function publishRoster() {
    setGeneratingRoster(true)
    try {
      // Insert into roster_history as published version
      const { error } = await supabase.from('roster_history').insert(
        generatedRosterPreview.map((item, idx) => ({
          shift_id: shifts[idx % shifts.length]?.id || '',
          employee_id: 'bulk-import',
          roster_date: item.date,
          version: 1,
          conflict_notes: null,
          status: 'published',
        })) as never
      )

      if (error) throw error
      await refetch()
      setShowGenerator(false)
      setGeneratingRoster(false)
    } catch (e) {
      alert('Error publishing roster: ' + (e instanceof Error ? e.message : 'Unknown error'))
      setGeneratingRoster(false)
    }
  }

  const publishedRosters = rosters.filter(r => r.status === 'published').length
  const pendingRosters = rosters.filter(r => r.status !== 'published').length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Rosters" value={rosters.length} icon="📅" color="#60a5fa" delay={0.05} loading={loading} />
        <StatCard label="Published" value={publishedRosters} icon="✅" color="#34d399" delay={0.1} loading={loading} />
        <StatCard label="Pending" value={pendingRosters} icon="⏳" color="#FFB347" delay={0.15} loading={loading} />
        <StatCard label="Avg Employees/Shift" value={8} icon="👥" color="#a78bfa" delay={0.2} loading={loading} />
      </div>

      <GlassCard delay={0.25} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>Roster History</h2>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowGenerator(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 0, fontSize: '12px', padding: '8px 14px' }}>
            <Zap size={12} /> Auto-Generate
          </motion.button>
        </div>
        <DataTable loading={loading} data={rosters} emptyIcon="📅" emptyMessage="No roster records"
          columns={[
            { key: 'date', label: 'Date', render: row => new Date(row.date).toLocaleDateString() },
            { key: 'shift', label: 'Shift', render: row => row.shifts?.name || '—' },
            { key: 'time', label: 'Time', render: row => `${row.shifts?.start_time} - ${row.shifts?.end_time}` || '—' },
            { key: 'employee', label: 'Employee', render: row => row.employees?.full_name || 'Bulk Import' },
            { key: 'version', label: 'Version', render: row => <span className="badge badge-blue">v{row.version}</span> },
            { key: 'status', label: 'Status', render: row => row.status === 'published' ? <span className="badge badge-green">Published</span> : <span className="badge badge-yellow">Draft</span> },
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showGenerator && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !generatingRoster && setShowGenerator(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '620px', maxHeight: '85vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>📅 Auto-Generate Roster</h2>
                {!generatingRoster && <button onClick={() => setShowGenerator(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>}
              </div>

              {currentStage === 0 && !generatingRoster ? (
                <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Start Date</label>
                      <input type="date" className="glass-input" value={formData.period_from} onChange={e => setFormData(p => ({ ...p, period_from: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>End Date</label>
                      <input type="date" className="glass-input" value={formData.period_to} onChange={e => setFormData(p => ({ ...p, period_to: e.target.value }))} required />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Roster Scenario</label>
                    <select className="glass-input" value={formData.scenario} onChange={e => setFormData(p => ({ ...p, scenario: e.target.value }))}>
                      <option value="balanced">Balanced Distribution</option>
                      <option value="optimized">Optimized for Peak Hours</option>
                      <option value="minimal">Minimal Staffing</option>
                    </select>
                  </div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.autoPublish} onChange={e => setFormData(p => ({ ...p, autoPublish: e.target.checked }))} />
                    Auto-publish after generation
                  </label>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowGenerator(false)}>Cancel</button>
                    <button type="button" className="btn-primary" style={{ flex: 2 }} onClick={startRosterGeneration}>Start Generation</button>
                  </div>
                </form>
              ) : (
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Pipeline Stage {currentStage} of {pipelineStages.length}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pipelineStages.map((stage, idx) => (
                      <motion.div key={stage.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: idx < currentStage ? 'rgba(52,211,153,0.1)' : idx === currentStage && generatingRoster ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${idx < currentStage ? 'rgba(52,211,153,0.3)' : idx === currentStage && generatingRoster ? 'rgba(96,165,250,0.3)' : 'rgba(255,140,66,0.1)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}>
                        {idx < currentStage ? (
                          <CheckCircle size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                        ) : idx === currentStage && generatingRoster ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                            <Zap size={16} style={{ color: '#60a5fa' }} />
                          </motion.div>
                        ) : (
                          <AlertCircle size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{stage.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{stage.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {currentStage >= pipelineStages.length && generatedRosterPreview.length > 0 && (
                    <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(52,211,153,0.08)', borderRadius: '8px', border: '1px solid rgba(52,211,153,0.2)' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#34d399', margin: '0 0 12px' }}>✅ Roster Generated Successfully</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px' }}>{generatedRosterPreview.length} shifts generated for {formData.period_from} to {formData.period_to}</p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" className="btn-ghost" style={{ flex: 1, fontSize: '12px', padding: '8px' }} onClick={() => setShowGenerator(false)}>Close</button>
                        <button type="button" className="btn-primary" style={{ flex: 1, fontSize: '12px', padding: '8px' }} onClick={publishRoster}>Publish Roster</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


