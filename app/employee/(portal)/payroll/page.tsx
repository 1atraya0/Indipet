import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function EmployeePayrollPage() {
  return (
    <PortalPageFrame
      badge="Payroll"
      emoji="💸"
      title="My Payroll"
      subtitle="Read your salary estimate, statutory deductions, historical payslips, and reimbursement claims."
      actions={[
        { label: 'View Leave', href: '/employee/leave' },
        { label: 'Open Documents', href: '/employee/documents', tone: 'secondary' },
      ]}
      metrics={[
        { label: 'Gross', value: '₹32,000', tone: 'orange' },
        { label: 'Net', value: '₹28,440', tone: 'green' },
        { label: 'Incentive', value: '₹3,120', tone: 'blue' },
        { label: 'TDS/PF/ESIC', value: '₹3,560', tone: 'red' },
      ]}
      sections={[
        {
          title: 'Salary Summary',
          description: 'Display payslips and deduction breakdown here when payroll integration is connected.',
          items: [
            { title: 'Payslip download', value: 'Ready', tone: 'green' },
            { title: 'PF contribution', value: 'Mapped', tone: 'blue' },
            { title: 'ESIC', value: 'Mapped', tone: 'orange' },
            { title: 'Reimbursements', value: 'Open', tone: 'yellow' },
          ],
        },
      ]}
    />
  )
}