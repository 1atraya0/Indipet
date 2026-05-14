-- Indipet ERP — Supabase Schema
-- Run this in Supabase SQL Editor to set up all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Locations ──
create table if not exists locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  type text check (type in ('company_owned','franchise')) not null,
  state text not null,
  city text not null,
  address text not null,
  status text check (status in ('active','inactive','onboarding')) default 'onboarding',
  franchisee_owner_id uuid,
  operating_hours_start time default '09:00',
  operating_hours_end time default '20:00',
  minimum_staff_strength integer default 3,
  created_at timestamptz default now()
);

-- ── Employees ──
create table if not exists employees (
  id uuid primary key default uuid_generate_v4(),
  employee_code text unique not null,
  full_name text not null,
  email text unique not null,
  phone text not null,
  designation text not null,
  department text not null,
  location_id uuid references locations(id),
  employment_type text check (employment_type in ('full_time','part_time','contractor')) default 'full_time',
  entity text check (entity in ('proprietorship','pvt_ltd')) default 'pvt_ltd',
  date_of_joining date not null,
  original_doj date,
  entity_transfer_date date,
  status text check (status in ('active','inactive','probation','exited')) default 'probation',
  probation_end_date date,
  is_salesperson boolean default false,
  salary_structure_id uuid,
  leave_policy_id uuid,
  shift_policy_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Leave Requests ──
create table if not exists leave_requests (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  leave_type text check (leave_type in ('PL','CL','ML','CO','LOP')) not null,
  from_date date not null,
  to_date date not null,
  days integer not null,
  reason text not null,
  status text check (status in ('pending','approved','rejected','cancelled')) default 'pending',
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- ── Attendance ──
create table if not exists attendance (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  location_id uuid references locations(id),
  date date not null,
  check_in time,
  check_out time,
  status text check (status in ('present','absent','half_day','on_leave','holiday')) default 'absent',
  biometric_verified boolean default false,
  biometric_override boolean default false,
  override_reason text,
  shift_id uuid,
  created_at timestamptz default now(),
  unique(employee_id, date)
);

-- ── Shifts ──
create table if not exists shifts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  start_time time not null,
  end_time time not null,
  location_id uuid references locations(id),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── Rosters ──
create table if not exists rosters (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  location_id uuid references locations(id) not null,
  shift_id uuid references shifts(id) not null,
  date date not null,
  status text check (status in ('scheduled','confirmed','overridden')) default 'scheduled',
  override_reason text,
  created_by text not null,
  created_at timestamptz default now()
);

-- ── Sales Target Portfolio ──
create table if not exists sales_target_portfolio (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  period_month integer not null check (period_month between 1 and 12),
  period_year integer not null,
  target_amount numeric(12,2) default 0,
  achieved_amount numeric(12,2) default 0,
  created_at timestamptz default now(),
  unique(employee_id, period_month, period_year)
);

-- ── Store Target Master ──
create table if not exists store_target_master (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) not null,
  period_month integer not null check (period_month between 1 and 12),
  period_year integer not null,
  revenue_target numeric(12,2) default 0,
  grooming_target integer default 0,
  achieved_revenue numeric(12,2) default 0,
  achieved_grooming integer default 0,
  created_at timestamptz default now(),
  unique(location_id, period_month, period_year)
);

-- ── Payroll Periods ──
create table if not exists payroll_periods (
  id uuid primary key default uuid_generate_v4(),
  period_month integer not null check (period_month between 1 and 12),
  period_year integer not null,
  start_date date not null,
  end_date date not null,
  lock_date date not null,
  status text check (status in ('open','locked','processing','dispatched','blocked')) default 'open',
  blocked_reason text,
  dispatched_at timestamptz,
  created_at timestamptz default now(),
  unique(period_month, period_year)
);

-- ── Commission Ledger ──
create table if not exists commission_ledger (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  location_id uuid references locations(id) not null,
  period_month integer not null,
  period_year integer not null,
  earned_amount numeric(12,2) default 0,
  status text check (status in ('pending','approved','locked','paid')) default 'pending',
  approved_by text,
  created_at timestamptz default now()
);

-- ── Contractor Profiles ──
create table if not exists contractor_profiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text,
  role text not null,
  location_id uuid references locations(id),
  kpi_score integer default 0 check (kpi_score between 0 and 100),
  status text check (status in ('active','inactive')) default 'active',
  created_at timestamptz default now()
);

