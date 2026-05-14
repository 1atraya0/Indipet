'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { AuditLog } from '@/lib/types'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

const COMPLIANCE_DATA = [
  { id: 'wb', state: 'West Bengal', pf: 'compliant', esic: 'compliant', pt: 'compliant', minwage: 'breach' },
  { id: 'mh', state: 'Maharashtra', pf: 'compliant', esic: 'compliant', pt: 'compliant', minwage: 'compliant' },
  { id: 'ka', state: 'Karnataka', pf: 'compliant', esic: 'pending', pt: 'compliant', minwage: 'compliant' },
  { id: 'up', state: 'Uttar Pradesh', pf: 'compliant', esic: 'compliant', pt: 'na', minwage: 'compliant' },
]

const actionTypeColor: Record<string, string> = {
  PAYROLL_LOCK: '#a78bfa',
  BIOMETRIC_OVERRIDE: '#FFB347',
  COMMISSION_APPROVED: '#34d399',
  LEAVE_REJECTED: '#f87171',
  EMPLOYEE_DEACTIVATED: '#f87171',
  ROSTER_OVERRIDE: '#FFB347',
}

function StatusDot({ status }: { status: string }) {
  if (status === 'compliant') return <span className="badge badge-green"><CheckCircle2 size={10} /> OK</span>
  if (status === 'breach') return <span className="badge badge-red"><AlertTriangle size={10} /> Breach</span>
  if (status === 'pending') return <span className="badge badge-yellow">Pending</span>
  return <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>N/A</span>
}

const today = new Date().toDateString()

export default function AuditPage() {
  const { data: auditLog, loading } = useSupabaseTable<AuditLog>(
    () => supabase.from('location_audit_log').select('*').order('timestamp', { ascending: false }).limit(50) as never,
    'location_audit_log'
  )

  const [tab, setTab] = useState<'log' | 'compliance'>('log')
  const [filterAction, setFilterAction] = useState('all')

  const filtered = filterAction === 'all' ? auditLog : auditLog.filter(a => a.action_type === filterAction)
  const actionTypes = [...new Set(auditLog.map(a => a.action_type))]
  const todayCount = auditLog.filter(a => new Date(a.timestamp).toDateString() === today).length
  const breaches = COMPLIANCE_DATA.filter(c => Object.values(c).includes('breach')).length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Audit Entries" value={auditLog.length} icon="📜" delay={0.05} loading={loading} />
        <StatCard label="Today's Actions" value={todayCount} icon="⚡" color="#FFB347" delay={0.1} loading={loading} />
        <StatCard label="Compliance Breaches" value={breaches} icon="⚠️" color="#f87171" delay={0.15} loading={loading} />
        <StatCard label="States Covered" value={COMPLIANCE_DATA.length} icon="🗺️" color="#34d399" delay={0.2} loading={loading} />
      </div>

      <GlassCard delay={0.25} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            {(['log', 'compliance'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                color: tab === t ? 'var(--orange-light)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--orange)' : '2px solid transparent',
              }}>
                {t === 'log' ? '📋 Audit Log' : '✅ Compliance Dashboard'}
              </button>
            ))}
          </div>
          {tab === 'log' && (
            <select className="glass-input" style={{ width: 'auto', minWidth: '180px', marginRight: '8px' }} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
              <option value="all">All Actions</option>
              {actionTypes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
        </div>

        {tab === 'log' ? (
          <DataTable loading={loading} data={filtered} emptyIcon="📜" emptyMessage="No audit entries"
            columns={[
              { key: 'timestamp', label: 'Time', render: row => <span style={{ fontSize: '11.5px', fontVariantNumeric: 'tabular-nums' }}>{new Date(row.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span> },
              { key: 'action_type', label: 'Action', render: row => (
                <span className="badge" style={{ background: `${actionTypeColor[row.action_type] || '#FF6B35'}18`, color: actionTypeColor[row.action_type] || '#FFB347', border: `1px solid ${actionTypeColor[row.action_type] || '#FF6B35'}30` }}>
                  {row.action_type.replace(/_/g, ' ')}
                </span>
              )},
              { key: 'target_record', label: 'Target', render: row => <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{row.target_record}</span> },
              { key: 'reason', label: 'Reason' },
              { key: 'actor_id', label: 'Actor', render: row => <span className="badge badge-orange">{row.actor_id}</span> },
            ]}
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DataTable loading={false} data={COMPLIANCE_DATA} emptyIcon="✅" emptyMessage="No compliance data"
              columns={[
                { key: 'state', label: 'State', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.state}</span> },
                { key: 'pf', label: 'PF', render: row => <StatusDot status={row.pf} /> },
                { key: 'esic', label: 'ESIC', render: row => <StatusDot status={row.esic} /> },
                { key: 'pt', label: 'Prof. Tax', render: row => <StatusDot status={row.pt} /> },
                { key: 'minwage', label: 'Min Wage', render: row => <StatusDot status={row.minwage} /> },
              ]}
            />
          </motion.div>
        )}
      </GlassCard>
    </div>
  )
}
