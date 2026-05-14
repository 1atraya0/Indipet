'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EmployeePortalPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new employee portal with sidebar
    router.push('/employee/home')
  }, [router])

  return null
}
