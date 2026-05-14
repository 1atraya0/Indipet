import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function EmployeeShiftsPage() {
  return (
    <PortalPageFrame
      badge="Shift Planner"
      emoji="🗓️"
      title="My Shifts"
      subtitle="See today’s shift, weekly roster, upcoming shifts, and request a swap when needed."
      actions={[
        { label: 'Open Attendance', href: '/employee/attendance' },
        { label: 'Request Swap', href: '/employee/helpdesk', tone: 'secondary' },
      ]}
      metrics={[
        { label: 'Today', value: 'Evening', tone: 'orange' },
        { label: 'This Week', value: '6 shifts', tone: 'blue' },
        { label: 'Upcoming', value: '2', tone: 'green' },
        { label: 'Swaps', value: '1 open', tone: 'yellow' },
      ]}
      sections={[
        {
          title: 'Shift Coverage',
          description: 'Wire this page to roster data when the swap workflow is enabled.',
          items: [
            { title: 'Morning shift', value: '6:00-2:00', tone: 'green' },
            { title: 'Evening shift', value: '2:00-10:00', tone: 'orange' },
            { title: 'Split shift', value: 'Available', tone: 'blue' },
            { title: 'Warehouse shift', value: 'On call', tone: 'yellow' },
          ],
        },
      ]}
    />
  )
}