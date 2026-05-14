import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function EmployeePerformancePage() {
  return (
    <PortalPageFrame
      badge="Performance"
      emoji="📈"
      title="My Performance"
      subtitle="Review your attendance score, sales score, conversion rate, and monthly manager feedback."
      metrics={[
        { label: 'Attendance', value: '96%', tone: 'green' },
        { label: 'Sales', value: '88%', tone: 'blue' },
        { label: 'Conversion', value: '18%', tone: 'orange' },
        { label: 'Feedback', value: 'Good', tone: 'yellow' },
      ]}
      sections={[
        {
          title: 'Monthly Review',
          description: 'Add manager comments and improvement plans here when the review workflow is enabled.',
          items: [
            { title: 'Attendance score', value: 'Excellent', tone: 'green' },
            { title: 'Customer feedback', value: 'Positive', tone: 'blue' },
            { title: 'Target achievement', value: 'On track', tone: 'orange' },
            { title: 'Improvement plan', value: '1 active', tone: 'yellow' },
          ],
        },
      ]}
    />
  )
}