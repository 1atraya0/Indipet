import EmployeeChrome from '@/components/employee/EmployeeChrome'

export default function EmployeePortalLayout({ children }: { children: React.ReactNode }) {
  return <EmployeeChrome>{children}</EmployeeChrome>
}