-- ── Contractor Invoices ──
create table if not exists contractor_invoices (
  id uuid primary key default uuid_generate_v4(),
  contractor_id uuid references contractor_profiles(id) not null,
  amount numeric(12,2) not null,
  period_month integer not null,
  period_year integer not null,
  kpi_achieved boolean default false,
  status text check (status in ('pending','approved','rejected','paid')) default 'pending',
  approved_by text,
  created_at timestamptz default now()
);

-- ── Role Master ──
create table if not exists role_master (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  all_permissions boolean default false,
  permissions jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── User Accounts ──
create table if not exists user_accounts (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text unique not null,
  role_id uuid references role_master(id),
  location_scope uuid[],
  status text check (status in ('active','inactive')) default 'active',
  last_login timestamptz,
  created_at timestamptz default now()
);

-- ── Audit Log (immutable) ──
create table if not exists location_audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id text not null,
  action_type text not null,
  target_record text not null,
  target_table text not null,
  reason text not null,
  metadata jsonb,
  timestamp timestamptz default now()
);

-- ── Leave Balance ──
create table if not exists leave_balance (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  leave_type text not null,
  balance integer default 0,
  used integer default 0,
  year integer not null,
  created_at timestamptz default now(),
  unique(employee_id, leave_type, year)
);

-- ── Warning Records ──
create table if not exists warning_records (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  reason text not null,
  issued_by text not null,
  issued_at date not null,
  action_type text check (action_type in ('warning','suspension','termination')) default 'warning',
  created_at timestamptz default now()
);

-- ── Advance Salary ──
create table if not exists advance_salary (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  amount numeric(12,2) not null,
  approved_by text,
  status text check (status in ('pending','approved','active','recovered','written_off')) default 'pending',
  recovery_start_month integer,
  recovery_start_year integer,
  created_at timestamptz default now()
);

-- ── CO Ledger ──
create table if not exists co_ledger (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  credits integer default 0,
  used integer default 0,
  expiry_date date,
  created_at timestamptz default now()
);

-- ── Salary Structure Master ──
create table if not exists salary_structure_master (
  id uuid primary key default uuid_generate_v4(),
  grade text not null,
  basic_percentage numeric(5,2) not null,
  hra_percentage numeric(5,2) not null,
  conveyance numeric(12,2) not null,
  da_percentage numeric(5,2) default 0,
  performance_cap numeric(12,2) default 5000,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(grade)
);

-- ── Leave Policy Master ──
create table if not exists leave_policy_master (
  id uuid primary key default uuid_generate_v4(),
  leave_type text not null,
  annual_entitlement integer not null,
  encashable boolean default false,
  carry_forward_max integer default 0,
  lop_floor_percentage numeric(5,2) default 69,
  created_at timestamptz default now(),
  unique(leave_type)
);

