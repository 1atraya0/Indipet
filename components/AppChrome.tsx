'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

type Props = {
  children: React.ReactNode
}

const AUTH_ROUTES = ['/login', '/register', '/employee', '/store-admin']

export default function AppChrome({ children }: Props) {
  const pathname = usePathname()

  const hideChrome = useMemo(() => {
    if (!pathname) return false
    return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  }, [pathname])

  if (hideChrome) {
    return <main style={{ minHeight: '100vh' }}>{children}</main>
  }

  return (
    <>
      <Sidebar />
      <Header />
      <main
        style={{
          marginLeft: 'var(--sidebar-w)',
          paddingTop: '72px',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </>
  )
}
