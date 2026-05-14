'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { QrCode, Smartphone, Eye, EyeOff } from 'lucide-react'

export default function EmployeeLoginPage() {
  const [tab, setTab] = useState<'otp' | 'id' | 'qr'>('otp')
  const [otp, setOtp] = useState('')
  const [empId, setEmpId] = useState('')
  const [phone, setPhone] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleOtpLogin() {
    setLoading(true)
    // Simulate OTP send
    await new Promise(r => setTimeout(r, 1500))
    alert(`OTP sent to ${phone}`)
    setLoading(false)
  }

  async function handleIdLogin() {
    setLoading(true)
    // Simulate login
    await new Promise(r => setTimeout(r, 1500))
    if (empId && otp) {
      window.location.href = '/employee/home'
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 0%, #0b0b0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '420px', background: 'rgba(15,15,15,0.8)', border: '1px solid rgba(255,140,66,0.2)', borderRadius: '16px', padding: '40px' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🐾</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Indipet</h1>
          <p style={{ fontSize: '12px', color: '#888' }}>Employee Self Service</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,140,66,0.1)', paddingBottom: '12px' }}>
          {(['otp', 'id', 'qr'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, color: tab === t ? '#FF6B35' : '#666',
                borderBottom: tab === t ? '2px solid #FF6B35' : 'none'
              }}
            >
              {t === 'otp' && '📱 OTP'}
              {t === 'id' && '🆔 Employee ID'}
              {t === 'qr' && <QrCode size={16} style={{ display: 'inline' }} />}
            </button>
          ))}
        </div>

        {/* OTP Tab */}
        {tab === 'otp' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>Mobile Number</label>
              <input type="tel" placeholder="9876543210" className="glass-input" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%' }} />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} onClick={handleOtpLogin} disabled={!phone || loading} style={{
              width: '100%', padding: '12px', background: loading ? '#666' : '#FF6B35', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer'
            }}>{loading ? 'Sending...' : 'Send OTP'}</motion.button>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '12px', textAlign: 'center' }}>OTP valid for 10 minutes</p>
          </motion.div>
        )}

        {/* Employee ID Tab */}
        {tab === 'id' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>Employee ID</label>
              <input type="text" placeholder="EMP-001234" className="glass-input" value={empId} onChange={e => setEmpId(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>Password / PIN</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} placeholder="••••••" className="glass-input" value={otp} onChange={e => setOtp(e.target.value)} style={{ width: '100%' }} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} onClick={handleIdLogin} disabled={!empId || !otp || loading} style={{
              width: '100%', padding: '12px', background: loading ? '#666' : '#FF6B35', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer'
            }}>{loading ? 'Logging in...' : 'Login'}</motion.button>
          </motion.div>
        )}

        {/* QR Tab */}
        {tab === 'qr' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ padding: '32px 0', color: '#666' }}>
              <QrCode size={64} style={{ margin: '0 auto', marginBottom: '12px', color: '#FF6B35' }} />
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>Point your camera at the QR code</p>
              <div style={{ background: 'rgba(255,140,66,0.1)', padding: '20px', borderRadius: '12px', marginBottom: '16px', aspectRatio: '1' }}>
                <p style={{ fontSize: '11px', color: '#888' }}>QR Scanner Ready</p>
              </div>
              <p style={{ fontSize: '11px', color: '#666' }}>Scan QR code from your device or kiosk</p>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#666' }}>Need help? Contact HR at <strong>hr@indipet.in</strong></p>
        </div>
      </motion.div>
    </div>
  )
}
