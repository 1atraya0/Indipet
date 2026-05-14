'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { EmployeeSalary, Employee, SalaryStructure } from '@/lib/types'
import { Plus, X, Edit2 } from 'lucide-react'

type EmployeeSalaryWithRelations = EmployeeSalary & {
  employees: { full_name: string; employee_code: string } | null
  salary_structure_master: { grade: string } | null
}

export default function EmployeeSalaryPage() {
  const { data, loading, refetch } = useSupabaseTable<EmployeeSalaryWithRelations>(
    () => supabase.from('employee_salary').select('*, employees(full_name, employee_code), salary_structure_master(grade)').order('created_at', { ascending: false }) as never,
    'employee_salary'
  )
  const { data: employees } = useSupabaseTable<Employee>(
    () => supabase.from('employees').select('*').order('full_name'),
    'employees'
  )
  const { data: salaryStructures } = useSupabaseTable<SalaryStructure>(
    () => supabase.from('salary_structure_master').select('*').order('grade'),
    'salary_structure_master'
  )

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ employee_id: '', salary_structure_id: '', monthly_basic: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        const { error: err } = await supabase.from('employee_salary').update({
          salary_structure_id: form.salary_structure_id,
          monthly_basic: form.monthly_basic,
        } as never).eq('id', editingId)
        if (err) throw new Error(err.message)
      } else {
        const { error: err } = await supabase.from('employee_salary').insert([{
          employee_id: form.employee_id,
          salary_structure_id: form.salary_structure_id,
          monthly_basic: form.monthly_basic,
        }] as never)
        if (err) throw new Error(err.message)
      }
      setShowModal(false)
      setEditingId(null)
      setForm({ employee_id: '', salary_structure_id: '', monthly_basic: 0 })
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save salary')
    } finally { setSaving(false) }
  }

  function openEditModal(item: EmployeeSalaryWithRelations) {
    setEditingId(item.id)
    setForm({
      employee_id: item.employee_id,
      salary_structure_id: item.salary_structure_id ?? '',
      monthly_basic: item.monthly_basic,
    })
    setShowModal(true)
  }

  const avgBasic = data.length > 0 ? Math.round(data.reduce((a, b) => a + b.monthly_basic, 0) / data.length) : 0

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Employees" value={data.length} icon="👥" color="#60a5fa" delay={0.05} loading={loading} />
        <StatCard label="Avg Basic" value={avgBasic} icon="💰" color="#34d399" delay={0.1} loading={loading} />
        <StatCard label="Total Outflow" value={data.reduce((a, b) => a + b.monthly_basic, 0)} icon="💸" color="#FFB347" delay={0.15} loading={loading} />
      </div>

      <GlassCard delay={0.2} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>Employee Salary Structure</h2>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => { setEditingId(null); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 0, fontSize: '12px', padding: '8px 14px' }}>
            <Plus size={12} /> Add Salary
          </motion.button>
        </div>
        <DataTable loading={loading} data={data} emptyIcon="👥" emptyMessage="No salary records"
          columns={[
            { key: 'employee', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.employees as { full_name: string } | null)?.full_name || 'Unknown'}</span> },
            { key: 'code', label: 'Code', render: row => (row.employees as { employee_code: string } | null)?.employee_code || '—' },
            { key: 'grade', label: 'Grade', render: row => <span className="badge badge-blue">{(row.salary_structure_master as { grade: string } | null)?.grade || '—'}</span> },
            { key: 'monthly_basic', label: 'Monthly Basic', render: row => <span style={{ fontWeight: 700, color: '#34d399' }}>₹{row.monthly_basic.toLocaleString('en-IN')}</span> },
            { key: 'action', label: 'Action', render: row => (
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => openEditModal(row)}
                style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(96,165,250,0.12)', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Edit2 size={11} /> Edit
              </motion.button>
            ) },
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>👥 {editingId ? 'Edit' : 'Add'} Employee Salary</h2>
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
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Salary Grade</label>
                  <select required className="glass-input" value={form.salary_structure_id} onChange={e => setForm(p => ({ ...p, salary_structure_id: e.target.value }))}>
                    <option value="">Select Grade</option>
                    {salaryStructures.map(ss => <option key={ss.id} value={ss.id}>Grade {ss.grade}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Basic</label>
                  <input required type="number" className="glass-input" value={form.monthly_basic} onChange={e => setForm(p => ({ ...p, monthly_basic: parseFloat(e.target.value) }))} min={0} step={100} />
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
