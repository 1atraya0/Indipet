import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function EmployeeProfilePage() {
  return (
    <PortalPageFrame
      badge="Profile"
      emoji="👤"
      title="Profile"
      subtitle="Personal details, emergency contacts, family details, and bank information live here."
      actions={[{ label: 'Open Documents', href: '/employee/documents' }]}
      metrics={[
        { label: 'KYC', value: 'Complete', tone: 'green' },
        { label: 'Bank', value: 'Verified', tone: 'blue' },
        { label: 'Contacts', value: '2 saved', tone: 'orange' },
        { label: 'Family', value: '1 saved', tone: 'yellow' },
      ]}
      sections={[
        {
          title: 'Profile Data',
          description: 'Keep your employee master details up to date.',
          items: [
            { title: 'Personal details', value: 'Editable', tone: 'green' },
            { title: 'Emergency contacts', value: 'Editable', tone: 'blue' },
            { title: 'Bank details', value: 'Editable', tone: 'orange' },
            { title: 'Family details', value: 'Editable', tone: 'yellow' },
          ],
        },
      ]}
    />
  )
}