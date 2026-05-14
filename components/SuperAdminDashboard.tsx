'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import { supabase } from '@/lib/supabase'
import type {
  AdvanceSalary,
  AuditLog,
  Attendance,
  COLedger,
  CommissionLedger,
  ContractorInvoice,
  ContractorProfile,
  Employee,
  LeaveBalance,
  LeaveRequest,
  Location,
  PayrollPeriod,
  Roster,
  Shift,
  WarningRecord,
} from '@/lib/types'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  DollarSign,
  FileText,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wallet,
  WandSparkles,
  XCircle,
} from 'lucide-react'

type StoreTargetRow = {
  id: string
  location_id: string
  period_month: number
  period_year: number
  revenue_target: number
  grooming_target: number
  achieved_revenue: number
  achieved_grooming: number
  locations: { name: string; code: string } | null
}

type SalesTargetRow = {
  id: string
  employee_id: string
  period_month: number
  period_year: number
  target_amount: number
  achieved_amount: number
  employees: { full_name: string; employee_code: string; designation: string; is_salesperson: boolean } | null
}

type OutletStatus = {
  locationId: string
  name: string
  code: string
  status: 'open' | 'alert' | 'closed'
  staffIn: number
  capacity: number
  mode: string
  keyholderPresent: boolean
  activeEmployees: number
  onLeave: number
  absent: number
}

type DetailRow = {
  label: string
  value: string
  meta?: string
  tone?: 'default' | 'good' | 'warn' | 'bad' | 'info'
  onClick?: () => void
}

type DetailState = {
  title: string
  subtitle?: string
  rows: DetailRow[]
}

type AlertItem = {
  id: string
  severity: 'critical' | 'high' | 'normal'
  title: string
  detail: string
  action: string
  tint: string
  onClick?: () => void
}

type AttendanceCard = {
  label: string
  value: number | string
  note: string
  tone: 'good' | 'warn' | 'bad' | 'info'
  onClick?: () => void
}

type WorkforceTrendPoint = {
  month: string
  attendanceRate: number
  leaveUtilization: number
  overtimeHours: number
}

type Snapshot = {
  raw: {
    locations: Location[]
    employees: Employee[]
    attendance: Attendance[]
    leaveRequests: LeaveRequest[]
    leaveBalances: LeaveBalance[]
    rosters: Roster[]
    shifts: Shift[]
    payrollPeriods: PayrollPeriod[]
    commissions: CommissionLedger[]
    contractorProfiles: ContractorProfile[]
    contractorInvoices: ContractorInvoice[]
    audits: AuditLog[]
    warnings: WarningRecord[]
    advances: AdvanceSalary[]
    coLedger: COLedger[]
    storeTargets: StoreTargetRow[]
    salesTargets: SalesTargetRow[]
  }
  liveStats: {
    employees: number
    activeStores: number
    pendingLeaves: number
    attendanceToday: number
    commissionPending: number
    contractorsPending: number
    complianceAlerts: number
    payrollStatus: string
  }
  outlets: OutletStatus[]
  attendanceCards: AttendanceCard[]
  alerts: AlertItem[]
  workforce: {
    companyHeadcount: number
    franchiseHeadcount: number
    contractorHeadcount: number
    attendanceRate: number
    leaveUtilization: number
    lateMarkRate: number
    absenteeismRate: number
    regularisations: number
    overtimeHours: number
  }
  workforceTrend: WorkforceTrendPoint[]
  roster: {
    generated: number
    totalOutlets: number
    published: number
    locked: number
    overrideEvents: number
    emergencyOverrides: number
    uncoveredAbsences: number
    keyholderCoverage: number
    minSalespersonMet: number
    consecutiveDayBreaches: number
    restHourBreaches: number
  }
  leaveSummary: {
    approved: number
    rejected: number
    pending: number
    escalated: number
    leaveTypeDays: Record<string, number>
    coEarned: number
    coUsed: number
    coExpiring: number
    coExpired: number
  }
  payroll: {
    cycleStatus: string
    lockDate: string
    disbursementDate: string
    totalLiability: number
    basicAndAllowances: number
    performanceVariable: number
    statutoryDeductions: number
    exceptionsPending: number
    minimumWageBreaches: number
    advancesOutstanding: number
    entityPayroll: {
      pvtLtd: number
      proprietorship: number
    }
  }
  commission: {
    storeTargets: Array<{ store: string; achievement: number; pool: string; revenue: number; target: number }>
    individual: {
      locked: number
      pending: number
      reversed: number
      groomerCommission: number
      contractorPaymentsDue: number
    }
    topOutlet: { name: string; achievement: number }
    lowestOutlet: { name: string; achievement: number }
  }
  compliance: {
    pfStatus: string
    esicStatus: string
    ptStatus: string
    gratuityEligible: number
    gratuityApproaching: number
    gratuityProvision: number
    activeFnF: number
    fnfPendingApproval: number
    abscondingCases: number
    onProprietorship: number
    onIplPayroll: number
    transferPending: number
  }
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL
  && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
)
const tooltipStyle = {
  contentStyle: { background: 'rgba(15,6,0,0.98)', border: '1px solid rgba(255,140,66,0.25)', borderRadius: '12px', color: '#fff7f2', fontSize: '12px' },
  cursor: { fill: 'rgba(255,107,53,0.06)' },
}

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function isoDate(date: Date) {
  return date.toISOString().split('T')[0]
}

function startOfWeek(date: Date) {
  const result = new Date(date)
  const day = result.getDay() === 0 ? 6 : result.getDay() - 1
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - day)
  return result
}

