'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Drawer } from 'vaul'
import { QRCode } from 'react-qrcode-logo'
import { Btn, Field, Icon, useToast } from '@/components/ds'
import { UrlState } from '@/context/url-provider'
import { createUrl } from '@/db/apiUrls'
import useFetch from '@/hooks/use-fetch'
import useMediaQuery from '@/hooks/use-media-query'
import { BASE_APP_DOMAIN, QR_BG_COLOR, QR_EYE_RADIUS, QR_FG_COLOR, QR_SIZE, QR_STYLE } from '@/lib/constants'

/* ---- Desktop backdrop ---- */
function Backdrop({ onClose, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(12,12,20,.5)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'fadeIn .2s',
      }}
    >
      {children}
    </div>
  )
}

export default function CreateLink({ fetchUrls }) {
  const { user } = UrlState()
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const qrRef = useRef()
  const isMobile = useMediaQuery('(max-width: 940px)')

  const longLink = searchParams?.get('createNew')
  const [open, setOpen] = useState(!!longLink)

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState(longLink || '')
  const [alias, setAlias] = useState('')
  const [errors, setErrors] = useState({})
  const [formErr, setFormErr] = useState('')

  const isValidPreview = (() => {
    if (!url.trim()) return false
    try {
      const normalized = url.match(/^https?:\/\//) ? url : 'https://' + url
      new URL(normalized)
      return true
    } catch { return false }
  })()
  const previewUrl = isValidPreview
    ? (url.match(/^https?:\/\//) ? url : 'https://' + url)
    : ''

  const { loading, error, data, fn: fnCreateUrl } = useFetch(createUrl, {
    title, longUrl: previewUrl, customUrl: alias, user_id: user?.id,
  })

  useEffect(() => {
    if (error === null && data) {
      toast?.('Link created!', 'success')
      fetchUrls?.()
      router.push(`/link/${data[0].id}`)
    }
  }, [error, data])

  const validate = () => {
    const er = {}
    if (!title.trim()) er.title = 'Give your link a title'
    if (!url.trim()) er.url = 'Paste the URL you want to shorten'
    else if (!isValidPreview) er.url = "That doesn't look like a valid URL"
    if (alias && !/^[a-z0-9-]+$/i.test(alias)) er.alias = 'Use only letters, numbers and hyphens'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setFormErr('')
    if (!validate()) return
    try {
      const canvas = qrRef.current?.canvasRef?.current
      if (!canvas) { await fnCreateUrl(null); return }
      const blob = await new Promise((resolve) => canvas.toBlob(resolve))
      await fnCreateUrl(blob)
    } catch (err) {
      setFormErr(err.message || 'Something went wrong')
    }
  }

  const handleClose = () => {
    setOpen(false)
    if (longLink) router.push('/dashboard')
  }

  const triggerBtn = (
    <Btn icon="plus" size="lg" onClick={() => setOpen(true)}>
      Create new link
    </Btn>
  )

  /* ---- Mobile: Vaul drawer ---- */
  if (isMobile) {
    return (
      <>
        {triggerBtn}
        {/* off-screen full-size QR for blob generation */}
        {previewUrl && (
          <div style={{ position: 'fixed', left: -9999, top: -9999, pointerEvents: 'none' }}>
            <QRCode
              ref={qrRef}
              value={previewUrl}
              size={QR_SIZE}
              qrStyle={QR_STYLE}
              eyeRadius={QR_EYE_RADIUS}
              bgColor={QR_BG_COLOR}
              fgColor={QR_FG_COLOR}
            />
          </div>
        )}
        <Drawer.Root open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
          <Drawer.Portal>
            <Drawer.Overlay style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(12,12,20,.55)',
              backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
            }} />
            <Drawer.Content style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 1000,
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              borderRadius: '20px 20px 0 0',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              outline: 'none',
            }}>
              {/* drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 4px', flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, borderRadius: 9, background: 'var(--border-2)' }} />
              </div>

              <Drawer.Title style={{ display: 'none' }}>Create a short link</Drawer.Title>

              {/* scrollable body */}
              <div style={{ overflowY: 'auto', padding: '8px 22px 40px', flex: 1 }}>
                {/* header */}
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div className="col" style={{ gap: 3 }}>
                    <span className="eyebrow">New link</span>
                    <h2 style={{ fontSize: 22 }}>Create a short link</h2>
                  </div>
                  <button className="iconbtn" onClick={handleClose} aria-label="close" style={{ flex: 'none' }}>
                    <Icon name="x" size={18} />
                  </button>
                </div>

                {/* compact QR preview */}
                {previewUrl && (
                  <div
                    className="row"
                    style={{
                      gap: 14, padding: '12px 14px', marginBottom: 18,
                      background: 'var(--surface-2)', borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="qr-card" style={{ padding: 6, flex: 'none' }}>
                      <QRCode
                        value={previewUrl}
                        size={60}
                        qrStyle={QR_STYLE}
                        eyeRadius={QR_EYE_RADIUS}
                        bgColor={QR_BG_COLOR}
                        fgColor={QR_FG_COLOR}
                      />
                    </div>
                    <div className="col" style={{ gap: 3, minWidth: 0 }}>
                      <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>QR preview</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {BASE_APP_DOMAIN}/{alias.trim() || '••••••'}
                      </span>
                    </div>
                  </div>
                )}

                {/* form */}
                <form className="col" style={{ gap: 17 }} onSubmit={submit} noValidate>
                  {(formErr || error) && (
                    <div className="form-error">
                      <Icon name="alert" size={18} /> {formErr || error?.message}
                    </div>
                  )}
                  <Field
                    label="Title"
                    placeholder="e.g. Spring product launch"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setErrors((x) => ({ ...x, title: '' })) }}
                    error={errors.title}
                  />
                  <Field
                    label="Long URL"
                    mono
                    leadIcon="link"
                    placeholder="https://example.com/very/long/path"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setErrors((x) => ({ ...x, url: '' })) }}
                    error={errors.url}
                  />
                  <Field
                    label="Custom alias"
                    optional
                    mono
                    prefix={`${BASE_APP_DOMAIN}/`}
                    placeholder="spring26"
                    value={alias}
                    onChange={(e) => { setAlias(e.target.value.replace(/\s/g, '')); setErrors((x) => ({ ...x, alias: '' })) }}
                    error={errors.alias}
                  />
                  <div className="row create-actions" style={{ gap: 10, marginTop: 4 }}>
                    <Btn type="button" variant="ghost" onClick={handleClose} style={{ flex: 'none' }}>
                      Cancel
                    </Btn>
                    <Btn
                      type="submit"
                      className="btn-block"
                      loading={loading}
                      iconRight={loading ? undefined : 'arrowRight'}
                    >
                      {loading ? 'Creating link…' : 'Create link'}
                    </Btn>
                  </div>
                </form>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </>
    )
  }

  /* ---- Desktop: backdrop overlay ---- */
  return (
    <>
      {!open && triggerBtn}
      {open && (
        <Backdrop onClose={handleClose}>
          <div
            className="create-overlay"
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              width: '100%',
              maxWidth: 880,
              borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--shadow-pop)',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '1fr 320px',
              animation: 'popIn .32s var(--ease-spring)',
              maxHeight: '92vh',
            }}
          >
            {/* form side */}
            <div className="col create-form" style={{ padding: 30, gap: 20, overflowY: 'auto' }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="col" style={{ gap: 5 }}>
                  <span className="eyebrow">New link</span>
                  <h2 style={{ fontSize: 26 }}>Create a short link</h2>
                </div>
                <button className="iconbtn create-close" onClick={handleClose} aria-label="close" style={{ flex: 'none' }}>
                  <Icon name="x" size={18} />
                </button>
              </div>

              <form className="col" style={{ gap: 17 }} onSubmit={submit} noValidate>
                {(formErr || error) && (
                  <div className="form-error">
                    <Icon name="alert" size={18} /> {formErr || error?.message}
                  </div>
                )}
                <Field
                  label="Title"
                  placeholder="e.g. Spring product launch"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setErrors((x) => ({ ...x, title: '' })) }}
                  error={errors.title}
                  autoFocus
                />
                <Field
                  label="Long URL"
                  mono
                  leadIcon="link"
                  placeholder="https://example.com/very/long/path"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setErrors((x) => ({ ...x, url: '' })) }}
                  error={errors.url}
                />
                <Field
                  label="Custom alias"
                  optional
                  mono
                  prefix={`${BASE_APP_DOMAIN}/`}
                  placeholder="spring26"
                  value={alias}
                  onChange={(e) => { setAlias(e.target.value.replace(/\s/g, '')); setErrors((x) => ({ ...x, alias: '' })) }}
                  error={errors.alias}
                />
                <div className="row create-actions" style={{ gap: 10, marginTop: 4 }}>
                  <Btn type="button" variant="ghost" onClick={handleClose} style={{ flex: 'none' }}>
                    Cancel
                  </Btn>
                  <Btn
                    type="submit"
                    className="btn-block"
                    loading={loading}
                    iconRight={loading ? undefined : 'arrowRight'}
                  >
                    {loading ? 'Creating link…' : 'Create link'}
                  </Btn>
                </div>
              </form>
            </div>

            {/* live QR preview side */}
            <div
              className="create-preview col"
              style={{
                padding: 30, gap: 16,
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                background: 'linear-gradient(165deg,var(--surface-2),var(--surface-3))',
                borderLeft: '1px solid var(--border)',
              }}
            >
              <span className="eyebrow" style={{ color: 'var(--violet)' }}>Live preview</span>
              <div style={{ transition: 'transform .3s var(--ease-spring)', transform: previewUrl ? 'scale(1)' : 'scale(.97)' }}>
                {previewUrl ? (
                  <div className="qr-card" style={{ padding: 14 }}>
                    <QRCode
                      ref={qrRef}
                      value={previewUrl}
                      size={172}
                      qrStyle={QR_STYLE}
                      eyeRadius={QR_EYE_RADIUS}
                      bgColor={QR_BG_COLOR}
                      fgColor={QR_FG_COLOR}
                    />
                  </div>
                ) : (
                  <div className="qr-empty" style={{ width: 200, height: 200 }}>
                    <Icon name="qr" size={32} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, maxWidth: 150 }}>
                      Start typing a URL and your QR code appears here
                    </span>
                  </div>
                )}
              </div>
              {previewUrl ? (
                <div className="col center" style={{ gap: 4 }}>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-2)' }}>
                    {BASE_APP_DOMAIN}/{alias.trim() || '••••••'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {(() => {
                      try { const u = new URL(previewUrl); return (u.hostname + u.pathname).replace(/\/$/, '') }
                      catch { return previewUrl }
                    })()}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 12.5, color: 'var(--ink-3)', maxWidth: 200 }}>
                  Your QR code updates in real time as you type.
                </span>
              )}
            </div>
          </div>
        </Backdrop>
      )}
    </>
  )
}
