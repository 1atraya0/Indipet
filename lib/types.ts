export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          employee_code: string
          full_name: string
          email: string
          phone: string
          designation: string
          department: string
          location_id: string
          employment_type: 'full_time' | 'part_time' | 'contractor'
          entity: 'proprietorship' | 'pvt_ltd'
          date_of_joining: string
          original_doj: string | null
          entity_transfer_date: string | null
          status: 'active' | 'inactive' | 'probation' | 'exited'
          probation_end_date: string | null
          is_salesperson: boolean
          salary_structure_id: string | null
          leave_policy_id: string | null
          shift_policy_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
      }
      locations: {
        Row: {
          id: string
          name: string
          code: string
          type: 'company_owned' | 'franchise'
          state: string
          city: string
          address: string
          status: 'active' | 'inactive' | 'onboarding'
          franchisee_owner_id: string | null
          operating_hours_start: string
          operating_hours_end: string
          minimum_staff_strength: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
      }
      leave_requests: {
        Row: {
          id: string
          employee_id: string
          leave_type: 'PL' | 'CL' | 'ML' | 'CO' | 'LOP'
          from_date: string
          to_date: string
          days: number
          reason: string
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leave_requests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leave_requests']['Insert']>
      }
      attendance: {
        Row: {
          id: string
          employee_id: string
          location_id: string
          date: string
          check_in: string | null
          check_out: string | null
          status: 'present' | 'absent' | 'half_day' | 'on_leave' | 'holiday'
          biometric_verified: boolean
          biometric_override: boolean
          override_reason: string | null
          shift_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>
      }
      shifts: {
        Row: {
          id: string
          name: string
          start_time: string
          end_time: string
          location_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['shifts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['shifts']['Insert']>
      }
      rosters: {
        Row: {
          id: string
          employee_id: string
          location_id: string
          shift_id: string
          date: string
          status: 'scheduled' | 'confirmed' | 'overridden'
          override_reason: string | null
          created_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['rosters']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['rosters']['Insert']>
      }
      sales_target_portfolio: {
        Row: {
          id: string
          employee_id: string
          period_month: number
          period_year: number
          target_amount: number
          achieved_amount: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sales_target_portfolio']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sales_target_portfolio']['Insert']>
      }
      store_target_master: {
        Row: {
          id: string
          location_id: string
          period_month: number
          period_year: number
          revenue_target: number
          grooming_target: number
          achieved_revenue: number
          achieved_grooming: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['store_target_master']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['store_target_master']['Insert']>
      }
      payroll_periods: {
        Row: {
          id: string
          period_month: number
          period_year: number
          start_date: string
          end_date: string
          lock_date: string
          status: 'open' | 'locked' | 'processing' | 'dispatched' | 'blocked'
          blocked_reason: string | null
          dispatched_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payroll_periods']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payroll_periods']['Insert']>
      }
      commission_ledger: {
        Row: {
          id: string
          employee_id: string
          location_id: string
          period_month: number
          period_year: number
          earned_amount: number
          status: 'pending' | 'approved' | 'locked' | 'paid'
          approved_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['commission_ledger']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['commission_ledger']['Insert']>
      }
      contractor_profiles: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          role: string
          location_id: string
          kpi_score: number
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contractor_profiles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contractor_profiles']['Insert']>
      }
      contractor_invoices: {
        Row: {
          id: string
          contractor_id: string
          amount: number
          period_month: number
          period_year: number
          kpi_achieved: boolean
          status: 'pending' | 'approved' | 'rejected' | 'paid'
          approved_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contractor_invoices']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contractor_invoices']['Insert']>
      }
      role_master: {
        Row: {
          id: string
          name: string
          code: string
          all_permissions: boolean
          permissions: Json
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['role_master']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['role_master']['Insert']>
      }
      user_accounts: {
        Row: {
          id: string
          full_name: string
          email: string
          role_id: string
          location_scope: string[] | null
          status: 'active' | 'inactive'
          last_login: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_accounts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_accounts']['Insert']>
      }
      location_audit_log: {
        Row: {
          id: string
          actor_id: string
          action_type: string
          target_record: string
          target_table: string
          reason: string
          metadata: Json | null
          timestamp: string
        }
        Insert: Omit<Database['public']['Tables']['location_audit_log']['Row'], 'id' | 'timestamp'>
        Update: Partial<Database['public']['Tables']['location_audit_log']['Insert']>
      }
      leave_balance: {
        Row: {
          id: string
          employee_id: string
          leave_type: string
          balance: number
          used: number
          year: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leave_balance']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leave_balance']['Insert']>
      }
      warning_records: {
        Row: {
          id: string
          employee_id: string
          reason: string
          issued_by: string
          issued_at: string
          action_type: 'warning' | 'suspension' | 'termination'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['warning_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['warning_records']['Insert']>
      }
      advance_salary: {
        Row: {
          id: string
          employee_id: string
          amount: number
          approved_by: string | null
          status: 'pending' | 'approved' | 'active' | 'recovered' | 'written_off'
          recovery_start_month: number | null
          recovery_start_year: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['advance_salary']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['advance_salary']['Insert']>
      }
      co_ledger: {
        Row: {
          id: string
          employee_id: string
          credits: number
          used: number
          expiry_date: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['co_ledger']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['co_ledger']['Insert']>
      }
      salary_structure_master: {
        Row: {
          id: string
          grade: string
          basic_percentage: number
          hra_percentage: number
          conveyance: number
          da_percentage: number
          performance_cap: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['salary_structure_master']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['salary_structure_master']['Insert']>
      }
      leave_policy_master: {
        Row: {
          id: string
          leave_type: string
          annual_entitlement: number
          encashable: boolean
          carry_forward_max: number
          lop_floor_percentage: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leave_policy_master']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leave_policy_master']['Insert']>
      }
      employee_category_master: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['employee_category_master']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['employee_category_master']['Insert']>
      }
      minimum_wage_master: {
        Row: {
          id: string
          state: string
          employee_category_id: string | null
          daily_wage: number
          monthly_wage: number
          effective_from: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['minimum_wage_master']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['minimum_wage_master']['Insert']>
      }
      holiday_calendar: {
        Row: {
          id: string
          location_id: string | null
          holiday_date: string
          holiday_name: string
          holiday_type: 'closed' | 'open'
          year: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['holiday_calendar']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['holiday_calendar']['Insert']>
      }
      employee_holidays: {
        Row: {
          id: string
          employee_id: string
          holiday_id: string
          holiday_date: string
          location_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['employee_holidays']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['employee_holidays']['Insert']>
      }
      service_type_master: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_type_master']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['service_type_master']['Insert']>
      }
      employee_finance: {
        Row: {
          id: string
          employee_id: string
          pan_number: string | null
          aadhaar_number: string | null
          bank_account_number: string | null
          ifsc_code: string | null
          upi_handle: string | null
          pf_uaan: string | null
          pf_wage_cap_elected: boolean
          esic_eligible: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['employee_finance']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['employee_finance']['Insert']>
      }
      employee_skills: {
        Row: {
          id: string
          employee_id: string
          skill_name: string
          proficiency_level: 'beginner' | 'intermediate' | 'expert'
          certification_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['employee_skills']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['employee_skills']['Insert']>
      }
      employee_salary: {
        Row: {
          id: string
          employee_id: string
          salary_structure_id: string | null
          monthly_basic: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['employee_salary']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['employee_salary']['Insert']>
      }
      roster_history: {
        Row: {
          id: string
          roster_id: string | null
          employee_id: string
          location_id: string
          shift_id: string
          date: string
          status: string
          override_reason: string | null
          version: number
          changed_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['roster_history']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['roster_history']['Insert']>
      }
      payslips: {
        Row: {
          id: string
          employee_id: string
          period_month: number
          period_year: number
          basic: number
          allowances: number
          gross_earnings: number
          pf_contribution: number
          esic_contribution: number
          professional_tax: number
          advance_recovery: number
          other_deductions: number
          total_deductions: number
          net_pay: number
          status: 'draft' | 'approved' | 'disbursed'
          generated_at: string
          disbursed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payslips']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payslips']['Insert']>
      }
      fnf_settlements: {
        Row: {
          id: string
          employee_id: string
          exit_date: string
          final_salary: number
          gratuity: number
          total_deductions: number
          settlement_amount: number
          status: 'draft' | 'approved' | 'disbursed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['fnf_settlements']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['fnf_settlements']['Insert']>
      }
      compliance_returns: {
        Row: {
          id: string
          return_type: 'pf' | 'esic' | 'pt'
          return_month: number
          return_year: number
          total_contribution: number
          total_employees: number
          status: 'draft' | 'approved' | 'filed'
          file_reference: string | null
          filing_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['compliance_returns']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['compliance_returns']['Insert']>
      }
      hr_rules: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          config: Json
          created_by: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['hr_rules']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['hr_rules']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Employee = Database['public']['Tables']['employees']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']
export type Attendance = Database['public']['Tables']['attendance']['Row']
export type Shift = Database['public']['Tables']['shifts']['Row']
export type Roster = Database['public']['Tables']['rosters']['Row']
export type PayrollPeriod = Database['public']['Tables']['payroll_periods']['Row']
export type CommissionLedger = Database['public']['Tables']['commission_ledger']['Row']
export type ContractorProfile = Database['public']['Tables']['contractor_profiles']['Row']
export type ContractorInvoice = Database['public']['Tables']['contractor_invoices']['Row']
export type RoleMaster = Database['public']['Tables']['role_master']['Row']
export type UserAccount = Database['public']['Tables']['user_accounts']['Row']
export type AuditLog = Database['public']['Tables']['location_audit_log']['Row']
export type LeaveBalance = Database['public']['Tables']['leave_balance']['Row']
export type WarningRecord = Database['public']['Tables']['warning_records']['Row']
export type AdvanceSalary = Database['public']['Tables']['advance_salary']['Row']
export type COLedger = Database['public']['Tables']['co_ledger']['Row']
export type SalaryStructure = Database['public']['Tables']['salary_structure_master']['Row']
export type LeavePolicyMaster = Database['public']['Tables']['leave_policy_master']['Row']
export type EmployeeCategory = Database['public']['Tables']['employee_category_master']['Row']
export type MinimumWage = Database['public']['Tables']['minimum_wage_master']['Row']
export type HolidayCalendar = Database['public']['Tables']['holiday_calendar']['Row']
export type ServiceType = Database['public']['Tables']['service_type_master']['Row']
export type EmployeeFinance = Database['public']['Tables']['employee_finance']['Row']
export type EmployeeSkill = Database['public']['Tables']['employee_skills']['Row']
export type EmployeeSalary = Database['public']['Tables']['employee_salary']['Row']
export type RosterHistory = Database['public']['Tables']['roster_history']['Row']
export type Payslip = Database['public']['Tables']['payslips']['Row']
export type FnFSettlement = Database['public']['Tables']['fnf_settlements']['Row']
export type ComplianceReturn = Database['public']['Tables']['compliance_returns']['Row']