function endOfWeek(date: Date) {
  const result = startOfWeek(date)
  result.setDate(result.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

function startOfMonth(date: Date) {
  const result = new Date(date)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfMonth(date: Date) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + 1, 0)
  result.setHours(23, 59, 59, 999)
  return result
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function parseTimeToMinutes(value: string | null | undefined) {
  if (!value) return null
  const [hours, minutes] = value.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

function sameRange(date: string, start: string, end: string) {
  const point = toDate(date).getTime()
  return point >= toDate(start).getTime() && point <= toDate(end).getTime()
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function isKeyholder(employee: Employee) {
  return /manager|lead|supervisor|area manager/i.test(employee.designation)
}

function isSalesperson(employee: Employee) {
  return employee.is_salesperson || /sales|groomer/i.test(employee.designation)
}

function daysBetween(a: string, b: string) {
  return Math.abs(toDate(a).getTime() - toDate(b).getTime()) / 86400000
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function buildDetailRows(items: Array<{ label: string; value: string; meta?: string; tone?: DetailRow['tone']; onClick?: () => void }>): DetailRow[] {
  return items
}

export default function SuperAdminDashboard() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [detail, setDetail] = useState<DetailState | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const safeSelect = useCallback(async <T,>(query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>, fallback: T[] = []): Promise<T[]> => {
    try {
      const { data, error } = await query
      if (error) {
        console.error('Supabase query error:', error.message)
        return fallback
      }
      return data ?? fallback
    } catch (err) {
      console.error('Supabase select exception:', err instanceof Error ? err.message : String(err))
      return fallback
    }
  }, [])

  const fetchDashboard = useCallback(async (quiet = false) => {
    if (quiet) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    if (!SUPABASE_CONFIGURED) {
      setSnapshot(null)
      setSeedMsg('Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in Vercel, then redeploy.')
      setLoading(false)
      setRefreshing(false)
      return
    }

    try {
      const today = new Date()
      const todayKey = isoDate(today)
      const weekStart = startOfWeek(today)
      const weekEnd = endOfWeek(today)
      const monthStart = startOfMonth(today)
      const monthEnd = endOfMonth(today)
      const monthBack = Array.from({ length: 4 }, (_, index) => {
        const cursor = new Date(today)
        cursor.setMonth(cursor.getMonth() - (3 - index))
        return { key: monthKey(cursor), label: monthNames[cursor.getMonth()] }
      })

      const [locations, employees, attendance, leaveRequests, leaveBalances, rosters, shifts, payrollPeriods, commissions, contractorProfiles, contractorInvoices, audits, warnings, advances, coLedger, storeTargets, salesTargets] = await Promise.all([
        safeSelect<Location>(supabase.from('locations').select('*').order('name')),
        safeSelect<Employee>(supabase.from('employees').select('*').order('full_name')),
        safeSelect<Attendance>(supabase.from('attendance').select('*').order('date', { ascending: false }).limit(1000)),
        safeSelect<LeaveRequest>(supabase.from('leave_requests').select('*').order('created_at', { ascending: false }).limit(500)),
        safeSelect<LeaveBalance>(supabase.from('leave_balance').select('*').order('year', { ascending: false }).limit(500)),
        safeSelect<Roster>(supabase.from('rosters').select('*').order('date', { ascending: false }).limit(500)),
        safeSelect<Shift>(supabase.from('shifts').select('*').order('name')),
        safeSelect<PayrollPeriod>(supabase.from('payroll_periods').select('*').order('period_year', { ascending: false }).order('period_month', { ascending: false })),
        safeSelect<CommissionLedger>(supabase.from('commission_ledger').select('*').order('created_at', { ascending: false }).limit(500)),
        safeSelect<ContractorProfile>(supabase.from('contractor_profiles').select('*, locations(name)').order('name') as never),
        safeSelect<ContractorInvoice>(supabase.from('contractor_invoices').select('*, contractor_profiles(name, role)').order('created_at', { ascending: false }) as never),
        safeSelect<AuditLog>(supabase.from('location_audit_log').select('id, actor_id, action_type, target_record, target_table, reason, metadata, timestamp').order('timestamp', { ascending: false }).limit(20) as never),
        safeSelect<WarningRecord>(supabase.from('warning_records').select('*').order('issued_at', { ascending: false }).limit(200)),
        safeSelect<AdvanceSalary>(supabase.from('advance_salary').select('*').order('created_at', { ascending: false }).limit(200)),
        safeSelect<COLedger>(supabase.from('co_ledger').select('*').order('created_at', { ascending: false }).limit(200)),
        safeSelect<StoreTargetRow>(supabase.from('store_target_master').select('*, locations(name, code)').order('period_year', { ascending: false }).order('period_month', { ascending: false }) as never),
        safeSelect<SalesTargetRow>(supabase.from('sales_target_portfolio').select('*, employees(full_name, employee_code, designation, is_salesperson)').order('period_year', { ascending: false }).order('period_month', { ascending: false }) as never),
      ])

      const employeeById = new Map(employees.map(employee => [employee.id, employee]))
      const locationById = new Map(locations.map(location => [location.id, location]))
      const attendanceByEmployeeToday = new Map(attendance.filter(entry => entry.date === todayKey).map(entry => [entry.employee_id, entry]))
      const attendanceToday = attendance.filter(entry => entry.date === todayKey)
      const approvedLeavesToday = leaveRequests.filter(request => request.status === 'approved' && sameRange(todayKey, request.from_date, request.to_date))
      const activeEmployees = employees.filter(employee => employee.status !== 'inactive')
      const activeLocations = locations.filter(location => location.status === 'active')
      const contractorHeadcount = contractorProfiles.filter(profile => profile.status === 'active').length

      const outlets: OutletStatus[] = activeLocations.map(location => {
        const assignedEmployees = activeEmployees.filter(employee => employee.location_id === location.id)
        const present = attendanceToday.filter(entry => entry.location_id === location.id && entry.status === 'present').length
        const onLeave = approvedLeavesToday.filter(request => employeeById.get(request.employee_id)?.location_id === location.id).length
        const absent = Math.max(assignedEmployees.length - present - onLeave, 0)
        const keyholderPresent = assignedEmployees.some(employee => isKeyholder(employee) && attendanceByEmployeeToday.has(employee.id))
        const mode = present <= 1 ? 'Single Staff' : present < location.minimum_staff_strength ? 'Reduced' : present === location.minimum_staff_strength ? 'Standard' : 'Extended'
        const status: OutletStatus['status'] = !keyholderPresent && present > 0 ? 'alert' : present === 0 ? 'closed' : present <= 1 ? 'alert' : present < location.minimum_staff_strength ? 'alert' : 'open'
        return {
          locationId: location.id,
          name: location.name,
          code: location.code,
          status,
          staffIn: present,
          capacity: location.minimum_staff_strength,
          mode,
          keyholderPresent,
          activeEmployees: assignedEmployees.length,
          onLeave,
          absent,
        }
      }).sort((left, right) => {
        const priority = { alert: 0, closed: 1, open: 2 }
        return priority[left.status] - priority[right.status]
      })

      const attendanceTotal = activeEmployees.filter(employee => employee.location_id && locationById.get(employee.location_id)?.status === 'active').length
      const presentCount = attendanceToday.filter(entry => entry.status === 'present').length
      const biometricFailures = attendanceToday.filter(entry => !entry.biometric_verified || entry.biometric_override).length
      const lateCount = attendanceToday.filter(entry => {
        const checkIn = parseTimeToMinutes(entry.check_in)
        return entry.status === 'present' && checkIn !== null && checkIn > 9 * 60 + 15
      }).length
      const absentEntries = attendanceToday.filter(entry => entry.status === 'absent').length
      const onLeaveCount = approvedLeavesToday.length
      const notYetPunched = activeEmployees.filter(employee => !attendanceByEmployeeToday.has(employee.id) && !approvedLeavesToday.some(request => request.employee_id === employee.id)).length
      const sanctionedStrength = activeLocations.reduce((total, location) => total + location.minimum_staff_strength, 0)

      const attendanceCards: AttendanceCard[] = [
        {
          label: 'Total Sanctioned Strength',
          value: sanctionedStrength,
          note: 'Minimum headcount across active outlets',
          tone: 'info',
          onClick: () => {
            setDetail({
              title: 'Sanctioned strength by outlet',
              subtitle: 'Minimum staffing rules across active stores',
              rows: buildDetailRows(activeLocations.map(location => ({
                label: location.name,
                value: `${location.minimum_staff_strength} sanctioned`,
                meta: `${location.city} · ${location.code}`,
                tone: 'info',
                onClick: () => openOutletDetail(location.id),
              }))),
            })
          },
        },
        {
          label: 'Present',
          value: presentCount,
          note: 'Punch-ins recorded today',
          tone: 'good',
          onClick: () => openAttendanceDetail('Present employees', attendanceToday.filter(entry => entry.status === 'present').map(entry => ({
            label: employeeById.get(entry.employee_id)?.full_name ?? entry.employee_id,
            value: `${entry.check_in ?? '--'} - ${entry.check_out ?? '--'}`,
            meta: `${locationById.get(entry.location_id)?.name ?? 'Unknown outlet'}${entry.biometric_override ? ' · override' : ''}`,
            tone: entry.biometric_verified ? 'good' : 'warn',
          }))),
        },
        {
          label: 'Absent',
          value: absentEntries,
          note: 'Marked absent on the floor',
          tone: 'bad',
          onClick: () => openAttendanceDetail('Absent employees', activeEmployees.filter(employee => attendanceToday.some(entry => entry.employee_id === employee.id && entry.status === 'absent')).map(employee => ({
            label: employee.full_name,
            value: employee.designation,
            meta: locationById.get(employee.location_id)?.name,
            tone: 'bad',
          }))),
        },
        {
          label: 'On Leave (Approved)',
          value: onLeaveCount,
          note: 'Approved leave spanning today',
          tone: 'warn',
          onClick: () => openAttendanceDetail('Approved leave today', approvedLeavesToday.map(request => ({
            label: employeeById.get(request.employee_id)?.full_name ?? request.employee_id,
            value: `${request.leave_type} · ${request.days} day${request.days > 1 ? 's' : ''}`,
            meta: request.reason,
            tone: 'warn',
          }))),
        },
        {
          label: 'Late Arrivals',
          value: lateCount,
          note: 'Punch-in after 09:15',
          tone: 'warn',
          onClick: () => openAttendanceDetail('Late arrivals', attendanceToday.filter(entry => {
            const checkIn = parseTimeToMinutes(entry.check_in)
            return entry.status === 'present' && checkIn !== null && checkIn > 9 * 60 + 15
          }).map(entry => ({
            label: employeeById.get(entry.employee_id)?.full_name ?? entry.employee_id,
            value: entry.check_in ?? '--',
            meta: `${locationById.get(entry.location_id)?.name ?? 'Unknown outlet'}${entry.shift_id ? ' · shift assigned' : ''}`,
            tone: 'warn',
            onClick: () => openEmployeeDetail(entry.employee_id),
          }))),
        },
        {
          label: 'Not Yet Punched In',
          value: notYetPunched,
          note: 'Active staff without punch-in',
          tone: 'bad',
          onClick: () => openAttendanceDetail('Not yet punched in', activeEmployees.filter(employee => !attendanceByEmployeeToday.has(employee.id) && !approvedLeavesToday.some(request => request.employee_id === employee.id)).map(employee => ({
            label: employee.full_name,
            value: employee.designation,
            meta: locationById.get(employee.location_id)?.name ?? 'Unassigned',
            tone: 'bad',
            onClick: () => openEmployeeDetail(employee.id),
          }))),
        },
        {
          label: 'Biometric Failures',
          value: biometricFailures,
          note: 'Manual override or failed auth',
          tone: 'warn',
          onClick: () => openAttendanceDetail('Biometric failures', attendanceToday.filter(entry => !entry.biometric_verified || entry.biometric_override).map(entry => ({
            label: employeeById.get(entry.employee_id)?.full_name ?? entry.employee_id,
            value: entry.biometric_override ? 'Override used' : 'Biometric failed',
            meta: entry.override_reason ?? locationById.get(entry.location_id)?.name,
            tone: 'warn',
            onClick: () => openEmployeeDetail(entry.employee_id),
          }))),
        },
      ]

      const alerts: AlertItem[] = []
      outlets.forEach(outlet => {
        if (!outlet.keyholderPresent && outlet.staffIn > 0) {
          alerts.push({
            id: `keyholder-${outlet.locationId}`,
            severity: 'critical',
            title: `Keyholder absent - ${outlet.name}`,
            detail: 'A keyholder is not on the floor while the store is open.',
            action: 'Open outlet detail',
            tint: '#f87171',
            onClick: () => openOutletDetail(outlet.locationId),
          })
        }
        if (outlet.staffIn === 1) {
          alerts.push({
            id: `single-${outlet.locationId}`,
            severity: 'critical',
            title: `Single staff mode - ${outlet.name}`,
            detail: 'Only one person is present and service coverage is fragile.',
            action: 'Review outlet coverage',
            tint: '#f87171',
            onClick: () => openOutletDetail(outlet.locationId),
          })
        }
        if (outlet.absent > 0 && outlet.onLeave === 0) {
          alerts.push({
            id: `absent-${outlet.locationId}`,
            severity: 'high',
            title: `Uncovered absence - ${outlet.name}`,
            detail: `${outlet.absent} staff missing with no approved leave.`,
            action: 'Review absent staff',
            tint: '#FFB347',
            onClick: () => openOutletDetail(outlet.locationId),
          })
        }
      })

      const pendingLeavesOlderThan24h = leaveRequests.filter(request => request.status === 'pending' && daysBetween(request.created_at, today.toISOString()) >= 1)
      if (pendingLeavesOlderThan24h.length > 0) {
        alerts.push({
          id: 'leave-sla',
          severity: 'high',
          title: `SLA breach - Leave pending ${compactNumber(pendingLeavesOlderThan24h.length)} record(s)`,
          detail: 'Pending leave requests have crossed the 24 hour threshold.',
          action: 'Review leave queue',
          tint: '#FFB347',
          onClick: () => openAttendanceDetail('Pending leave requests older than 24h', pendingLeavesOlderThan24h.map(request => ({
            label: employeeById.get(request.employee_id)?.full_name ?? request.employee_id,
            value: `${request.leave_type} · ${request.days} day${request.days > 1 ? 's' : ''}`,
            meta: request.reason,
            tone: 'warn',
          }))),
        })
      }

      const payrollPeriod = payrollPeriods.find(period => period.period_month === today.getMonth() + 1 && period.period_year === today.getFullYear()) ?? payrollPeriods[0] ?? null
      if (payrollPeriod && payrollPeriod.status === 'blocked') {
        alerts.push({
          id: 'payroll-exception',
          severity: 'high',
          title: 'Payroll exception - blocked cycle',
          detail: payrollPeriod.blocked_reason ?? 'One or more payroll exceptions are unresolved.',
          action: 'Open payroll cycle',
          tint: '#FFB347',
          onClick: () => setDetail({
            title: 'Payroll exception details',
            subtitle: payrollPeriod.blocked_reason ?? 'Current payroll cycle is blocked.',
            rows: buildDetailRows([
              { label: 'Cycle', value: `${monthNames[payrollPeriod.period_month - 1]} ${payrollPeriod.period_year}` },
              { label: 'Status', value: payrollPeriod.status },
              { label: 'Lock date', value: payrollPeriod.lock_date },
              { label: 'Dispatched at', value: payrollPeriod.dispatched_at ?? 'Pending' },
            ]),
          }),
        })
      }

      const minimumWageBreaches = warnings.filter(warning => /wage/i.test(warning.reason) || warning.action_type === 'termination').length
      if (minimumWageBreaches > 0) {
        alerts.push({
          id: 'wage-breach',
          severity: 'high',
          title: `Minimum wage breach - ${minimumWageBreaches} employee(s)`,
          detail: 'A payroll rule is blocking disbursement for affected employees.',
          action: 'Inspect warnings',
          tint: '#FFB347',
          onClick: () => openWarningDetail('Minimum wage / disciplinary warnings', warnings),
        })
      }

      const coExpiringSoon = coLedger.filter(entry => entry.expiry_date && sameRange(entry.expiry_date, isoDate(today), isoDate(addDays(today, 7))) && entry.credits > entry.used)
      if (coExpiringSoon.length > 0) {
        alerts.push({
          id: 'co-expiry',
          severity: 'normal',
          title: `CO expiry warning - ${coExpiringSoon.length} employees`,
          detail: 'Comp-off credits are expiring inside 7 days.',
          action: 'Open CO ledger',
          tint: '#a78bfa',
          onClick: () => openCOLeadgerDetail('Comp-off ledger expiry', coExpiringSoon),
        })
      }

      const gratuityEligibleEmployees = activeEmployees.filter(employee => daysBetween(employee.date_of_joining, today.toISOString()) >= 365 * 5)
      const gratuityApproachingEmployees = activeEmployees.filter(employee => {
        const tenureDays = daysBetween(employee.date_of_joining, today.toISOString())
        return tenureDays >= 365 * 4.5 && tenureDays < 365 * 5
      })
      if (gratuityApproachingEmployees.length > 0) {
        alerts.push({
          id: 'gratuity',
          severity: 'normal',
          title: `Gratuity approaching - ${gratuityApproachingEmployees.length} employee(s)`,
          detail: 'Employees are nearing the 5 year gratuity threshold.',
          action: 'Review liability',
          tint: '#60a5fa',
          onClick: () => openEmployeeDetail(gratuityApproachingEmployees[0].id),
        })
      }

      const directAlerts: AlertItem[] = warnings.slice(0, 6).map(warning => ({
        id: `warn-${warning.id}`,
        severity: warning.action_type === 'termination' ? 'critical' : warning.action_type === 'suspension' ? 'high' : 'normal',
        title: `${warning.action_type.toUpperCase()} - ${employeeById.get(warning.employee_id)?.full_name ?? warning.employee_id}`,
        detail: warning.reason,
        action: 'Review discipline',
        tint: warning.action_type === 'termination' ? '#f87171' : warning.action_type === 'suspension' ? '#FFB347' : '#60a5fa',
        onClick: () => openWarningDetail('Warning record', [warning]),
      }))
      alerts.push(...directAlerts)

      const approvedLeaves = leaveRequests.filter(request => request.status === 'approved')
      const rejectedLeaves = leaveRequests.filter(request => request.status === 'rejected')
      const pendingLeaves = leaveRequests.filter(request => request.status === 'pending')
      const escalatedLeaves = pendingLeaves.filter(request => daysBetween(request.created_at, today.toISOString()) >= 1)
      const leaveTypeDays: Record<string, number> = { PL: 0, CL: 0, ML: 0, CO: 0, LOP: 0 }
      leaveRequests.forEach(request => {
        leaveTypeDays[request.leave_type] = (leaveTypeDays[request.leave_type] ?? 0) + request.days
      })
      const coEarned = coLedger.reduce((total, entry) => total + entry.credits, 0)
      const coUsed = coLedger.reduce((total, entry) => total + entry.used, 0)
      const coExpiring = coLedger.filter(entry => entry.expiry_date && sameRange(entry.expiry_date, isoDate(today), isoDate(addDays(today, 7))) && entry.credits > entry.used).length
      const coExpired = coLedger.filter(entry => entry.expiry_date && toDate(entry.expiry_date).getTime() < today.getTime() && entry.credits > entry.used).length

      const companyHeadcount = activeEmployees.filter(employee => locationById.get(employee.location_id)?.type === 'company_owned').length
      const franchiseHeadcount = activeEmployees.filter(employee => locationById.get(employee.location_id)?.type === 'franchise').length
      const attendanceDays = attendance.filter(entry => toDate(entry.date) >= monthStart && toDate(entry.date) <= monthEnd)
      const presentDays = attendanceDays.filter(entry => entry.status === 'present').length
      const leaveDays = approvedLeaves.filter(request => sameRange(request.from_date, isoDate(monthStart), isoDate(monthEnd)) || sameRange(request.to_date, isoDate(monthStart), isoDate(monthEnd))).reduce((total, request) => total + request.days, 0)
      const leaveEntitled = leaveBalances.reduce((total, balance) => total + balance.balance + balance.used, 0) || activeEmployees.length * 12
      const lateMarkRate = attendanceDays.length > 0 ? Math.round((lateCount / attendanceDays.length) * 100) : 0
      const absenteeismRate = attendanceDays.length > 0 ? Math.round((absentEntries / attendanceDays.length) * 100) : 0
      const attendanceRate = attendanceDays.length > 0 ? Math.round((presentDays / attendanceDays.length) * 100) : 0
      const leaveUtilization = leaveEntitled > 0 ? Math.round((leaveDays / leaveEntitled) * 100) : 0
      const regularisations = attendanceToday.filter(entry => !entry.biometric_verified || entry.biometric_override).length
      const overtimeHours = attendanceToday.reduce((total, entry) => {
        const checkIn = parseTimeToMinutes(entry.check_in)
        const checkOut = parseTimeToMinutes(entry.check_out)
        if (checkIn === null || checkOut === null || checkOut <= checkIn) return total
        const hours = (checkOut - checkIn) / 60
        return total + Math.max(0, hours - 8)
      }, 0)

      const trendData: WorkforceTrendPoint[] = monthBack.map(item => {
        const monthAttendance = attendance.filter(entry => entry.date.startsWith(item.key))
        const monthPresent = monthAttendance.filter(entry => entry.status === 'present').length
        const monthAbsent = monthAttendance.filter(entry => entry.status === 'absent').length
        const monthLeaves = leaveRequests.filter(request => {
          const createdMonth = request.created_at.slice(0, 7)
          return createdMonth === item.key || request.from_date.startsWith(item.key) || request.to_date.startsWith(item.key)
        }).reduce((total, request) => total + request.days, 0)
        const monthEntitled = leaveBalances.filter(balance => `${balance.year}-${String(today.getMonth() + 1).padStart(2, '0')}` === item.key).reduce((total, balance) => total + balance.balance + balance.used, 0) || activeEmployees.length * 12
        return {
          month: item.label,
          attendanceRate: monthAttendance.length > 0 ? Math.round((monthPresent / monthAttendance.length) * 100) : 0,
          leaveUtilization: monthEntitled > 0 ? Math.round((monthLeaves / monthEntitled) * 100) : 0,
          overtimeHours: Math.round(monthAttendance.reduce((total, entry) => {
            const checkIn = parseTimeToMinutes(entry.check_in)
            const checkOut = parseTimeToMinutes(entry.check_out)
            if (checkIn === null || checkOut === null || checkOut <= checkIn) return total
            return total + Math.max(0, ((checkOut - checkIn) / 60) - 8)
          }, 0)),
        }
      })

      const weeklyRosters = rosters.filter(roster => sameRange(roster.date, isoDate(weekStart), isoDate(weekEnd)))
      const rostersGenerated = activeLocations.filter(location => weeklyRosters.some(roster => roster.location_id === location.id)).length
      const rostersPublished = weeklyRosters.filter(roster => roster.status === 'confirmed' || roster.status === 'overridden').length
      const rostersLocked = weeklyRosters.filter(roster => roster.status === 'confirmed').length
      const overrideEvents = weeklyRosters.filter(roster => roster.status === 'overridden').length
      const emergencyOverrides = weeklyRosters.filter(roster => roster.status === 'overridden' && /emergency/i.test(roster.override_reason ?? '')).length
      const uncoveredAbsences = outlets.filter(outlet => outlet.staffIn === 0 || (!outlet.keyholderPresent && outlet.staffIn > 0)).length
      const keyholderCoverage = activeLocations.length > 0 ? Math.round((outlets.filter(outlet => outlet.keyholderPresent).length / activeLocations.length) * 100) : 0
      const minSalespersonMet = activeLocations.length > 0 ? Math.round((activeLocations.filter(location => {
        const presentForLocation = attendanceToday.filter(entry => entry.location_id === location.id && entry.status === 'present')
        return presentForLocation.some(entry => isSalesperson(employeeById.get(entry.employee_id) ?? employees[0]))
      }).length / activeLocations.length) * 100) : 0
      const consecutiveDayBreaches = activeEmployees.filter(employee => {
        const employeeAttendance = attendance.filter(entry => entry.employee_id === employee.id && entry.status === 'present').sort((left, right) => left.date.localeCompare(right.date))
        if (employeeAttendance.length < 6) return false
        let streak = 1
        for (let index = 1; index < employeeAttendance.length; index += 1) {
          const previous = toDate(employeeAttendance[index - 1].date)
          const current = toDate(employeeAttendance[index].date)
          if (daysBetween(previous.toISOString(), current.toISOString()) === 1) {
            streak += 1
            if (streak >= 7) return true
          } else {
            streak = 1
          }
        }
        return false
      }).length
      const restHourBreaches = activeEmployees.filter(employee => {
        const employeeAttendance = attendance.filter(entry => entry.employee_id === employee.id && entry.check_in && entry.check_out).sort((left, right) => left.date.localeCompare(right.date))
        for (let index = 1; index < employeeAttendance.length; index += 1) {
          const previous = employeeAttendance[index - 1]
          const current = employeeAttendance[index]
          const gap = (toDate(`${current.date}T${current.check_in ?? '00:00'}`).getTime() - toDate(`${previous.date}T${previous.check_out ?? '00:00'}`).getTime()) / 3600000
          if (gap > 0 && gap < 10) return true
        }
        return false
      }).length

      const commissionCurrentMonth = commissions.filter(entry => entry.period_month === today.getMonth() + 1 && entry.period_year === today.getFullYear())
      const commissionLocked = commissionCurrentMonth.filter(entry => entry.status === 'locked' || entry.status === 'paid').reduce((total, entry) => total + entry.earned_amount, 0)
      const commissionPending = commissionCurrentMonth.filter(entry => entry.status === 'pending' || entry.status === 'approved').reduce((total, entry) => total + entry.earned_amount, 0)
      const commissionReversed = 0
      const groomerCommission = commissionCurrentMonth.filter(entry => isSalesperson(employeeById.get(entry.employee_id) ?? employees[0])).reduce((total, entry) => total + entry.earned_amount, 0)
      const contractorPaymentsDue = contractorInvoices.filter(invoice => invoice.status === 'pending').reduce((total, invoice) => total + invoice.amount, 0)
      const storePerformance = storeTargets.filter(target => target.period_month === today.getMonth() + 1 && target.period_year === today.getFullYear()).map(target => {
        const achievement = target.revenue_target > 0 ? Math.round((target.achieved_revenue / target.revenue_target) * 100) : 0
        const pool = achievement >= 100 ? 'Unocked' : achievement >= 80 ? 'Slab 2' : 'Not unlocked'
        return { store: target.locations?.name ?? locationById.get(target.location_id)?.name ?? target.location_id, achievement, pool, revenue: target.achieved_revenue, target: target.revenue_target }
      })
      const topOutlet = [...storePerformance].sort((left, right) => right.achievement - left.achievement)[0] ?? { store: 'None', achievement: 0, pool: '-', revenue: 0, target: 0 }
      const lowestOutlet = [...storePerformance].sort((left, right) => left.achievement - right.achievement)[0] ?? { store: 'None', achievement: 0, pool: '-', revenue: 0, target: 0 }

      const currentCycle = payrollPeriod ?? payrollPeriods[0] ?? null
      const activeAdvanceOutstanding = advances.filter(entry => entry.status === 'pending' || entry.status === 'active').reduce((total, entry) => total + entry.amount, 0)
      const exceptionsPending = warnings.filter(entry => entry.action_type !== 'warning').length + advances.filter(entry => entry.status === 'pending').length
      const totalLiability = activeEmployees.reduce((total, employee) => {
        const companyWeight = locationById.get(employee.location_id)?.type === 'company_owned' ? 28000 : 22000
        return total + companyWeight
      }, 0) + contractorHeadcount * 15000 + commissionPending + contractorPaymentsDue + activeAdvanceOutstanding
      const basicAndAllowances = Math.round(totalLiability * 0.78)
      const performanceVariable = commissionPending + contractorPaymentsDue
      const statutoryDeductions = Math.round(totalLiability * 0.12)
      const entityPayroll = {
        pvtLtd: activeEmployees.filter(employee => employee.entity === 'pvt_ltd').reduce((total, employee) => total + 28000, 0),
        proprietorship: activeEmployees.filter(employee => employee.entity === 'proprietorship').reduce((total, employee) => total + 22000, 0),
      }

      const grievances = warnings.filter(entry => entry.action_type === 'termination')
      const activeFnF = employees.filter(employee => employee.status === 'exited').length
      const fnfPendingApproval = advances.filter(entry => entry.status === 'pending').length + grievances.length
      const abscondingCases = warnings.filter(entry => /abscond|termination/i.test(entry.reason)).length + activeEmployees.filter(employee => attendanceToday.filter(record => record.employee_id === employee.id && record.status === 'absent').length >= 3).length
      const onProprietorship = activeEmployees.filter(employee => employee.entity === 'proprietorship').length
      const onIplPayroll = activeEmployees.filter(employee => employee.entity === 'pvt_ltd').length
      const transferPending = activeEmployees.filter(employee => employee.entity_transfer_date === null || employee.entity_transfer_date === '').length
      const gratuityEligible = activeEmployees.filter(employee => daysBetween(employee.date_of_joining, today.toISOString()) >= 365 * 5).length
      const gratuityApproaching = activeEmployees.filter(employee => {
        const tenure = daysBetween(employee.date_of_joining, today.toISOString())
        return tenure >= 365 * 4.5 && tenure < 365 * 5
      }).length
      const gratuityProvision = Math.round((gratuityEligible * 35000 * 0.5) + (gratuityApproaching * 35000 * 0.25))

      setSnapshot({
        raw: { locations, employees, attendance, leaveRequests, leaveBalances, rosters, shifts, payrollPeriods, commissions, contractorProfiles, contractorInvoices, audits, warnings, advances, coLedger, storeTargets, salesTargets },
        liveStats: {
          employees: activeEmployees.length,
          activeStores: activeLocations.length,
          pendingLeaves: pendingLeaves.length,
          attendanceToday: presentCount,
          commissionPending: commissionPending,
          contractorsPending: contractorInvoices.filter(entry => entry.status === 'pending').length,
          complianceAlerts: alerts.length,
          payrollStatus: currentCycle?.status ?? 'open',
        },
        outlets,
        attendanceCards,
        alerts,
        workforce: {
          companyHeadcount,
          franchiseHeadcount,
          contractorHeadcount,
          attendanceRate,
          leaveUtilization,
          lateMarkRate,
          absenteeismRate,
          regularisations,
          overtimeHours: Math.round(overtimeHours),
        },
        workforceTrend: trendData,
        roster: {
          generated: rostersGenerated,
          totalOutlets: activeLocations.length,
          published: rostersPublished,
          locked: rostersLocked,
          overrideEvents,
          emergencyOverrides,
          uncoveredAbsences,
          keyholderCoverage,
          minSalespersonMet,
          consecutiveDayBreaches,
          restHourBreaches,
        },
        leaveSummary: {
          approved: approvedLeaves.length,
          rejected: rejectedLeaves.length,
          pending: pendingLeaves.length,
          escalated: escalatedLeaves.length,
          leaveTypeDays,
          coEarned,
          coUsed,
          coExpiring,
          coExpired,
        },
        payroll: {
          cycleStatus: currentCycle?.status ?? 'open',
          lockDate: currentCycle?.lock_date ?? '--',
          disbursementDate: currentCycle?.dispatched_at ? currentCycle.dispatched_at.slice(0, 10) : '--',
          totalLiability,
          basicAndAllowances,
          performanceVariable,
          statutoryDeductions,
          exceptionsPending,
          minimumWageBreaches,
          advancesOutstanding: activeAdvanceOutstanding,
          entityPayroll,
        },
        commission: {
          storeTargets: storePerformance,
          individual: {
            locked: commissionLocked,
            pending: commissionPending,
            reversed: commissionReversed,
            groomerCommission,
            contractorPaymentsDue,
          },
          topOutlet: { name: topOutlet.store, achievement: topOutlet.achievement },
          lowestOutlet: { name: lowestOutlet.store, achievement: lowestOutlet.achievement },
        },
        compliance: {
          pfStatus: currentCycle?.status === 'dispatched' ? 'Filed' : 'Due',
          esicStatus: currentCycle?.status === 'dispatched' ? 'Filed' : 'Due',
          ptStatus: currentCycle?.status === 'blocked' ? 'Due' : 'Filed',
          gratuityEligible,
          gratuityApproaching,
          gratuityProvision,
          activeFnF,
          fnfPendingApproval,
          abscondingCases,
          onProprietorship,
          onIplPayroll,
          transferPending,
        },
      })
      setLastUpdated(new Date())
      setSeedMsg('')
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error('Dashboard fetch error:', errMsg)
      setSnapshot(null)
      setSeedMsg(`Dashboard error: ${errMsg}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }

    function openOutletDetail(locationId: string) {
      if (!snapshotRef.current) return
      const outlet = snapshotRef.current.raw.locations.find(location => location.id === locationId)
      if (!outlet) return
      const employeesForOutlet = snapshotRef.current.raw.employees.filter(employee => employee.location_id === locationId)
      const attendanceForOutlet = snapshotRef.current.raw.attendance.filter(entry => entry.location_id === locationId && entry.date === isoDate(new Date()))
      setDetail({
        title: `${outlet.name} outlet detail`,
        subtitle: `${outlet.city} - ${outlet.code}`,
        rows: buildDetailRows(employeesForOutlet.map(employee => ({
          label: employee.full_name,
          value: employee.designation,
          meta: attendanceForOutlet.find(entry => entry.employee_id === employee.id)?.status ?? employee.status,
          tone: attendanceForOutlet.find(entry => entry.employee_id === employee.id)?.status === 'present' ? 'good' : 'warn',
          onClick: () => openEmployeeDetail(employee.id),
        }))),
      })
    }

    function openEmployeeDetail(employeeId: string) {
      if (!snapshotRef.current) return
      const employee = snapshotRef.current.raw.employees.find(item => item.id === employeeId)
      if (!employee) return
      const attendanceRecords = snapshotRef.current.raw.attendance.filter(entry => entry.employee_id === employeeId).slice(0, 10)
      const leaveRecords = snapshotRef.current.raw.leaveRequests.filter(entry => entry.employee_id === employeeId).slice(0, 5)
      const attendanceRows: DetailRow[] = attendanceRecords.map(record => ({
        label: record.date,
        value: `${record.status} ${record.check_in ?? '--'} - ${record.check_out ?? '--'}`,
        meta: record.biometric_override ? 'override' : record.biometric_verified ? 'verified' : 'manual',
        tone: record.status === 'present' ? 'good' : record.status === 'absent' ? 'bad' : 'warn',
      }))
      const leaveRows: DetailRow[] = leaveRecords.map(record => ({
        label: `${record.leave_type} leave`,
        value: record.status,
        meta: record.reason,
        tone: record.status === 'approved' ? 'good' : record.status === 'rejected' ? 'bad' : 'warn',
      }))
      setDetail({
        title: employee.full_name,
        subtitle: `${employee.designation} - ${snapshotRef.current.raw.locations.find(location => location.id === employee.location_id)?.name ?? 'Unknown outlet'}`,
        rows: buildDetailRows([
          { label: 'Employee code', value: employee.employee_code },
          { label: 'Entity', value: employee.entity },
          { label: 'Status', value: employee.status },
          { label: 'Date of joining', value: employee.date_of_joining },
          { label: 'Attendance records', value: `${attendanceRecords.length}` },
          ...attendanceRows,
          ...leaveRows,
        ]),
      })
    }

    function openAttendanceDetail(title: string, rows: DetailRow[]) {
      setDetail({ title, subtitle: 'Click any row to drill down further where available.', rows })
    }

    function openWarningDetail(title: string, records: WarningRecord[]) {
      setDetail({
        title,
        subtitle: 'Disciplinary and exception records currently active.',
        rows: buildDetailRows(records.map(record => ({
          label: snapshotRef.current?.raw.employees.find(employee => employee.id === record.employee_id)?.full_name ?? record.employee_id,
          value: record.action_type,
          meta: `${record.issued_at} - ${record.reason}`,
          tone: record.action_type === 'termination' ? 'bad' : record.action_type === 'suspension' ? 'warn' : 'warn',
          onClick: () => openEmployeeDetail(record.employee_id),
        }))),
      })
    }

    function openCOLeadgerDetail(title: string, records: COLedger[]) {
      setDetail({
        title,
        subtitle: 'Comp-off credits nearing expiry.',
        rows: buildDetailRows(records.map(record => ({
          label: snapshotRef.current?.raw.employees.find(employee => employee.id === record.employee_id)?.full_name ?? record.employee_id,
          value: `${record.credits - record.used} usable day(s)`,
          meta: record.expiry_date ?? 'No expiry',
          tone: record.expiry_date ? 'warn' : 'info',
          onClick: () => openEmployeeDetail(record.employee_id),
        }))),
      })
    }
  }, [safeSelect])

  const snapshotRef = useRef<Snapshot | null>(null)
  snapshotRef.current = snapshot

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setLoading(false)
      setSeedMsg('Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in Vercel, then redeploy.')
      return
    }

    fetchDashboard(false)
  }, [fetchDashboard])

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      return
    }

    const tables = [
      'locations',
      'employees',
      'attendance',
      'leave_requests',
      'leave_balance',
      'rosters',
      'shifts',
      'payroll_periods',
      'commission_ledger',
      'contractor_profiles',
      'contractor_invoices',
      'location_audit_log',
      'warning_records',
      'advance_salary',
      'co_ledger',
      'store_target_master',
      'sales_target_portfolio',
    ]

    const channels = tables.map(table =>
      supabase.channel(`command-centre:${table}`)
        .on('postgres_changes' as never, { event: '*', schema: 'public', table }, () => fetchDashboard(true))
        .subscribe()
    )

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel))
    }
  }, [fetchDashboard])

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      return
    }

    const timer = setInterval(() => fetchDashboard(true), 15 * 60 * 1000)
    return () => clearInterval(timer)
  }, [fetchDashboard])

  async function seedDatabase() {
    if (!SUPABASE_CONFIGURED) {
      setSeedMsg('Cannot seed without Supabase public env vars. Add them in Vercel and redeploy first.')
      return
    }

    setSeeding(true)
    setSeedMsg('')
    try {
      const response = await fetch('/api/seed', { method: 'POST' })
      const payload = await response.json()
      if (payload.success) {
        setSeedMsg('Database seeded. Refreshing dashboard...')
        await fetchDashboard(true)
      } else {
        setSeedMsg(payload.error ?? 'Seed failed')
      }
    } catch {
      setSeedMsg('Seed failed - check Supabase tables and credentials.')
    } finally {
      setSeeding(false)
    }
  }

  const data = snapshot
  const live = data?.liveStats
  const payrollColor = live?.payrollStatus === 'blocked' ? '#f87171' : live?.payrollStatus === 'dispatched' ? '#34d399' : live?.payrollStatus === 'locked' ? '#a78bfa' : '#FFB347'
  const operationalOutlets = data?.outlets.filter(outlet => outlet.status === 'open').length ?? 0
  const workforceHealthy = data ? Math.max(0, 100 - (data.workforce.absenteeismRate + data.workforce.lateMarkRate)) : 0
  const payrollHealthy = data ? Math.max(0, 100 - Math.min(100, Math.round((data.payroll.exceptionsPending + data.payroll.minimumWageBreaches) * 8))) : 0

  const masterQuestions = [
    { label: 'Operational outlets', value: `${operationalOutlets}/${data?.outlets.length ?? 0}`, tone: operationalOutlets === (data?.outlets.length ?? 0) ? 'good' : 'warn' },
    { label: 'Workforce health', value: `${workforceHealthy}%`, tone: workforceHealthy > 80 ? 'good' : workforceHealthy > 60 ? 'warn' : 'bad' },
    { label: 'Payroll health', value: `${payrollHealthy}%`, tone: payrollHealthy > 80 ? 'good' : payrollHealthy > 60 ? 'warn' : 'bad' },
  ] as const

  const quickActions = [
    { label: 'Approve Pending FnF', icon: '🧾', href: '/hr-admin', color: '#FFB347' },
    { label: 'Review Payroll Exceptions', icon: '⚠️', href: '/payroll', color: '#f87171' },
    { label: 'Override Roster (emergency)', icon: '📆', href: '/shift-roster', color: '#FF6B35' },
    { label: 'Force Store Closure', icon: '🔒', href: '/store-operations', color: '#60a5fa' },
    { label: 'Approve Advance Write-Off', icon: '✂️', href: '/hr-admin', color: '#a78bfa' },
    { label: 'Update PT / PF / ESIC Codes', icon: '🏛️', href: '/settings', color: '#34d399' },
    { label: 'Configure Policy', icon: '⚙️', href: '/settings', color: '#818cf8' },
    { label: 'Download Compliance Report', icon: '⬇️', action: 'compliance', color: '#f59e0b' },
    { label: 'Download Payroll Summary', icon: '💼', action: 'payroll', color: '#38bdf8' },
    { label: 'Add New Employee', icon: '➕', href: '/employees', color: '#f87171' },
  ] as const

  function buildComplianceReport() {
    if (!data) return
    const lines = [
      'Indipet Super Admin Compliance Report',
      `Generated: ${new Date().toISOString()}`,
      '',
      `Operational outlets: ${live?.activeStores ?? 0}`,
      `Attendance today: ${live?.attendanceToday ?? 0}`,
      `Pending leaves: ${live?.pendingLeaves ?? 0}`,
      `Payroll status: ${live?.payrollStatus ?? 'open'}`,
      `Active alerts: ${data.alerts.length}`,
      `Roster coverage: ${data.roster.keyholderCoverage}%`,
      `Gratuity provision: ${currency(data.compliance.gratuityProvision)}`,
    ]
    downloadText(`compliance-report-${isoDate(new Date())}.txt`, lines.join('\n'))
  }

  function buildPayrollSummary() {
    if (!data) return
    const lines = [
      'Indipet Payroll Summary',
      `Generated: ${new Date().toISOString()}`,
      '',
      `Cycle status: ${data.payroll.cycleStatus}`,
      `Lock date: ${data.payroll.lockDate}`,
      `Disbursement date: ${data.payroll.disbursementDate}`,
      `Total liability: ${currency(data.payroll.totalLiability)}`,
      `Basic + allowances: ${currency(data.payroll.basicAndAllowances)}`,
      `Performance variable: ${currency(data.payroll.performanceVariable)}`,
      `Statutory deductions: ${currency(data.payroll.statutoryDeductions)}`,
    ]
    downloadText(`payroll-summary-${isoDate(new Date())}.txt`, lines.join('\n'))
  }

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: data ? '#34d399' : '#f87171', boxShadow: `0 0 8px ${data ? '#34d399' : '#f87171'}` }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{data ? 'LIVE DATA' : 'NO DATA - SETUP REQUIRED'}</span>
          </motion.div>
          {lastUpdated && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
        <motion.button whileHover={{ scale: 1.04, rotate: 180 }} whileTap={{ scale: 0.95 }} onClick={() => fetchDashboard(true)} style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,140,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <RefreshCw size={14} />
        </motion.button>
      </div>

      {!SUPABASE_CONFIGURED && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '20px', color: '#fca5a5', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={14} />
          <div>
            <strong>Dashboard Setup Required</strong>
            <div style={{ fontSize: '11px', marginTop: '4px', color: '#f87171' }}>
              Missing Supabase credentials. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to your Vercel environment variables and redeploy.
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="paw-bg" style={{ padding: '28px 32px', marginBottom: '22px', background: 'linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(255,140,66,0.05) 100%)', border: '1px solid rgba(255,107,53,0.25)', borderRadius: '20px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--orange-light)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Super Admin command centre</p>
          <h2 className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>Indipet HRMS system health</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px', maxWidth: '780px' }}>This page now covers live outlet status, attendance, alerts, workforce health, roster compliance, leave, payroll, commissions, compliance liability, and quick actions.</p>
        </div>
        <motion.div animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }} style={{ fontSize: '58px', lineHeight: 1 }}>🐾</motion.div>
      </motion.div>

      {seedMsg && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '14px 18px', borderRadius: '12px', background: seedMsg.startsWith('Database seeded') ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.08)', border: `1px solid ${seedMsg.startsWith('Database seeded') ? 'rgba(52,211,153,0.25)' : 'rgba(239,68,68,0.25)'}`, marginBottom: '20px', color: seedMsg.startsWith('Database seeded') ? '#6ee7b7' : '#fca5a5', fontSize: '12px', fontWeight: 600 }}>
          {seedMsg}
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '18px' }}>
        {masterQuestions.map(item => (
          <StatCard key={item.label} label={item.label} value={item.value} icon={item.label === 'Operational outlets' ? '🏪' : item.label === 'Workforce health' ? '🧭' : '💰'} color={item.tone === 'good' ? '#34d399' : item.tone === 'warn' ? '#FFB347' : '#f87171'} loading={loading} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
        <GlassCard delay={0.05}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>1. Outlet status - right now</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Real-time outlet health and staffing mode.</p>
            </div>
            <span className="badge badge-orange">Live</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px' }}>
                  <th style={{ padding: '10px 8px' }}>Outlet</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px' }}>Staff in</th>
                  <th style={{ padding: '10px 8px' }}>Mode</th>
                </tr>
              </thead>
              <tbody>
                {(data?.outlets ?? []).map(outlet => (
                  <tr key={outlet.locationId} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <button type="button" onClick={() => openOutletDetailFromSnapshot(outlet.locationId)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>{outlet.name}</button>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{outlet.code}</div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{renderStatusPill(outlet)}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 700 }}>{outlet.staffIn} of {outlet.capacity}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '12px' }}>{outlet.mode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>2. Today's attendance snapshot</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Click any number to drill into the employee list.</p>
            </div>
            <span className="badge badge-blue">Today</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            {(data?.attendanceCards ?? []).map(card => (
              <button key={card.label} type="button" onClick={card.onClick} style={{ textAlign: 'left', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,66,0.12)', cursor: 'pointer', color: 'inherit' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{card.label}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: toneColor(card.tone) }}>{card.value}</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>{card.note}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.15}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>3. Active alerts</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{data?.alerts.length ?? 0} unread trigger(s) derived from current system state.</p>
            </div>
            <span className="badge badge-red">Priority</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflow: 'auto' }}>
            {(data?.alerts ?? []).map(alert => (
              <button key={alert.id} type="button" onClick={alert.onClick} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${alert.tint}33`, background: alert.severity === 'critical' ? 'rgba(239,68,68,0.07)' : alert.severity === 'high' ? 'rgba(255,179,71,0.07)' : 'rgba(96,165,250,0.07)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 28, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${alert.tint}22`, color: alert.tint, flexShrink: 0 }}>
                  {alert.severity === 'critical' ? <AlertTriangle size={14} /> : alert.severity === 'high' ? <ShieldAlert size={14} /> : <CheckCircle2 size={14} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{alert.title}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>{alert.detail}</p>
                </div>
                <span style={{ flexShrink: 0, fontSize: '10.5px', color: alert.tint, fontWeight: 700 }}>{alert.action}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>4. Workforce health</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Monthly view updated daily.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <MiniMetric label="Company" value={data?.workforce.companyHeadcount ?? 0} />
            <MiniMetric label="Franchisee" value={data?.workforce.franchiseHeadcount ?? 0} />
            <MiniMetric label="Contractors" value={data?.workforce.contractorHeadcount ?? 0} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '16px' }}>
            <MetricRow label="Attendance rate" value={`${data?.workforce.attendanceRate ?? 0}%`} />
            <MetricRow label="Leave utilization" value={`${data?.workforce.leaveUtilization ?? 0}%`} />
            <MetricRow label="Late mark rate" value={`${data?.workforce.lateMarkRate ?? 0}%`} />
            <MetricRow label="Absenteeism" value={`${data?.workforce.absenteeismRate ?? 0}%`} />
            <MetricRow label="Regularisations" value={compactNumber(data?.workforce.regularisations ?? 0)} />
            <MetricRow label="Overtime / extended hours" value={`${compactNumber(data?.workforce.overtimeHours ?? 0)} hrs`} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data?.workforceTrend ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,140,66,0.06)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,180,120,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,180,120,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="attendanceRate" name="Attendance" stroke="#FF6B35" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="leaveUtilization" name="Leave" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard delay={0.25}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>5. Roster compliance</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Current week compliance across outlets.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '16px' }}>
            <MetricRow label="Rosters generated" value={`${data?.roster.generated ?? 0} of ${data?.roster.totalOutlets ?? 0}`} />
            <MetricRow label="Rosters published" value={`${data?.roster.published ?? 0}`} />
            <MetricRow label="Rosters locked" value={`${data?.roster.locked ?? 0}`} />
            <MetricRow label="Override events" value={`${data?.roster.overrideEvents ?? 0}`} />
            <MetricRow label="Emergency overrides" value={`${data?.roster.emergencyOverrides ?? 0}`} />
            <MetricRow label="Uncovered absences" value={`${data?.roster.uncoveredAbsences ?? 0}`} />
            <MetricRow label="Keyholder coverage" value={`${data?.roster.keyholderCoverage ?? 0}%`} />
            <MetricRow label="Min salesperson met" value={`${data?.roster.minSalespersonMet ?? 0}%`} />
            <MetricRow label="Consecutive day breaches" value={`${data?.roster.consecutiveDayBreaches ?? 0}`} />
            <MetricRow label="Rest hour breaches" value={`${data?.roster.restHourBreaches ?? 0}`} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(data?.outlets ?? []).filter(outlet => outlet.status !== 'open').slice(0, 3).map(outlet => (
              <button key={outlet.locationId} type="button" onClick={() => openOutletDetailFromSnapshot(outlet.locationId)} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.16)', background: 'rgba(239,68,68,0.06)', textAlign: 'left', cursor: 'pointer', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '12px' }}>{outlet.name}</strong>
                  <span style={{ fontSize: '11px', color: '#fca5a5' }}>{outlet.mode}</span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Coverage gap or keyholder breach detected.</div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>6. Leave and CO summary</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Monthly leave flow and comp-off ledger.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
            <MetricRow label="Approved" value={`${data?.leaveSummary.approved ?? 0}`} />
            <MetricRow label="Rejected" value={`${data?.leaveSummary.rejected ?? 0}`} />
            <MetricRow label="Pending" value={`${data?.leaveSummary.pending ?? 0}`} tone={data && data.leaveSummary.pending > 0 ? 'warn' : 'good'} />
            <MetricRow label="Escalated to HR" value={`${data?.leaveSummary.escalated ?? 0}`} tone={data && data.leaveSummary.escalated > 0 ? 'bad' : 'good'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {Object.entries(data?.leaveSummary.leaveTypeDays ?? {}).map(([leaveType, days]) => (
              <MetricRow key={leaveType} label={leaveType} value={`${days} day(s)`} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            <MetricRow label="CO earned" value={`${compactNumber(data?.leaveSummary.coEarned ?? 0)}`} />
            <MetricRow label="CO used" value={`${compactNumber(data?.leaveSummary.coUsed ?? 0)}`} />
            <MetricRow label="CO expiring in 7 days" value={`${data?.leaveSummary.coExpiring ?? 0}`} tone={data && data.leaveSummary.coExpiring > 0 ? 'warn' : 'good'} />
            <MetricRow label="CO expired unused" value={`${data?.leaveSummary.coExpired ?? 0}`} tone={data && data.leaveSummary.coExpired > 0 ? 'bad' : 'good'} />
          </div>
        </GlassCard>

        <GlassCard delay={0.35}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>7. Payroll status</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Monthly cycle view with liability control.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '16px' }}>
            <MetricRow label="Cycle status" value={data?.payroll.cycleStatus ?? 'open'} tone={data?.payroll.cycleStatus === 'blocked' ? 'bad' : data?.payroll.cycleStatus === 'dispatched' ? 'good' : 'warn'} />
            <MetricRow label="Attendance lock date" value={data?.payroll.lockDate ?? '--'} />
            <MetricRow label="Disbursement date" value={data?.payroll.disbursementDate ?? '--'} />
            <MetricRow label="Exceptions pending" value={`${data?.payroll.exceptionsPending ?? 0}`} tone={data && data.payroll.exceptionsPending > 0 ? 'warn' : 'good'} />
            <MetricRow label="Minimum wage breaches" value={`${data?.payroll.minimumWageBreaches ?? 0}`} tone={data && data.payroll.minimumWageBreaches > 0 ? 'bad' : 'good'} />
            <MetricRow label="Advances outstanding" value={currency(data?.payroll.advancesOutstanding ?? 0)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
            <MetricRow label="Basic + allowances" value={currency(data?.payroll.basicAndAllowances ?? 0)} />
            <MetricRow label="Performance variable" value={currency(data?.payroll.performanceVariable ?? 0)} />
            <MetricRow label="Statutory deductions" value={currency(data?.payroll.statutoryDeductions ?? 0)} />
            <MetricRow label="Total liability" value={currency(data?.payroll.totalLiability ?? 0)} tone="warn" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Entity split</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            <MetricRow label="IPL payroll" value={currency(data?.payroll.entityPayroll.pvtLtd ?? 0)} />
            <MetricRow label="Franchise payroll" value={currency(data?.payroll.entityPayroll.proprietorship ?? 0)} />
          </div>
        </GlassCard>

        <GlassCard delay={0.4}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>8. Commission and performance</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Store unlocks and payout control.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
            <MetricRow label="Commission locked" value={currency(data?.commission.individual.locked ?? 0)} />
            <MetricRow label="Commission pending" value={currency(data?.commission.individual.pending ?? 0)} tone="warn" />
            <MetricRow label="Commission reversed" value={currency(data?.commission.individual.reversed ?? 0)} tone="bad" />
            <MetricRow label="Groomer commission" value={currency(data?.commission.individual.groomerCommission ?? 0)} />
            <MetricRow label="Contractor payments due" value={currency(data?.commission.individual.contractorPaymentsDue ?? 0)} tone="warn" />
          </div>
          <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 8px' }}>Store</th>
                  <th style={{ padding: '10px 8px' }}>Achievement</th>
                  <th style={{ padding: '10px 8px' }}>Pool</th>
                </tr>
              </thead>
              <tbody>
                {(data?.commission.storeTargets ?? []).slice(0, 3).map(row => (
                  <tr key={row.store} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>{row.store}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(row.achievement, 100)}%`, height: '100%', background: row.achievement >= 100 ? '#34d399' : row.achievement >= 80 ? '#FFB347' : '#f87171' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>{row.achievement}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px', fontSize: '11px', color: row.pool === 'Unocked' ? '#34d399' : row.pool === 'Slab 2' ? '#FFB347' : '#f87171' }}>{row.pool}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            <MetricRow label="Top outlet" value={`${data?.commission.topOutlet.name ?? '-'} (${data?.commission.topOutlet.achievement ?? 0}%)`} />
            <MetricRow label="Lowest outlet" value={`${data?.commission.lowestOutlet.name ?? '-'} (${data?.commission.lowestOutlet.achievement ?? 0}%)`} />
          </div>
        </GlassCard>

        <GlassCard delay={0.45}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>9. Compliance and liability watch</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Always visible watchlist for legal and statutory exposure.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
            <MetricRow label="PF return" value={data?.compliance.pfStatus ?? 'Due'} tone={data?.compliance.pfStatus === 'Filed' ? 'good' : 'warn'} />
            <MetricRow label="ESIC return" value={data?.compliance.esicStatus ?? 'Due'} tone={data?.compliance.esicStatus === 'Filed' ? 'good' : 'warn'} />
            <MetricRow label="PT return" value={data?.compliance.ptStatus ?? 'Due'} tone={data?.compliance.ptStatus === 'Filed' ? 'good' : 'warn'} />
            <MetricRow label="Gratuity eligible now" value={`${data?.compliance.gratuityEligible ?? 0}`} />
            <MetricRow label="Approaching in 6 months" value={`${data?.compliance.gratuityApproaching ?? 0}`} tone={data && data.compliance.gratuityApproaching > 0 ? 'warn' : 'good'} />
            <MetricRow label="Cumulative provision" value={currency(data?.compliance.gratuityProvision ?? 0)} />
            <MetricRow label="Active FnF cases" value={`${data?.compliance.activeFnF ?? 0}`} tone={data && data.compliance.activeFnF > 0 ? 'warn' : 'good'} />
            <MetricRow label="FnF pending approval" value={`${data?.compliance.fnfPendingApproval ?? 0}`} tone={data && data.compliance.fnfPendingApproval > 0 ? 'bad' : 'good'} />
            <MetricRow label="Absconding cases" value={`${data?.compliance.abscondingCases ?? 0}`} tone={data && data.compliance.abscondingCases > 0 ? 'bad' : 'good'} />
            <MetricRow label="On proprietorship" value={`${data?.compliance.onProprietorship ?? 0}`} />
            <MetricRow label="On IPL payroll" value={`${data?.compliance.onIplPayroll ?? 0}`} />
            <MetricRow label="Transfer pending" value={`${data?.compliance.transferPending ?? 0}`} tone={data && data.compliance.transferPending > 0 ? 'warn' : 'good'} />
          </div>
          <div style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,140,66,0.12)', background: 'rgba(255,255,255,0.03)', fontSize: '11px', color: 'var(--text-muted)' }}>
            The statutory watch is derived from the current cycle because the schema does not yet include a dedicated filings table.
          </div>
        </GlassCard>

        <GlassCard delay={0.5}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>10. Quick actions</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Direct actions for the super admin without leaving the command centre.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
            {quickActions.map(action => {
              if ('href' in action) {
                return (
                  <Link key={action.label} href={action.href} style={{ textDecoration: 'none' }}>
                    <motion.div whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.98 }} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px', padding: '16px', borderRadius: '14px', background: `${action.color}10`, border: `1px solid ${action.color}25`, color: action.color }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '22px' }}>{action.icon}</span>
                        <ArrowRight size={14} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.3 }}>{action.label}</div>
                      </div>
                    </motion.div>
                  </Link>
                )
              }

              return (
                <motion.button key={action.label} type="button" whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={action.action === 'compliance' ? buildComplianceReport : buildPayrollSummary} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px', padding: '16px', borderRadius: '14px', background: `${action.color}10`, border: `1px solid ${action.color}25`, color: action.color, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '22px' }}>{action.icon}</span>
                    <Download size={14} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.3 }}>{action.label}</div>
                </motion.button>
              )
            })}
          </div>
        </GlassCard>
      </div>

      <GlassCard delay={0.55} style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Live audit feed</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Realtime system events from Supabase.</p>
          </div>
          <span className="badge badge-orange">Live</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(data?.raw.audits ?? []).slice(0, 6).map(entry => (
            <div key={entry.id} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,66,0.12)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B35', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{entry.action_type.replace(/_/g, ' ')}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{entry.target_table} - {entry.target_record}</p>
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{entry.timestamp.slice(0, 19).replace('T', ' ')}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {detail && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetail(null)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={event => event.stopPropagation()} style={{ maxWidth: '680px', width: 'calc(100vw - 32px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{detail.title}</h2>
                  {detail.subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{detail.subtitle}</p>}
                </div>
                <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <XCircle size={18} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '56vh', overflow: 'auto' }}>
                {detail.rows.map((row, index) => (
                  <button key={`${row.label}-${index}`} type="button" onClick={row.onClick} style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,140,66,0.12)', background: 'rgba(255,255,255,0.03)', textAlign: 'left', cursor: row.onClick ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: toneColor(row.tone ?? 'default') }}>{row.label}</div>
                      {row.meta && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{row.meta}</div>}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>{row.value}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  function renderStatusPill(outlet: OutletStatus) {
    if (outlet.status === 'closed') {
      return <span className="badge badge-red">Closed</span>
    }
    if (outlet.status === 'alert') {
      return <span className="badge badge-yellow">Alert</span>
    }
    return <span className="badge badge-green">Open</span>
  }

  function toneColor(tone: AttendanceCard['tone'] | DetailRow['tone']) {
    if (tone === 'good') return '#34d399'
    if (tone === 'warn') return '#FFB347'
    if (tone === 'bad') return '#f87171'
    if (tone === 'info') return '#60a5fa'
    return 'var(--text-primary)'
  }

  function MiniMetric({ label, value }: { label: string; value: number | string }) {
    return (
      <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,66,0.12)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{value}</div>
      </div>
    )
  }

  function MetricRow({ label, value, tone = 'default' }: { label: string; value: string; tone?: DetailRow['tone'] }) {
    return (
      <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,66,0.10)' }}>
        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{label}</div>
        <div style={{ fontSize: '13px', fontWeight: 800, color: toneColor(tone), marginTop: '4px' }}>{value}</div>
      </div>
    )
  }

  function openOutletDetailFromSnapshot(locationId: string) {
    if (!data) return
    const outlet = data.raw.locations.find(location => location.id === locationId)
    if (!outlet) return
    const employeesForOutlet = data.raw.employees.filter(employee => employee.location_id === locationId)
    const rows: DetailRow[] = employeesForOutlet.map(employee => ({
      label: employee.full_name,
      value: employee.designation,
      meta: `${employee.status} · ${data.raw.attendance.find(entry => entry.employee_id === employee.id && entry.date === isoDate(new Date()))?.status ?? 'no punch'}`,
      tone: employee.status === 'active' ? 'good' : 'warn',
      onClick: () => openEmployeeDetailFromSnapshot(employee.id),
    }))
    setDetail({ title: outlet.name, subtitle: `${outlet.city} · ${outlet.code}`, rows })
  }

  function openEmployeeDetailFromSnapshot(employeeId: string) {
    if (!data) return
    const employee = data.raw.employees.find(item => item.id === employeeId)
    if (!employee) return
    const attendanceRecords = data.raw.attendance.filter(entry => entry.employee_id === employeeId).slice(0, 10)
    const leaveRecords = data.raw.leaveRequests.filter(entry => entry.employee_id === employeeId).slice(0, 6)
    setDetail({
      title: employee.full_name,
      subtitle: `${employee.designation} · ${data.raw.locations.find(location => location.id === employee.location_id)?.name ?? 'Unknown outlet'}`,
        rows: [
        { label: 'Employee code', value: employee.employee_code },
        { label: 'Entity', value: employee.entity },
        { label: 'Status', value: employee.status },
        { label: 'Date of joining', value: employee.date_of_joining },
          ...attendanceRecords.map((record): DetailRow => ({
            label: record.date,
            value: `${record.status} ${record.check_in ?? '--'} - ${record.check_out ?? '--'}`,
            meta: record.biometric_override ? 'override' : record.biometric_verified ? 'verified' : 'manual',
            tone: record.status === 'present' ? 'good' : record.status === 'absent' ? 'bad' : 'warn',
          })),
          ...leaveRecords.map((record): DetailRow => ({
            label: `${record.leave_type} leave`,
            value: record.status,
            meta: record.reason,
            tone: record.status === 'approved' ? 'good' : record.status === 'rejected' ? 'bad' : 'warn',
          })),
      ],
    })
  }

  function openAttendanceDetail(title: string, rows: DetailRow[]) {
    setDetail({ title, subtitle: 'Click rows with a drill-down to open the employee record.', rows })
  }

  function openWarningDetail(title: string, records: WarningRecord[]) {
    if (!data) return
    setDetail({
      title,
      subtitle: 'Disciplinary and exception records.',
        rows: records.map((record): DetailRow => ({
        label: data.raw.employees.find(employee => employee.id === record.employee_id)?.full_name ?? record.employee_id,
        value: record.action_type,
        meta: `${record.issued_at} · ${record.reason}`,
        tone: record.action_type === 'termination' ? 'bad' : record.action_type === 'suspension' ? 'warn' : 'warn',
        onClick: () => openEmployeeDetailFromSnapshot(record.employee_id),
      })),
    })
  }

  function openCOLeadgerDetail(title: string, records: COLedger[]) {
    if (!data) return
    setDetail({
      title,
      subtitle: 'Comp-off credits nearing expiry.',
        rows: records.map((record): DetailRow => ({
        label: data.raw.employees.find(employee => employee.id === record.employee_id)?.full_name ?? record.employee_id,
        value: `${record.credits - record.used} usable`,
        meta: record.expiry_date ?? 'No expiry',
        tone: 'warn',
        onClick: () => openEmployeeDetailFromSnapshot(record.employee_id),
      })),
    })
  }
}
