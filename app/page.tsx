'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminDashboard from '@/components/SuperAdminDashboard'

type Role = 'super_admin' | 'store_admin' | 'employee'

export default function Page() {
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as Role | null

    if (!storedRole) {
      router.replace('/login')
      return
    }

    if (storedRole === 'store_admin') {
      router.replace('/store-admin')
      return
    }

    if (storedRole === 'employee') {
      router.replace('/employee')
      return
    }

    setRole(storedRole)
    setReady(true)
  }, [router])

  if (!ready || role !== 'super_admin') {
    return null
  }

  return <SuperAdminDashboard />
}
