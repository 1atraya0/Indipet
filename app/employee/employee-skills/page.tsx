'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { EmployeeSkill, Employee } from '@/lib/types'
import { Plus, X, Edit2, Trash2 } from 'lucide-react'

type EmployeeSkillWithEmployee = EmployeeSkill & {
  employees: { full_name: string; employee_code: string } | null
}

export default function EmployeeSkillsPage() {
  const { data, loading, refetch } = useSupabaseTable<EmployeeSkillWithEmployee>(
    () => supabase.from('employee_skills').select('*, employees(full_name, employee_code)').order('created_at', { ascending: false }) as never,
    'employee_skills'
  )
  const { data: employees } = useSupabaseTable<Employee>(
    () => supabase.from('employees').select('*').order('full_name'),
    'employees'
  )

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ employee_id: '', skill_name: '', proficiency_level: 'intermediate', certification_url: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        const { error: err } = await supabase.from('employee_skills').update({
          skill_name: form.skill_name,
          proficiency_level: form.proficiency_level,
          certification_url: form.certification_url,
        } as never).eq('id', editingId)
        if (err) throw new Error(err.message)
      } else {
        const { error: err } = await supabase.from('employee_skills').insert([{
          employee_id: form.employee_id,
          skill_name: form.skill_name,
          proficiency_level: form.proficiency_level,
          certification_url: form.certification_url,
        }] as never)
        if (err) throw new Error(err.message)
      }
      setShowModal(false)
      setEditingId(null)
      setForm({ employee_id: '', skill_name: '', proficiency_level: 'intermediate', certification_url: '' })
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save skill')
    } finally { setSaving(false) }
  }

  async function deleteSkill(id: string) {
    if (confirm('Delete this skill?')) {
      await supabase.from('employee_skills').delete().eq('id', id)
      await refetch()
    }
  }

  function openEditModal(item: EmployeeSkillWithEmployee) {
    setEditingId(item.id)
    setForm({
      employee_id: item.employee_id,
      skill_name: item.skill_name,
      proficiency_level: item.proficiency_level,
      certification_url: item.certification_url || '',
    })
    setShowModal(true)
  }

  const expertCount = data.filter(d => d.proficiency_level === 'expert').length
  const totalSkills = data.length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Skills" value={totalSkills} icon="🎯" color="#60a5fa" delay={0.05} loading={loading} />
        <StatCard label="Expert Level" value={expertCount} icon="⭐" color="#FFB347" delay={0.1} loading={loading} />
        <StatCard label="Unique Employees" value={new Set(data.map(d => d.employee_id)).size} icon="👥" color="#34d399" delay={0.15} loading={loading} />
      </div>

      <GlassCard delay={0.2} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>Employee Skills</h2>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => { setEditingId(null); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 0, fontSize: '12px', padding: '8px 14px' }}>
            <Plus size={12} /> Add Skill
          </motion.button>
        </div>
        <DataTable loading={loading} data={data} emptyIcon="🎯" emptyMessage="No skills recorded"
          columns={[
            { key: 'employee', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.employees as { full_name: string } | null)?.full_name || 'Unknown'}</span> },
            { key: 'skill', label: 'Skill', render: row => row.skill_name },
            { key: 'proficiency', label: 'Proficiency', render: row => {
              const colorMap: Record<string, string> = { beginner: 'badge-blue', intermediate: 'badge-yellow', expert: 'badge-green' }
              return <span className={`badge ${colorMap[row.proficiency_level]}`}>{row.proficiency_level.charAt(0).toUpperCase() + row.proficiency_level.slice(1)}</span>
            }},
            { key: 'certification', label: 'Certification', render: row => row.certification_url ? <a href={row.certification_url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: '12px' }}>View</a> : '—' },
            { key: 'actions', label: 'Actions', render: row => (
              <div style={{ display: 'flex', gap: '4px' }}>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => openEditModal(row)}
                  style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
                  <Edit2 size={10} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => deleteSkill(row.id)}
                  style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(248,113,113,0.12)', color: '#f87171' }}>
                  <Trash2 size={10} />
                </motion.button>
              </div>
            ) },
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🎯 {editingId ? 'Edit' : 'Add'} Skill</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{error}</p>}
              <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {!editingId && (
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employee</label>
                    <select required className="glass-input" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}>
                      <option value="">Select Employee</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skill Name</label>
                  <input required className="glass-input" placeholder="e.g., Grooming, CPR, Social Media" value={form.skill_name} onChange={e => setForm(p => ({ ...p, skill_name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Proficiency Level</label>
                  <select className="glass-input" value={form.proficiency_level} onChange={e => setForm(p => ({ ...p, proficiency_level: e.target.value }))}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Certification URL (optional)</label>
                  <input type="url" className="glass-input" placeholder="https://..." value={form.certification_url} onChange={e => setForm(p => ({ ...p, certification_url: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
