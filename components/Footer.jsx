'use client'

import Link from 'next/link'
import { Icon, Logo } from './ds'
import { BASE_APP_DOMAIN } from '@/lib/constants'

export default function Footer() {
  const links = ['Features', 'How it works', 'Pricing']

  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div
        className="wrap footer-grid"
        style={{
          padding: '40px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 32,
          flexWrap: 'wrap',
        }}
      >
        <div className="col" style={{ gap: 12, maxWidth: 320 }}>
          <Logo size={28} />
          <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6 }}>
            Short links, real QR codes, and click analytics that actually tell you something.
          </p>
        </div>

        <nav className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
          {links.map((item) => (
            <Link
              key={item}
              href={`/#${encodeURIComponent(item)}`}
              style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-2)')}
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>

      <div
        className="wrap row footer-bottom"
        style={{
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderTop: '1px solid var(--border)',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          © 2026 Clippr — Make every link count.
        </span>
        <span className="row" style={{ gap: 8 }}>
          <span className="badge badge-muted">
            <span className="dot" style={{ background: 'var(--success)' }} /> Operational
          </span>
          <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
            {BASE_APP_DOMAIN}
          </span>
        </span>
      </div>
    </footer>
  )
}
