import PortalPageFrame from '@/components/portal/PortalPageFrame'

export default function EmployeeIncentivesPage() {
  return (
    <PortalPageFrame
      badge="Retail Incentives"
      emoji="🎯"
      title="My Incentives"
      subtitle="Track live earnings, target achievement, product attribution, and leaderboard rank."
      metrics={[
        { label: 'Current', value: '₹4,860', tone: 'green' },
        { label: 'Target', value: '84%', tone: 'orange' },
        { label: 'Store Rank', value: '#3', tone: 'blue' },
        { label: 'Region Rank', value: '#12', tone: 'yellow' },
      ]}
      sections={[
        {
          title: 'Earnings View',
          description: 'This page is ready for the category, brand, and SKU incentive engine.',
          items: [
            { title: 'Category sales', value: 'Tracked', tone: 'green' },
            { title: 'Brand sales', value: 'Tracked', tone: 'blue' },
            { title: 'Product attribution', value: 'Tracked', tone: 'orange' },
            { title: 'Leaderboard', value: 'Live', tone: 'red' },
          ],
        },
      ]}
    />
  )
}