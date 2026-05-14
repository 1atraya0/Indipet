'use client'

import Link from 'next/link'

export default function EmployeeRegisterPage() {
  return (
    <section style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '20px' }}>
      <div className="glass-strong" style={{ width: '100%', maxWidth: '640px', padding: '24px', display: 'grid', gap: '14px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Use Demo Credentials</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Employee registration is not available. Please use the demo credentials on the login page.
        </p>
        <Link href="/login" className="btn-primary" style={{ textDecoration: 'none', marginTop: '12px' }}>
          Back to Login
        </Link>
      </div>
    </section>
  )
}
