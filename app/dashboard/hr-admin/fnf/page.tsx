'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { Employee, EmployeeSalary } from '@/lib/types'
import { Plus, X, FileText } from 'lucide-react'

interface FnFSettlement {
  id: string
  employee_id: string
  exit_date: string
  final_salary: number
  gratuity: number
  total_deductions: number
  settlement_amount: number
  status: 'draft' | 'approved' | 'disbursed'
  created_at: string
  employees?: { full_name: string; employee_code: string; date_of_joining: string } | null
}

export default function FnFSettlementPage() {
  const { data: settlements, loading, refetch } = useSupabaseTable<FnFSettlement>(
    () => supabase.from('fnf_settlements').select('*, employees(full_name, employee_code, date_of_joining)').order('created_at', { ascending: false }) as never,
    'fnf_settlements'
  )
  const { data: employees } = useSupabaseTable<Employee>(
    () => supabase.from('employees').select('*').order('full_name'),
    'employees'
  )

  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ employee_id: '', exit_date: '', final_salary: 0, gratuity: 0, total_deductions: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function calculateSettlement() {
    return form.final_salary + form.gratuity - form.total_deductions
  }

  async function saveFnF() {
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase.from('fnf_settlements').insert([{
        employee_id: form.employee_id,
        exit_date: form.exit_date,
        final_salary: form.final_salary,
        gratuity: form.gratuity,
        total_deductions: form.total_deductions,
        settlement_amount: calculateSettlement(),
        status: 'draft',
      }] as never)
      if (err) throw err
      setShowAddModal(false)
      setForm({ employee_id: '', exit_date: '', final_salary: 0, gratuity: 0, total_deductions: 0 })
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save FnF settlement')
    } finally {
      setSaving(false)
    }
  }

  const draftCount = settlements.filter(s => s.status === 'draft').length
  const approvedCount = settlements.filter(s => s.status === 'approved').length
  const disbursedCount = settlements.filter(s => s.status === 'disbursed').length
  const totalSettlement = settlements.reduce((a, b) => a + b.settlement_amount, 0)

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Settlements" value={settlements.length} icon="📋" color="#60a5fa" delay={0.05} loading={loading} />
        <StatCard label="Draft" value={draftCount} icon="📝" color="#FFB347" delay={0.1} loading={loading} />
        <StatCard label="Approved" value={approvedCount} icon="✅" color="#34d399" delay={0.15} loading={loading} />
        <StatCard label="Disbursed" value={disbursedCount} icon="💰" color="#a78bfa" delay={0.2} loading={loading} />
        <StatCard label="Total Amount" value={Math.round(totalSettlement / 100000)} suffix="L" icon="💸" color="#FF6B6B" delay={0.25} loading={loading} />
      </div>

      <GlassCard delay={0.3} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>FnF Settlements</h2>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 0, fontSize: '12px', padding: '8px 14px' }}>
            <Plus size={12} /> Create Settlement
          </motion.button>
        </div>
        <DataTable loading={loading} data={settlements} emptyIcon="📋" emptyMessage="No FnF settlements"
          columns={[
            { key: 'employee', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.employees as { full_name: string } | null)?.full_name || 'Unknown'}</span> },
            { key: 'exit_date', label: 'Exit Date', render: row => new Date(row.exit_date).toLocaleDateString() },
            { key: 'final_salary', label: 'Final Salary', render: row => `₹${row.final_salary.toLocaleString('en-IN')}` },
            { key: 'gratuity', label: 'Gratuity', render: row => `₹${row.gratuity.toLocaleString('en-IN')}` },
            { key: 'deductions', label: 'Deductions', render: row => `₹${row.total_deductions.toLocaleString('en-IN')}` },
            { key: 'settlement', label: 'Settlement Amount', render: row => <span style={{ fontWeight: 700, color: '#34d399' }}>₹{row.settlement_amount.toLocaleString('en-IN')}</span> },
            { key: 'status', label: 'Status', render: row => {
              const map: Record<string, string> = { draft: 'badge-yellow', approved: 'badge-green', disbursed: 'badge-blue' }
              return <span className={`badge ${map[row.status]}`}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span>
            }},
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showAddModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>📋 Create FnF Settlement</h2>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{error}</p>}
              <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employee</label>
                  <select required className="glass-input" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Exit Date</label>
                  <input required type="date" className="glass-input" value={form.exit_date} onChange={e => setForm(p => ({ ...p, exit_date: e.target.value }))} />
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,140,66,0.1)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px', fontWeight: 600 }}>💰 Settlement Components</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Final Salary</label>
                      <input type="number" className="glass-input" style={{ fontSize: '12px', padding: '8px' }} value={form.final_salary} onChange={e => setForm(p => ({ ...p, final_salary: Number(e.target.value) }))} min={0} />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Gratuity</label>
                      <input type="number" className="glass-input" style={{ fontSize: '12px', padding: '8px' }} value={form.gratuity} onChange={e => setForm(p => ({ ...p, gratuity: Number(e.target.value) }))} min={0} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Total Deductions</label>
                      <input type="number" className="glass-input" style={{ fontSize: '12px', padding: '8px' }} value={form.total_deductions} onChange={e => setForm(p => ({ ...p, total_deductions: Number(e.target.value) }))} min={0} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(52,211,153,0.08)', borderRadius: '8px', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <p style={{ fontSize: '11px', color: '#34d399', fontWeight: 600, margin: 0 }}>
                    Settlement Amount: ₹{calculateSettlement().toLocaleString('en-IN')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="button" className="btn-primary" style={{ flex: 2 }} disabled={saving} onClick={saveFnF}>{saving ? 'Creating...' : 'Create Settlement'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
