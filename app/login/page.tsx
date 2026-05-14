'use client'

import { useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, ShieldCheck, UserRound, Fingerprint, CalendarCheck2, AlertTriangle, Copy, Check } from 'lucide-react'

type Role = 'super_admin' | 'store_admin' | 'employee'
type DemoCreds = { email: string; password: string; role: string }

const DEMO_CREDENTIALS: Record<Role, DemoCreds> = {
  super_admin: { email: 'admin@indipet.com', password: 'demo@123', role: 'Super Admin' },
  store_admin: { email: 'store@indipet.com', password: 'demo@123', role: 'Store Admin' },
  employee: { email: 'emp@indipet.com', password: 'demo@123', role: 'Employee' },
}

const cardStyle: CSSProperties = {
  background: 'rgba(255, 107, 53, 0.06)',
  border: '1px solid rgba(255, 140, 66, 0.24)',
  borderRadius: '18px',
  padding: '20px',
  display: 'grid',
  gap: '14px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 140, 66, 0.28)',
  background: 'rgba(10, 4, 0, 0.5)',
  color: 'var(--text-primary)',
  fontSize: '14px',
}

const credBoxStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'rgba(10, 4, 0, 0.3)',
  border: '1px solid rgba(255, 140, 66, 0.15)',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  fontFamily: 'monospace',
}

function roleHome(role: Role) {
  if (role === 'super_admin') return '/dashboard'
  if (role === 'store_admin') return '/store-admin'
  return '/employee'
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role>('employee')
  const [email, setEmail] = useState(DEMO_CREDENTIALS.employee.email)
  const [password, setPassword] = useState(DEMO_CREDENTIALS.employee.password)
  const [copied, setCopied] = useState<'email' | 'password' | null>(null)

  function fillCredentials(role: Role) {
    const creds = DEMO_CREDENTIALS[role]
    setSelectedRole(role)
    setEmail(creds.email)
    setPassword(creds.password)
  }

  function copyToClipboard(text: string, type: 'email' | 'password') {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 1500)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (selectedRole === 'super_admin') {
        if (email === 'admin@indipet.com' && password === 'demo@123') {
          localStorage.setItem('userRole', 'super_admin')
          router.push(roleHome('super_admin'))
        } else {
          throw new Error('Invalid super admin credentials')
        }
      } else if (selectedRole === 'store_admin') {
        if (email === 'store@indipet.com' && password === 'demo@123') {
          localStorage.setItem('userRole', 'store_admin')
          router.push('/store-admin')
        } else {
          throw new Error('Invalid store admin credentials')
        }
      } else {
        if (email === 'emp@indipet.com' && password === 'demo@123') {
          localStorage.setItem('userRole', 'employee')
          router.push('/employee')
        } else {
          throw new Error('Invalid employee credentials')
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const creds = DEMO_CREDENTIALS[selectedRole]

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '28px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gap: '20px' }}>
        <div className="glass-strong" style={{ padding: '24px' }}>
          <p className="badge badge-orange" style={{ margin: 0, width: 'fit-content' }}>
            Demo Access
          </p>
          <h1 style={{ margin: '12px 0 8px', fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.1 }}>
            Indipet ERP Login
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '74ch' }}>
            Select your role and use demo credentials to access the portal. Employee features include face-based attendance and leave application. Store admins can approve leaves and manage attendance. Super admin has full system access.
          </p>
        </div>

        {error && (
          <div
            style={{
              borderRadius: '12px',
              border: '1px solid rgba(248,113,113,0.35)',
              background: 'rgba(127,29,29,0.25)',
              color: '#fecaca',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} />
            <span style={{ fontSize: '13px' }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* Super Admin Card */}
          <div
            style={{
              ...cardStyle,
              border: selectedRole === 'super_admin' ? '2px solid #fbbf24' : cardStyle.border,
              cursor: 'pointer',
            }}
            onClick={() => fillCredentials('super_admin')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Crown size={20} style={{ color: '#fbbf24' }} />
              <h2 style={{ margin: 0, fontSize: '18px' }}>Super Admin</h2>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              Full system access, all features and admin controls.
            </p>
            <div
              style={credBoxStyle}
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(DEMO_CREDENTIALS.super_admin.email, 'email')
              }}
            >
              <span>{DEMO_CREDENTIALS.super_admin.email}</span>
              {copied === 'email' ? <Check size={14} /> : <Copy size={14} />}
            </div>
            <div
              style={credBoxStyle}
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(DEMO_CREDENTIALS.super_admin.password, 'password')
              }}
            >
              <span>••••••••</span>
              {copied === 'password' ? <Check size={14} /> : <Copy size={14} />}
            </div>
          </div>

          {/* Store Admin Card */}
          <div
            style={{
              ...cardStyle,
              border: selectedRole === 'store_admin' ? '2px solid #34d399' : cardStyle.border,
              cursor: 'pointer',
            }}
            onClick={() => fillCredentials('store_admin')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} style={{ color: '#34d399' }} />
              <h2 style={{ margin: 0, fontSize: '18px' }}>Store Admin</h2>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              Approve leaves, manage attendance, and monitor team.
            </p>
            <div
              style={credBoxStyle}
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(DEMO_CREDENTIALS.store_admin.email, 'email')
              }}
            >
              <span>{DEMO_CREDENTIALS.store_admin.email}</span>
              {copied === 'email' ? <Check size={14} /> : <Copy size={14} />}
            </div>
            <div
              style={credBoxStyle}
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(DEMO_CREDENTIALS.store_admin.password, 'password')
              }}
            >
              <span>••••••••</span>
              {copied === 'password' ? <Check size={14} /> : <Copy size={14} />}
            </div>
          </div>

          {/* Employee Card */}
          <div
            style={{
              ...cardStyle,
              border: selectedRole === 'employee' ? '2px solid #60a5fa' : cardStyle.border,
              cursor: 'pointer',
            }}
            onClick={() => fillCredentials('employee')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserRound size={20} style={{ color: '#60a5fa' }} />
              <h2 style={{ margin: 0, fontSize: '18px' }}>Employee</h2>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              Face attendance, apply leaves, track requests.
            </p>
            <div
              style={credBoxStyle}
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(DEMO_CREDENTIALS.employee.email, 'email')
              }}
            >
              <span>{DEMO_CREDENTIALS.employee.email}</span>
              {copied === 'email' ? <Check size={14} /> : <Copy size={14} />}
            </div>
            <div
              style={credBoxStyle}
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(DEMO_CREDENTIALS.employee.password, 'password')
              }}
            >
              <span>••••••••</span>
              {copied === 'password' ? <Check size={14} /> : <Copy size={14} />}
            </div>
          </div>
        </div>

        <form className="glass-strong" onSubmit={handleLogin} style={{ padding: '24px', display: 'grid', gap: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
            Login as {DEMO_CREDENTIALS[selectedRole].role}
          </h2>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email</span>
            <input
              type="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Password</span>
            <input
              type="password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : `Login as ${DEMO_CREDENTIALS[selectedRole].role}`}
          </button>

          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
            💡 Click on any role card to auto-fill demo credentials, or use the copy buttons to get the credentials.
          </p>
        </form>
      </div>
    </section>
  )
}
