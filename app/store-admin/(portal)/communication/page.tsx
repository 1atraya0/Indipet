import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function StoreAdminCommunicationPage() {
  return (
    <PortalPageFrame
      badge="Operations"
      emoji="📣"
      title="Communication Center"
      subtitle="Send shift reminders, payroll notices, policy updates, and emergency alerts through the right channel."
      metrics={[
        { label: 'WhatsApp', value: 'Live', tone: 'green' },
        { label: 'SMS', value: 'Live', tone: 'blue' },
        { label: 'Push', value: 'Live', tone: 'orange' },
        { label: 'Internal', value: 'Live', tone: 'yellow' },
      ]}
      sections={[
        {
          title: 'Message Types',
          description: 'This page is ready to connect to the actual notification engine.',
          items: [
            { title: 'Shift reminders', value: 'Enabled', tone: 'green' },
            { title: 'Payroll notifications', value: 'Enabled', tone: 'blue' },
            { title: 'Policy updates', value: 'Enabled', tone: 'orange' },
            { title: 'Emergency alerts', value: 'Enabled', tone: 'red' },
          ],
        },
      ]}
    />
  )
}