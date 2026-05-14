import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function EmployeePoliciesPage() {
  return (
    <PortalPageFrame
      badge="Policies"
      emoji="📣"
      title="Policies"
      subtitle="Read the employee handbook, grooming standards, attendance policy, and POS policy acknowledgements."
      metrics={[
        { label: 'Handbook', value: 'Read', tone: 'green' },
        { label: 'Grooming', value: 'Acked', tone: 'blue' },
        { label: 'Attendance', value: 'Acked', tone: 'orange' },
        { label: 'POS', value: 'Acked', tone: 'yellow' },
      ]}
      sections={[
        {
          title: 'Policy Checklist',
          description: 'Use acknowledgements to track compliance at the employee level.',
          items: [
            { title: 'Employee handbook', value: 'Available', tone: 'green' },
            { title: 'Grooming standards', value: 'Available', tone: 'blue' },
            { title: 'Attendance policy', value: 'Available', tone: 'orange' },
            { title: 'Compliance acknowledgements', value: 'Available', tone: 'yellow' },
          ],
        },
      ]}
    />
  )
}