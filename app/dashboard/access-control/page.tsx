'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { supabase } from '@/lib/supabase'
import { useSupabaseTable } from '@/hooks/useSupabase'
import type { UserAccount, RoleMaster } from '@/lib/types'
import { Plus, X, Shield, UserX } from 'lucide-react'

type UserWithRole = UserAccount & {
  role_master: { name: string; code: string } | null
}

export default function AccessControlPage() {
  const { data: users, loading: uLoading, refetch: refetchUsers } = useSupabaseTable<UserWithRole>(
    () => supabase.from('user_accounts').select('*, role_master(name, code)').order('created_at', { ascending: false }) as never,
    'user_accounts'
  )
  const { data: roles, loading: rLoading } = useSupabaseTable<RoleMaster>(
    () => supabase.from('role_master').select('*').order('name'),
    'role_master'
  )

  const [tab, setTab] = useState<'users' | 'roles'>('users')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', role_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loading = uLoading || rLoading

  async function toggleUser(user: UserWithRole) {
    const newStatus: UserAccount['status'] = user.status === 'active' ? 'inactive' : 'active'
    await supabase.from('user_accounts').update({ status: newStatus } as never).eq('id', user.id)
    await refetchUsers()
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase.from('user_accounts').insert([{
        full_name: form.full_name,
        email: form.email,
        role_id: form.role_id || roles.find(r => r.code !== 'super_admin')?.id,
        status: 'active',
      }] as never)
      if (err) throw new Error(err.message)
      setShowModal(false)
      setForm({ full_name: '', email: '', role_id: '' })
      await refetchUsers()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create user')
    } finally { setSaving(false) }
  }

  const active = users.filter(u => u.status === 'active').length
  const activeRoles = roles.filter(r => r.is_active).length
  const hrUnassigned = !users.some(u => {
    const role = u.role_master as { code: string } | null
    return role?.code === 'hr_admin' && u.status === 'active'
  })

  return (
    <div style={{ padding: '28px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Users" value={users.length} icon="👥" delay={0.05} loading={loading} />
        <StatCard label="Active" value={active} icon="✅" color="#34d399" delay={0.1} loading={loading} />
        <StatCard label="Active Roles" value={activeRoles} icon="🎭" color="#a78bfa" delay={0.15} loading={loading} />
        <StatCard label="HR Admin" value={hrUnassigned ? 'Unassigned' : 'Assigned'} icon="👔" color={hrUnassigned ? '#FFB347' : '#34d399'} delay={0.2} loading={loading} />
      </div>

      {hrUnassigned && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,186,92,0.07)', border: '1px solid rgba(255,186,92,0.2)', display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '16px' }}>ℹ️</span>
          <p style={{ fontSize: '12.5px', color: '#fcd34d', margin: 0 }}>
            <strong>HR Admin role exists but is unassigned.</strong> Super Admin absorbs all HR Admin functions at go-live. Assign HR Admin only when the hire is made.
          </p>
        </motion.div>
      )}

      <GlassCard delay={0.3} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            {(['users', 'roles'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                color: tab === t ? 'var(--orange-light)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--orange)' : '2px solid transparent',
              }}>
                {t === 'users' ? '👤 User Accounts' : '🛡️ Role Master'}
              </button>
            ))}
          </div>
          {tab === 'users' && (
            <motion.button whileHover={{ scale: 1.02 }} className="btn-primary" onClick={() => setShowModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px', fontSize: '12px', padding: '8px 14px' }}>
              <Plus size={12} /> Add User
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'users' ? (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable loading={uLoading} data={users} emptyIcon="👤" emptyMessage="No users"
                columns={[
                  { key: 'full_name', label: 'Name', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.full_name}</span> },
                  { key: 'email', label: 'Email' },
                  { key: 'role', label: 'Role', render: row => {
                    const roleName = (row.role_master as { name: string } | null)?.name || row.role_id
                    const isSuperAdmin = (row.role_master as { code: string } | null)?.code === 'super_admin'
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isSuperAdmin && <Shield size={12} style={{ color: '#FFB347' }} />}
                        <span style={{ fontWeight: isSuperAdmin ? 700 : 400, color: isSuperAdmin ? '#FFB347' : 'var(--text-secondary)' }}>{roleName}</span>
                      </div>
                    )
                  }},
                  { key: 'location_scope', label: 'Scope', render: row => row.location_scope ? <span className="badge badge-blue">{row.location_scope.length} locations</span> : <span className="badge badge-orange">All</span> },
                  { key: 'status', label: 'Status', render: row => row.status === 'active' ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Inactive</span> },
                  { key: 'last_login', label: 'Last Login', render: row => row.last_login ? new Date(row.last_login).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never' },
                  {
                    key: 'action', label: 'Action',
                    render: row => (row.role_master as { code: string } | null)?.code !== 'super_admin' ? (
                      <motion.button whileHover={{ scale: 1.05 }} onClick={() => toggleUser(row)}
                        style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: row.status === 'active' ? 'rgba(239,68,68,0.12)' : 'rgba(52,211,153,0.12)', color: row.status === 'active' ? '#fca5a5' : '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserX size={11} />{row.status === 'active' ? 'Deactivate' : 'Activate'}
                      </motion.button>
                    ) : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Protected</span>
                  },
                ]}
              />
            </motion.div>
          ) : (
            <motion.div key="roles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataTable loading={rLoading} data={roles} emptyIcon="🛡️" emptyMessage="No roles"
                columns={[
                  { key: 'name', label: 'Role', render: row => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span> },
                  { key: 'code', label: 'Code', render: row => <code style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '5px' }}>{row.code}</code> },
                  { key: 'all_permissions', label: 'Permissions', render: row => row.all_permissions ? <span className="badge badge-orange">All Permissions</span> : <span className="badge badge-blue">Scoped</span> },
                  { key: 'is_active', label: 'Status', render: row => row.is_active ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Inactive</span> },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🔐 Create User Account</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{error}</p>}
              <form onSubmit={createUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
                  <input required className="glass-input" placeholder="Arjun Singh" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
                  <input required type="email" className="glass-input" placeholder="arjun@indipet.in" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</label>
                  <select className="glass-input" value={form.role_id} onChange={e => setForm(p => ({ ...p, role_id: e.target.value }))}>
                    {roles.filter(r => r.code !== 'super_admin').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>{saving ? 'Creating...' : 'Create Account'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
