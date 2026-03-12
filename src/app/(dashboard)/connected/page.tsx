"use client";

import "./connected.css";

/* ════════════════════════════════════════════════
   Inline SVG Icons
   ════════════════════════════════════════════════ */

function GmailIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 6L12 13 2 6V4l10 7 10-7v2z" fill="#EA4335" />
            <path d="M2 6v12h4V8l6 5 6-5v10h4V6L12 13 2 6z" fill="#EA4335" />
            <path d="M2 6l10 7V8L6 4H4L2 6z" fill="#FBBC05" />
            <path d="M22 6L12 13V8l6-4h2l2 2z" fill="#34A853" />
            <path d="M6 18V8L2 6v12h4z" fill="#C5221F" />
            <path d="M18 18V8l4-2v12h-4z" fill="#0F9D58" />
            <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="#E0E0E0" strokeWidth="0" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" />
            <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
        </svg>
    );
}

function YouTubeIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M23 7s-.3-1.9-1.1-2.7C20.8 3.2 19.6 3 19 2.9 15.7 2.6 12 2.6 12 2.6s-3.7 0-7 .3c-.6.1-1.8.3-2.9 1.4C1.3 5.1 1 7 1 7S.7 9.2.7 11.4v2.1C.7 15.7 1 17.9 1 17.9s.3 1.9 1.1 2.7c1.1 1.1 2.5 1.1 3.1 1.2 2.3.2 9.8.3 9.8.3s3.7 0 7-.3c.6-.1 1.8-.3 2.9-1.4.8-.8 1.1-2.7 1.1-2.7s.3-2.2.3-4.4v-2.1C23.3 9.2 23 7 23 7z" fill="white" />
            <path d="M10 15.5V8.5L16 12L10 15.5Z" fill="#FF0000" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

/* ════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════ */
export default function ConnectedAccountsPage() {
    return (
        <div className="ca-page">
            {/* ─── Header ─── */}
            <header className="ca-header">
                <h1>Connected Accounts</h1>
                <p>Manage your email and social media connections to enable outreach</p>
            </header>

            {/* ─── Content ─── */}
            <div className="ca-content">
                <div className="ca-inner">

                    {/* ═══════════ SECTION 1 — Email ═══════════ */}
                    <section className="ca-section">
                        <p className="ca-section-label">Email</p>

                        {/* Gmail — Connected */}
                        <div className="ca-card ca-card--connected">
                            <span className="ca-pill ca-pill--connected">● Connected</span>

                            <div className="ca-icon ca-icon--gmail">
                                <GmailIcon />
                            </div>

                            <div className="ca-card-body">
                                <p className="ca-card-name">Google / Gmail</p>
                                <p className="ca-card-desc">
                                    Send and receive outreach emails directly from your own Gmail inbox
                                </p>

                                <div className="ca-connection-info">
                                    <span className="ca-connection-dot" />
                                    brand@gmail.com
                                </div>
                                <p className="ca-connection-since">Connected since Feb 2, 2026</p>
                            </div>

                            <div className="ca-card-actions">
                                <button className="ca-btn-disconnect">Disconnect</button>
                                <button className="ca-btn-ghost">Send Test Email</button>
                            </div>
                        </div>
                    </section>

                    {/* ═══════════ SECTION 2 — Social Media ═══════════ */}
                    <section className="ca-section">
                        <p className="ca-section-label">Social Media</p>

                        {/* Instagram — Not Connected */}
                        <div className="ca-card ca-card--disconnected">
                            <span className="ca-pill ca-pill--disconnected">○ Not Connected</span>

                            <div className="ca-icon ca-icon--instagram">
                                <InstagramIcon />
                            </div>

                            <div className="ca-card-body">
                                <p className="ca-card-name">Instagram</p>
                                <p className="ca-card-desc">
                                    Send DMs to influencers directly through their Instagram inbox
                                </p>
                                <p className="ca-warning">
                                    ⚠️ Requires Instagram Business or Creator account with API access
                                </p>

                                <div className="ca-card-bottom">
                                    <span className="ca-phase-badge">Available in Phase 2</span>
                                    <div className="ca-tooltip-wrap">
                                        <button className="ca-btn-connect" disabled>
                                            Connect Instagram
                                        </button>
                                        <span className="ca-tooltip">Coming in Phase 2</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* YouTube — Not Connected */}
                        <div className="ca-card ca-card--disconnected">
                            <span className="ca-pill ca-pill--disconnected">○ Not Connected</span>

                            <div className="ca-icon ca-icon--youtube">
                                <YouTubeIcon />
                            </div>

                            <div className="ca-card-body">
                                <p className="ca-card-name">YouTube</p>
                                <p className="ca-card-desc">
                                    Track influencer video performance and manage YouTube collaborations
                                </p>
                                <p className="ca-warning">
                                    ⚠️ Connect via YouTube Data API v3
                                </p>

                                <div className="ca-card-bottom">
                                    <span className="ca-phase-badge">Available in Phase 2</span>
                                    <div className="ca-tooltip-wrap">
                                        <button className="ca-btn-connect" disabled>
                                            Connect YouTube
                                        </button>
                                        <span className="ca-tooltip">Coming in Phase 2</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LinkedIn — Not Connected */}
                        <div className="ca-card ca-card--disconnected">
                            <span className="ca-pill ca-pill--disconnected">○ Not Connected</span>

                            <div className="ca-icon ca-icon--linkedin">
                                <LinkedInIcon />
                            </div>

                            <div className="ca-card-body">
                                <p className="ca-card-name">LinkedIn</p>
                                <p className="ca-card-desc">
                                    Reach B2B influencers and thought leaders directly via LinkedIn messages
                                </p>
                                <p className="ca-warning">
                                    ⚠️ Requires LinkedIn Partner Program access
                                </p>

                                <div className="ca-card-bottom">
                                    <span className="ca-phase-badge">Available in Phase 2</span>
                                    <div className="ca-tooltip-wrap">
                                        <button className="ca-btn-connect" disabled>
                                            Connect LinkedIn
                                        </button>
                                        <span className="ca-tooltip">Coming in Phase 2</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ═══════════ Security Note ═══════════ */}
                    <div className="ca-security">
                        <div className="ca-security-header">
                            <span className="ca-security-icon">🔒</span>
                            Your connections are secure
                        </div>
                        <p>
                            Clinch uses official OAuth and API integrations only. We never store your
                            passwords and only request the minimum permissions needed. 100% White Hat — no
                            grey-area automation.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
