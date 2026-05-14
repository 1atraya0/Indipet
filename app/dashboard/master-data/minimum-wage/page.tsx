'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { MinimumWage } from '@/lib/types'
import { Plus, X } from 'lucide-react'

const states = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']

export default function MinimumWagePage() {
  const { data, loading, refetch } = useSupabaseTable<MinimumWage>(
    () => supabase.from('minimum_wage_master').select('*').order('state'),
    'minimum_wage_master'
  )

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ state: '', category: 'skilled', effective_date: new Date().toISOString().split('T')[0], daily_wage: 0, monthly_wage: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase.from('minimum_wage_master').insert([{
        state: form.state,
        category: form.category,
        effective_date: form.effective_date,
        daily_wage: form.daily_wage,
        monthly_wage: form.monthly_wage,
      }] as never)
      if (err) throw new Error(err.message)
      setShowModal(false)
      setForm({ state: '', category: 'skilled', effective_date: new Date().toISOString().split('T')[0], daily_wage: 0, monthly_wage: 0 })
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add minimum wage')
    } finally { setSaving(false) }
  }

  const uniqueStates = new Set(data.map(d => d.state)).size

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Records" value={data.length} icon="📋" color="#60a5fa" delay={0.05} loading={loading} />
        <StatCard label="States" value={uniqueStates} icon="🗺️" color="#FFB347" delay={0.1} loading={loading} />
        <StatCard label="Avg Daily Wage" value={Math.round(data.reduce((a, b) => a + b.daily_wage, 0) / (data.length || 1))} icon="💵" color="#34d399" delay={0.15} loading={loading} />
      </div>

      <GlassCard delay={0.2} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>Minimum Wage Master</h2>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 0, fontSize: '12px', padding: '8px 14px' }}>
            <Plus size={12} /> Add Entry
          </motion.button>
        </div>
        <DataTable loading={loading} data={data} emptyIcon="📋" emptyMessage="No minimum wage entries"
          columns={[
            { key: 'state', label: 'State', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.state}</span> },
            { key: 'category', label: 'Category', render: row => <span className="badge badge-blue">{row.employee_category_id}</span> },
            { key: 'daily', label: 'Daily Wage', render: row => `₹${row.daily_wage.toLocaleString('en-IN')}` },
            { key: 'monthly', label: 'Monthly Wage', render: row => <span style={{ fontWeight: 700, color: '#34d399' }}>₹{row.monthly_wage.toLocaleString('en-IN')}</span> },
            { key: 'effective', label: 'Effective', render: row => new Date(row.effective_from).toLocaleDateString() },
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>📋 Add Minimum Wage</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{error}</p>}
              <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>State</label>
                  <select required className="glass-input" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}>
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</label>
                  <select className="glass-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="unskilled">Unskilled</option>
                    <option value="semi-skilled">Semi-Skilled</option>
                    <option value="skilled">Skilled</option>
                    <option value="highly-skilled">Highly Skilled</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily Wage</label>
                    <input required type="number" className="glass-input" value={form.daily_wage} onChange={e => setForm(p => ({ ...p, daily_wage: parseFloat(e.target.value) }))} min={0} step={0.01} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Wage</label>
                    <input required type="number" className="glass-input" value={form.monthly_wage} onChange={e => setForm(p => ({ ...p, monthly_wage: parseFloat(e.target.value) }))} min={0} step={0.01} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Effective Date</label>
                  <input required type="date" className="glass-input" value={form.effective_date} onChange={e => setForm(p => ({ ...p, effective_date: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Adding...' : 'Add Entry'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
