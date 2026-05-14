'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type PendingLeave = {
  id: string
  employee_id: string
  leave_type: string
  from_date: string
  to_date: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  employees: {
    full_name: string
    employee_code: string
  } | null
}

type AttendanceException = {
  id: string
  employee_id: string
  date: string
  check_in: string | null
  check_out: string | null
  biometric_verified: boolean
  biometric_override: boolean
  status: string
}

export default function StoreAdminPortalPage() {
  const router = useRouter()
  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([])
  const [exceptions, setExceptions] = useState<AttendanceException[]>([])
  const [overrideReason, setOverrideReason] = useState('Manual verification by store admin')
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role !== 'store_admin') {
      alert('Access denied. Please login as store admin.')
      router.push('/login')
      return
    }
    void loadData()
  }, [router])

  async function loadData() {
    setError(null)

    const { data: leaves, error: leaveErr } = await supabase
      .from('leave_requests')
      .select('id,employee_id,leave_type,from_date,to_date,days,reason,status,employees(full_name,employee_code)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (leaveErr) {
      setError(leaveErr.message)
      return
    }

    const { data: attendanceData, error: attendanceErr } = await supabase
      .from('attendance')
      .select('id,employee_id,date,check_in,check_out,biometric_verified,biometric_override,status')
      .eq('status', 'present')
      .eq('biometric_verified', false)
      .eq('biometric_override', false)
      .order('date', { ascending: false })

    if (attendanceErr) {
      setError(attendanceErr.message)
      return
    }

    setPendingLeaves((leaves ?? []) as PendingLeave[])
    setExceptions((attendanceData ?? []) as AttendanceException[])
  }

  async function reviewLeave(id: string, decision: 'approved' | 'rejected') {
    setBusyId(id)
    setError(null)
    setMsg(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const approver = userData.user?.email ?? 'store-admin'

      const { error: updateErr } = await supabase
        .from('leave_requests')
        .update({ status: decision, approved_by: approver, approved_at: new Date().toISOString() } as never)
        .eq('id', id)

      if (updateErr) throw updateErr
      setMsg(`Leave request ${decision}.`)
      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Leave action failed')
    } finally {
      setBusyId(null)
    }
  }

  async function overrideAttendance(id: string) {
    setBusyId(id)
    setError(null)
    setMsg(null)
    try {
      const { error: overrideErr } = await supabase
        .from('attendance')
        .update({ biometric_override: true, override_reason: overrideReason } as never)
        .eq('id', id)

      if (overrideErr) throw overrideErr
      setMsg('Attendance exception overridden successfully.')
      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Attendance override failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section style={{ minHeight: '100vh', padding: '24px', display: 'grid', gap: '16px' }}>
      <div className="glass-strong" style={{ padding: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Store Admin Portal</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Approve leaves and resolve attendance verification exceptions.
        </p>
      </div>

      {error && <p style={{ color: '#fecaca', margin: 0 }}>{error}</p>}
      {msg && <p style={{ color: '#86efac', margin: 0 }}>{msg}</p>}

      <div className="glass-strong" style={{ padding: '16px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '18px' }}>Pending Leave Requests</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          {pendingLeaves.length === 0 && <p style={{ margin: 0, color: 'var(--text-muted)' }}>No pending leave requests.</p>}
          {pendingLeaves.map((leave) => (
            <div key={leave.id} style={{ border: '1px solid rgba(255,140,66,0.2)', borderRadius: '10px', padding: '10px', display: 'grid', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>
                {leave.employees?.full_name ?? 'Unknown'} ({leave.employees?.employee_code ?? '-'}) | {leave.leave_type}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                {leave.from_date} to {leave.to_date} | {leave.days} day(s) | {leave.reason}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" disabled={busyId === leave.id} onClick={() => void reviewLeave(leave.id, 'approved')}>Approve</button>
                <button className="btn-ghost" disabled={busyId === leave.id} onClick={() => void reviewLeave(leave.id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-strong" style={{ padding: '16px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '18px' }}>Attendance Exceptions</h2>
        <input className="glass-input" value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="Override reason" />
        <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
          {exceptions.length === 0 && <p style={{ margin: 0, color: 'var(--text-muted)' }}>No pending attendance exceptions.</p>}
          {exceptions.map((item) => (
            <div key={item.id} style={{ border: '1px solid rgba(255,140,66,0.2)', borderRadius: '10px', padding: '10px', display: 'grid', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>
                Employee ID: {item.employee_id} | Date: {item.date}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Check-in: {item.check_in ?? '-'} | Check-out: {item.check_out ?? '-'}
              </p>
              <button className="btn-primary" disabled={busyId === item.id} onClick={() => void overrideAttendance(item.id)}>
                Mark as Manually Verified
              </button>
            </div>
          ))}
        </div>
      </div>

      <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none' }}>← Back to Login</Link>
    </section>
  )
}
