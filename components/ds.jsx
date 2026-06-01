'use client'

import { useCallback, useContext, useEffect, useRef, useState, createContext } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

/* ---- Icon ---- */
const ICONS = {
  link:        'M9 15l6-6M10.5 6.5l1-1a4.95 4.95 0 017 7l-1 1M13.5 17.5l-1 1a4.95 4.95 0 01-7-7l1-1',
  qr:          'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 14v6M17 20h3M14 17h0',
  chart:       'M4 20V10M10 20V4M16 20v-7M22 20H2',
  arrowRight:  'M5 12h14M13 6l6 6-6 6',
  arrowUpRight:'M7 17L17 7M8 7h9v9',
  arrowLeft:   'M19 12H5M11 18l-6-6 6-6',
  copy:        'M9 9h10a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8a2 2 0 012-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1',
  check:       'M20 6L9 17l-5-5',
  download:    'M12 3v12M7 10l5 5 5-5M5 21h14',
  trash:       'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6',
  plus:        'M12 5v14M5 12h14',
  search:      'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  user:        'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  mail:        'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 7l-10 6L2 7',
  lock:        'M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2zM8 11V7a4 4 0 018 0v4',
  eye:         'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeOff:      'M9.9 5.2A9.7 9.7 0 0112 5c6.5 0 10 7 10 7a13.6 13.6 0 01-2.3 3.1M6.6 6.6A13.5 13.5 0 002 12s3.5 7 10 7a9.5 9.5 0 004-.9M3 3l18 18M9.9 9.9a3 3 0 004.2 4.2',
  image:       'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3M21 16l-5-5L5 21',
  sun:         'M12 4V2M12 22v-2M5 5L3.5 3.5M20.5 20.5L19 19M4 12H2M22 12h-2M5 19l-1.5 1.5M20.5 3.5L19 5M12 17a5 5 0 100-10 5 5 0 000 10z',
  moon:        'M21 12.8A9 9 0 1111.2 3a7 7 0 109.8 9.8z',
  logout:      'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  x:           'M18 6L6 18M6 6l12 12',
  alert:       'M12 9v4M12 17h0M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  zap:         'M13 2L3 14h7l-1 8 10-12h-7l1-8z',
  cursor:      'M3 3l7.5 18 2.3-7.2L20 11.5 3 3z',
  smartphone:  'M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zM11 18h2',
  monitor:     'M3 4h18a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM8 21h8M12 17v4',
  tablet:      'M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1zM12 17h0',
  mapPin:      'M12 21s7-6.4 7-11a7 7 0 10-14 0c0 4.6 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  calendar:    'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  sparkle:     'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
  chevronDown: 'M6 9l6 6 6-6',
  menu:        'M3 6h18M3 12h18M3 18h18',
  external:    'M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6',
}

export function Icon({ name, size = 20, style, className, strokeWidth = 2 }) {
  const d = ICONS[name]
  if (!d) return null
  const paths = d.split('M').filter(Boolean).map((seg, i) => (
    <path key={i} d={'M' + seg} />
  ))
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths}
    </svg>
  )
}

/* ---- Button ---- */
export function Btn({
  variant = 'primary',
  size,
  loading,
  children,
  className = '',
  icon,
  iconRight,
  ...rest
}) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : '',
    className,
  ].join(' ')
  return (
    <button className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className="spin" /> : icon ? <Icon name={icon} /> : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} /> : null}
    </button>
  )
}

/* ---- Field ---- */
export function Field({
  label,
  optional,
  error,
  leadIcon,
  prefix,
  mono,
  type = 'text',
  rightSlot,
  shellClass = '',
  ...rest
}) {
  const [show, setShow] = useState(false)
  const isPw = type === 'password'
  return (
    <div className="field">
      {label && (
        <label className="field-label">
          {label}
          {optional && <span className="opt"> · optional</span>}
        </label>
      )}
      <div className={`input-shell ${mono ? 'mono' : ''} ${error ? 'has-error' : ''} ${shellClass}`}>
        {leadIcon && (
          <span className="lead-icon">
            <Icon name={leadIcon} size={18} />
          </span>
        )}
        {prefix && <span className="prefix">{prefix}</span>}
        <input type={isPw && show ? 'text' : type} {...rest} />
        {isPw && (
          <button
            type="button"
            className="lead-icon"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label="toggle password"
          >
            <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
          </button>
        )}
        {rightSlot}
      </div>
      {error && (
        <div className="field-error">
          <Icon name="alert" size={14} /> {error}
        </div>
      )}
    </div>
  )
}

/* ---- Avatar ---- */
export function Avatar({ user, size = 38 }) {
  const name = user?.user_metadata?.name || user?.email || ''
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const avatarUrl = user?.user_metadata?.profile_pic
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </div>
  )
}

/* ---- Skeleton ---- */
export function Sk({ w, h = 14, r = 8, style }) {
  return <div className="sk" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

/* ---- CountUp ---- */
export function CountUp({ value, dur = 900, className, style }) {
  const [n, setN] = useState(0)
  const raf = useRef()
  useEffect(() => {
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur)
      const e = 1 - Math.pow(1 - p, 3)
      setN(Math.round(value * e))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, dur])
  return (
    <span className={className} style={style}>
      {n.toLocaleString('en-US')}
    </span>
  )
}

/* ---- Logo ---- */
export function Logo({ size = 30, withWord = true, href, light = false, onClick }) {
  const inner = (
    <div
      className="row"
      style={{ gap: 10, cursor: href || onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          flex: 'none',
          background: 'linear-gradient(150deg,#2bbd73 0%,var(--primary) 52%,var(--primary-2) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            '0 6px 14px rgba(14,138,80,.42),inset 0 1px 1px rgba(255,255,255,.45),inset 0 -2px 3px rgba(0,0,0,.22)',
        }}
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.28))' }}
        >
          <path d="M9 15l6-6" />
          <path d="M10.5 6.5l1-1a4.95 4.95 0 017 7l-1 1" />
          <path d="M13.5 17.5l-1 1a4.95 4.95 0 01-7-7l1-1" />
        </svg>
      </div>
      {withWord && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: size * 0.6,
            letterSpacing: '-.03em',
            color: light ? '#fff' : 'var(--ink)',
          }}
        >
          clippr
        </span>
      )}
    </div>
  )
  if (href) return <Link href={href}>{inner}</Link>
  return inner
}

/* ---- ThemeToggle ---- */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div style={{ width: 40, height: 40 }} />
  return (
    <button
      className="iconbtn"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="toggle theme"
      title="Toggle theme"
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
    </button>
  )
}

/* ---- Toast ---- */
const ToastCtx = createContext(null)

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, kind = 'success') => {
    const id = uid()
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(
      () => setToasts((t) => t.map((x) => (x.id === id ? { ...x, out: true } : x))),
      2200
    )
    setTimeout(
      () => setToasts((t) => t.filter((x) => x.id !== id)),
      2550
    )
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-host">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.out ? 'out' : ''} ${
              t.kind === 'info' ? 'is-info' : t.kind === 'danger' ? 'is-danger' : ''
            }`}
          >
            <span className="tic">
              <Icon
                name={t.kind === 'danger' ? 'x' : t.kind === 'info' ? 'link' : 'check'}
                size={14}
              />
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
