'use client'

import { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import PortalPageFrame from '@/components/portal/PortalPageFrame'
import { supabase } from '@/lib/supabase'
import type { Employee } from '@/lib/types'

export default function StoreAdminEmployeeProfilePage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    let active = true
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('employees').select('*').eq('id', id).maybeSingle<Employee>()
      if (!active) return
      setEmployee(data ?? null)
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [id])

  if (!id) {
    notFound()
  }

  return (
    <PortalPageFrame
      badge="Store Staff"
      emoji="👤"
      title={loading ? 'Loading employee profile' : employee ? employee.full_name : 'Employee not found'}
      subtitle={loading
        ? 'Fetching employee details from Supabase.'
        : employee
          ? `Profile for ${employee.employee_code} · ${employee.designation}`
          : 'No employee record matched the requested ID.'}
      metrics={employee ? [
        { label: 'Status', value: employee.status.replace(/_/g, ' '), tone: employee.status === 'active' ? 'green' : employee.status === 'probation' ? 'yellow' : 'red' },
        { label: 'Type', value: employee.employment_type.replace(/_/g, ' '), tone: 'blue' },
        { label: 'Sales', value: employee.is_salesperson ? 'Enabled' : 'No', tone: employee.is_salesperson ? 'green' : 'red' },
        { label: 'DOJ', value: new Date(employee.date_of_joining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), tone: 'orange' },
      ] : []}
      sections={employee ? [
        {
          title: 'Employment Snapshot',
          description: 'Outlet-assigned profile details.',
          items: [
            { title: 'Designation', value: employee.designation, tone: 'orange' },
            { title: 'Department', value: employee.department, tone: 'blue' },
            { title: 'Location', value: employee.location_id || 'Unassigned', tone: 'green' },
            { title: 'Probation End', value: employee.probation_end_date || '—', tone: 'yellow' },
          ],
        },
        {
          title: 'Contact Details',
          description: 'Basic communication fields stored in the employee master.',
          items: [
            { title: 'Email', value: employee.email, tone: 'blue' },
            { title: 'Phone', value: employee.phone, tone: 'orange' },
            { title: 'Employee Code', value: employee.employee_code, tone: 'green' },
            { title: 'Entity', value: employee.entity, tone: 'yellow' },
          ],
        },
      ] : []}
    >
      {!loading && !employee && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Use the people directory to open a valid employee profile.</p>
        </div>
      )}
    </PortalPageFrame>
  )
}