import "./auth.css";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="auth-layout">
            {/* ── Left Panel · Espresso ─────────────────────────── */}
            <div className="auth-left">
                <div>
                    {/* Brand */}
                    <div className="auth-left__brand">
                        <div className="auth-left__icon">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="4" width="18" height="18" rx="4" fill="#C4622D" />
                                <rect x="26" y="4" width="18" height="18" rx="4" fill="#C4622D" opacity="0.6" />
                                <rect x="4" y="26" width="18" height="18" rx="4" fill="#C4622D" opacity="0.6" />
                                <rect x="26" y="26" width="18" height="18" rx="4" fill="#C4622D" opacity="0.3" />
                            </svg>
                        </div>
                        <span className="auth-left__name">clinch.ai</span>
                    </div>

                    {/* Tagline */}
                    <h1 className="auth-left__tagline">
                        Hire an AI to Negotiate Your Influencer Deals
                    </h1>
                </div>

                {/* Social Proof Stats */}
                <div className="auth-left__stats">
                    <div className="auth-stat-card">
                        <div className="auth-stat-card__value">1,400+</div>
                        <div className="auth-stat-card__label">Brands</div>
                    </div>
                    <div className="auth-stat-card">
                        <div className="auth-stat-card__value">10K+</div>
                        <div className="auth-stat-card__label">Deals</div>
                    </div>
                    <div className="auth-stat-card">
                        <div className="auth-stat-card__value">₹2Cr+</div>
                        <div className="auth-stat-card__label">Saved</div>
                    </div>
                </div>
            </div>

            {/* ── Right Panel · Cream ───────────────────────────── */}
            <div className="auth-right">
                <div className="auth-form-wrapper">
                    {children}
                </div>
            </div>
        </div>
    );
}