-- ── Employee Category Master ──
create table if not exists employee_category_master (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── Minimum Wage Master ──
create table if not exists minimum_wage_master (
  id uuid primary key default uuid_generate_v4(),
  state text not null,
  employee_category_id uuid references employee_category_master(id),
  daily_wage numeric(12,2) not null,
  monthly_wage numeric(12,2) not null,
  effective_from date not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(state, employee_category_id)
);

-- ── Holiday Calendar ──
create table if not exists holiday_calendar (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id),
  holiday_date date not null,
  holiday_name text not null,
  holiday_type text check (holiday_type in ('closed','open')) default 'open',
  year integer not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── Service Type Master ──
create table if not exists service_type_master (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── Employee Finance Details ──
create table if not exists employee_finance (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null unique,
  pan_number text,
  aadhaar_number text,
  bank_account_number text,
  ifsc_code text,
  upi_handle text,
  pf_uaan text,
  pf_wage_cap_elected boolean default false,
  esic_eligible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Employee Skills ──
create table if not exists employee_skills (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  skill_name text not null,
  proficiency_level text check (proficiency_level in ('beginner','intermediate','expert')) default 'intermediate',
  certification_url text,
  created_at timestamptz default now()
);

-- ── Employee Salary Details ──
create table if not exists employee_salary (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null unique,
  salary_structure_id uuid references salary_structure_master(id),
  monthly_basic numeric(12,2) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Roster History ──
create table if not exists roster_history (
  id uuid primary key default uuid_generate_v4(),
  roster_id uuid references rosters(id),
  employee_id uuid references employees(id) not null,
  location_id uuid references locations(id) not null,
  shift_id uuid references shifts(id) not null,
  date date not null,
  status text not null,
  override_reason text,
  version integer default 1,
  changed_by text,
  created_at timestamptz default now()
);

-- ── Payslips ──
create table if not exists payslips (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  period_month integer not null,
  period_year integer not null,
  basic numeric(12,2) not null,
  allowances numeric(12,2) default 0,
  gross_earnings numeric(12,2) not null,
  pf_contribution numeric(12,2) default 0,
  esic_contribution numeric(12,2) default 0,
  professional_tax numeric(12,2) default 0,
  advance_recovery numeric(12,2) default 0,
  other_deductions numeric(12,2) default 0,
  total_deductions numeric(12,2) not null,
  net_pay numeric(12,2) not null,
  status text check (status in ('draft','approved','disbursed')) default 'draft',
  generated_at timestamptz default now(),
  disbursed_at timestamptz,
  created_at timestamptz default now(),
  unique(employee_id, period_month, period_year)
);

-- ── FnF Settlements ──
create table if not exists fnf_settlements (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  exit_date date not null,
  final_salary numeric(12,2) not null,
  gratuity numeric(12,2) default 0,
  total_deductions numeric(12,2) default 0,
  settlement_amount numeric(12,2) not null,
  status text check (status in ('draft','approved','disbursed')) default 'draft',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Compliance Returns ──
create table if not exists compliance_returns (
  id uuid primary key default uuid_generate_v4(),
  return_type text check (return_type in ('pf','esic','pt')) not null,
  return_month integer not null,
  return_year integer not null,
  total_contribution numeric(12,2) not null,
  total_employees integer not null,
  status text check (status in ('draft','approved','filed')) default 'draft',
  file_reference text,
  filing_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(return_type, return_month, return_year)
);

-- ── HR Rules (Customizable rules for Super Admin) ──
create table if not exists hr_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  description text,
  config jsonb default '{}'::jsonb,
  created_by uuid,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Seed: Role Master ──
insert into role_master (name, code, all_permissions, permissions) values
  ('Super Admin', 'super_admin', true, '{"all": true}'),
  ('Store Manager', 'store_manager', false, '{"leave_approve": true, "roster_view": true, "attendance_entry": true}'),
  ('Area Manager', 'area_manager', false, '{"leave_approve": true, "roster_view": true, "analytics_view": true}'),
  ('HR Admin', 'hr_admin', false, '{"leave_policy": true, "disciplinary": true, "onboarding": true}'),
  ('Finance', 'finance', false, '{"report_view": true}')
on conflict (code) do nothing;

-- ── Row Level Security ──
alter table location_audit_log enable row level security;
alter table employees enable row level security;
alter table locations enable row level security;

-- Allow read for authenticated users (Super Admin portal)
create policy "Allow all for authenticated" on location_audit_log for all using (true);
create policy "Allow all for authenticated" on employees for all using (true);
create policy "Allow all for authenticated" on locations for all using (true);
create policy "Allow all for authenticated" on leave_requests for all using (true);
create policy "Allow all for authenticated" on attendance for all using (true);
create policy "Allow all for authenticated" on shifts for all using (true);
create policy "Allow all for authenticated" on rosters for all using (true);
create policy "Allow all for authenticated" on payroll_periods for all using (true);
create policy "Allow all for authenticated" on commission_ledger for all using (true);
create policy "Allow all for authenticated" on contractor_profiles for all using (true);
create policy "Allow all for authenticated" on contractor_invoices for all using (true);
create policy "Allow all for authenticated" on user_accounts for all using (true);
create policy "Allow all for authenticated" on warning_records for all using (true);
create policy "Allow all for authenticated" on advance_salary for all using (true);
create policy "Allow all for authenticated" on salary_structure_master for all using (true);
create policy "Allow all for authenticated" on leave_policy_master for all using (true);
create policy "Allow all for authenticated" on employee_category_master for all using (true);
create policy "Allow all for authenticated" on minimum_wage_master for all using (true);
create policy "Allow all for authenticated" on holiday_calendar for all using (true);
create policy "Allow all for authenticated" on service_type_master for all using (true);
create policy "Allow all for authenticated" on employee_finance for all using (true);
create policy "Allow all for authenticated" on employee_skills for all using (true);
create policy "Allow all for authenticated" on employee_salary for all using (true);
create policy "Allow all for authenticated" on roster_history for all using (true);
create policy "Allow all for authenticated" on payslips for all using (true);

-- ── Auth Linkage + Face Verification (Employee / Store Admin Portals) ──
alter table employees add column if not exists auth_user_id uuid unique;
alter table user_accounts add column if not exists auth_user_id uuid unique;

create table if not exists attendance_face_verifications (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  attendance_date date not null,
  action_type text check (action_type in ('check_in','check_out')) not null,
  face_detected boolean not null default false,
  confidence_score numeric(5,2) default 0,
  snapshot_base64 text,
  created_at timestamptz default now()
);

-- ── Employee Holidays (mapping holidays to employees for attendance/roster) ──
create table if not exists employee_holidays (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  holiday_id uuid references holiday_calendar(id) not null,
  holiday_date date not null,
  location_id uuid references locations(id),
  created_at timestamptz default now()
);

create table if not exists employee_device_sessions (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  device_label text,
  platform text,
  app_version text,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now()
);

insert into role_master (name, code, all_permissions, permissions)
values ('Store Admin', 'store_admin', false, '{"leave_approve": true, "attendance_override": true, "roster_view": true}')
on conflict (code) do nothing;

-- ── Seed: Salary Structure Master ──
insert into salary_structure_master (grade, basic_percentage, hra_percentage, conveyance, da_percentage, performance_cap) values
  ('A', 50, 25, 1500, 10, 8000),
  ('B', 45, 20, 1200, 8, 6000),
  ('C', 40, 15, 1000, 5, 4000),
  ('D', 35, 12, 800, 3, 2000),
  ('S', 55, 30, 2000, 12, 10000)
on conflict (grade) do nothing;

-- ── Seed: Leave Policy Master ──
insert into leave_policy_master (leave_type, annual_entitlement, encashable, carry_forward_max, lop_floor_percentage) values
  ('PL', 15, true, 10, 69),
  ('CL', 12, false, 0, 69),
  ('ML', 7, false, 0, 69),
  ('CO', 0, false, 3, 69),
  ('LOP', 0, false, 0, 69)
on conflict (leave_type) do nothing;

-- ── Seed: Employee Category Master ──
insert into employee_category_master (name, code, description) values
  ('Unskilled', 'unskilled', 'Unskilled workers'),
  ('Semi-Skilled', 'semi_skilled', 'Semi-skilled workers'),
  ('Skilled', 'skilled', 'Skilled workers'),
  ('Clerical', 'clerical', 'Clerical staff'),
  ('Supervisory', 'supervisory', 'Supervisory staff')
on conflict (code) do nothing;

-- ── Seed: Minimum Wage Master (West Bengal sample) ──
insert into minimum_wage_master (state, employee_category_id, daily_wage, monthly_wage, effective_from) 
select 'West Bengal', ec.id, 617, 13107, '2024-01-01'::date from employee_category_master ec where ec.code = 'unskilled'
on conflict (state, employee_category_id) do nothing;

-- ── Seed: Service Type Master ──
insert into service_type_master (name, code, description) values
  ('Retail', 'retail', 'Retail pet supplies'),
  ('Grooming', 'grooming', 'Pet grooming services'),
  ('Veterinary', 'vet', 'Veterinary services'),
  ('Boarding', 'boarding', 'Pet boarding'),
  ('Training', 'training', 'Pet training'),
  ('Online', 'online', 'Online sales')
on conflict (code) do nothing;

alter table attendance_face_verifications enable row level security;
alter table employee_device_sessions enable row level security;

drop policy if exists "Allow all for authenticated" on attendance_face_verifications;
drop policy if exists "Allow all for authenticated" on employee_device_sessions;

create policy "Allow all for authenticated" on attendance_face_verifications for all using (true);
create policy "Allow all for authenticated" on employee_device_sessions for all using (true);
