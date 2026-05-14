'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'

export default function LeavePage() {
  const [showApply, setShowApply] = useState(false)
  const balances = [{ type: 'Paid Leave', count: 8, total: 12 }, { type: 'Casual Leave', count: 2, total: 8 }, { type: 'Medical Leave', count: 5, total: 6 }, { type: 'Comp Off', count: 1, total: 3 }]

  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700 }}>📊 Leave Balance</h3>
      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {balances.map((b, i) => (
          <div key={i} style={{ background: '#0f0f0f', border: '1px solid rgba(255,140,66,0.1)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>{b.type}</span>
              <span style={{ fontSize: '12px', color: '#FF6B35', fontWeight: 700 }}>{b.count}/{b.total}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${(b.count/b.total)*100}%`, height: '100%', background: '#FF6B35' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setShowApply(true)} style={{ flex: 1, padding: '12px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /> Apply Leave</button>
      </div>

      <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700 }}>📋 History</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {[{ date: '1-7 May', type: 'Paid Leave', status: 'Approved', emoji: '✓' }, { date: '20 May', type: 'Casual Leave', status: 'Pending', emoji: '⏳' }].map((h, i) => (
          <div key={i} style={{ background: '#0f0f0f', border: '1px solid rgba(255,140,66,0.1)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong>{h.date}</strong>
              <span style={{ fontSize: '11px', background: h.status === 'Approved' ? 'rgba(52,211,153,0.1)' : 'rgba(255,193,7,0.1)', color: h.status === 'Approved' ? '#34d399' : '#FFB347', padding: '2px 8px', borderRadius: '6px' }}>{h.status}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{h.emoji} {h.type}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showApply && (
          <motion.div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowApply(false)}>
            <motion.div style={{ background: '#0f0f0f', border: '1px solid rgba(255,140,66,0.2)', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Apply for Leave</h3>
                <button onClick={() => setShowApply(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <select style={{ padding: '10px', background: '#1a1a1a', border: '1px solid rgba(255,140,66,0.2)', borderRadius: '8px', color: '#fff' }}>
                  <option>Select Leave Type</option>
                  <option>Paid Leave</option>
                  <option>Casual Leave</option>
                  <option>Medical Leave</option>
                </select>
                <input type="date" style={{ padding: '10px', background: '#1a1a1a', border: '1px solid rgba(255,140,66,0.2)', borderRadius: '8px', color: '#fff' }} placeholder="From" />
                <input type="date" style={{ padding: '10px', background: '#1a1a1a', border: '1px solid rgba(255,140,66,0.2)', borderRadius: '8px', color: '#fff' }} placeholder="To" />
                <textarea style={{ padding: '10px', background: '#1a1a1a', border: '1px solid rgba(255,140,66,0.2)', borderRadius: '8px', color: '#fff', minHeight: '60px' }} placeholder="Reason" />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowApply(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #666', borderRadius: '8px', color: '#ccc', cursor: 'pointer' }}>Cancel</button>
                  <button style={{ flex: 1, padding: '10px', background: '#FF6B35', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Apply</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}