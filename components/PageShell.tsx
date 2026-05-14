'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageShellProps {
  children: ReactNode
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        marginLeft: 'var(--sidebar-w)',
        paddingTop: '72px',
        minHeight: '100vh',
        padding: '96px 32px 40px',
      }}
    >
      {children}
    </motion.main>
  )
}
