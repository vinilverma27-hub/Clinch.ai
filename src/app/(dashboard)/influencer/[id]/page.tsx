"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OutreachModal } from "../../search/OutreachModal";
import "./profile.css";

/* ════════════════════════════════════════════════
   Avatar Colors (letter-based)
   ════════════════════════════════════════════════ */
const avatarColors: Record<string, string> = {
    A: '#E8A87C', B: '#85C1E9', C: '#82E0AA',
    D: '#F8C471', E: '#C39BD3', F: '#F1948A',
    G: '#76D7C4', H: '#F0B27A', I: '#AED6F1',
    J: '#A9DFBF', K: '#FAD7A0', L: '#D2B4DE',
    M: '#A3E4D7', N: '#F9E79F', O: '#FDEBD0',
    P: '#D5E8D4', Q: '#DAE8FC', R: '#FFE6CC',
    S: '#E1D5E7', T: '#D5E8D4', U: '#FFF2CC',
    V: '#F8CECC', W: '#DAE8FC', X: '#D5E8D4',
    Y: '#FFE6CC', Z: '#E1D5E7',
};

/* ════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════ */
function formatFollowers(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

function formatCost(min: number, max: number): string {
    const fmt = (v: number) => {
        if (v >= 100_000) return `₹${(v / 100_000).toFixed(0)}L`;
        if (v >= 1_000) return `₹${(v / 1_000).toFixed(0)}k`;
        return `₹${v}`;
    };
    return `${fmt(min)}–${fmt(max)}`;
}

function getProfileUrl(platform: string, handle: string): string {
    const cleanHandle = handle.replace('@', '');
    switch (platform.toLowerCase()) {
        case 'instagram': return `https://instagram.com/${cleanHandle}`;
        case 'youtube': return `https://youtube.com/@${cleanHandle}`;
        case 'linkedin': return `https://linkedin.com/in/${cleanHandle}`;
        default: return '#';
    }
}

function getPlatformLabel(platform: string): { emoji: string; label: string; className: string } {
    switch (platform.toLowerCase()) {
        case 'instagram': return { emoji: '📸', label: 'Instagram', className: 'instagram' };
        case 'youtube': return { emoji: '▶️', label: 'YouTube', className: 'youtube' };
        case 'linkedin': return { emoji: '💼', label: 'LinkedIn', className: 'linkedin' };
        default: return { emoji: '📱', label: platform, className: 'default' };
    }
}

/* ════════════════════════════════════════════════
   SVG Icons
   ════════════════════════════════════════════════ */
function IconPin({ className = "w-3.5 h-3.5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
    );
}

function IconGlobe({ className = "w-3.5 h-3.5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
    );
}

function IconVerified({ className = "w-3.5 h-3.5", style }: { className?: string, style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
    );
}

function IconUsers({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
    );
}

function IconHeart({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l10.61-10.61 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
    );
}

function IconMessage({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
    );
}

function IconEye({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function IconCalendar({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function IconTrendingUp({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
        </svg>
    );
}

/* ════════════════════════════════════════════════
   Page Component
   ════════════════════════════════════════════════ */
export default function InfluencerProfilePage() {
    const router = useRouter();
    const [influencer, setInfluencer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // CRM state
    const [inCRM, setInCRM] = useState(false);
    const [addingCRM, setAddingCRM] = useState(false);

    // Outreach modal
    const [showOutreach, setShowOutreach] = useState(false);

    // Animated score
    const [animatedScore, setAnimatedScore] = useState(0);

    // Read data from sessionStorage on mount, fallback to API
    useEffect(() => {
        const raw = sessionStorage.getItem('clinch_influencer');
        let parsed: any = null;
        if (raw) {
            try {
                parsed = JSON.parse(raw);
                setInfluencer(parsed);
            } catch {
                parsed = null;
            }
        }

        const id = window.location.pathname.split('/').pop();

        async function fetchInfluencerStatus(inf: any, influencerId: string) {
             try {
                const res = await fetch(`/api/crm/entries`);
                const data = await res.json();
                 const inCrm = data.entries?.some((e: any) => 
                     e.influencer_id === influencerId ||
                     e.influencer_id === inf?.id || 
                     (inf?.external_id && e.influencers?.external_id === inf.external_id)
                 );
                 if (inCrm) setInCRM(true);
             } catch (err) {
                 console.error("Failed to check CRM status", err);
             }
        }

        if (parsed) {
             fetchInfluencerStatus(parsed, parsed.id);
             setLoading(false);
        } else if (id) {
            // Fetch from backend
            fetch(`/api/search/influencers/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.influencer) {
                         setInfluencer(data.influencer);
                         fetchInfluencerStatus(data.influencer, id);
                    }
                })
                .catch(err => console.error("Failed to fetch influencer:", err))
                .finally(() => setLoading(false));
            
        } else {
             setLoading(false);
        }
    }, []);

    // Animate score bar on mount
    useEffect(() => {
        if (influencer?.match_score) {
            const timer = setTimeout(() => {
                setAnimatedScore(influencer.match_score);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [influencer]);

    // CRM handler
    async function handleAddToCRM() {
        if (inCRM || addingCRM) return;
        setAddingCRM(true);
        try {
            const res = await fetch('/api/crm/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    influencer,
                    match_score: influencer.match_score,
                    ai_insight: influencer.ai_insight,
                }),
            });
            if (res.ok) setInCRM(true);
        } finally {
            setAddingCRM(false);
        }
    }

    // Start outreach
    function handleStartOutreach() {
        if (!inCRM) {
            handleAddToCRM().then(() => setShowOutreach(true));
        } else {
            setShowOutreach(true);
        }
    }

    // ─── Loading ───
    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="profile-loading-spinner" />
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    // ─── Not Found ───
    if (!influencer) {
        return (
            <div className="profile-page">
                <div className="profile-not-found">
                    <p>Profile not found.</p>
                    <button onClick={() => router.back()}>← Go back</button>
                </div>
            </div>
        );
    }

    // ─── Derive values ───
    const firstLetter = (influencer.full_name?.[0] || 'A').toUpperCase();
    const avatarBg = avatarColors[firstLetter] || '#E8DDD4';
    const initials = influencer.full_name
        ? influencer.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
        : 'NA';
    const platform = getPlatformLabel(influencer.platform || '');
    const profileUrl = getProfileUrl(influencer.platform || '', influencer.handle || '');
    const matchScore = influencer.match_score || 0;
    const scoreColor = matchScore >= 75 ? 'green' : matchScore >= 50 ? 'amber' : 'red';
    
    // Defaulting missing metrics safely
    const gender = influencer.gender || 'Not specified';
    const languages = Array.isArray(influencer.language)
        ? influencer.language.map((l: string) => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')
        : influencer.language || 'Not specified';
    const city = influencer.city || 'Not specified';

    // Engagement Metrics
    const followers = influencer.followers || 0;
    const engagementRate = influencer.engagement_rate || 0;
    const avgViews = influencer.avg_views || 0;
    const avgLikes = influencer.avg_likes || 0;
    const avgComments = influencer.avg_comments || 0;

    // Audience Details
    const audienceAge = influencer.audience_age || '18-24 yrs';
    const audienceGender = influencer.audience_gender || 'Mixed';
    const audienceLocation = influencer.audience_location || influencer.city || 'India';
    const fakeFollowers = influencer.fake_follower_percentage ? `${influencer.fake_follower_percentage}%` : 'N/A';

    // Pricing
    const estCostPost = formatCost(influencer.estimated_cost_min || 0, influencer.estimated_cost_max || 0);
    const estCostStory = influencer.estimated_cost_story ? `₹${influencer.estimated_cost_story}` : 'TBD';
    const estCostReel = influencer.estimated_cost_reel ? `₹${influencer.estimated_cost_reel}` : 'TBD';

    // Content Details
    const postingFreq = influencer.posting_frequency || '4-5x per week';
    const contentFormats = influencer.content_formats || 'Reels, Carousels, Stories';
    const avgReelViews = influencer.avg_reel_views ? formatFollowers(influencer.avg_reel_views) : formatFollowers(avgViews);
    const avgStoryViews = influencer.avg_story_views ? formatFollowers(influencer.avg_story_views) : 'TBD';
    const avgPostViews = influencer.avg_post_views ? formatFollowers(influencer.avg_post_views) : formatFollowers(avgViews);

    const scoreBreakdown = influencer.score_breakdown || null;
    const brandCollabs = influencer.brand_collabs || influencer.past_brands || [];

    return (
        <div className="profile-page">
            {/* ─── Back Link ─── */}
            <button className="profile-back" onClick={() => router.back()}>
                ← Back to Search Results
            </button>

            {/* ─── Hero Card ─── */}
            <div className="profile-section">
                <div className="profile-hero">
                    <div className="profile-hero-avatar" style={{ background: avatarBg }}>
                        {initials}
                    </div>

                    <div className="profile-hero-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h1 className="profile-hero-name">{influencer.full_name}</h1>
                            {influencer.is_verified && <IconVerified className="w-5 h-5" style={{ color: '#2E7D32' }} />}
                        </div>
                        <p className="profile-hero-handle">@{(influencer.handle || '').replace('@', '')}</p>

                        <div className="profile-hero-meta">
                            <span className={`profile-platform-badge ${platform.className}`}>
                                {platform.emoji} {platform.label}
                            </span>
                            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="profile-view-link">
                                View Profile ↗
                            </a>
                        </div>
                    </div>

                    <div className="profile-hero-crm-btn">
                        <button className={`profile-btn-crm ${inCRM ? 'added' : ''}`} onClick={handleAddToCRM} disabled={addingCRM || inCRM}>
                            {addingCRM ? 'Adding...' : inCRM ? '✅ In CRM' : '+ Add to CRM'}
                        </button>
                    </div>
                </div>

                {influencer.bio && (
                    <div style={{ marginTop: '20px' }}>
                        <p className="profile-bio">{influencer.bio}</p>
                    </div>
                )}

                <div className="profile-meta-tags" style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span className="profile-meta-pill"><IconPin /> {city}</span>
                    <span className="profile-meta-pill"><IconGlobe /> {languages}</span>
                    <span className="profile-meta-pill">👤 {gender}</span>
                </div>
            </div>

            {/* ─── AI Match Score ─── */}
            {matchScore > 0 && (
                <div className="profile-section">
                    <div className="profile-ai-score">
                        <span className="profile-ai-score-label">✦ AI Match Score</span>
                        <span className="profile-ai-score-value">{matchScore}%</span>
                    </div>
                    <div className="profile-score-track">
                        <div className={`profile-score-fill ${scoreColor}`} style={{ width: `${animatedScore}%` }} />
                    </div>
                    {influencer.ai_insight && (
                        <p className="profile-ai-insight-text" style={{ marginTop: '12px' }}>"{influencer.ai_insight}"</p>
                    )}
                </div>
            )}

            {/* ─── Two Column Layout ─── */}
            <div className="profile-two-col">
                {/* LEFT COLUMN */}
                <div className="profile-col-left">

                    {/* Engagement Metrics */}
                    <div className="profile-section">
                        <p className="profile-section-title">Engagement Metrics</p>
                        <div className="profile-detail-row">
                            <span className="profile-detail-label"><IconUsers className="w-3.5 h-3.5 inline mr-2 opacity-60" /> Followers</span>
                            <span className="profile-detail-value">{formatFollowers(followers)}</span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="profile-detail-label"><IconTrendingUp className="w-3.5 h-3.5 inline mr-2 opacity-60" /> Engagement Rate</span>
                            <span className="profile-detail-value" style={{ color: engagementRate > 4 ? '#10B981' : '#F59E0B' }}>
                                {engagementRate}%
                            </span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="profile-detail-label"><IconEye className="w-3.5 h-3.5 inline mr-2 opacity-60" /> Avg Views</span>
                            <span className="profile-detail-value">{formatFollowers(avgViews)}</span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="profile-detail-label"><IconHeart className="w-3.5 h-3.5 inline mr-2 opacity-60" /> Avg Likes</span>
                            <span className="profile-detail-value">{formatFollowers(avgLikes)}</span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="profile-detail-label"><IconMessage className="w-3.5 h-3.5 inline mr-2 opacity-60" /> Avg Comments</span>
                            <span className="profile-detail-value">{formatFollowers(avgComments)}</span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="profile-detail-label"><IconCalendar className="w-3.5 h-3.5 inline mr-2 opacity-60" /> Posting Frequency</span>
                            <span className="profile-detail-value">{postingFreq}</span>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="profile-section">
                        <p className="profile-section-title">Pricing Estimates</p>
                        <div className="profile-detail-row">
                            <span className="profile-detail-label">Post</span>
                            <span className="profile-detail-value">{estCostPost}</span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="profile-detail-label">Story</span>
                            <span className="profile-detail-value">{estCostStory}</span>
                        </div>
                        <div className="profile-detail-row">
                            <span className="profile-detail-label">Reel / Video</span>
                            <span className="profile-detail-value">{estCostReel}</span>
                        </div>
                    </div>
                    
                    {/* Past Brand Collabs */}
                    {brandCollabs.length > 0 && (
                        <div className="profile-section">
                            <p className="profile-section-title">Past Brand Collabs</p>
                            <div className="profile-collab-pills">
                                {brandCollabs.map((brand: string, i: number) => (
                                    <span key={i} className="profile-collab-pill">{brand}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN */}
                <div className="profile-col-right">
                    
                    {/* Audience Details */}
                    <div className="profile-section">
                        <p className="profile-section-title">Audience Details</p>
                        <div className="profile-audience-row">
                            <span className="profile-detail-label">Age Range</span>
                            <span className="profile-detail-value">{audienceAge}</span>
                        </div>
                        <div className="profile-audience-row">
                            <span className="profile-detail-label">Gender Split</span>
                            <span className="profile-detail-value">{audienceGender}</span>
                        </div>
                        <div className="profile-audience-row">
                            <span className="profile-detail-label">Location Makeup</span>
                            <span className="profile-detail-value">{audienceLocation}</span>
                        </div>
                        <div className="profile-audience-row">
                            <span className="profile-detail-label">Fake Followers</span>
                            <span className="profile-detail-value" style={{ color: fakeFollowers !== 'N/A' ? '#EF4444' : '#A89585' }}>{fakeFollowers}</span>
                        </div>
                    </div>

                    {/* Content Details */}
                    <div className="profile-section">
                        <p className="profile-section-title">Content Details</p>
                        <div className="profile-audience-row">
                            <span className="profile-detail-label">Primary Platform</span>
                            <span className="profile-detail-value">{platform.label}</span>
                        </div>
                        <div className="profile-audience-row">
                            <span className="profile-detail-label">Formats</span>
                            <span className="profile-detail-value">{contentFormats}</span>
                        </div>
                        <div className="profile-audience-row">
                            <span className="profile-detail-label">Avg Reel Views</span>
                            <span className="profile-detail-value">{avgReelViews}</span>
                        </div>
                        <div className="profile-audience-row">
                            <span className="profile-detail-label">Avg Story Views</span>
                            <span className="profile-detail-value">{avgStoryViews}</span>
                        </div>
                        <div className="profile-audience-row">
                            <span className="profile-detail-label">Avg Post Views</span>
                            <span className="profile-detail-value">{avgPostViews}</span>
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    {scoreBreakdown && (
                        <div className="profile-section">
                            <p className="profile-section-title">AI Score Breakdown</p>
                            {Object.entries(scoreBreakdown).map(([key, val]: [string, any]) => {
                                const score = typeof val === 'object' ? val.score : val;
                                const max = typeof val === 'object' ? val.max : 100;
                                const pct = max > 0 ? (score / max) * 100 : 0;
                                const label = key
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, (c: string) => c.toUpperCase());
                                return (
                                    <div key={key} className="profile-breakdown-row">
                                        <div className="profile-breakdown-header">
                                            <span className="profile-breakdown-label">{label}</span>
                                            <span className="profile-breakdown-score">{score}/{max}</span>
                                        </div>
                                        <div className="profile-breakdown-track">
                                            <div
                                                className="profile-breakdown-fill"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Sticky Bottom CTA Bar ─── */}
            <div className="profile-sticky-cta">
                <button
                    className={`profile-btn-crm ${inCRM ? 'added' : ''}`}
                    onClick={handleAddToCRM}
                    disabled={addingCRM || inCRM}
                >
                    {addingCRM ? 'Adding...' : inCRM ? '✅ In CRM' : '+ Add to CRM'}
                </button>
                <button
                    className="profile-btn-outreach"
                    onClick={handleStartOutreach}
                >
                    ✉️ Start Outreach →
                </button>
            </div>

            {/* ─── Outreach Modal ─── */}
            {showOutreach && (
                <OutreachModal
                    influencer={influencer}
                    onClose={() => setShowOutreach(false)}
                    onSent={() => setShowOutreach(false)}
                />
            )}
        </div>
    );
}
