import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function StoreAdminLiveAttendancePage() {
  return (
    <PortalPageFrame
      badge="Attendance"
      emoji="📡"
      title="Live Attendance"
      subtitle="Realtime monitoring for present, late, missing punch, geo-violation, and device sync exceptions."
      metrics={[
        { label: 'Present', value: '18', tone: 'green' },
        { label: 'Late', value: '3', tone: 'yellow' },
        { label: 'Missing Punch', value: '1', tone: 'red' },
        { label: 'Geo Violations', value: '0', tone: 'blue' },
      ]}
      sections={[
        {
          title: 'Live Feed',
          description: 'Plug the attendance table or biometric stream here when the live device feed is connected.',
          items: [
            { title: 'Biometric device sync', value: 'Ready', tone: 'green' },
            { title: 'Mobile GPS punches', value: 'Ready', tone: 'green' },
            { title: 'Correction queue', value: 'Pending', tone: 'yellow' },
            { title: 'Payroll sync', value: 'Locked', tone: 'blue' },
          ],
        },
      ]}
    />
  )
}