'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { Plus, X } from 'lucide-react'

const DEPARTMENTS = [
  { id: '1', name: 'Operations', code: 'OPS', designation_count: 4 },
  { id: '2', name: 'Management', code: 'MGMT', designation_count: 3 },
  { id: '3', name: 'Sales', code: 'SALES', designation_count: 2 },
  { id: '4', name: 'Grooming', code: 'GROO', designation_count: 3 },
]

const DESIGNATIONS = [
  { id: '1', name: 'Senior Groomer', department: 'Grooming', min_wage: 18000, grade: 'B' },
  { id: '2', name: 'Junior Groomer', department: 'Grooming', min_wage: 14000, grade: 'C' },
  { id: '3', name: 'Store Manager', department: 'Management', min_wage: 25000, grade: 'A' },
  { id: '4', name: 'Area Manager', department: 'Management', min_wage: 40000, grade: 'S' },
  { id: '5', name: 'Sales Executive', department: 'Sales', min_wage: 16000, grade: 'B' },
  { id: '6', name: 'Receptionist', department: 'Operations', min_wage: 13000, grade: 'D' },
]

const PT_SLABS = [
  { id: '1', state: 'West Bengal', min_income: 10001, max_income: 15000, pt_amount: 110 },
  { id: '2', state: 'West Bengal', min_income: 15001, max_income: 25000, pt_amount: 130 },
  { id: '3', state: 'West Bengal', min_income: 25001, max_income: 40000, pt_amount: 150 },
  { id: '4', state: 'West Bengal', min_income: 40001, max_income: 999999, pt_amount: 200 },
  { id: '5', state: 'Maharashtra', min_income: 10001, max_income: 999999, pt_amount: 200 },
]

const tabs = ['departments', 'designations', 'pt_slabs'] as const
const tabLabels = { departments: '🏢 Departments', designations: '🎖️ Designations & Min Wage', pt_slabs: '📊 PT Slabs' }

export default function MasterDataPage() {
  const [tab, setTab] = useState<typeof tabs[number]>('designations')

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Departments" value={DEPARTMENTS.length} icon="🏢" delay={0.05} />
        <StatCard label="Designations" value={DESIGNATIONS.length} icon="🎖️" color="#34d399" delay={0.1} />
        <StatCard label="PT Slabs" value={PT_SLABS.length} icon="📊" color="#a78bfa" delay={0.15} />
        <StatCard label="States" value={[...new Set(PT_SLABS.map(p => p.state))].length} icon="🗺️" color="#FFB347" delay={0.2} />
      </div>

      <GlassCard delay={0.25} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, whiteSpace: 'nowrap',
              color: tab === t ? 'var(--orange-light)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--orange)' : '2px solid transparent',
            }}>
              {tabLabels[t]}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'departments' && (
            <motion.div key="dept" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable data={DEPARTMENTS} loading={false} emptyIcon="🏢" emptyMessage="No departments"
                columns={[
                  { key: 'name', label: 'Department', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span> },
                  { key: 'code', label: 'Code', render: row => <code style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '5px' }}>{row.code}</code> },
                  { key: 'designation_count', label: 'Designations', render: row => <span className="badge badge-blue">{row.designation_count}</span> },
                ]}
              />
            </motion.div>
          )}
          {tab === 'designations' && (
            <motion.div key="desig" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable data={DESIGNATIONS} loading={false} emptyIcon="🎖️" emptyMessage="No designations"
                columns={[
                  { key: 'name', label: 'Designation', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span> },
                  { key: 'department', label: 'Department' },
                  { key: 'grade', label: 'Grade', render: row => <span className="badge badge-orange">{row.grade}</span> },
                  { key: 'min_wage', label: 'Min Wage', render: row => <span style={{ fontWeight: 700, color: 'var(--orange-light)' }}>₹{row.min_wage.toLocaleString('en-IN')}/mo</span> },
                ]}
              />
            </motion.div>
          )}
          {tab === 'pt_slabs' && (
            <motion.div key="pt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable data={PT_SLABS} loading={false} emptyIcon="📊" emptyMessage="No PT slabs"
                columns={[
                  { key: 'state', label: 'State', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.state}</span> },
                  { key: 'min_income', label: 'From (₹)', render: row => `₹${row.min_income.toLocaleString('en-IN')}` },
                  { key: 'max_income', label: 'To (₹)', render: row => row.max_income === 999999 ? 'No limit' : `₹${row.max_income.toLocaleString('en-IN')}` },
                  { key: 'pt_amount', label: 'PT Amount', render: row => <span style={{ fontWeight: 700, color: 'var(--orange-light)' }}>₹{row.pt_amount}/mo</span> },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  )
}
