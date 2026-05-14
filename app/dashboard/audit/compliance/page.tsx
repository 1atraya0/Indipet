'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { EmployeeFinance, Payslip } from '@/lib/types'
import { FileText, X, Download, AlertCircle } from 'lucide-react'

interface ComplianceReturn {
  id: string
  return_type: 'pf' | 'esic' | 'pt'
  return_month: number
  return_year: number
  total_contribution: number
  total_employees: number
  status: 'draft' | 'approved' | 'filed'
  created_at: string
}

const returnTypes = [
  { id: 'pf', name: 'PF Returns (EPF/EPS)', icon: '📋', color: '#60a5fa' },
  { id: 'esic', name: 'ESIC Returns', icon: '🏥', color: '#34d399' },
  { id: 'pt', name: 'PT Returns', icon: '💼', color: '#FFB347' },
]

export default function ComplianceReturnsPage() {
  const { data: returns, loading: returnsLoading, refetch: refetchReturns } = useSupabaseTable<ComplianceReturn>(
    () => supabase.from('compliance_returns').select('*').order('return_year', { ascending: false }).order('return_month', { ascending: false }) as never,
    'compliance_returns'
  )
  const { data: payslips } = useSupabaseTable<Payslip>(
    () => supabase.from('payslips').select('*'),
    'payslips'
  )
  const { data: finances } = useSupabaseTable<EmployeeFinance>(
    () => supabase.from('employee_finance').select('*'),
    'employee_finance'
  )

  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedReturnType, setSelectedReturnType] = useState<'pf' | 'esic' | 'pt'>('pf')
  const [generateForm, setGenerateForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [generating, setGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<any>(null)

  async function generateReturn() {
    setGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    let data: any = {}

    if (selectedReturnType === 'pf') {
      const pfContributions = payslips.filter(p => p.period_month === generateForm.month && p.period_year === generateForm.year)
      data = {
        return_type: 'pf',
        total_employees: new Set(pfContributions.map(p => p.employee_id)).size,
        epf_contribution: pfContributions.reduce((a, b) => a + (b.pf_contribution || 0), 0),
        eps_contribution: Math.round(pfContributions.reduce((a, b) => a + (b.pf_contribution || 0) * 0.08, 0)),
        employer_contribution: Math.round(pfContributions.reduce((a, b) => a + (b.pf_contribution || 0) * 1.61, 0)),
      }
    } else if (selectedReturnType === 'esic') {
      const esicContributions = payslips.filter(p => p.period_month === generateForm.month && p.period_year === generateForm.year)
      data = {
        return_type: 'esic',
        total_employees: new Set(esicContributions.map(p => p.employee_id)).size,
        employee_contribution: esicContributions.reduce((a, b) => a + (b.esic_contribution || 0), 0),
        employer_contribution: Math.round(esicContributions.reduce((a, b) => a + (b.esic_contribution || 0) * 4, 0)),
      }
    } else if (selectedReturnType === 'pt') {
      const ptContributions = payslips.filter(p => p.period_month === generateForm.month && p.period_year === generateForm.year)
      data = {
        return_type: 'pt',
        total_employees: new Set(ptContributions.map(p => p.employee_id)).size,
        total_pt: ptContributions.reduce((a, b) => a + (b.professional_tax || 0), 0),
      }
    }

    setGeneratedData(data)
    setGenerating(false)
  }

  async function fileReturn() {
    const { error } = await supabase.from('compliance_returns').insert([{
      return_type: selectedReturnType,
      return_month: generateForm.month,
      return_year: generateForm.year,
      total_contribution: generatedData?.epf_contribution || generatedData?.employee_contribution || generatedData?.total_pt || 0,
      total_employees: generatedData?.total_employees || 0,
      status: 'filed',
    }] as never)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowGenerator(false)
      setGeneratedData(null)
      await refetchReturns()
    }
  }

  const pfReturns = returns.filter(r => r.return_type === 'pf').length
  const esicReturns = returns.filter(r => r.return_type === 'esic').length
  const ptReturns = returns.filter(r => r.return_type === 'pt').length
  const filedReturns = returns.filter(r => r.status === 'filed').length

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Returns" value={returns.length} icon="📋" color="#60a5fa" delay={0.05} loading={returnsLoading} />
        <StatCard label="PF Returns" value={pfReturns} icon="📊" color="#34d399" delay={0.1} loading={returnsLoading} />
        <StatCard label="ESIC Returns" value={esicReturns} icon="🏥" color="#FFB347" delay={0.15} loading={returnsLoading} />
        <StatCard label="PT Returns" value={ptReturns} icon="💼" color="#a78bfa" delay={0.2} loading={returnsLoading} />
        <StatCard label="Filed" value={filedReturns} icon="✅" color="#34d399" delay={0.25} loading={returnsLoading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {returnTypes.map((rt, idx) => (
          <motion.div key={rt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <GlassCard delay={0.3 + idx * 0.05} style={{ padding: '20px 24px', cursor: 'pointer' }} onClick={() => { setSelectedReturnType(rt.id as any); setShowGenerator(true); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{rt.icon}</span>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{rt.name}</h3>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, marginBottom: '12px' }}>
                {rt.id === 'pf' && 'EPF & EPS contributions'}
                {rt.id === 'esic' && 'Employee & employer split'}
                {rt.id === 'pt' && 'State-wise PT filing'}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: `${rt.color}20`,
                color: rt.color,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                width: '100%',
                justifyContent: 'center',
              }}>
                <FileText size={11} /> Generate
              </motion.button>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard delay={0.45} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0', padding: 0 }}>Compliance Filing History</h2>
        </div>
        <DataTable loading={returnsLoading} data={returns} emptyIcon="📋" emptyMessage="No returns filed"
          columns={[
            { key: 'return_type', label: 'Return Type', render: row => {
              const rt = returnTypes.find(r => r.id === row.return_type)
              return <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rt?.name}</span>
            }},
            { key: 'period', label: 'Period', render: row => `${row.return_month}/${row.return_year}` },
            { key: 'employees', label: 'Employees', render: row => row.total_employees },
            { key: 'amount', label: 'Contribution', render: row => `₹${row.total_contribution.toLocaleString('en-IN')}` },
            { key: 'status', label: 'Status', render: row => {
              const map: Record<string, string> = { draft: 'badge-yellow', approved: 'badge-blue', filed: 'badge-green' }
              return <span className={`badge ${map[row.status]}`}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span>
            }},
            { key: 'action', label: 'Action', render: row => (
              <motion.button whileHover={{ scale: 1.05 }}
                style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(96,165,250,0.12)', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Download size={11} /> Download
              </motion.button>
            ) },
          ]}
        />
      </GlassCard>

      <AnimatePresence>
        {showGenerator && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !generating && setShowGenerator(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {returnTypes.find(r => r.id === selectedReturnType)?.icon} Generate {returnTypes.find(r => r.id === selectedReturnType)?.name}
                </h2>
                {!generating && <button onClick={() => setShowGenerator(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>}
              </div>

              {!generatedData ? (
                <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Month</label>
                      <select className="glass-input" value={generateForm.month} onChange={e => setGenerateForm(p => ({ ...p, month: Number(e.target.value) }))}>
                        {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Year</label>
                      <select className="glass-input" value={generateForm.year} onChange={e => setGenerateForm(p => ({ ...p, year: Number(e.target.value) }))}>
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(96,165,250,0.08)', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)' }}>
                    <p style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 600, margin: '0 0 6px' }}>📋 Return Details</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                      {selectedReturnType === 'pf' && 'Employer & employee PF contributions with EPF/EPS split'}
                      {selectedReturnType === 'esic' && 'ESIC contribution with employee & employer breakdown'}
                      {selectedReturnType === 'pt' && 'Professional tax filings by state'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowGenerator(false)}>Cancel</button>
                    <button type="button" className="btn-primary" style={{ flex: 2 }} onClick={generateReturn}>{generating ? 'Generating...' : 'Generate Return'}</button>
                  </div>
                </form>
              ) : (
                <div>
                  <div style={{ padding: '14px', background: 'rgba(52,211,153,0.08)', borderRadius: '8px', border: '1px solid rgba(52,211,153,0.2)', marginBottom: '16px' }}>
                    <p style={{ fontSize: '11px', color: '#34d399', fontWeight: 600, margin: '0 0 10px' }}>✅ Return Generated Successfully</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <p style={{ margin: 0 }}>Period: {generateForm.month}/{generateForm.year}</p>
                      <p style={{ margin: 0 }}>Employees: {generatedData.total_employees}</p>
                      {selectedReturnType === 'pf' && (
                        <>
                          <p style={{ margin: 0 }}>EPF: ₹{generatedData.epf_contribution?.toLocaleString('en-IN')}</p>
                          <p style={{ margin: 0 }}>EPS: ₹{generatedData.eps_contribution?.toLocaleString('en-IN')}</p>
                        </>
                      )}
                      {selectedReturnType === 'esic' && (
                        <>
                          <p style={{ margin: 0 }}>Employee: ₹{generatedData.employee_contribution?.toLocaleString('en-IN')}</p>
                          <p style={{ margin: 0 }}>Employer: ₹{generatedData.employer_contribution?.toLocaleString('en-IN')}</p>
                        </>
                      )}
                      {selectedReturnType === 'pt' && (
                        <p style={{ margin: 0, gridColumn: '1 / -1' }}>Total PT: ₹{generatedData.total_pt?.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowGenerator(false)}>Close</button>
                    <button type="button" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={fileReturn}>
                      <FileText size={12} /> File Return
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
