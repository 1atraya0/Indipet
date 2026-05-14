'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import { Plus, Edit2, Trash, X } from 'lucide-react'
import type { } from '@/lib/types'

export default function RulesPage() {
  const { data: rules = [], loading, refetch } = useSupabaseTable<any>(() => supabase.from('hr_rules').select('*').order('created_at', { ascending: false }) as never, 'hr_rules')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ name: '', code: '', description: '', config: '{}' })
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing(null)
    setForm({ name: '', code: '', description: '', config: '{}' })
    setShowModal(true)
  }

  function openEdit(r: any) {
    setEditing(r)
    setForm({ name: r.name || '', code: r.code || '', description: r.description || '', config: JSON.stringify(r.config || {}, null, 2) })
    setShowModal(true)
  }

  async function saveRule() {
    setSaving(true)
    try {
      const cfg = JSON.parse(form.config)
      if (editing) {
        const { error } = await supabase.from('hr_rules').update({ name: form.name, code: form.code, description: form.description, config: cfg } as never).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('hr_rules').insert([{
          name: form.name,
          code: form.code,
          description: form.description,
          config: cfg,
          is_active: true
        }] as never)
        if (error) throw error
      }
      await refetch()
      setShowModal(false)
    } catch (err: any) {
      alert('Error: ' + (err?.message || err))
    }
    setSaving(false)
  }

  async function removeRule(id: string) {
    if (!confirm('Remove this rule?')) return
    const { error } = await supabase.from('hr_rules').delete().eq('id', id)
    if (error) alert('Error: ' + error.message)
    else await refetch()
  }

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Rule Customizations</h2>
        <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={12} /> New Rule
        </motion.button>
      </div>

      <GlassCard delay={0.12} style={{ padding: 0 }}>
        <DataTable loading={loading} data={rules} emptyIcon="⚙️" emptyMessage="No rules defined" columns={[
          { key: 'name', label: 'Name', render: row => <strong style={{ color: 'var(--text-primary)' }}>{row.name}</strong> },
          { key: 'code', label: 'Code', render: row => <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.code}</span> },
          { key: 'description', label: 'Description', render: row => <span style={{ fontSize: '13px' }}>{row.description || '—'}</span> },
          { key: 'active', label: 'Active', render: row => <span className={`badge ${row.is_active ? 'badge-green' : 'badge-red'}`}>{row.is_active ? 'Yes' : 'No'}</span> },
          { key: 'config', label: 'Config', render: row => <pre style={{ maxWidth: '320px', overflow: 'auto', fontSize: '11px', margin: 0 }}>{JSON.stringify(row.config || {}, null, 2)}</pre> },
          { key: 'actions', label: 'Actions', render: row => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-ghost" onClick={() => openEdit(row)}><Edit2 size={14} /></button>
              <button className="btn-ghost" onClick={() => removeRule(row.id)}><Trash size={14} /></button>
            </div>
          ) }
        ]} />
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '760px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ margin: 0 }}>{editing ? 'Edit Rule' : 'Create Rule'}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Name</label>
                  <input className="glass-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Code</label>
                  <input className="glass-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Description</label>
                  <input className="glass-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Configuration (JSON)</label>
                  <textarea className="glass-input" style={{ minHeight: '160px', fontFamily: 'monospace', fontSize: '12px' }} value={form.config} onChange={e => setForm(f => ({ ...f, config: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={saveRule} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Rule'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
