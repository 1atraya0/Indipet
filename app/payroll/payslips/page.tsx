'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { Payslip, Employee } from '@/lib/types'
import { Plus, X, Download } from 'lucide-react'

type PayslipWithEmployee = Payslip & {
  employees: { full_name: string; employee_code: string } | null
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function PayslipsPage() {
  const { data, loading, refetch } = useSupabaseTable<PayslipWithEmployee>(
    () => supabase.from('payslips').select('*, employees(full_name, employee_code)').order('period_year', { ascending: false }).order('period_month', { ascending: false }) as never,
    'payslips'
  )
  const { data: employees } = useSupabaseTable<Employee>(
    () => supabase.from('employees').select('*').order('full_name'),
    'employees'
  )

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee_id: '', period_month: new Date().getMonth() + 1, period_year: new Date().getFullYear(), basic: 0, allowances: 0, pf_contribution: 0, esic_contribution: 0, professional_tax: 0, advance_recovery: 0, other_deductions: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const grossEarnings = form.basic + form.allowances
      const totalDeductions = form.pf_contribution + form.esic_contribution + form.professional_tax + form.advance_recovery + form.other_deductions
      const netPay = grossEarnings - totalDeductions

      const { error: err } = await supabase.from('payslips').insert([{
        employee_id: form.employee_id,
        period_month: form.period_month,
        period_year: form.period_year,
        basic: form.basic,
        allowances: form.allowances,
        gross_earnings: grossEarnings,
        pf_contribution: form.pf_contribution,
        esic_contribution: form.esic_contribution,
        professional_tax: form.professional_tax,
        advance_recovery: form.advance_recovery,
        other_deductions: form.other_deductions,
        total_deductions: totalDeductions,
        net_pay: netPay,
        status: 'draft',
      }] as never)
      if (err) throw new Error(err.message)
      setShowModal(false)
      setForm({ employee_id: '', period_month: new Date().getMonth() + 1, period_year: new Date().getFullYear(), basic: 0, allowances: 0, pf_contribution: 0, esic_contribution: 0, professional_tax: 0, advance_recovery: 0, other_deductions: 0 })
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create payslip')
    } finally { setSaving(false) }
  }

  const draftCount = data.filter(d => d.status === 'draft').length
  const approvedCount = data.filter(d => d.status === 'approved').length
  const disbursedCount = data.filter(d => d.status === 'disbursed').length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Payslips" value={data.length} icon="💼" color="#60a5fa" delay={0.05} loading={loading} />
        <StatCard label="Draft" value={draftCount} icon="📝" color="#FFB347" delay={0.1} loading={loading} />
        <StatCard label="Approved" value={approvedCount} icon="✅" color="#34d399" delay={0.15} loading={loading} />
        <StatCard label="Disbursed" value={disbursedCount} icon="💰" color="#a78bfa" delay={0.2} loading={loading} />
      </div>

      <GlassCard delay={0.25} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>Payslips</h2>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 0, fontSize: '12px', padding: '8px 14px' }}>
            <Plus size={12} /> Generate Payslip
          </motion.button>
        </div>
        <DataTable loading={loading} data={data} emptyIcon="💼" emptyMessage="No payslips"
          columns={[
            { key: 'employee', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.employees as { full_name: string } | null)?.full_name || 'Unknown'}</span> },
            { key: 'period', label: 'Period', render: row => `${monthNames[row.period_month - 1]} ${row.period_year}` },
            { key: 'gross', label: 'Gross', render: row => `₹${row.gross_earnings.toLocaleString('en-IN')}` },
            { key: 'deductions', label: 'Deductions', render: row => `₹${row.total_deductions.toLocaleString('en-IN')}` },
            { key: 'net_pay', label: 'Net Pay', render: row => <span style={{ fontWeight: 700, color: '#34d399' }}>₹{row.net_pay.toLocaleString('en-IN')}</span> },
            { key: 'status', label: 'Status', render: row => {
              const map: Record<string, string> = { draft: 'badge-yellow', approved: 'badge-green', disbursed: 'badge-blue' }
              return <span className={`badge ${map[row.status]}`}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span>
            }},
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>💼 Generate Payslip</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{error}</p>}
              <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employee</label>
                    <select required className="glass-input" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}>
                      <option value="">Select Employee</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Period</label>
                    <select required className="glass-input" value={`${form.period_month}-${form.period_year}`} onChange={e => {
                      const [m, y] = e.target.value.split('-')
                      setForm(p => ({ ...p, period_month: parseInt(m), period_year: parseInt(y) }))
                    }}>
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = i + 1
                        const y = new Date().getFullYear()
                        return <option key={`${m}-${y}`} value={`${m}-${y}`}>{monthNames[m - 1]} {y}</option>
                      })}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Basic</label>
                    <input required type="number" className="glass-input" value={form.basic} onChange={e => setForm(p => ({ ...p, basic: parseFloat(e.target.value) }))} min={0} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Allowances</label>
                    <input type="number" className="glass-input" value={form.allowances} onChange={e => setForm(p => ({ ...p, allowances: parseFloat(e.target.value) }))} min={0} />
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,140,66,0.1)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px' }}>Deductions</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PF</label>
                      <input type="number" className="glass-input" style={{ fontSize: '12px', padding: '8px' }} value={form.pf_contribution} onChange={e => setForm(p => ({ ...p, pf_contribution: parseFloat(e.target.value) }))} min={0} />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ESIC</label>
                      <input type="number" className="glass-input" style={{ fontSize: '12px', padding: '8px' }} value={form.esic_contribution} onChange={e => setForm(p => ({ ...p, esic_contribution: parseFloat(e.target.value) }))} min={0} />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PT</label>
                      <input type="number" className="glass-input" style={{ fontSize: '12px', padding: '8px' }} value={form.professional_tax} onChange={e => setForm(p => ({ ...p, professional_tax: parseFloat(e.target.value) }))} min={0} />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Advance Recovery</label>
                      <input type="number" className="glass-input" style={{ fontSize: '12px', padding: '8px' }} value={form.advance_recovery} onChange={e => setForm(p => ({ ...p, advance_recovery: parseFloat(e.target.value) }))} min={0} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Other Deductions</label>
                      <input type="number" className="glass-input" style={{ fontSize: '12px', padding: '8px' }} value={form.other_deductions} onChange={e => setForm(p => ({ ...p, other_deductions: parseFloat(e.target.value) }))} min={0} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Generating...' : 'Generate Payslip'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
