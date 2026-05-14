'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { SalaryStructure } from '@/lib/types'
import { Plus, X } from 'lucide-react'

export default function SalaryStructurePage() {
  const { data, loading, refetch } = useSupabaseTable<SalaryStructure>(
    () => supabase.from('salary_structure_master').select('*').order('grade'),
    'salary_structure_master'
  )

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ grade: '', basic_percentage: 50, hra_percentage: 25, conveyance: 1500, da_percentage: 10, performance_cap: 8000 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase.from('salary_structure_master').insert([{
        grade: form.grade,
        basic_percentage: form.basic_percentage,
        hra_percentage: form.hra_percentage,
        conveyance: form.conveyance,
        da_percentage: form.da_percentage,
        performance_cap: form.performance_cap,
        is_active: true,
      }] as never)
      if (err) throw new Error(err.message)
      setShowModal(false)
      setForm({ grade: '', basic_percentage: 50, hra_percentage: 25, conveyance: 1500, da_percentage: 10, performance_cap: 8000 })
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create salary structure')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Grades" value={data.length} icon="📊" color="#a78bfa" delay={0.05} loading={loading} />
        <StatCard label="Active" value={data.filter(d => d.is_active).length} icon="✅" color="#34d399" delay={0.1} loading={loading} />
      </div>

      <GlassCard delay={0.15} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>Salary Structure Master</h2>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 0, fontSize: '12px', padding: '8px 14px' }}>
            <Plus size={12} /> Add Grade
          </motion.button>
        </div>
        <DataTable loading={loading} data={data} emptyIcon="📊" emptyMessage="No salary structures"
          columns={[
            { key: 'grade', label: 'Grade', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.grade}</span> },
            { key: 'basic_percentage', label: 'Basic %', render: row => `${row.basic_percentage}%` },
            { key: 'hra_percentage', label: 'HRA %', render: row => `${row.hra_percentage}%` },
            { key: 'conveyance', label: 'Conveyance', render: row => `₹${row.conveyance.toLocaleString('en-IN')}` },
            { key: 'da_percentage', label: 'DA %', render: row => `${row.da_percentage}%` },
            { key: 'performance_cap', label: 'Perf Cap', render: row => `₹${row.performance_cap.toLocaleString('en-IN')}` },
            { key: 'status', label: 'Status', render: row => row.is_active ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Inactive</span> },
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>📊 Add Salary Grade</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{error}</p>}
              <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grade (A/B/C/D/S)</label>
                  <input required className="glass-input" placeholder="A" value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value.toUpperCase() }))} maxLength={1} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Basic %</label>
                    <input required type="number" className="glass-input" value={form.basic_percentage} onChange={e => setForm(p => ({ ...p, basic_percentage: parseFloat(e.target.value) }))} min={0} max={100} step={0.5} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>HRA %</label>
                    <input required type="number" className="glass-input" value={form.hra_percentage} onChange={e => setForm(p => ({ ...p, hra_percentage: parseFloat(e.target.value) }))} min={0} max={100} step={0.5} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Conveyance (monthly)</label>
                  <input required type="number" className="glass-input" value={form.conveyance} onChange={e => setForm(p => ({ ...p, conveyance: parseFloat(e.target.value) }))} min={0} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>DA %</label>
                    <input required type="number" className="glass-input" value={form.da_percentage} onChange={e => setForm(p => ({ ...p, da_percentage: parseFloat(e.target.value) }))} min={0} max={100} step={0.5} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Performance Cap</label>
                    <input required type="number" className="glass-input" value={form.performance_cap} onChange={e => setForm(p => ({ ...p, performance_cap: parseFloat(e.target.value) }))} min={0} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Creating...' : 'Create Grade'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
