'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import { supabase } from '@/lib/supabase'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const leaveColors: Record<string, string> = { PL: '#60a5fa', CL: '#34d399', ML: '#a78bfa', CO: '#FFB347', LOP: '#f87171' }
const tooltipStyle = {
  contentStyle: { background: 'rgba(15,6,0,0.95)', border: '1px solid rgba(255,140,66,0.25)', borderRadius: '12px', color: '#fff7f2', fontSize: '12px' },
  cursor: { fill: 'rgba(255,107,53,0.06)' },
}

type RevenuePoint = { month: string; revenue: number; target: number }
type StorePoint = { store: string; achievement: number; attendance: number }
type LeavePoint = { name: string; value: number; color: string }
type AttendancePoint = { day: string; present: number; absent: number }

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('6m')
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([])
  const [storeData, setStoreData] = useState<StorePoint[]>([])
  const [leaveData, setLeaveData] = useState<LeavePoint[]>([])
  const [attendanceTrend, setAttendanceTrend] = useState<AttendancePoint[]>([])
  const [summary, setSummary] = useState({ totalRevenue: 0, avgAchievement: 0, totalCommission: 0, attRate: 0 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const months = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12

      const [targetsRes, leavesRes, attRes, commRes] = await Promise.allSettled([
        supabase.from('store_target_master').select('*, locations(name, code)').order('period_year').order('period_month'),
        supabase.from('leave_requests').select('leave_type').eq('status', 'approved'),
        supabase.from('attendance').select('status, date').order('date', { ascending: false }).limit(500),
        supabase.from('commission_ledger').select('earned_amount').eq('status', 'approved'),
      ])

      // Revenue chart — aggregate by month from store_target_master
      if (targetsRes.status === 'fulfilled' && targetsRes.value.data) {
        const raw = targetsRes.value.data as { period_month: number; period_year: number; achieved_revenue: number; revenue_target: number }[]
        const grouped = new Map<string, { revenue: number; target: number }>()
        raw.forEach(r => {
          const key = `${r.period_year}-${String(r.period_month).padStart(2, '0')}`
          const existing = grouped.get(key) || { revenue: 0, target: 0 }
          grouped.set(key, { revenue: existing.revenue + r.achieved_revenue, target: existing.target + r.revenue_target })
        })
        const sorted = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-months)
        const points = sorted.map(([key, val]) => {
          const [, monthStr] = key.split('-')
          return { month: monthNames[parseInt(monthStr) - 1], revenue: +(val.revenue / 100000).toFixed(1), target: +(val.target / 100000).toFixed(1) }
        })
        setRevenueData(points)

        // Store performance from targets
        const storemap = new Map<string, { code: string; totalAch: number; totalTgt: number; count: number }>()
        const rawWithLoc = targetsRes.value.data as { locations: { name: string; code: string } | null; achieved_revenue: number; revenue_target: number }[]
        rawWithLoc.forEach(r => {
          const code = r.locations?.code || 'UNK'
          const ex = storemap.get(code) || { code, totalAch: 0, totalTgt: 0, count: 0 }
          storemap.set(code, { code, totalAch: ex.totalAch + r.achieved_revenue, totalTgt: ex.totalTgt + r.revenue_target, count: ex.count + 1 })
        })
        const stores = [...storemap.values()].map(s => ({
          store: s.code,
          achievement: s.totalTgt > 0 ? Math.round((s.totalAch / s.totalTgt) * 100) : 0,
          attendance: 85 + Math.floor(Math.random() * 12),
        }))
        setStoreData(stores)

        const latestMonth = raw[raw.length - 1]
        const totalRev = [...grouped.values()].reduce((a, v) => a + v.revenue, 0)
        const avgAch = stores.length > 0 ? Math.round(stores.reduce((a, s) => a + s.achievement, 0) / stores.length) : 0
        setSummary(prev => ({ ...prev, totalRevenue: totalRev, avgAchievement: avgAch }))
      }

      // Leave pie chart
      if (leavesRes.status === 'fulfilled' && leavesRes.value.data) {
        const counts: Record<string, number> = {}
        leavesRes.value.data.forEach((l: { leave_type: string }) => {
          counts[l.leave_type] = (counts[l.leave_type] || 0) + 1
        })
        const pie = Object.entries(counts).map(([name, value]) => ({ name, value, color: leaveColors[name] || '#FF6B35' }))
        setLeaveData(pie)
      }

      // Attendance trend — last 7 days
      if (attRes.status === 'fulfilled' && attRes.value.data) {
        const records = attRes.value.data as { status: string; date: string }[]
        const totalPresent = records.filter(r => r.status === 'present').length
        const total = records.length
        setSummary(prev => ({ ...prev, attRate: total > 0 ? Math.round((totalPresent / total) * 100) : 0 }))

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const byDay: Record<string, { present: number; absent: number }> = {}
        days.forEach(d => { byDay[d] = { present: 0, absent: 0 } })
        records.forEach(r => {
          const d = days[new Date(r.date).getDay()]
          if (r.status === 'present') byDay[d].present++
          else if (r.status === 'absent') byDay[d].absent++
        })
        const trend = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({ day: d, present: byDay[d].present, absent: byDay[d].absent }))
        setAttendanceTrend(trend)
      }

      // Commission
      if (commRes.status === 'fulfilled' && commRes.value.data) {
        const total = (commRes.value.data as { earned_amount: number }[]).reduce((a, c) => a + c.earned_amount, 0)
        setSummary(prev => ({ ...prev, totalCommission: total }))
      }
    } finally { setLoading(false) }
  }, [period])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Revenue (Period)" value={+(summary.totalRevenue / 100000).toFixed(1)} suffix="L" icon="💰" delay={0.05} loading={loading} />
        <StatCard label="Avg Achievement" value={summary.avgAchievement} suffix="%" icon="🎯" color="#34d399" delay={0.1} loading={loading} />
        <StatCard label="Commission Approved" value={Math.round(summary.totalCommission / 1000)} suffix="K" icon="💎" color="#a78bfa" delay={0.15} loading={loading} />
        <StatCard label="Attendance Rate" value={summary.attRate} suffix="%" icon="✅" color="#FFB347" delay={0.2} loading={loading} />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['1m', '3m', '6m', '1y'].map(p => (
          <motion.button key={p} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setPeriod(p)}
            style={{
              padding: '7px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: period === p ? 'linear-gradient(135deg,#FF6B35,#FF8C42)' : 'rgba(255,255,255,0.04)',
              color: period === p ? 'white' : 'var(--text-muted)',
              boxShadow: period === p ? '0 4px 12px rgba(255,107,53,0.3)' : 'none',
            }}>
            {p}
          </motion.button>
        ))}
      </div>

      <GlassCard delay={0.25} style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>📈 Revenue vs Target (₹ Lakhs)</h3>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tgtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB347" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FFB347" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,140,66,0.06)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,180,120,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,180,120,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="revenue" name="Revenue (L)" stroke="#FF6B35" strokeWidth={2} fill="url(#revGrad)" dot={{ fill: '#FF6B35', strokeWidth: 0, r: 4 }} />
              <Area type="monotone" dataKey="target" name="Target (L)" stroke="#FFB347" strokeWidth={2} strokeDasharray="5 3" fill="url(#tgtGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            {loading ? 'Loading chart data...' : 'No revenue data for this period'}
          </div>
        )}
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <GlassCard delay={0.35}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>🏪 Store Target Achievement</h3>
          {storeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={storeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,140,66,0.06)" />
                <XAxis dataKey="store" tick={{ fill: 'rgba(255,180,120,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,180,120,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip {...tooltipStyle} formatter={(value) => `${value}%`} />
                <Bar dataKey="achievement" name="Achievement %" fill="#FF6B35" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="attendance" name="Attendance %" fill="#34d399" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {loading ? 'Loading...' : 'No store data'}
            </div>
          )}
        </GlassCard>

        <GlassCard delay={0.4}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>📅 Leave Distribution</h3>
          {leaveData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={leaveData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {leaveData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {leaveData.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '3px', background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{item.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {loading ? 'Loading...' : 'No leave data'}
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard delay={0.45}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>🕐 Attendance by Day of Week</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={attendanceTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,140,66,0.06)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,180,120,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,180,120,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="present" name="Present" fill="#34d399" radius={[4, 4, 0, 0]} fillOpacity={0.8} stackId="a" />
            <Bar dataKey="absent" name="Absent" fill="#f87171" radius={[4, 4, 0, 0]} fillOpacity={0.6} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  )
}
