'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { ServiceType } from '@/lib/types'
import { Plus, X } from 'lucide-react'

export default function ServiceTypesPage() {
  const { data, loading, refetch } = useSupabaseTable<ServiceType>(
    () => supabase.from('service_type_master').select('*').order('name'),
    'service_type_master'
  )

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase.from('service_type_master').insert([{
        name: form.name,
        code: form.code,
        description: form.description,
        is_active: true,
      }] as never)
      if (err) throw new Error(err.message)
      setShowModal(false)
      setForm({ name: '', code: '', description: '' })
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create service type')
    } finally { setSaving(false) }
  }

  const activeCount = data.filter(d => d.is_active).length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Services" value={data.length} icon="🛠️" color="#FFB347" delay={0.05} loading={loading} />
        <StatCard label="Active" value={activeCount} icon="✅" color="#34d399" delay={0.1} loading={loading} />
      </div>

      <GlassCard delay={0.15} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>Service Types Master</h2>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 0, fontSize: '12px', padding: '8px 14px' }}>
            <Plus size={12} /> Add Service
          </motion.button>
        </div>
        <DataTable loading={loading} data={data} emptyIcon="🛠️" emptyMessage="No service types"
          columns={[
            { key: 'name', label: 'Service', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span> },
            { key: 'code', label: 'Code', render: row => <code style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '5px' }}>{row.code}</code> },
            { key: 'description', label: 'Description', render: row => row.description || '—' },
            { key: 'status', label: 'Status', render: row => row.is_active ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Inactive</span> },
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🛠️ Add Service Type</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{error}</p>}
              <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Service Name</label>
                  <input required className="glass-input" placeholder="Grooming" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Code</label>
                  <input required className="glass-input" placeholder="grooming" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toLowerCase() }))} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
                  <textarea className="glass-input" placeholder="Service description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Creating...' : 'Add Service'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
