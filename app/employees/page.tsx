'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { Employee } from '@/lib/types'
import { Plus, Search, X, UserCheck, UserX } from 'lucide-react'

const statusBadge = (s: Employee['status']) => {
  const map = { active: 'badge-green', inactive: 'badge-red', probation: 'badge-yellow', exited: 'badge-red' }
  const label = { active: '● Active', inactive: '● Inactive', probation: '◐ Probation', exited: '● Exited' }
  return <span className={`badge ${map[s]}`}>{label[s]}</span>
}

const typeBadge = (t: Employee['employment_type']) => {
  const map = { full_time: 'badge-blue', part_time: 'badge-orange', contractor: 'badge-yellow' }
  const label = { full_time: 'Full Time', part_time: 'Part Time', contractor: 'Contractor' }
  return <span className={`badge ${map[t]}`}>{label[t]}</span>
}

const EMPTY_FORM = { full_name: '', email: '', phone: '', designation: '', department: '', employment_type: 'full_time', date_of_joining: '' }

export default function EmployeesPage() {
  const { data: employees, loading, refetch } = useSupabaseTable<Employee>(
    () => supabase.from('employees').select('*').order('created_at', { ascending: false }),
    'employees'
  )

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filtered = employees.filter(e => {
    const s = search.toLowerCase()
    const matchSearch = e.full_name.toLowerCase().includes(s) || e.employee_code?.toLowerCase().includes(s) || e.designation.toLowerCase().includes(s) || e.department.toLowerCase().includes(s)
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    return matchSearch && matchStatus
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const employment_type = form.employment_type as Employee['employment_type']
      const { error: err } = await supabase.from('employees').insert([{
        employee_code: `EMP-${Date.now().toString().slice(-5)}`,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        designation: form.designation,
        department: form.department,
        employment_type,
        date_of_joining: form.date_of_joining,
        original_doj: form.date_of_joining,
        location_id: 'loc-001',
        entity: 'pvt_ltd',
        status: 'probation',
        is_salesperson: employment_type === 'full_time',
      } as never])
      if (err) throw new Error(err.message)
      setShowModal(false); setForm(EMPTY_FORM)
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create employee')
    } finally { setSaving(false) }
  }

  async function toggleStatus(emp: Employee) {
    const newStatus: Employee['status'] = emp.status === 'active' ? 'inactive' : 'active'
    await supabase.from('employees').update({ status: newStatus } as never).eq('id', emp.id)
    await refetch()
  }

  const activeCount = employees.filter(e => e.status === 'active').length
  const probationCount = employees.filter(e => e.status === 'probation').length
  const salespersonCount = employees.filter(e => e.is_salesperson).length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Employees" value={employees.length} icon="🐕" delay={0.05} loading={loading} />
        <StatCard label="Active" value={activeCount} icon="✅" color="#34d399" delay={0.1} loading={loading} />
        <StatCard label="On Probation" value={probationCount} icon="⏳" color="#FFB347" delay={0.15} loading={loading} />
        <StatCard label="Salespersons" value={salespersonCount} icon="💼" color="#a78bfa" delay={0.2} loading={loading} />
      </div>

      <GlassCard delay={0.25} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="glass-input" style={{ paddingLeft: '34px' }} placeholder="Search by name, code, designation..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="glass-input" style={{ width: 'auto', minWidth: '140px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="probation">Probation</option>
            <option value="inactive">Inactive</option>
            <option value="exited">Exited</option>
          </select>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <Plus size={14} /> Add Employee
          </motion.button>
        </div>

        <DataTable loading={loading} data={filtered} emptyMessage="No employees match your search" emptyIcon="🐕"
          columns={[
            { key: 'employee_code', label: 'Code', width: '100px' },
            { key: 'full_name', label: 'Name', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.full_name}</span> },
            { key: 'designation', label: 'Designation' },
            { key: 'department', label: 'Department' },
            { key: 'employment_type', label: 'Type', render: row => typeBadge(row.employment_type) },
            { key: 'status', label: 'Status', render: row => statusBadge(row.status) },
            { key: 'is_salesperson', label: 'Salesperson', render: row => row.is_salesperson ? <span className="badge badge-green">Yes</span> : <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>No</span> },
            { key: 'date_of_joining', label: 'DOJ', render: row => new Date(row.date_of_joining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
            { key: 'actions', label: 'Action', render: row => (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toggleStatus(row)}
                style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: row.status === 'active' ? 'rgba(239,68,68,0.12)' : 'rgba(52,211,153,0.12)', color: row.status === 'active' ? '#fca5a5' : '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {row.status === 'active' ? <><UserX size={11} />Deactivate</> : <><UserCheck size={11} />Activate</>}
              </motion.button>
            )},
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🐾 Add New Employee</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Will be placed on probation until confirmed</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{error}</p>}
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Full Name *', key: 'full_name', placeholder: 'Arjun Singh' },
                    { label: 'Email *', key: 'email', placeholder: 'arjun@indipet.in', type: 'email' },
                    { label: 'Phone *', key: 'phone', placeholder: '9876543210' },
                    { label: 'Designation *', key: 'designation', placeholder: 'Senior Groomer' },
                    { label: 'Department *', key: 'department', placeholder: 'Grooming' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                      <input required type={f.type || 'text'} className="glass-input" placeholder={f.placeholder} value={(form as Record<string,string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employment Type</label>
                    <select className="glass-input" value={form.employment_type} onChange={e => setForm(p => ({ ...p, employment_type: e.target.value }))}>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contractor">Contractor</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date of Joining *</label>
                    <input required type="date" className="glass-input" value={form.date_of_joining} onChange={e => setForm(p => ({ ...p, date_of_joining: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Saving to Supabase...' : '🐾 Create Employee'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
