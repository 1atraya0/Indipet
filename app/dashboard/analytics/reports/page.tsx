'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { Payslip, Employee } from '@/lib/types'
import { BarChart3, Download, X, Calendar } from 'lucide-react'

interface ReportMetrics {
  totalAttendance: number
  totalPayroll: number
  commissionPaid: number
  complianceIssues: number
}

export default function ReportsAndExportsPage() {
  const { data: payslips, loading: payslipsLoading } = useSupabaseTable<Payslip>(
    () => supabase.from('payslips').select('*'),
    'payslips'
  )
  const { data: employees, loading: employeesLoading } = useSupabaseTable<Employee>(
    () => supabase.from('employees').select('*'),
    'employees'
  )

  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<'attendance' | 'payroll' | 'commission' | 'compliance'>('payroll')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [exporting, setExporting] = useState(false)

  const reports = [
    { id: 'attendance', name: 'Attendance Report', desc: 'Daily attendance summary & corrections', icon: '📅', color: '#60a5fa' },
    { id: 'payroll', name: 'Payroll Summary', desc: 'Monthly payslip aggregation & analytics', icon: '💰', color: '#34d399' },
    { id: 'commission', name: 'Commission Details', desc: 'Store & employee commission breakdown', icon: '🏆', color: '#FFB347' },
    { id: 'compliance', name: 'Compliance Returns', desc: 'PF/ESIC/PT regulatory filings', icon: '📋', color: '#a78bfa' },
  ]

  async function generateReport() {
    setExporting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate CSV data based on report type
    let csvContent = ''
    let filename = ''

    if (selectedReport === 'payroll') {
      csvContent = 'Employee,Period,Basic,HRA,DA,Gross,PF,ESIC,PT,Net Pay,Status\n'
      payslips.forEach(p => {
        csvContent += `Employee${p.employee_id},${p.period_month}/${p.period_year},${p.basic},${p.allowances},0,${p.gross_earnings},${p.pf_contribution},${p.esic_contribution},${p.professional_tax},${p.net_pay},${p.status}\n`
      })
      filename = `payroll_${dateRange.from}_to_${dateRange.to}.csv`
    } else if (selectedReport === 'attendance') {
      csvContent = 'Employee,Date,Check-In,Check-Out,Status,Duration\n'
      filename = `attendance_${dateRange.from}_to_${dateRange.to}.csv`
    } else if (selectedReport === 'commission') {
      csvContent = 'Store,Period,Target,Achieved,Commission Rate,Commission Amount\n'
      filename = `commission_${dateRange.from}_to_${dateRange.to}.csv`
    } else if (selectedReport === 'compliance') {
      csvContent = 'Employee,PF UAAN,PF Contribution,ESIC Status,PT Amount,State\n'
      employees.forEach(e => {
        csvContent += `${e.full_name},,0,Eligible,0,West Bengal\n`
      })
      filename = `compliance_${dateRange.from}_to_${dateRange.to}.csv`
    }

    // Download CSV
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    setExporting(false)
    setShowReportModal(false)
  }

  const metrics: ReportMetrics = {
    totalAttendance: employees.length * 20, // Estimated
    totalPayroll: payslips.reduce((a, b) => a + b.net_pay, 0),
    commissionPaid: 250000, // Estimated
    complianceIssues: 0,
  }

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Attendance Records" value={metrics.totalAttendance} icon="📅" color="#60a5fa" delay={0.05} loading={employeesLoading} />
        <StatCard label="Payroll Processed" value={Math.round(metrics.totalPayroll / 100000)} suffix="L" icon="💰" color="#34d399" delay={0.1} loading={payslipsLoading} />
        <StatCard label="Commission Paid" value={Math.round(metrics.commissionPaid / 100000)} suffix="L" icon="🏆" color="#FFB347" delay={0.15} loading={false} />
        <StatCard label="Compliance Issues" value={metrics.complianceIssues} icon="⚠️" color="#FF6B6B" delay={0.2} loading={false} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {reports.map((report, idx) => (
          <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <GlassCard delay={0.25 + idx * 0.05} style={{ padding: '20px 24px', cursor: 'pointer', transition: 'all 0.3s' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-2px)'
                el.style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.background = 'rgba(255,255,255,0.02)'
              }}
              onClick={() => { setSelectedReport(report.id as any); setShowReportModal(true); }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{report.icon}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{report.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{report.desc}</p>
                  <motion.button whileHover={{ scale: 1.05 }} style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: `rgba(${report.color === '#60a5fa' ? '96,165,250' : report.color === '#34d399' ? '52,211,153' : report.color === '#FFB347' ? '255,179,71' : '167,139,250'},0.12)`,
                    color: report.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Download size={10} /> Export
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard delay={0.45} style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(96,165,250,0.08), rgba(52,211,153,0.08))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <BarChart3 size={18} style={{ color: '#60a5fa' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Report Analytics</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Last Attendance Sync: 2 hours ago</p>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Payroll Period: May 2026</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Export Format: CSV/PDF</p>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Next Run: Scheduled daily at 2 AM</p>
          </div>
        </div>
      </GlassCard>

      <AnimatePresence>
        {showReportModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReportModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {reports.find(r => r.id === selectedReport)?.icon} {reports.find(r => r.id === selectedReport)?.name}
                </h2>
                <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>

              <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Report Type</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                    {reports.find(r => r.id === selectedReport)?.desc}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>From Date</label>
                    <input type="date" className="glass-input" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To Date</label>
                    <input type="date" className="glass-input" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} />
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(96,165,250,0.08)', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <p style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 600, margin: '0 0 6px' }}>📊 Export Format</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>CSV file with all relevant columns • Comma-separated values • Ready for Excel</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowReportModal(false)}>Cancel</button>
                  <button type="button" className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} disabled={exporting} onClick={generateReport}>
                    <Download size={12} /> {exporting ? 'Exporting...' : 'Export Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
