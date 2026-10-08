import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Mail, ShieldCheck, X } from 'lucide-react'
import { customerRequest, type Customer } from '../customer-api'
import './customer-login.css'

export function CustomerLogin({ onClose, onLogin }: { onClose: () => void; onLogin: (customer: Customer) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const emailInput = useRef<HTMLInputElement>(null)
  const codeInput = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.showModal(); emailInput.current?.focus()
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  useEffect(() => { if (challenge) codeInput.current?.focus() }, [challenge])
  useEffect(() => {
    if (!cooldown) return
    const timer = window.setTimeout(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])
  const requestCode = async () => {
    setBusy(true); setError('')
    try {
      const result = await customerRequest<{ challengeId: string; retryAfter: number }>('request-code', { email })
      setChallenge(result.challengeId); setCode(''); setCooldown(result.retryAfter)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not send your code.'); setCooldown(60) }
    finally { setBusy(false) }
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!challenge) { await requestCode(); return }
    setBusy(true); setError('')
    try {
      const result = await customerRequest<{ customer: Customer }>('verify-code', { challengeId: challenge, code, name, phone })
      onLogin(result.customer)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not verify your code.') }
    finally { setBusy(false) }
  }
  return <dialog ref={dialog} className="customer-login" aria-labelledby="customer-login-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }} onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <button type="button" className="icon-button auth-close" aria-label="Close sign in" disabled={busy} onClick={onClose}><X size={20} /></button>
    <span className="auth-symbol"><Mail size={26} /></span><p className="section-kicker">Your next good mood</p>
    <h2 id="customer-login-title">{challenge ? 'Check your inbox.' : 'A quick hello.'}</h2>
    <p>{challenge ? `Enter the six-digit code sent to ${email}. It expires in 10 minutes. Check spam if needed.` : 'Sign in with an email code before placing your pickup order. No password needed.'}</p>
    <form onSubmit={submit}>
      {!challenge ? <>
        <label>Email address<input ref={emailInput} type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} /></label>
        <label>Your name<input autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} disabled={busy} /></label>
        <label>Mobile contact number <span>India · +91</span><input type="tel" autoComplete="tel-national" inputMode="tel" required pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit mobile number" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} disabled={busy} /></label>
        <small>We verify your email, not your mobile number. Your mobile number is used to contact you about pickup.</small>
      </> : <label>Email verification code<input ref={codeInput} className="otp-input" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} disabled={busy} /></label>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="primary-button" disabled={busy || (!challenge && cooldown > 0)}>{busy ? 'Please wait…' : challenge ? 'Verify email & sign in' : cooldown ? `Try again in ${cooldown}s` : 'Send my login code'}<ShieldCheck size={18} /></button>
      {challenge && <div className="auth-secondary"><button type="button" disabled={busy} onClick={() => { setChallenge(''); setError(''); requestAnimationFrame(() => emailInput.current?.focus()) }}><ArrowLeft size={15} /> Edit details</button><button type="button" disabled={busy || cooldown > 0} onClick={requestCode}>{cooldown ? `Resend in ${cooldown}s` : 'Resend code'}</button></div>}
    </form><small className="auth-privacy">Your details are stored for sign-in and order fulfilment. Codes are sent through Resend. This does not subscribe you to marketing.</small>
  </dialog>
}
