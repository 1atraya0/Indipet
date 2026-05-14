import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are required for seeding')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function POST() {
  try {
    const supabase = createSupabaseClient()

    // ── 1. Locations ──────────────────────────────────────
    const { error: locErr } = await supabase.from('locations').upsert([
      { id: 'loc-001', name: 'Indipet Kolkata West', code: 'KOL-W', type: 'company_owned', state: 'West Bengal', city: 'Kolkata', address: '12, Lake Gardens, Kolkata - 700045', status: 'active', operating_hours_start: '09:00', operating_hours_end: '20:00', minimum_staff_strength: 4 },
      { id: 'loc-002', name: 'Indipet Noida Sector 18', code: 'NOI-18', type: 'company_owned', state: 'Uttar Pradesh', city: 'Noida', address: 'Shop 5, Sector 18 Market, Noida - 201301', status: 'active', operating_hours_start: '10:00', operating_hours_end: '21:00', minimum_staff_strength: 3 },
      { id: 'loc-003', name: 'Indipet Bandra West', code: 'BDR-W', type: 'franchise', state: 'Maharashtra', city: 'Mumbai', address: 'Linking Road, Bandra West, Mumbai - 400050', status: 'active', operating_hours_start: '09:30', operating_hours_end: '21:30', minimum_staff_strength: 5 },
      { id: 'loc-004', name: 'Indipet Indiranagar', code: 'BLR-IND', type: 'franchise', state: 'Karnataka', city: 'Bengaluru', address: '100 Feet Road, Indiranagar, Bengaluru - 560038', status: 'onboarding', operating_hours_start: '10:00', operating_hours_end: '20:00', minimum_staff_strength: 4 },
      { id: 'loc-005', name: 'Indipet Salt Lake', code: 'KOL-SL', type: 'company_owned', state: 'West Bengal', city: 'Kolkata', address: 'Sector V, Salt Lake, Kolkata - 700091', status: 'active', operating_hours_start: '09:00', operating_hours_end: '20:00', minimum_staff_strength: 3 },
    ], { onConflict: 'id' })
    if (locErr) throw new Error(`Locations: ${locErr.message}`)

    // ── 2. Employees ──────────────────────────────────────
    const { error: empErr } = await supabase.from('employees').upsert([
      { id: 'emp-001', employee_code: 'EMP-001', full_name: 'Ananya Sharma', email: 'ananya.sharma@indipet.in', phone: '9876543210', designation: 'Senior Groomer', department: 'Grooming', location_id: 'loc-001', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2023-04-01', original_doj: '2022-01-15', entity_transfer_date: '2023-04-01', status: 'active', is_salesperson: true },
      { id: 'emp-002', employee_code: 'EMP-002', full_name: 'Rahul Verma', email: 'rahul.verma@indipet.in', phone: '9876543211', designation: 'Store Manager', department: 'Management', location_id: 'loc-002', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2023-06-01', original_doj: '2023-06-01', status: 'active', is_salesperson: false },
      { id: 'emp-003', employee_code: 'EMP-003', full_name: 'Priya Nair', email: 'priya.nair@indipet.in', phone: '9876543212', designation: 'Junior Groomer', department: 'Grooming', location_id: 'loc-001', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2024-01-10', original_doj: '2024-01-10', status: 'probation', probation_end_date: '2024-07-10', is_salesperson: true },
      { id: 'emp-004', employee_code: 'EMP-004', full_name: 'Deepak Raj', email: 'deepak.raj@indipet.in', phone: '9876543213', designation: 'Sales Executive', department: 'Sales', location_id: 'loc-003', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2023-09-01', original_doj: '2023-09-01', status: 'active', is_salesperson: true },
      { id: 'emp-005', employee_code: 'EMP-005', full_name: 'Sneha Patel', email: 'sneha.patel@indipet.in', phone: '9876543214', designation: 'Receptionist', department: 'Operations', location_id: 'loc-002', employment_type: 'part_time', entity: 'pvt_ltd', date_of_joining: '2024-02-01', original_doj: '2024-02-01', status: 'active', is_salesperson: false },
      { id: 'emp-006', employee_code: 'EMP-006', full_name: 'Arjun Singh', email: 'arjun.singh@indipet.in', phone: '9876543215', designation: 'Senior Groomer', department: 'Grooming', location_id: 'loc-003', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2023-03-15', original_doj: '2023-03-15', status: 'active', is_salesperson: true },
      { id: 'emp-007', employee_code: 'EMP-007', full_name: 'Meera Krishnan', email: 'meera.krishnan@indipet.in', phone: '9876543216', designation: 'Store Manager', department: 'Management', location_id: 'loc-003', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2022-11-01', original_doj: '2022-11-01', status: 'active', is_salesperson: false },
      { id: 'emp-008', employee_code: 'EMP-008', full_name: 'Vikash Kumar', email: 'vikash.kumar@indipet.in', phone: '9876543217', designation: 'Junior Groomer', department: 'Grooming', location_id: 'loc-005', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2024-03-01', original_doj: '2024-03-01', status: 'probation', probation_end_date: '2024-09-01', is_salesperson: true },
      { id: 'emp-009', employee_code: 'EMP-009', full_name: 'Pooja Reddy', email: 'pooja.reddy@indipet.in', phone: '9876543218', designation: 'Sales Executive', department: 'Sales', location_id: 'loc-001', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2023-08-15', original_doj: '2023-08-15', status: 'active', is_salesperson: true },
      { id: 'emp-010', employee_code: 'EMP-010', full_name: 'Suresh Babu', email: 'suresh.babu@indipet.in', phone: '9876543219', designation: 'Area Manager', department: 'Management', location_id: 'loc-001', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2022-06-01', original_doj: '2022-06-01', status: 'active', is_salesperson: false },
      { id: 'emp-011', employee_code: 'EMP-011', full_name: 'Ritu Sharma', email: 'ritu.sharma@indipet.in', phone: '9876543220', designation: 'Receptionist', department: 'Operations', location_id: 'loc-005', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2024-01-20', original_doj: '2024-01-20', status: 'active', is_salesperson: false },
      { id: 'emp-012', employee_code: 'EMP-012', full_name: 'Karan Mehta', email: 'karan.mehta@indipet.in', phone: '9876543221', designation: 'Senior Groomer', department: 'Grooming', location_id: 'loc-002', employment_type: 'full_time', entity: 'pvt_ltd', date_of_joining: '2023-02-01', original_doj: '2023-02-01', status: 'active', is_salesperson: true },
    ], { onConflict: 'id' })
    if (empErr) throw new Error(`Employees: ${empErr.message}`)

    // ── 3. Shifts ──────────────────────────────────────
    const { error: shiftErr } = await supabase.from('shifts').upsert([
      { id: 'shf-001', name: 'Morning', start_time: '09:00', end_time: '18:00', location_id: null, is_active: true },
      { id: 'shf-002', name: 'Evening', start_time: '13:00', end_time: '22:00', location_id: null, is_active: true },
      { id: 'shf-003', name: 'Split (Bandra)', start_time: '10:00', end_time: '19:00', location_id: 'loc-003', is_active: true },
    ], { onConflict: 'id' })
    if (shiftErr) throw new Error(`Shifts: ${shiftErr.message}`)

    // ── 4. Leave Requests ──────────────────────────────────────
    const { error: leaveErr } = await supabase.from('leave_requests').upsert([
      { id: 'lrq-001', employee_id: 'emp-001', leave_type: 'PL', from_date: '2026-05-10', to_date: '2026-05-12', days: 3, reason: 'Family function in Kolkata', status: 'pending' },
      { id: 'lrq-002', employee_id: 'emp-002', leave_type: 'CL', from_date: '2026-05-08', to_date: '2026-05-08', days: 1, reason: 'Personal work', status: 'approved', approved_by: 'super_admin', approved_at: '2026-05-06T10:00:00Z' },
      { id: 'lrq-003', employee_id: 'emp-003', leave_type: 'ML', from_date: '2026-05-15', to_date: '2026-05-25', days: 11, reason: 'Medical leave — doctor prescribed rest', status: 'pending' },
      { id: 'lrq-004', employee_id: 'emp-004', leave_type: 'LOP', from_date: '2026-05-03', to_date: '2026-05-04', days: 2, reason: 'Absent without notice', status: 'rejected', approved_by: 'super_admin', approved_at: '2026-05-05T09:00:00Z' },
      { id: 'lrq-005', employee_id: 'emp-005', leave_type: 'CO', from_date: '2026-05-09', to_date: '2026-05-09', days: 1, reason: 'Compensatory off for working Sunday', status: 'pending' },
      { id: 'lrq-006', employee_id: 'emp-006', leave_type: 'PL', from_date: '2026-05-20', to_date: '2026-05-22', days: 3, reason: 'Vacation', status: 'pending' },
      { id: 'lrq-007', employee_id: 'emp-009', leave_type: 'CL', from_date: '2026-05-12', to_date: '2026-05-12', days: 1, reason: 'Child school event', status: 'pending' },
      { id: 'lrq-008', employee_id: 'emp-012', leave_type: 'PL', from_date: '2026-05-16', to_date: '2026-05-18', days: 3, reason: 'Personal trip', status: 'approved', approved_by: 'super_admin', approved_at: '2026-05-07T08:00:00Z' },
    ], { onConflict: 'id' })
    if (leaveErr) throw new Error(`Leaves: ${leaveErr.message}`)

    // ── 5. Attendance ──────────────────────────────────────
    const today = new Date().toISOString().split('T')[0]
    const { error: attErr } = await supabase.from('attendance').upsert([
      { id: 'att-001', employee_id: 'emp-001', location_id: 'loc-001', date: today, check_in: '09:02', check_out: '18:05', status: 'present', biometric_verified: true },
      { id: 'att-002', employee_id: 'emp-002', location_id: 'loc-002', date: today, check_in: '09:15', check_out: '18:30', status: 'present', biometric_verified: true },
      { id: 'att-003', employee_id: 'emp-003', location_id: 'loc-001', date: today, check_in: null, check_out: null, status: 'absent', biometric_verified: false },
      { id: 'att-004', employee_id: 'emp-004', location_id: 'loc-003', date: today, check_in: '09:45', check_out: '14:00', status: 'half_day', biometric_verified: true },
      { id: 'att-005', employee_id: 'emp-005', location_id: 'loc-002', date: today, check_in: '09:00', check_out: '18:00', status: 'present', biometric_verified: false, biometric_override: true, override_reason: 'Device malfunction — manually verified' },
      { id: 'att-006', employee_id: 'emp-006', location_id: 'loc-003', date: today, check_in: '09:30', check_out: '18:30', status: 'present', biometric_verified: true },
      { id: 'att-007', employee_id: 'emp-007', location_id: 'loc-003', date: today, check_in: '10:05', check_out: '19:05', status: 'present', biometric_verified: true },
      { id: 'att-008', employee_id: 'emp-008', location_id: 'loc-005', date: today, check_in: null, check_out: null, status: 'on_leave', biometric_verified: false },
      { id: 'att-009', employee_id: 'emp-009', location_id: 'loc-001', date: today, check_in: '09:10', check_out: '18:10', status: 'present', biometric_verified: true },
      { id: 'att-010', employee_id: 'emp-010', location_id: 'loc-001', date: today, check_in: '08:55', check_out: '18:55', status: 'present', biometric_verified: true },
      { id: 'att-011', employee_id: 'emp-011', location_id: 'loc-005', date: today, check_in: '09:20', check_out: '18:20', status: 'present', biometric_verified: true },
      { id: 'att-012', employee_id: 'emp-012', location_id: 'loc-002', date: today, check_in: '09:05', check_out: '18:05', status: 'present', biometric_verified: true },
    ], { onConflict: 'id' })
    if (attErr) throw new Error(`Attendance: ${attErr.message}`)

    // ── 6. Rosters ──────────────────────────────────────
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const { error: rosterErr } = await supabase.from('rosters').upsert([
      { id: 'rst-001', employee_id: 'emp-001', location_id: 'loc-001', shift_id: 'shf-001', date: tomorrow, status: 'scheduled', created_by: 'super_admin' },
      { id: 'rst-002', employee_id: 'emp-002', location_id: 'loc-002', shift_id: 'shf-002', date: tomorrow, status: 'confirmed', created_by: 'super_admin' },
      { id: 'rst-003', employee_id: 'emp-003', location_id: 'loc-001', shift_id: 'shf-001', date: tomorrow, status: 'overridden', override_reason: 'Emergency coverage', created_by: 'super_admin' },
      { id: 'rst-004', employee_id: 'emp-006', location_id: 'loc-003', shift_id: 'shf-003', date: tomorrow, status: 'scheduled', created_by: 'super_admin' },
      { id: 'rst-005', employee_id: 'emp-012', location_id: 'loc-002', shift_id: 'shf-001', date: tomorrow, status: 'confirmed', created_by: 'super_admin' },
    ], { onConflict: 'id' })
    if (rosterErr) throw new Error(`Rosters: ${rosterErr.message}`)

    // ── 7. Store Targets ──────────────────────────────────────
    const { error: storeTargErr } = await supabase.from('store_target_master').upsert([
      { id: 'stgt-001', location_id: 'loc-001', period_month: 5, period_year: 2026, revenue_target: 300000, grooming_target: 150, achieved_revenue: 187500, achieved_grooming: 94 },
      { id: 'stgt-002', location_id: 'loc-002', period_month: 5, period_year: 2026, revenue_target: 250000, grooming_target: 120, achieved_revenue: 142000, achieved_grooming: 71 },
      { id: 'stgt-003', location_id: 'loc-003', period_month: 5, period_year: 2026, revenue_target: 400000, grooming_target: 200, achieved_revenue: 220000, achieved_grooming: 112 },
      { id: 'stgt-004', location_id: 'loc-005', period_month: 5, period_year: 2026, revenue_target: 200000, grooming_target: 90, achieved_revenue: 95000, achieved_grooming: 48 },
    ], { onConflict: 'id' })
    if (storeTargErr) throw new Error(`Store Targets: ${storeTargErr.message}`)

    // ── 8. Sales Targets ──────────────────────────────────────
    const { error: salesTargErr } = await supabase.from('sales_target_portfolio').upsert([
      { id: 'stp-001', employee_id: 'emp-001', period_month: 5, period_year: 2026, target_amount: 50000, achieved_amount: 31250 },
      { id: 'stp-002', employee_id: 'emp-004', period_month: 5, period_year: 2026, target_amount: 45000, achieved_amount: 24750 },
      { id: 'stp-003', employee_id: 'emp-006', period_month: 5, period_year: 2026, target_amount: 55000, achieved_amount: 30250 },
      { id: 'stp-004', employee_id: 'emp-009', period_month: 5, period_year: 2026, target_amount: 40000, achieved_amount: 22000 },
      { id: 'stp-005', employee_id: 'emp-012', period_month: 5, period_year: 2026, target_amount: 48000, achieved_amount: 26400 },
    ], { onConflict: 'id' })
    if (salesTargErr) throw new Error(`Sales Targets: ${salesTargErr.message}`)

    // ── 9. Payroll Periods ──────────────────────────────────────
    const { error: payErr } = await supabase.from('payroll_periods').upsert([
      { id: 'pay-001', period_month: 5, period_year: 2026, start_date: '2026-05-01', end_date: '2026-05-31', lock_date: '2026-05-28', status: 'open' },
      { id: 'pay-002', period_month: 4, period_year: 2026, start_date: '2026-04-01', end_date: '2026-04-30', lock_date: '2026-04-28', status: 'dispatched', dispatched_at: '2026-04-29T10:30:00Z' },
      { id: 'pay-003', period_month: 3, period_year: 2026, start_date: '2026-03-01', end_date: '2026-03-31', lock_date: '2026-03-28', status: 'dispatched', dispatched_at: '2026-03-29T09:15:00Z' },
      { id: 'pay-004', period_month: 2, period_year: 2026, start_date: '2026-02-01', end_date: '2026-02-28', lock_date: '2026-02-25', status: 'blocked', blocked_reason: 'Minimum wage breach — EMP-047, EMP-089' },
    ], { onConflict: 'id' })
    if (payErr) throw new Error(`Payroll: ${payErr.message}`)

    // ── 10. Commission Ledger ──────────────────────────────────────
    const { error: commErr } = await supabase.from('commission_ledger').upsert([
      { id: 'com-001', employee_id: 'emp-001', location_id: 'loc-001', period_month: 4, period_year: 2026, earned_amount: 8500, status: 'pending' },
      { id: 'com-002', employee_id: 'emp-004', location_id: 'loc-003', period_month: 4, period_year: 2026, earned_amount: 12200, status: 'approved', approved_by: 'super_admin' },
      { id: 'com-003', employee_id: 'emp-006', location_id: 'loc-003', period_month: 4, period_year: 2026, earned_amount: 9800, status: 'pending' },
      { id: 'com-004', employee_id: 'emp-009', location_id: 'loc-001', period_month: 4, period_year: 2026, earned_amount: 5100, status: 'pending' },
      { id: 'com-005', employee_id: 'emp-012', location_id: 'loc-002', period_month: 4, period_year: 2026, earned_amount: 7300, status: 'approved', approved_by: 'super_admin' },
    ], { onConflict: 'id' })
    if (commErr) throw new Error(`Commission: ${commErr.message}`)

    // ── 11. Contractor Profiles ──────────────────────────────────────
    const { error: ctErr } = await supabase.from('contractor_profiles').upsert([
      { id: 'ctr-001', name: 'Priya Krishnamurthy', phone: '9988776655', email: 'priya.k@groomer.in', role: 'Freelance Groomer', location_id: 'loc-001', kpi_score: 94, status: 'active' },
      { id: 'ctr-002', name: 'Ravi Shankar', phone: '9988776656', email: 'ravi.shankar@trainer.in', role: 'Pet Trainer', location_id: 'loc-002', kpi_score: 78, status: 'active' },
      { id: 'ctr-003', name: 'Meera Joshi', phone: '9988776657', email: 'meera.j@groomer.in', role: 'Freelance Groomer', location_id: 'loc-003', kpi_score: 88, status: 'inactive' },
      { id: 'ctr-004', name: 'Suresh Kumar', phone: '9988776658', email: 'suresh.k@nutrition.in', role: 'Pet Nutritionist', location_id: 'loc-004', kpi_score: 62, status: 'active' },
    ], { onConflict: 'id' })
    if (ctErr) throw new Error(`Contractors: ${ctErr.message}`)

    // ── 12. Contractor Invoices ──────────────────────────────────────
    const { error: invErr } = await supabase.from('contractor_invoices').upsert([
      { id: 'inv-001', contractor_id: 'ctr-001', amount: 18000, period_month: 4, period_year: 2026, kpi_achieved: true, status: 'pending' },
      { id: 'inv-002', contractor_id: 'ctr-002', amount: 12000, period_month: 4, period_year: 2026, kpi_achieved: false, status: 'pending' },
      { id: 'inv-003', contractor_id: 'ctr-003', amount: 15000, period_month: 3, period_year: 2026, kpi_achieved: true, status: 'approved', approved_by: 'super_admin' },
      { id: 'inv-004', contractor_id: 'ctr-004', amount: 8500, period_month: 4, period_year: 2026, kpi_achieved: false, status: 'rejected' },
    ], { onConflict: 'id' })
    if (invErr) throw new Error(`Invoices: ${invErr.message}`)

    // ── 13. Role Master ──────────────────────────────────────
    const { error: roleErr } = await supabase.from('role_master').upsert([
      { id: 'rol-001', name: 'Super Admin', code: 'super_admin', all_permissions: true, permissions: { all: true }, is_active: true },
      { id: 'rol-002', name: 'Store Manager', code: 'store_manager', all_permissions: false, permissions: { leave_approve: true, roster_view: true, attendance_entry: true }, is_active: true },
      { id: 'rol-003', name: 'Area Manager', code: 'area_manager', all_permissions: false, permissions: { leave_approve: true, roster_view: true, analytics_view: true }, is_active: true },
      { id: 'rol-004', name: 'HR Admin', code: 'hr_admin', all_permissions: false, permissions: { leave_policy: true, disciplinary: true, onboarding: true }, is_active: true },
      { id: 'rol-005', name: 'Finance', code: 'finance', all_permissions: false, permissions: { report_view: true }, is_active: true },
    ], { onConflict: 'id' })
    if (roleErr) throw new Error(`Roles: ${roleErr.message}`)

    // ── 14. User Accounts ──────────────────────────────────────
    const { error: userErr } = await supabase.from('user_accounts').upsert([
      { id: 'usr-001', full_name: 'Vikram Chatterjee', email: 'vikram@indipet.in', role_id: 'rol-001', location_scope: null, status: 'active', last_login: new Date().toISOString() },
      { id: 'usr-002', full_name: 'Asha Mehta', email: 'asha@indipet.in', role_id: 'rol-002', location_scope: ['loc-001'], status: 'active', last_login: new Date(Date.now() - 3600000).toISOString() },
      { id: 'usr-003', full_name: 'Rajan Pillai', email: 'rajan@indipet.in', role_id: 'rol-003', location_scope: ['loc-001', 'loc-002', 'loc-005'], status: 'active', last_login: new Date(Date.now() - 7200000).toISOString() },
      { id: 'usr-004', full_name: 'Preethi Nair', email: 'preethi@indipet.in', role_id: 'rol-002', location_scope: ['loc-003'], status: 'active', last_login: new Date(Date.now() - 1800000).toISOString() },
    ], { onConflict: 'id' })
    if (userErr) throw new Error(`Users: ${userErr.message}`)

    // ── 15. Audit Log ──────────────────────────────────────
    const { error: auditErr } = await supabase.from('location_audit_log').upsert([
      { id: 'aud-001', actor_id: 'super_admin', action_type: 'PAYROLL_DISPATCHED', target_record: 'payroll_period:Apr 2026', target_table: 'payroll_periods', reason: 'Monthly payroll cycle complete', timestamp: new Date(Date.now() - 120000).toISOString() },
      { id: 'aud-002', actor_id: 'super_admin', action_type: 'BIOMETRIC_OVERRIDE', target_record: 'attendance:EMP-005:today', target_table: 'attendance', reason: 'Device malfunction confirmed by store manager', timestamp: new Date(Date.now() - 1080000).toISOString() },
      { id: 'aud-003', actor_id: 'super_admin', action_type: 'COMMISSION_APPROVED', target_record: 'commission_ledger:EMP-004:Apr 2026', target_table: 'commission_ledger', reason: 'KPI threshold met — 108% achievement', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'aud-004', actor_id: 'super_admin', action_type: 'LEAVE_REJECTED', target_record: 'leave_request:lrq-004', target_table: 'leave_requests', reason: 'Store below minimum staff strength — Hard Rule 2', timestamp: new Date(Date.now() - 10800000).toISOString() },
      { id: 'aud-005', actor_id: 'super_admin', action_type: 'STORE_ACTIVATED', target_record: 'location:loc-005', target_table: 'locations', reason: 'Onboarding checklist complete', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'aud-006', actor_id: 'super_admin', action_type: 'ROSTER_OVERRIDE', target_record: 'roster:loc-001:tomorrow', target_table: 'rosters', reason: 'Emergency staffing shortage — EMP-003 sick leave', timestamp: new Date(Date.now() - 172800000).toISOString() },
    ], { onConflict: 'id' })
    if (auditErr) throw new Error(`Audit: ${auditErr.message}`)

    // ── 16. Warning Records ──────────────────────────────────────
    const { error: warnErr } = await supabase.from('warning_records').upsert([
      { id: 'wrn-001', employee_id: 'emp-004', reason: 'Repeated tardiness — 4 instances in March 2026', issued_by: 'super_admin', issued_at: '2026-04-02', action_type: 'warning' },
      { id: 'wrn-002', employee_id: 'emp-003', reason: 'SOP non-compliance — grooming checklist skipped twice', issued_by: 'super_admin', issued_at: '2026-03-15', action_type: 'warning' },
    ], { onConflict: 'id' })
    if (warnErr) throw new Error(`Warnings: ${warnErr.message}`)

    // ── 17. Advance Salary ──────────────────────────────────────
    const { error: advErr } = await supabase.from('advance_salary').upsert([
      { id: 'adv-001', employee_id: 'emp-001', amount: 15000, approved_by: 'super_admin', status: 'active', recovery_start_month: 5, recovery_start_year: 2026 },
      { id: 'adv-002', employee_id: 'emp-002', amount: 8000, approved_by: 'super_admin', status: 'recovered', recovery_start_month: 3, recovery_start_year: 2026 },
    ], { onConflict: 'id' })
    if (advErr) throw new Error(`Advance: ${advErr.message}`)

    // ── 18. Leave Balance ──────────────────────────────────────
    const { error: lbErr } = await supabase.from('leave_balance').upsert([
      { id: 'lb-001', employee_id: 'emp-001', leave_type: 'PL', balance: 12, used: 3, year: 2026 },
      { id: 'lb-002', employee_id: 'emp-001', leave_type: 'CL', balance: 9, used: 3, year: 2026 },
      { id: 'lb-003', employee_id: 'emp-002', leave_type: 'PL', balance: 15, used: 0, year: 2026 },
      { id: 'lb-004', employee_id: 'emp-002', leave_type: 'CL', balance: 11, used: 1, year: 2026 },
    ], { onConflict: 'id' })
    if (lbErr) throw new Error(`Leave balance: ${lbErr.message}`)

    return NextResponse.json({ success: true, message: 'Database seeded successfully with Indipet data!' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function GET() {
  const supabase = createSupabaseClient()

  const checks = await Promise.all([
    supabase.from('employees').select('id', { count: 'exact', head: true }),
    supabase.from('locations').select('id', { count: 'exact', head: true }),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }),
  ])
  return NextResponse.json({
    employees: checks[0].count ?? 0,
    locations: checks[1].count ?? 0,
    leave_requests: checks[2].count ?? 0,
    seeded: (checks[0].count ?? 0) > 0,
  })
}
