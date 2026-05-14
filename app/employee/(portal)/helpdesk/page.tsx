import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function EmployeeHelpdeskPage() {
  return (
    <PortalPageFrame
      badge="Support"
      emoji="🛟"
      title="Helpdesk"
      subtitle="Raise salary, attendance, grievance, and exit tickets from a lightweight mobile-friendly screen."
      actions={[{ label: 'My Profile', href: '/employee/profile', tone: 'secondary' }]}
      metrics={[
        { label: 'Open Tickets', value: '2', tone: 'yellow' },
        { label: 'Payroll Issues', value: '1', tone: 'blue' },
        { label: 'Attendance Issues', value: '1', tone: 'orange' },
        { label: 'Exit Requests', value: '0', tone: 'green' },
      ]}
      sections={[
        {
          title: 'Ticket Types',
          description: 'This area can later be wired to a proper helpdesk table.',
          items: [
            { title: 'Salary issue', value: 'Ready', tone: 'blue' },
            { title: 'Attendance issue', value: 'Ready', tone: 'orange' },
            { title: 'Grievance', value: 'Ready', tone: 'red' },
            { title: 'Exit request', value: 'Ready', tone: 'yellow' },
          ],
        },
      ]}
    />
  )
}