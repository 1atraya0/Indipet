'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'

export default function AttendancePage() {
  const [tab, setTab] = useState<'punch' | 'history' | 'correction'>('punch')
  const [showCorrection, setShowCorrection] = useState(false)

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255,140,66,0.1)', paddingBottom: '12px' }}>
        {(['punch', 'history', 'correction'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            color: tab === t ? '#FF6B35' : '#999', borderBottom: tab === t ? '2px solid #FF6B35' : 'none'
          }}>
            {t === 'punch' && '⏱️ Punch In/Out'} {t === 'history' && '📜 History'} {t === 'correction' && '🔄 Corrections'}
          </button>
        ))}
      </div>

      {tab === 'punch' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FFB347 100%)', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', marginBottom: '24px', color: '#fff' }}>
            <p style={{ fontSize: '13px', margin: '0 0 12px' }}>📍 Indipet Store #12, Delhi</p>
            <h2 style={{ fontSize: '36px', fontWeight: 800, margin: 0 }}>09:45</h2>
            <p style={{ fontSize: '12px', margin: '8px 0 0', opacity: 0.9 }}>Ready to Punch In</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <button style={{ padding: '14px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '12px', color: '#34d399', fontWeight: 600, cursor: 'pointer' }}>✓ PUNCH IN</button>
            <button style={{ padding: '14px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '12px', color: '#60a5fa', fontWeight: 600, cursor: 'pointer' }}>✓ PUNCH OUT</button>
          </div>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,140,66,0.1)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 12px' }}>📌 Punch Methods</p>
            <div style={{ display: 'grid', gap: '8px' }}>
              {['📱 Biometric Punch', '🎥 Face Recognition', '📍 GPS Location', '🔳 QR Scan'].map((m, i) => (
                <button key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,140,66,0.1)', borderRadius: '8px', color: '#ccc', fontSize: '12px', cursor: 'pointer' }}>{m}</button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'history' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {[{ date: '13 May', in: '09:15', out: '18:05', status: 'On Time' }, { date: '12 May', in: '09:30', out: '18:00', status: 'Late (15 min)' }].map((r, i) => (
            <div key={i} style={{ background: '#0f0f0f', border: '1px solid rgba(255,140,66,0.1)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>{r.date}</strong>
                <span style={{ fontSize: '12px', color: r.status.includes('Late') ? '#FFB347' : '#34d399' }}>{r.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#999' }}>
                <span>⏱️ In: {r.in}</span><span>Out: {r.out}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {tab === 'correction' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Pending Corrections</h3>
            <button onClick={() => setShowCorrection(true)} style={{ background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Plus size={12} /> New
            </button>
          </div>
          <div style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#FFB347' }}>No pending corrections</p>
          </div>
          <AnimatePresence>
            {showCorrection && (
              <motion.div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowCorrection(false)}>
                <motion.div style={{ background: '#0f0f0f', border: '1px solid rgba(255,140,66,0.2)', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Request Correction</h3>
                    <button onClick={() => setShowCorrection(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={18} /></button>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#999', display: 'block', marginBottom: '4px' }}>Date</label>
                      <input type="date" style={{ width: '100%', padding: '10px', background: '#1a1a1a', border: '1px solid rgba(255,140,66,0.2)', borderRadius: '8px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#999', display: 'block', marginBottom: '4px' }}>Reason</label>
                      <textarea style={{ width: '100%', padding: '10px', background: '#1a1a1a', border: '1px solid rgba(255,140,66,0.2)', borderRadius: '8px', color: '#fff', minHeight: '80px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setShowCorrection(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #666', borderRadius: '8px', color: '#ccc', cursor: 'pointer' }}>Cancel</button>
                      <button style={{ flex: 1, padding: '10px', background: '#FF6B35', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Submit</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}