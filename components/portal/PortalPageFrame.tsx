import Link from 'next/link'
import type { ReactNode } from 'react'

type Metric = {
  label: string
  value: string
  hint?: string
  tone?: 'orange' | 'green' | 'blue' | 'red' | 'yellow' | 'purple'
}

type SectionItem = {
  title: string
  value?: string
  tone?: 'orange' | 'green' | 'blue' | 'red' | 'yellow' | 'purple'
}

type Section = {
  title: string
  description?: string
  items: SectionItem[]
}

type Action = {
  label: string
  href: string
  tone?: 'primary' | 'secondary'
}

type PortalPageFrameProps = {
  badge?: string
  emoji?: string
  title: string
  subtitle: string
  metrics?: Metric[]
  actions?: Action[]
  sections?: Section[]
  children?: ReactNode
}

const toneToClass: Record<NonNullable<Metric['tone']> | NonNullable<SectionItem['tone']>, string> = {
  orange: 'badge-orange',
  green: 'badge-green',
  blue: 'badge-blue',
  red: 'badge-red',
  yellow: 'badge-yellow',
  purple: 'badge-blue',
}

export default function PortalPageFrame({ badge, emoji = '🐾', title, subtitle, metrics = [], actions = [], sections = [], children }: PortalPageFrameProps) {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div className="glass-strong portal-page-hero" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'grid', gap: '10px', maxWidth: '760px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '26px' }}>{emoji}</span>
              {badge && <span className="badge badge-orange">{badge}</span>}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.05 }}>{title}</h1>
              <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '72ch' }}>{subtitle}</p>
            </div>
          </div>
          {actions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={action.tone === 'secondary' ? 'btn-ghost' : 'btn-primary'}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {metrics.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {metrics.map((metric) => (
            <div key={metric.label} className="glass-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{metric.label}</p>
                  <p style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>{metric.value}</p>
                </div>
                <span className={`badge ${toneToClass[metric.tone || 'orange']}`}>{metric.hint ?? metric.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {sections.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {sections.map((section) => (
            <div key={section.title} className="glass-card" style={{ padding: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '16px' }}>{section.title}</h2>
              {section.description && <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '12.5px', lineHeight: 1.55 }}>{section.description}</p>}
              <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,140,66,0.12)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}>{item.title}</p>
                    </div>
                    {item.value ? <span className={`badge ${toneToClass[item.tone || 'orange']}`}>{item.value}</span> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  )
}