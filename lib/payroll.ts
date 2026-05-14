/**
 * Payroll Calculation Engine
 * Implements all payroll rules and deduction logic
 */

import type { Payslip, SalaryStructure, MinimumWage, EmployeeSalary } from './types'

export interface PayrollInput {
  employeeSalary: EmployeeSalary & { salary_structure_master: SalaryStructure | null }
  basicSalary: number
  workingDays?: number
  totalDays?: number
  minimumWage?: MinimumWage | null
  pfEligible?: boolean
  esicEligible?: boolean
  ptState?: string
}

export interface PayrollOutput {
  basic: number
  hra: number
  da: number
  conveyance: number
  grossEarnings: number
  pf: number
  esic: number
  pt: number
  netPay: number
  validations: {
    meetsMinimumWage: boolean
    warning?: string
  }
}

/**
 * Calculate HRA based on salary structure percentage
 */
export function calculateHRA(basic: number, hraPercentage: number): number {
  return Math.round((basic * hraPercentage) / 100)
}

/**
 * Calculate DA based on salary structure percentage
 */
export function calculateDA(basic: number, daPercentage: number): number {
  return Math.round((basic * daPercentage) / 100)
}

/**
 * Calculate Conveyance allowance
 */
export function calculateConveyance(basic: number, conveyancePercentage: number): number {
  return Math.round((basic * conveyancePercentage) / 100)
}

/**
 * Calculate PF Contribution (Employee's share)
 * Standard: 12% of basic or max limit of ₹50,000/month (whichever is lower)
 */
export function calculatePF(basic: number, eligible: boolean, wageCap?: boolean): number {
  if (!eligible) return 0
  const cappedBasic = wageCap ? Math.min(basic, 50000) : basic
  return Math.round((cappedBasic * 12) / 100)
}

/**
 * Calculate ESIC Contribution (Employee's share)
 * Standard: 0.75% of gross earnings
 */
export function calculateESIC(grossEarnings: number, eligible: boolean): number {
  if (!eligible || grossEarnings > 21000) return 0 // ESIC limit
  return Math.round((grossEarnings * 0.75) / 100)
}

/**
 * Calculate Professional Tax (State-based)
 * PT varies by state - this is a simplified version
 */
export function calculatePT(grossEarnings: number, state: string): number {
  // Simplified PT calculation - adjust based on actual state rules
  const ptRules: Record<string, number> = {
    'West Bengal': grossEarnings <= 300000 ? 0 : grossEarnings <= 500000 ? 150 : 300,
    'Maharashtra': grossEarnings <= 500000 ? 150 : 250,
    'Karnataka': grossEarnings <= 400000 ? 200 : 250,
    'Tamil Nadu': grossEarnings <= 300000 ? 0 : 150,
    'Telangana': grossEarnings <= 500000 ? 0 : 200,
  }
  return ptRules[state] || 0
}

/**
 * Main Payroll Calculation Function
 * Implements Hard Rule 4: net_pay must be >= minimum_wage
 */
export function calculatePayroll(input: PayrollInput): PayrollOutput {
  const salaryStructure = input.employeeSalary.salary_structure_master
  if (!salaryStructure) {
    throw new Error('Salary structure not found')
  }

  // Calculate allowances based on salary structure percentages
  const basic = input.basicSalary
  const hra = calculateHRA(basic, salaryStructure.hra_percentage)
  const da = calculateDA(basic, salaryStructure.da_percentage)
  const conveyance = calculateConveyance(basic, salaryStructure.conveyance)
  const grossEarnings = basic + hra + da + conveyance

  // Calculate deductions
  const pf = calculatePF(basic, input.pfEligible !== false, input.employeeSalary.pf_wage_cap_elected)
  const esic = calculateESIC(grossEarnings, input.esicEligible !== false)
  const pt = calculatePT(grossEarnings, input.ptState || 'West Bengal')

  const totalDeductions = pf + esic + pt
  const netPay = grossEarnings - totalDeductions

  // Validation: Hard Rule 4 - Net pay must meet minimum wage
  let meetsMinimumWage = true
  let warning: string | undefined

  if (input.minimumWage) {
    const monthlyMinimumWage = input.minimumWage.monthly_wage
    meetsMinimumWage = netPay >= monthlyMinimumWage

    if (!meetsMinimumWage) {
      warning = `Net pay (₹${netPay}) is below minimum wage (₹${monthlyMinimumWage}) for ${input.minimumWage.state} - ${input.minimumWage.category}`
    }
  }

  return {
    basic: Math.round(basic),
    hra: Math.round(hra),
    da: Math.round(da),
    conveyance: Math.round(conveyance),
    grossEarnings: Math.round(grossEarnings),
    pf: Math.round(pf),
    esic: Math.round(esic),
    pt: Math.round(pt),
    netPay: Math.round(netPay),
    validations: {
      meetsMinimumWage,
      warning,
    },
  }
}

/**
 * Prorate salary for partial month
 */
export function proratePayroll(
  payroll: PayrollOutput,
  workingDays: number,
  totalDaysInMonth: number = 30
): PayrollOutput {
  const ratio = workingDays / totalDaysInMonth

  return {
    basic: Math.round(payroll.basic * ratio),
    hra: Math.round(payroll.hra * ratio),
    da: Math.round(payroll.da * ratio),
    conveyance: Math.round(payroll.conveyance * ratio),
    grossEarnings: Math.round(payroll.grossEarnings * ratio),
    pf: Math.round(payroll.pf * ratio),
    esic: Math.round(payroll.esic * ratio),
    pt: Math.round(payroll.pt * ratio),
    netPay: Math.round(payroll.netPay * ratio),
    validations: payroll.validations,
  }
}

/**
 * Format payroll for display
 */
export function formatPayroll(payroll: PayrollOutput): Record<string, string> {
  return {
    basic: `₹${payroll.basic.toLocaleString('en-IN')}`,
    hra: `₹${payroll.hra.toLocaleString('en-IN')}`,
    da: `₹${payroll.da.toLocaleString('en-IN')}`,
    conveyance: `₹${payroll.conveyance.toLocaleString('en-IN')}`,
    gross: `₹${payroll.grossEarnings.toLocaleString('en-IN')}`,
    pf: `₹${payroll.pf.toLocaleString('en-IN')}`,
    esic: `₹${payroll.esic.toLocaleString('en-IN')}`,
    pt: `₹${payroll.pt.toLocaleString('en-IN')}`,
    total_deductions: `₹${(payroll.pf + payroll.esic + payroll.pt).toLocaleString('en-IN')}`,
    net_pay: `₹${payroll.netPay.toLocaleString('en-IN')}`,
  }
}
