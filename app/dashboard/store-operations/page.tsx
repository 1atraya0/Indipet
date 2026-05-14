'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { Location } from '@/lib/types'
import { X, AlertCircle } from 'lucide-react'

const statusBadge = (s: Location['status']) => {
  const map = { active: 'badge-green', inactive: 'badge-red', onboarding: 'badge-yellow' }
  return <span className={`badge ${map[s]}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
}

const typeBadge = (t: Location['type']) => (
  <span className={`badge ${t === 'company_owned' ? 'badge-blue' : 'badge-orange'}`}>
    {t === 'company_owned' ? 'Company' : 'Franchise'}
  </span>
)

export default function StoreOperationsPage() {
  const { data: locations, loading, refetch } = useSupabaseTable<Location>(
    () => supabase.from('locations').select('*').order('name'),
    'locations'
  )

  const [selected, setSelected] = useState<Location | null>(null)
  const [activateModal, setActivateModal] = useState<Location | null>(null)

  async function toggleActive(loc: Location) {
    const newStatus: Location['status'] = loc.status === 'active' ? 'inactive' : 'active'
    await supabase.from('locations').update({ status: newStatus } as never).eq('id', loc.id)
    if (selected?.id === loc.id) setSelected({ ...loc, status: newStatus })
    setActivateModal(null)
    await refetch()
  }

  const active = locations.filter(l => l.status === 'active').length
  const onboarding = locations.filter(l => l.status === 'onboarding').length
  const lowStaff = locations.filter(l => l.minimum_staff_strength <= 2 && l.status === 'active').length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Locations" value={locations.length} icon="🏪" delay={0.05} loading={loading} />
        <StatCard label="Active" value={active} icon="✅" color="#34d399" delay={0.1} loading={loading} />
        <StatCard label="Onboarding" value={onboarding} icon="🔧" color="#FFB347" delay={0.15} loading={loading} />
        <StatCard label="Low Staff Alert" value={lowStaff} icon="⚠️" color="#f87171" delay={0.2} loading={loading} />
      </div>

      {lowStaff > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          <AlertCircle size={15} style={{ color: '#fcd34d', flexShrink: 0 }} />
          <p style={{ fontSize: '12.5px', color: '#fcd34d', margin: 0 }}>
            <strong>{lowStaff} store(s)</strong> below minimum staff strength. Immediate action required.
          </p>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '20px' }}>
        <GlassCard delay={0.3} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🏪 All Locations</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{locations.length} total</span>
          </div>
          <DataTable
            loading={loading}
            data={locations}
            emptyIcon="🏪"
            emptyMessage="No locations found"
            columns={[
              { key: 'name', label: 'Store', render: row => (
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontSize: '13px' }}>{row.name}</p>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '11px' }}>{row.code} · {row.city}, {row.state}</p>
                </div>
              )},
              { key: 'type', label: 'Type', render: row => typeBadge(row.type) },
              { key: 'status', label: 'Status', render: row => statusBadge(row.status) },
              { key: 'operating_hours', label: 'Hours', render: row => <span style={{ fontSize: '12px' }}>{row.operating_hours_start} – {row.operating_hours_end}</span> },
              { key: 'minimum_staff_strength', label: 'Min Staff', render: row => (
                <span style={{ fontWeight: 600, color: row.minimum_staff_strength <= 2 ? '#f87171' : 'var(--text-secondary)' }}>{row.minimum_staff_strength}</span>
              )},
              {
                key: 'actions', label: 'Action',
                render: row => (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setSelected(selected?.id === row.id ? null : row)}
                      style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: selected?.id === row.id ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}>
                      Details
                    </motion.button>
                    {row.status !== 'onboarding' && (
                      <motion.button whileHover={{ scale: 1.05 }} onClick={() => setActivateModal(row)}
                        style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: row.status === 'active' ? 'rgba(239,68,68,0.12)' : 'rgba(52,211,153,0.12)', color: row.status === 'active' ? '#fca5a5' : '#6ee7b7' }}>
                        {row.status === 'active' ? 'Deactivate' : 'Activate'}
                      </motion.button>
                    )}
                  </div>
                )
              },
            ]}
          />
        </GlassCard>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <GlassCard style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Store Details</h3>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{selected.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{selected.address}</p>
                  </div>
                  {[
                    { label: 'Code', value: selected.code },
                    { label: 'Type', value: selected.type === 'company_owned' ? 'Company Owned' : 'Franchise' },
                    { label: 'State', value: selected.state },
                    { label: 'City', value: selected.city },
                    { label: 'Hours', value: `${selected.operating_hours_start} – ${selected.operating_hours_end}` },
                    { label: 'Min Staff', value: `${selected.minimum_staff_strength} staff` },
                    { label: 'Status', value: selected.status.charAt(0).toUpperCase() + selected.status.slice(1) },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,140,66,0.08)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Created</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>{new Date(selected.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activateModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActivateModal(null)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                {activateModal.status === 'active' ? '🔴 Deactivate Store' : '🟢 Activate Store'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {activateModal.status === 'active'
                  ? `Deactivating "${activateModal.name}" will suspend all operations. This action will be logged.`
                  : `Activating "${activateModal.name}" will resume operations and enable roster generation.`}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setActivateModal(null)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={() => toggleActive(activateModal)}>
                  {activateModal.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
