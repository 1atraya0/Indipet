'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'super_admin' | 'store_admin' | 'employee'

export default function Page() {
  const router = useRouter()

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

    router.replace('/dashboard')
  }, [router])

  return null
}
