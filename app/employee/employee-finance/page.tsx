'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { EmployeeFinance, Employee } from '@/lib/types'
import { Plus, X, Edit2 } from 'lucide-react'

type EmployeeFinanceWithEmployee = EmployeeFinance & {
  employees: { full_name: string; employee_code: string } | null
}

export default function EmployeeFinancePage() {
  const { data, loading, refetch } = useSupabaseTable<EmployeeFinanceWithEmployee>(
    () => supabase.from('employee_finance').select('*, employees(full_name, employee_code)').order('created_at', { ascending: false }) as never,
    'employee_finance'
  )
  const { data: employees } = useSupabaseTable<Employee>(
    () => supabase.from('employees').select('*').order('full_name'),
    'employees'
  )

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ employee_id: '', pan_number: '', aadhaar_number: '', bank_account_number: '', ifsc_code: '', upi_handle: '', pf_uaan: '', pf_wage_cap_elected: false, esic_eligible: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        const { error: err } = await supabase.from('employee_finance').update({
          pan_number: form.pan_number,
          aadhaar_number: form.aadhaar_number,
          bank_account_number: form.bank_account_number,
          ifsc_code: form.ifsc_code,
          upi_handle: form.upi_handle,
          pf_uaan: form.pf_uaan,
          pf_wage_cap_elected: form.pf_wage_cap_elected,
          esic_eligible: form.esic_eligible,
        } as never).eq('id', editingId)
        if (err) throw new Error(err.message)
      } else {
        const { error: err } = await supabase.from('employee_finance').insert([{
          employee_id: form.employee_id,
          pan_number: form.pan_number,
          aadhaar_number: form.aadhaar_number,
          bank_account_number: form.bank_account_number,
          ifsc_code: form.ifsc_code,
          upi_handle: form.upi_handle,
          pf_uaan: form.pf_uaan,
          pf_wage_cap_elected: form.pf_wage_cap_elected,
          esic_eligible: form.esic_eligible,
        }] as never)
        if (err) throw new Error(err.message)
      }
      setShowModal(false)
      setEditingId(null)
      setForm({ employee_id: '', pan_number: '', aadhaar_number: '', bank_account_number: '', ifsc_code: '', upi_handle: '', pf_uaan: '', pf_wage_cap_elected: false, esic_eligible: true })
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save employee finance')
    } finally { setSaving(false) }
  }

  function openEditModal(item: EmployeeFinanceWithEmployee) {
    setEditingId(item.id)
    setForm({
      employee_id: item.employee_id,
      pan_number: item.pan_number || '',
      aadhaar_number: item.aadhaar_number || '',
      bank_account_number: item.bank_account_number || '',
      ifsc_code: item.ifsc_code || '',
      upi_handle: item.upi_handle || '',
      pf_uaan: item.pf_uaan || '',
      pf_wage_cap_elected: item.pf_wage_cap_elected,
      esic_eligible: item.esic_eligible,
    })
    setShowModal(true)
  }

  const panCount = data.filter(d => d.pan_number).length
  const bankCount = data.filter(d => d.bank_account_number).length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Records" value={data.length} icon="💼" color="#60a5fa" delay={0.05} loading={loading} />
        <StatCard label="PAN Verified" value={panCount} icon="📄" color="#34d399" delay={0.1} loading={loading} />
        <StatCard label="Bank Details" value={bankCount} icon="🏦" color="#FFB347" delay={0.15} loading={loading} />
      </div>

      <GlassCard delay={0.2} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>Employee Financial Details</h2>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => { setEditingId(null); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 0, fontSize: '12px', padding: '8px 14px' }}>
            <Plus size={12} /> Add Record
          </motion.button>
        </div>
        <DataTable loading={loading} data={data} emptyIcon="💼" emptyMessage="No financial records"
          columns={[
            { key: 'employee', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.employees as { full_name: string } | null)?.full_name || 'Unknown'}</span> },
            { key: 'pan', label: 'PAN', render: row => row.pan_number ? <span className="badge badge-green">{row.pan_number.slice(-4)}</span> : <span className="badge badge-red">—</span> },
            { key: 'bank', label: 'Bank Account', render: row => row.bank_account_number ? <span className="badge badge-blue">Added</span> : <span className="badge badge-yellow">—</span> },
            { key: 'pf_uaan', label: 'PF UAAN', render: row => row.pf_uaan || '—' },
            { key: 'esic', label: 'ESIC', render: row => row.esic_eligible ? <span className="badge badge-green">Eligible</span> : <span className="badge badge-red">No</span> },
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
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>💼 {editingId ? 'Edit' : 'Add'} Financial Details</h2>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>PAN</label>
                    <input className="glass-input" placeholder="XXXXXXXX0000X" value={form.pan_number} onChange={e => setForm(p => ({ ...p, pan_number: e.target.value }))} maxLength={10} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aadhaar</label>
                    <input className="glass-input" placeholder="XXXX XXXX XXXX" value={form.aadhaar_number} onChange={e => setForm(p => ({ ...p, aadhaar_number: e.target.value }))} maxLength={12} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bank Account</label>
                  <input className="glass-input" placeholder="1234567890123456" value={form.bank_account_number} onChange={e => setForm(p => ({ ...p, bank_account_number: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>IFSC Code</label>
                    <input className="glass-input" placeholder="SBIN0001234" value={form.ifsc_code} onChange={e => setForm(p => ({ ...p, ifsc_code: e.target.value }))} maxLength={11} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>UPI Handle</label>
                    <input className="glass-input" placeholder="name@upi" value={form.upi_handle} onChange={e => setForm(p => ({ ...p, upi_handle: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>PF UAAN</label>
                  <input className="glass-input" placeholder="100XXXXX0000000" value={form.pf_uaan} onChange={e => setForm(p => ({ ...p, pf_uaan: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.pf_wage_cap_elected} onChange={e => setForm(p => ({ ...p, pf_wage_cap_elected: e.target.checked }))} />
                    PF Wage Cap Elected
                  </label>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.esic_eligible} onChange={e => setForm(p => ({ ...p, esic_eligible: e.target.checked }))} />
                    ESIC Eligible
                  </label>
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
