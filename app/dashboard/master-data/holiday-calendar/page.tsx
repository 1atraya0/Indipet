'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { HolidayCalendar, Location } from '@/lib/types'
import { Plus, X } from 'lucide-react'

type HolidayWithLocation = HolidayCalendar & {
  locations: { name: string; code: string } | null
}

export default function HolidayCalendarPage() {
  const { data: holidays, loading: hLoading, refetch: refetchHolidays } = useSupabaseTable<HolidayWithLocation>(
    () => supabase.from('holiday_calendar').select('*, locations(name, code)').order('holiday_date', { ascending: true }) as never,
    'holiday_calendar'
  )
  const { data: locations, loading: lLoading } = useSupabaseTable<Location>(
    () => supabase.from('locations').select('*').order('name'),
    'locations'
  )

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ location_id: '', holiday_date: '', holiday_name: '', holiday_type: 'open' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loading = hLoading || lLoading

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const date = new Date(form.holiday_date)
      const year = date.getFullYear()
      const { error: err } = await supabase.from('holiday_calendar').insert([{
        location_id: form.location_id || null,
        holiday_date: form.holiday_date,
        holiday_name: form.holiday_name,
        holiday_type: form.holiday_type,
        year,
        is_active: true,
      }] as never)
      if (err) throw new Error(err.message)
      // Map holiday to employees: if location specified, map to employees in that location, otherwise map to all employees
      try {
        // fetch inserted holiday id
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
      } catch (mapErr) {
        console.warn('Failed to map employees to holiday', mapErr)
      }
      setShowModal(false)
      setForm({ location_id: '', holiday_date: '', holiday_name: '', holiday_type: 'open' })
      await refetchHolidays()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create holiday')
    } finally { setSaving(false) }
  }

  const closedHolidays = holidays.filter(h => h.holiday_type === 'closed').length
  const openHolidays = holidays.filter(h => h.holiday_type === 'open').length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Holidays" value={holidays.length} icon="📅" color="#34d399" delay={0.05} loading={loading} />
        <StatCard label="Closed" value={closedHolidays} icon="🔒" color="#f87171" delay={0.1} loading={loading} />
        <StatCard label="Open" value={openHolidays} icon="🔓" color="#FFB347" delay={0.15} loading={loading} />
      </div>

      <GlassCard delay={0.2} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>Holiday Calendar</h2>
          <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 0, fontSize: '12px', padding: '8px 14px' }}>
            <Plus size={12} /> Add Holiday
          </motion.button>
        </div>
        <DataTable loading={hLoading} data={holidays} emptyIcon="📅" emptyMessage="No holidays"
          columns={[
            { key: 'holiday_date', label: 'Date', render: row => new Date(row.holiday_date).toLocaleDateString('en-IN') },
            { key: 'holiday_name', label: 'Holiday', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.holiday_name}</span> },
            { key: 'location', label: 'Location', render: row => (row.locations as { name: string } | null)?.name || 'All locations' },
            { key: 'type', label: 'Type', render: row => row.holiday_type === 'closed' ? <span className="badge badge-red">Closed</span> : <span className="badge badge-yellow">Open</span> },
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>📅 Add Holiday</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{error}</p>}
              <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Holiday Date</label>
                  <input required type="date" className="glass-input" value={form.holiday_date} onChange={e => setForm(p => ({ ...p, holiday_date: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Holiday Name</label>
                  <input required className="glass-input" placeholder="e.g., Republic Day" value={form.holiday_name} onChange={e => setForm(p => ({ ...p, holiday_name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
                  <select className="glass-input" value={form.holiday_type} onChange={e => setForm(p => ({ ...p, holiday_type: e.target.value }))}>
                    <option value="closed">Closed (No roster)</option>
                    <option value="open">Open (CO if worked)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location (leave empty for all)</label>
                  <select className="glass-input" value={form.location_id} onChange={e => setForm(p => ({ ...p, location_id: e.target.value }))}>
                    <option value="">All Locations</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Creating...' : 'Add Holiday'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
