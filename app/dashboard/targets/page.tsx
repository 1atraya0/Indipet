'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import { Edit2, X, Plus } from 'lucide-react'
import type { Location } from '@/lib/types'

type StoreTarget = {
  id: string
  location_id: string
  period_month: number
  period_year: number
  revenue_target: number
  grooming_target: number
  achieved_revenue: number
  achieved_grooming: number
  created_at: string
  locations: { name: string; code: string } | null
}

type SalesTarget = {
  id: string
  employee_id: string
  period_month: number
  period_year: number
  target_amount: number
  achieved_amount: number
  created_at: string
  employees: { full_name: string; employee_code: string } | null
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct >= 100 ? '#34d399' : pct >= 75 ? '#FFB347' : pct >= 50 ? '#FF6B35' : '#f87171'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ height: '100%', borderRadius: '3px', background: `linear-gradient(90deg, ${color}aa, ${color})` }} />
      </div>
      <span style={{ fontSize: '11.5px', fontWeight: 700, color, minWidth: '36px', textAlign: 'right' }}>{Math.round(pct)}%</span>
    </div>
  )
}

const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()
const monthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

export default function TargetsPage() {
  const { data: storeTargets, loading: storeLoading, refetch: refetchStore } = useSupabaseTable<StoreTarget>(
    () => supabase.from('store_target_master').select('*, locations(name, code)').eq('period_month', currentMonth).eq('period_year', currentYear) as never,
    'store_target_master'
  )
  const { data: salesTargets, loading: salesLoading, refetch: refetchSales } = useSupabaseTable<SalesTarget>(
    () => supabase.from('sales_target_portfolio').select('*, employees(full_name, employee_code)').eq('period_month', currentMonth).eq('period_year', currentYear) as never,
    'sales_target_portfolio'
  )
  const { data: employees } = useSupabaseTable<{ id: string; full_name: string; employee_code: string }>(() => supabase.from('employees').select('id, full_name, employee_code').order('full_name'), 'employees')

  const [tab, setTab] = useState<'store' | 'employee'>('store')
  const [editModal, setEditModal] = useState<StoreTarget | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [addForm, setAddForm] = useState({ location_id: '', revenue_target: 0, grooming_target: 0 })
  const [employeeAddForm, setEmployeeAddForm] = useState({ employee_id: '', target_amount: 0 })
  const [saving, setSaving] = useState(false)
  const { data: locations } = useSupabaseTable<Location>(() => supabase.from('locations').select('*').order('name'), 'locations')

  const loading = storeLoading || salesLoading

  async function saveTarget() {
    if (!editModal) return
    setSaving(true)
    await supabase.from('store_target_master').update({ revenue_target: Number(editValue) } as never).eq('id', editModal.id)
    await refetchStore()
    setSaving(false)
    setEditModal(null)
  }

  async function saveAddTarget() {
    setSaving(true)
    const { error } = await supabase.from('store_target_master').insert([{
      location_id: addForm.location_id,
      period_month: currentMonth,
      period_year: currentYear,
      revenue_target: addForm.revenue_target,
      grooming_target: addForm.grooming_target,
      achieved_revenue: 0,
      achieved_grooming: 0,
    }] as never)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowAddModal(false)
      setAddForm({ location_id: '', revenue_target: 0, grooming_target: 0 })
      await refetchStore()
    }
    setSaving(false)
  }

  const totalRevTarget = storeTargets.reduce((a, s) => a + s.revenue_target, 0)
  const totalRevAchieved = storeTargets.reduce((a, s) => a + s.achieved_revenue, 0)
  const overallPct = totalRevTarget > 0 ? Math.round((totalRevAchieved / totalRevTarget) * 100) : 0
  const exceeding = storeTargets.filter(s => s.achieved_revenue >= s.revenue_target).length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Overall Achievement" value={overallPct} suffix="%" icon="🎯" delay={0.05} loading={loading} />
        <StatCard label="Stores Exceeding Target" value={exceeding} icon="🏆" color="#34d399" delay={0.1} loading={loading} />
        <StatCard label="Total Revenue Target" value={totalRevTarget > 0 ? Math.round(totalRevTarget / 100000) : 0} suffix="L" icon="💰" color="#a78bfa" delay={0.15} loading={loading} />
        <StatCard label="Achieved Revenue" value={totalRevAchieved > 0 ? Math.round(totalRevAchieved / 100000) : 0} suffix="L" icon="📈" color="#FFB347" delay={0.2} loading={loading} />
      </div>

      <GlassCard delay={0.25} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            {(['store', 'employee'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                color: tab === t ? 'var(--orange-light)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--orange)' : '2px solid transparent',
              }}>
                {t === 'store' ? '🏪 Store Targets' : '👤 Employee Targets'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {tab === 'store' && (
              <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowAddModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}>
                <Plus size={12} /> Add Target
              </motion.button>
            )}
            {tab === 'employee' && (
              <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowAddEmployeeModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}>
                <Plus size={12} /> Add Employee Target
              </motion.button>
            )}
            <span className="badge badge-orange" style={{ marginRight: '0px' }}>{monthName}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'store' ? (
            <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable
                loading={storeLoading}
                data={storeTargets}
                emptyIcon="🎯"
                emptyMessage="No store targets set"
                columns={[
                  { key: 'store', label: 'Store', render: row => (
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {(row.locations as { name: string } | null)?.name || row.location_id}
                    </span>
                  )},
                  { key: 'revenue_target', label: 'Rev Target', render: row => `₹${(row.revenue_target / 1000).toFixed(0)}K` },
                  { key: 'achieved_revenue', label: 'Achieved', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{(row.achieved_revenue / 1000).toFixed(0)}K</span> },
                  { key: 'rev_pct', label: 'Progress', render: row => <ProgressBar pct={(row.achieved_revenue / row.revenue_target) * 100} /> },
                  { key: 'grooming_target', label: 'Grooming Target', render: row => `${row.grooming_target} sessions` },
                  { key: 'achieved_grooming', label: 'Achieved', render: row => `${row.achieved_grooming} sessions` },
                  { key: 'grooming_pct', label: 'Grooming %', render: row => <ProgressBar pct={(row.achieved_grooming / row.grooming_target) * 100} /> },
                  {
                    key: 'edit', label: 'Edit',
                    render: row => (
                      <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setEditModal(row); setEditValue(String(row.revenue_target)) }}
                        style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(255,107,53,0.12)', color: '#FFB347', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Edit2 size={11} /> Edit
                      </motion.button>
                    )
                  },
                ]}
              />
            </motion.div>
          ) : (
            <motion.div key="employee" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable
                loading={salesLoading}
                data={salesTargets}
                emptyIcon="👤"
                emptyMessage="No employee targets set"
                columns={[
                  { key: 'employee', label: 'Employee', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.employees as { full_name: string } | null)?.full_name || row.employee_id}</span> },
                  { key: 'code', label: 'Code', render: row => (row.employees as { employee_code: string } | null)?.employee_code || '—' },
                  { key: 'target_amount', label: 'Target', render: row => row.target_amount ? `₹${(row.target_amount / 1000).toFixed(0)}K` : <span className="badge badge-yellow">Not Set</span> },
                  { key: 'achieved_amount', label: 'Achieved', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.target_amount ? `₹${(row.achieved_amount / 1000).toFixed(0)}K` : '—'}</span> },
                  { key: 'pct', label: 'Achievement', render: row => row.target_amount ? <ProgressBar pct={(row.achieved_amount / row.target_amount) * 100} /> : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span> },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <AnimatePresence>
        {editModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditModal(null)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🎯 Edit Store Target</h2>
                <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {(editModal.locations as { name: string } | null)?.name || editModal.location_id} — {monthName}
              </p>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue Target (₹)</label>
                <input type="number" className="glass-input" value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="300000" />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setEditModal(null)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2 }} disabled={saving} onClick={saveTarget}>
                  {saving ? 'Saving...' : 'Save Target'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showAddModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🎯 Add Store Target</h2>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Store Location</label>
                  <select required className="glass-input" value={addForm.location_id} onChange={e => setAddForm(p => ({ ...p, location_id: e.target.value }))}>
                    <option value="">Select Location</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue Target (₹)</label>
                    <input required type="number" className="glass-input" value={addForm.revenue_target} onChange={e => setAddForm(p => ({ ...p, revenue_target: Number(e.target.value) }))} placeholder="500000" min={0} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grooming Target</label>
                    <input required type="number" className="glass-input" value={addForm.grooming_target} onChange={e => setAddForm(p => ({ ...p, grooming_target: Number(e.target.value) }))} placeholder="50" min={0} />
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '10px 12px', background: 'rgba(96,165,250,0.08)', borderRadius: '8px', margin: '8px 0' }}>
                  📅 Period: {monthName}
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="button" className="btn-primary" style={{ flex: 2 }} disabled={saving} onClick={saveAddTarget}>
                    {saving ? 'Creating...' : 'Add Target'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {showAddEmployeeModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddEmployeeModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🎯 Add Employee Target</h2>
                <button onClick={() => setShowAddEmployeeModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employee</label>
                  <select required className="glass-input" value={employeeAddForm.employee_id} onChange={e => setEmployeeAddForm(p => ({ ...p, employee_id: e.target.value }))}>
                    <option value="">Select Employee</option>
                    {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target Amount (₹)</label>
                  <input required type="number" className="glass-input" value={employeeAddForm.target_amount} onChange={e => setEmployeeAddForm(p => ({ ...p, target_amount: Number(e.target.value) }))} placeholder="150000" min={0} />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '10px 12px', background: 'rgba(96,165,250,0.08)', borderRadius: '8px', margin: '8px 0' }}>
                  📅 Period: {monthName}
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddEmployeeModal(false)}>Cancel</button>
                  <button type="button" className="btn-primary" style={{ flex: 2 }} disabled={saving} onClick={async () => {
                    setSaving(true)
                    const { error } = await supabase.from('sales_target_portfolio').insert([{
                      employee_id: employeeAddForm.employee_id,
                      period_month: currentMonth,
                      period_year: currentYear,
                      target_amount: employeeAddForm.target_amount,
                      achieved_amount: 0,
                    }] as never)
                    if (error) alert('Error: ' + error.message)
                    else {
                      setShowAddEmployeeModal(false)
                      setEmployeeAddForm({ employee_id: '', target_amount: 0 })
                      await refetchSales()
                    }
                    setSaving(false)
                  }}>{saving ? 'Saving...' : 'Add Target'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
