'use client'

import { useEffect, useState } from 'react'
import { Icon } from './ds'

/* Device metadata for donut chart */
export const DEVICE_META = {
  mobile:  { label: 'Mobile',  icon: 'smartphone', color: 'var(--primary)' },
  desktop: { label: 'Desktop', icon: 'monitor',    color: 'var(--violet)'  },
  tablet:  { label: 'Tablet',  icon: 'tablet',     color: 'var(--amber)'   },
}

function fmt(n) {
  return (n || 0).toLocaleString('en-US')
}

/* ---- BarChart: top cities with CSS fill animation ---- */
export function BarChart({ data }) {
  if (!data?.length) return null
  const max = Math.max(...data.map((d) => d.clicks), 1)
  return (
    <div className="col" style={{ gap: 16 }}>
      {data.map((d, i) => (
        <div key={d.name} className="col" style={{ gap: 7 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span
              className="row"
              style={{ gap: 8, fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}
            >
              <Icon name="mapPin" size={15} style={{ color: 'var(--ink-3)' }} />
              {d.name}
            </span>
            <span className="mono" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)' }}>
              {fmt(d.clicks)}
            </span>
          </div>
          <div
            style={{
              height: 12,
              borderRadius: 99,
              background: 'var(--surface-3)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(d.clicks / max) * 100}%`,
                borderRadius: 99,
                background: 'linear-gradient(90deg,var(--primary),var(--primary-2))',
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                animation: `barGrow .9s var(--ease) ${i * 0.08 + 0.1}s forwards`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---- DonutChart: SVG-based device distribution ---- */
export function DonutChart({ devices, size = 188 }) {
  const entries = Object.entries(devices || {}).filter(([, v]) => v > 0)
  const total = entries.reduce((a, [, v]) => a + v, 0) || 1
  const R = size / 2
  const r = R - 20
  const C = 2 * Math.PI * r
  let acc = 0
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="row" style={{ gap: 26, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={R}
            cy={R}
            r={r}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth="20"
          />
          {entries.map(([k, v]) => {
            const frac = v / total
            const dash = frac * C
            const off = acc * C
            acc += frac
            return (
              <circle
                key={k}
                cx={R}
                cy={R}
                r={r}
                fill="none"
                stroke={DEVICE_META[k]?.color || '#888'}
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${mounted ? dash : 0} ${C}`}
                strokeDashoffset={-off}
                style={{ transition: 'stroke-dasharray 1s var(--ease)' }}
              />
            )
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '-.03em',
            }}
          >
            {fmt(total)}
          </span>
          <span
            style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: -2 }}
          >
            clicks
          </span>
        </div>
      </div>

      <div className="col" style={{ gap: 12, flex: 1, minWidth: 150 }}>
        {Object.keys(DEVICE_META).map((k) => {
          const v = devices?.[k] || 0
          const pct = Math.round((v / total) * 100)
          return (
            <div key={k} className="row" style={{ gap: 11 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--surface-2)',
                  color: DEVICE_META[k].color,
                  border: '1px solid var(--border)',
                }}
              >
                <Icon name={DEVICE_META[k].icon} size={16} />
              </span>
              <div className="col" style={{ flex: 1, gap: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>
                  {DEVICE_META[k].label}
                </span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  {fmt(v)} · {pct}%
                </span>
              </div>
              <span
                className="dot"
                style={{ background: DEVICE_META[k].color, width: 10, height: 10 }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
