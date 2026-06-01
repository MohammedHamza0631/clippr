'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { UrlState } from '@/context/url-provider'
import { logout } from '@/db/apiAuth'
import { Avatar, Btn, Icon, Logo, ThemeToggle } from './ds'

function DropItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="row"
      style={{
        gap: 11,
        width: '100%',
        padding: '10px 11px',
        border: 'none',
        background: 'transparent',
        borderRadius: 10,
        cursor: 'pointer',
        color: danger ? 'var(--danger)' : 'var(--ink)',
        fontWeight: 600,
        fontSize: 14,
        textAlign: 'left',
        transition: 'background .14s',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = danger ? 'var(--danger-soft)' : 'var(--surface-2)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <Icon name={icon} size={17} style={{ color: danger ? 'var(--danger)' : 'var(--ink-3)' }} />
      {label}
    </button>
  )
}

export default function Header() {
  const { user, isAuthenticated, fetchUser } = UrlState()
  const userName = user?.user_metadata?.name || user?.email || ''
  const userEmail = user?.email || ''
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const ddRef = useRef(null)

  useEffect(() => {
    const h = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    setNavOpen(false)
    await logout()
    await fetchUser()
    router.push('/')
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
        backdropFilter: 'saturate(160%) blur(14px)',
        WebkitBackdropFilter: 'saturate(160%) blur(14px)',
      }}
    >
      <div
        className="wrap row"
        style={{
          height: 68,
          justifyContent: 'space-between',
          gap: 16,
          maxWidth: isAuthenticated ? 1280 : 'var(--maxw)',
        }}
      >
        <Logo href={isAuthenticated ? '/dashboard' : '/'} size={30} />

        {/* center nav — public pages only, desktop */}
        {!isAuthenticated && (
          <nav
            className="nav-desktop row"
            style={{ gap: 4, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          >
            {['Features', 'How it works', 'Pricing'].map((label) => (
              <Link
                key={label}
                href={`/#${encodeURIComponent(label)}`}
                style={{
                  padding: '8px 14px',
                  fontWeight: 600,
                  fontSize: 14.5,
                  color: 'var(--ink-2)',
                  borderRadius: 9,
                  transition: 'color .14s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-2)')}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="row" style={{ gap: 10 }}>
          <ThemeToggle />

          {!isAuthenticated ? (
            <div className="row nav-desktop" style={{ gap: 10 }}>
              <Btn variant="ghost" onClick={() => router.push('/auth')}>
                Log in
              </Btn>
              <Btn
                variant="dark"
                onClick={() => router.push('/auth?tab=signup')}
                iconRight="arrowRight"
              >
                Sign up free
              </Btn>
            </div>
          ) : (
            <div ref={ddRef} style={{ position: 'relative' }} className="nav-desktop">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="row"
                style={{
                  gap: 9,
                  padding: '5px 9px 5px 5px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-pill)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Avatar user={user} size={32} />
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>
                  {userName.split(' ')[0]}
                </span>
                <Icon
                  name="chevronDown"
                  size={15}
                  style={{
                    color: 'var(--ink-3)',
                    transform: menuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform .2s',
                  }}
                />
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 10px)',
                    width: 248,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: 7,
                    animation: 'popIn .22s var(--ease-spring)',
                  }}
                >
                  <div className="row" style={{ gap: 11, padding: '10px 11px 12px' }}>
                    <Avatar user={user} size={42} />
                    <div className="col" style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: 14.5 }}>{userName}</span>
                      <span
                        className="mono"
                        style={{
                          fontSize: 12,
                          color: 'var(--ink-3)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {userEmail}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{ height: 1, background: 'var(--border)', margin: '2px 4px 6px' }}
                  />
                  <DropItem
                    icon="chart"
                    label="Dashboard"
                    onClick={() => {
                      setMenuOpen(false)
                      router.push('/dashboard')
                    }}
                  />
                  <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px' }} />
                  <DropItem icon="logout" label="Log out" danger onClick={handleLogout} />
                </div>
              )}
            </div>
          )}

          {/* mobile hamburger */}
          <button
            className="iconbtn nav-mobile"
            onClick={() => setNavOpen((o) => !o)}
            aria-label="menu"
          >
            <Icon name={navOpen ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      {navOpen && (
        <div
          className="nav-drawer"
          style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: 16,
            animation: 'fadeIn .2s',
          }}
        >
          {isAuthenticated ? (
            <div className="col" style={{ gap: 6 }}>
              <div className="row" style={{ gap: 11, padding: '6px 8px 12px' }}>
                <Avatar user={user} size={40} />
                <div className="col">
                  <span style={{ fontWeight: 700 }}>{userName}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    {userEmail}
                  </span>
                </div>
              </div>
              <Btn
                variant="soft"
                className="btn-block"
                icon="chart"
                onClick={() => {
                  setNavOpen(false)
                  router.push('/dashboard')
                }}
              >
                Dashboard
              </Btn>
              <Btn
                variant="danger-ghost"
                className="btn-block"
                icon="logout"
                onClick={handleLogout}
              >
                Log out
              </Btn>
            </div>
          ) : (
            <div className="col" style={{ gap: 8 }}>
              {['Features', 'How it works', 'Pricing'].map((label) => (
                <Link
                  key={label}
                  href={`/#${encodeURIComponent(label)}`}
                  onClick={() => setNavOpen(false)}
                  style={{
                    padding: '11px 10px',
                    fontWeight: 600,
                    color: 'var(--ink-2)',
                    borderRadius: 10,
                    display: 'block',
                  }}
                >
                  {label}
                </Link>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <Btn
                variant="soft"
                className="btn-block"
                onClick={() => {
                  setNavOpen(false)
                  router.push('/auth')
                }}
              >
                Log in
              </Btn>
              <Btn
                variant="primary"
                className="btn-block"
                onClick={() => {
                  setNavOpen(false)
                  router.push('/auth?tab=signup')
                }}
              >
                Sign up free
              </Btn>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
