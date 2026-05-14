import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function EmployeeDocumentsPage() {
  return (
    <PortalPageFrame
      badge="Documents"
      emoji="📂"
      title="Document Center"
      subtitle="Access offer letters, payslips, tax forms, ID documents, and policy acknowledgements."
      metrics={[
        { label: 'Offer Letter', value: 'Stored', tone: 'green' },
        { label: 'Payslips', value: '12 PDFs', tone: 'blue' },
        { label: 'Tax Forms', value: 'Ready', tone: 'orange' },
        { label: 'Policies', value: 'Acked', tone: 'yellow' },
      ]}
      sections={[
        {
          title: 'Document Buckets',
          description: 'Connect this page to your document store or HR attachment table.',
          items: [
            { title: 'Identity proof', value: 'Available', tone: 'green' },
            { title: 'Salary slips', value: 'Available', tone: 'blue' },
            { title: 'Tax forms', value: 'Available', tone: 'orange' },
            { title: 'Policy receipts', value: 'Available', tone: 'yellow' },
          ],
        },
      ]}
    />
  )
}