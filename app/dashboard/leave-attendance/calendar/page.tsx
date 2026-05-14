'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { HolidayCalendar, Location, Employee } from '@/lib/types'
import type { LeaveRequest } from '@/lib/types'
import { Plus, X } from 'lucide-react'

type HolidayWithLocation = HolidayCalendar & { locations?: { name: string } | null }

export default function LeaveCalendarPage() {
  const { data: holidays = [], loading: hLoading, refetch: refetchHolidays } = useSupabaseTable<HolidayWithLocation>(
    () => supabase.from('holiday_calendar').select('*, locations(name)').order('holiday_date', { ascending: true }) as never,
    'holiday_calendar'
  )
  const { data: locations } = useSupabaseTable<Location>(() => supabase.from('locations').select('*').order('name'), 'locations')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ location_id: '', holiday_date: '', holiday_name: '', holiday_type: 'closed' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [displayMonth, setDisplayMonth] = useState<number>(new Date().getMonth())
  const [displayYear, setDisplayYear] = useState<number>(new Date().getFullYear())
  const { data: leaveRequests = [] } = useSupabaseTable<LeaveRequest>(() => supabase.from('leave_requests').select('*').order('from_date', { ascending: false }) as never, 'leave_requests')
  const { data: empHolidays = [] } = useSupabaseTable(() => supabase.from('employee_holidays').select('*') as never, 'employee_holidays')
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applyForm, setApplyForm] = useState({ employee_id: '', leave_type: 'PL', from_date: '', to_date: '', reason: '' })
  const { data: employees } = useSupabaseTable<Employee>(() => supabase.from('employees').select('id, full_name, employee_code, location_id').order('full_name'), 'employees')

  useEffect(() => { setMessage('') }, [showModal])

  async function submitForm(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      const date = new Date(form.holiday_date)
      const year = date.getFullYear()
      const { error } = await supabase.from('holiday_calendar').insert([{
        location_id: form.location_id || null,
        holiday_date: form.holiday_date,
        holiday_name: form.holiday_name,
        holiday_type: form.holiday_type,
        year,
        is_active: true,
      }] as never)
      if (error) throw error
      // mapping handled by master-data page as well; but ensure mapping here for immediate effect
      try {
        const { data: inserted } = await supabase.from('holiday_calendar').select('id').eq('holiday_date', form.holiday_date).eq('holiday_name', form.holiday_name).limit(1).single() as any
        const holidayId = inserted?.id
        if (holidayId) {
          let empQuery = supabase.from('employees').select('id')
          if (form.location_id) empQuery = empQuery.eq('location_id', form.location_id)
          const { data: emps } = await empQuery as any
          if (emps?.length) {
            const rows = emps.map((e: any) => ({ employee_id: e.id, holiday_id: holidayId, holiday_date: form.holiday_date, location_id: form.location_id || null }))
            await supabase.from('employee_holidays').insert(rows as never)
          }
        }
      } catch (mapErr) { console.warn('map err', mapErr) }

      setShowModal(false)
      setForm({ location_id: '', holiday_date: '', holiday_name: '', holiday_type: 'closed' })
      await refetchHolidays()
      setMessage('Holiday added and mapped to employees')
    } catch (err: any) {
      setMessage('Error: ' + (err?.message || err))
    }
    setSaving(false)
  }

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Leave Calendar</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={12} /> Add Holiday / Store Leave
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-ghost" onClick={() => setShowApplyModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Apply for Leave
          </motion.button>
        </div>
      </div>

      <GlassCard delay={0.12} style={{ padding: 0 }}>
        <DataTable loading={hLoading} data={holidays} emptyIcon="📅" emptyMessage="No holidays defined" columns={[
          { key: 'date', label: 'Date', render: r => new Date(r.holiday_date).toLocaleDateString('en-IN') },
          { key: 'name', label: 'Holiday', render: r => <strong>{r.holiday_name}</strong> },
          { key: 'location', label: 'Location', render: r => (r.locations as any)?.name || 'All Locations' },
          { key: 'type', label: 'Type', render: r => r.holiday_type === 'closed' ? <span className="badge badge-red">Closed</span> : <span className="badge badge-yellow">Open</span> },
        ]} />
      </GlassCard>

      {/* Month calendar with markers */}
      <GlassCard delay={0.18} style={{ marginTop: 18, padding: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Calendar</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn-ghost" onClick={() => {
              const d = new Date(displayYear, displayMonth - 1, 1)
              setDisplayMonth(d.getMonth())
              setDisplayYear(d.getFullYear())
            }}>{'◀'}</button>
            <strong style={{ minWidth: 160, textAlign: 'center' }}>{new Date(displayYear, displayMonth).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</strong>
            <button className="btn-ghost" onClick={() => {
              const d = new Date(displayYear, displayMonth + 1, 1)
              setDisplayMonth(d.getMonth())
              setDisplayYear(d.getFullYear())
            }}>{'▶'}</button>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#f87171' }} /> Holiday</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#60a5fa' }} /> Leave Request</div>
            <select className="glass-input" value={displayYear} onChange={e => setDisplayYear(Number(e.target.value))} style={{ width: 96 }}>
              {Array.from({ length: 7 }, (_, i) => displayYear - 3 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.from({ length: 12 }, (_, m) => (
            <button key={m} className={`btn-ghost ${m === displayMonth ? 'active' : ''}`} onClick={() => setDisplayMonth(m)} style={{ padding: '6px 8px', fontSize: 12 }}>{new Date(0, m).toLocaleString('en-IN', { month: 'short' })}</button>
          ))}
        </div>

        <MonthCalendar holidays={holidays} leaveRequests={leaveRequests} empHolidays={empHolidays} month={displayMonth} year={displayYear} />
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ margin: 0 }}>Add Holiday / Store Leave</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>

              {message && <div style={{ padding: 10, marginBottom: 12, borderRadius: 8, background: '#f1f5f9' }}>{message}</div>}

              <form style={{ display: 'grid', gap: 12 }} onSubmit={submitForm}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Date</label>
                  <input required type="date" className="glass-input" value={form.holiday_date} onChange={e => setForm(f => ({ ...f, holiday_date: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Name</label>
                  <input required className="glass-input" value={form.holiday_name} onChange={e => setForm(f => ({ ...f, holiday_name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Type</label>
                  <select className="glass-input" value={form.holiday_type} onChange={e => setForm(f => ({ ...f, holiday_type: e.target.value }))}>
                    <option value="closed">Closed (No Roster)</option>
                    <option value="open">Open (Optional Work)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Store (leave empty for all)</label>
                  <select className="glass-input" value={form.location_id} onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))}>
                    <option value="">All Locations</option>
                    {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Adding...' : 'Add Holiday'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showApplyModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApplyModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ margin: 0 }}>Apply for Leave</h3>
                <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              <form style={{ display: 'grid', gap: 12 }} onSubmit={async (e) => {
                e.preventDefault()
                setSaving(true)
                try {
                  const fd = new Date(applyForm.from_date)
                  const td = new Date(applyForm.to_date)
                  const days = Math.max(1, Math.floor((td.getTime() - fd.getTime()) / (24 * 3600 * 1000)) + 1)
                  const payload = {
                    employee_id: applyForm.employee_id,
                    leave_type: applyForm.leave_type,
                    from_date: applyForm.from_date,
                    to_date: applyForm.to_date,
                    days,
                    reason: applyForm.reason,
                    status: 'pending',
                    created_at: new Date().toISOString()
                  }
                  const { error } = await supabase.from('leave_requests').insert([payload] as never)
                  if (error) throw error
                  setShowApplyModal(false)
                  setApplyForm({ employee_id: '', leave_type: 'PL', from_date: '', to_date: '', reason: '' })
                } catch (err: any) {
                  alert('Error: ' + (err?.message || err))
                }
                setSaving(false)
              }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Employee</label>
                  <select required className="glass-input" value={applyForm.employee_id} onChange={e => setApplyForm(f => ({ ...f, employee_id: e.target.value }))}>
                    <option value="">Select Employee</option>
                    {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Leave Type</label>
                  <select className="glass-input" value={applyForm.leave_type} onChange={e => setApplyForm(f => ({ ...f, leave_type: e.target.value }))}>
                    <option value="PL">PL</option>
                    <option value="CL">CL</option>
                    <option value="ML">ML</option>
                    <option value="CO">CO</option>
                    <option value="LOP">LOP</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>From</label>
                    <input required type="date" className="glass-input" value={applyForm.from_date} onChange={e => setApplyForm(f => ({ ...f, from_date: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>To</label>
                    <input required type="date" className="glass-input" value={applyForm.to_date} onChange={e => setApplyForm(f => ({ ...f, to_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Reason</label>
                  <input required className="glass-input" value={applyForm.reason} onChange={e => setApplyForm(f => ({ ...f, reason: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowApplyModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Applying...' : 'Apply'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MonthCalendar({ holidays = [], leaveRequests = [], empHolidays = [], month = new Date().getMonth(), year = new Date().getFullYear() }: { holidays: any[], leaveRequests: any[], empHolidays: any[], month?: number, year?: number }) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const daysInMonth = last.getDate()

  const byDate: Record<string, { holidays: any[]; leaves: any[] }> = {}
  function key(d: string) { return d }
  holidays.forEach(h => { const k = key(h.holiday_date); byDate[k] ??= { holidays: [], leaves: [] }; byDate[k].holidays.push(h) })
  leaveRequests.forEach(l => {
    // map each day in the range
    try {
      const from = new Date(l.from_date)
      const to = new Date(l.to_date)
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const k = key(d.toISOString().slice(0, 10))
        byDate[k] ??= { holidays: [], leaves: [] }
        byDate[k].leaves.push(l)
      }
    } catch (e) { }
  })
  empHolidays.forEach(eh => { const k = key(eh.holiday_date); byDate[k] ??= { holidays: [], leaves: [] }; byDate[k].holidays.push(eh) })

  const weeks: any[] = []
  let week: any[] = []
  for (let i = 0; i < first.getDay(); i++) week.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(year, month, d).toISOString().slice(0, 10)
    week.push({ d, dateStr, data: byDate[dateStr] || { holidays: [], leaves: [] } })
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week) }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h => <div key={h} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{h}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateRows: `repeat(${weeks.length}, auto)`, gap: 8 }}>
        {weeks.map((w, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {w.map((cell: any, ci: number) => cell ? (
              <div key={ci} style={{ minHeight: 72, borderRadius: 8, padding: 8, background: '#0b0b0b', border: '1px solid rgba(255,140,66,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{cell.d}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {cell.data.holidays.length > 0 && <div style={{ width: 10, height: 10, background: '#f87171', borderRadius: 3 }} />}
                    {cell.data.leaves.length > 0 && <div style={{ width: 10, height: 10, background: '#60a5fa', borderRadius: 3 }} />}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', minHeight: 22 }}>
                  {cell.data.holidays.slice(0,2).map((h: any, idx: number) => <div key={idx} style={{ color: '#f87171' }}>{h.holiday_name || 'Holiday'}</div>)}
                  {cell.data.leaves.slice(0,2).map((l: any, idx: number) => <div key={idx} style={{ color: '#60a5fa' }}>{l.leave_type} — {l.employee_id ? `EMP-${l.employee_id.slice(-5).toUpperCase()}` : 'Leave'}</div>)}
                </div>
              </div>
            ) : (
              <div key={ci} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
