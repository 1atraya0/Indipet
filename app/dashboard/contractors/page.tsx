'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { ContractorProfile, ContractorInvoice } from '@/lib/types'
import { CheckCircle2, XCircle } from 'lucide-react'

type InvoiceWithContractor = ContractorInvoice & {
  contractor_profiles: { name: string; role: string } | null
}

type ProfileWithLocation = ContractorProfile & {
  locations: { name: string } | null
}

const statusBadge = (s: ContractorInvoice['status']) => {
  const map = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red', paid: 'badge-green' }
  return <span className={`badge ${map[s]}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ContractorsPage() {
  const { data: contractors, loading: cLoading } = useSupabaseTable<ProfileWithLocation>(
    () => supabase.from('contractor_profiles').select('*, locations(name)').order('name') as never,
    'contractor_profiles'
  )
  const { data: invoices, loading: iLoading, refetch: refetchInvoices } = useSupabaseTable<InvoiceWithContractor>(
    () => supabase.from('contractor_invoices').select('*, contractor_profiles(name, role)').order('created_at', { ascending: false }) as never,
    'contractor_invoices'
  )

  const [tab, setTab] = useState<'invoices' | 'contractors'>('invoices')
  const [saving, setSaving] = useState(false)

  const loading = cLoading || iLoading

  async function approveInvoice(id: string) {
    setSaving(true)
    await supabase.from('contractor_invoices').update({ status: 'approved', approved_by: 'super_admin' } as never).eq('id', id)
    await refetchInvoices()
    setSaving(false)
  }

  async function rejectInvoice(id: string) {
    setSaving(true)
    await supabase.from('contractor_invoices').update({ status: 'rejected', approved_by: 'super_admin' } as never).eq('id', id)
    await refetchInvoices()
    setSaving(false)
  }

  const pendingCount = invoices.filter(i => i.status === 'pending').length
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((a, i) => a + i.amount, 0)
  const kpiMiss = invoices.filter(i => !i.kpi_achieved && i.status === 'pending').length
  const activeContractors = contractors.filter(c => c.status === 'active').length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Active Contractors" value={activeContractors} icon="🤝" delay={0.05} loading={loading} />
        <StatCard label="Pending Invoices" value={pendingCount} icon="📋" color="#FFB347" delay={0.1} loading={loading} />
        <StatCard label="Pending Amount" value={Math.round(pendingAmount / 1000)} suffix="K" icon="💰" color="#a78bfa" delay={0.15} loading={loading} />
        <StatCard label="KPI Misses" value={kpiMiss} icon="⚠️" color="#f87171" delay={0.2} loading={loading} />
      </div>

      <GlassCard delay={0.25} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)' }}>
          {(['invoices', 'contractors'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              color: tab === t ? 'var(--orange-light)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--orange)' : '2px solid transparent',
            }}>
              {t === 'invoices' ? '🧾 Invoices' : '🤝 Contractor Profiles'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'invoices' ? (
            <motion.div key="invoices" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable loading={iLoading} data={invoices} emptyIcon="🧾" emptyMessage="No invoices"
                columns={[
                  { key: 'contractor', label: 'Contractor', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(row.contractor_profiles as { name: string } | null)?.name || row.contractor_id}</span> },
                  { key: 'role', label: 'Role', render: row => (row.contractor_profiles as { role: string } | null)?.role || '—' },
                  { key: 'period', label: 'Period', render: row => `${monthNames[row.period_month - 1]} ${row.period_year}` },
                  { key: 'amount', label: 'Amount', render: row => <span style={{ fontWeight: 700, color: 'var(--orange-light)' }}>₹{row.amount.toLocaleString('en-IN')}</span> },
                  { key: 'kpi_achieved', label: 'KPI', render: row => row.kpi_achieved
                    ? <span className="badge badge-green"><CheckCircle2 size={10} /> Achieved</span>
                    : <span className="badge badge-red"><XCircle size={10} /> Missed</span>
                  },
                  { key: 'status', label: 'Status', render: row => statusBadge(row.status) },
                  {
                    key: 'action', label: 'Action',
                    render: row => row.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => !saving && approveInvoice(row.id)} disabled={!row.kpi_achieved}
                          style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: row.kpi_achieved ? 'pointer' : 'not-allowed', border: 'none', background: 'rgba(52,211,153,0.12)', color: '#6ee7b7', opacity: row.kpi_achieved ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={11} /> Approve
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => !saving && rejectInvoice(row.id)}
                          style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.12)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <XCircle size={11} /> Reject
                        </motion.button>
                      </div>
                    ) : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                  },
                ]}
              />
            </motion.div>
          ) : (
            <motion.div key="contractors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable loading={cLoading} data={contractors} emptyIcon="🤝" emptyMessage="No contractors"
                columns={[
                  { key: 'name', label: 'Name', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span> },
                  { key: 'role', label: 'Role' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'location', label: 'Store', render: row => (row.locations as { name: string } | null)?.name || row.location_id },
                  { key: 'kpi_score', label: 'KPI Score', render: row => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '50px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${row.kpi_score}%`, height: '100%', borderRadius: '3px', background: row.kpi_score >= 90 ? '#34d399' : row.kpi_score >= 70 ? '#FFB347' : '#f87171' }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{row.kpi_score}</span>
                    </div>
                  )},
                  { key: 'status', label: 'Status', render: row => row.status === 'active' ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Inactive</span> },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  )
}
