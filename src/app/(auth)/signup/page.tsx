'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /* ── Google OAuth ───────────────────────────────────── */
    async function handleGoogleSignup() {
        setGoogleLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError(error.message)
            setGoogleLoading(false)
        }
    }

    /* ── Email / Password ───────────────────────────────── */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
            },
        })

        if (error) {
            if (error.message.toLowerCase().includes('already registered')) {
                setError('This email is already registered. Try signing in instead.')
            } else {
                setError(error.message)
            }
            setLoading(false)
            return
        }

        router.push('/onboarding')
    }

    return (
        <>
            <h2 className="auth-heading">Create your account</h2>
            <p className="auth-subtext">Start finding perfect influencers today</p>

            {/* Google OAuth */}
            <button
                type="button"
                className="auth-google-btn"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <div className="auth-spinner" style={{ borderColor: 'rgba(28,20,16,0.2)', borderTopColor: '#1C1410' }} />
                ) : (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                )}
                {googleLoading ? 'Connecting…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="auth-divider">
                <div className="auth-divider__line" />
                <span className="auth-divider__text">or sign up with email</span>
                <div className="auth-divider__line" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="auth-field">
                    <label className="auth-label" htmlFor="signup-name">Full Name</label>
                    <div className="auth-input-wrap">
                        <input
                            id="signup-name"
                            type="text"
                            className="auth-input"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>
                </div>

                {/* Work Email */}
                <div className="auth-field">
                    <label className="auth-label" htmlFor="signup-email">Work Email</label>
                    <div className="auth-input-wrap">
                        <input
                            id="signup-email"
                            type="email"
                            className={`auth-input${error ? ' auth-input--error' : ''}`}
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="auth-field">
                    <label className="auth-label" htmlFor="signup-password">Password</label>
                    <div className="auth-input-wrap">
                        <input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            className={`auth-input auth-input--password${error ? ' auth-input--error' : ''}`}
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="auth-toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loading}
                >
                    {loading && <div className="auth-spinner" />}
                    {loading ? 'Creating account…' : 'Create Account'}
                </button>
            </form>

            {/* Terms */}
            <p className="auth-terms">
                By signing up you agree to our{' '}
                <a href="/terms">Terms of Service</a> and{' '}
                <a href="/privacy">Privacy Policy</a>
            </p>

            {/* Error */}
            {error && (
                <div className="auth-error">
                    <svg className="auth-error__icon" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 4a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0V5zm.75 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                    </svg>
                    <span className="auth-error__text">{error}</span>
                </div>
            )}

            {/* Footer */}
            <p className="auth-footer">
                Already have an account?{' '}
                <Link href="/login">Sign in →</Link>
            </p>
        </>
    )
}
