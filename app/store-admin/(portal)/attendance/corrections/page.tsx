import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function StoreAdminAttendanceCorrectionsPage() {
  return (
    <PortalPageFrame
      badge="Attendance"
      emoji="🛠️"
      title="Attendance Corrections"
      subtitle="Employee request → store review → HR approval → payroll sync workflow."
      metrics={[
        { label: 'Pending', value: '4', tone: 'yellow' },
        { label: 'Under Review', value: '2', tone: 'blue' },
        { label: 'Approved', value: '7', tone: 'green' },
        { label: 'Rejected', value: '1', tone: 'red' },
      ]}
      sections={[
        {
          title: 'Workflow Stages',
          description: 'Use this page to review missing punches and correction requests.',
          items: [
            { title: 'Employee request submitted', value: 'Enabled', tone: 'blue' },
            { title: 'Store admin review', value: 'Enabled', tone: 'orange' },
            { title: 'HR approval', value: 'Enabled', tone: 'yellow' },
            { title: 'Payroll sync', value: 'Enabled', tone: 'green' },
          ],
        },
      ]}
    />
  )
}