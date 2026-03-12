"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

/* ────────────── Icon Components ────────────── */
function IconHome({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
        </svg>
    );
}

function IconSearch({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
        </svg>
    );
}

function IconCreatorsCRM({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
            <path d="M9 3v18" />
        </svg>
    );
}

function IconAIAgent({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
            <circle cx="9" cy="16" r="1" fill="currentColor" />
            <circle cx="15" cy="16" r="1" fill="currentColor" />
        </svg>
    );
}

function IconMailbox({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 7l-10 7L2 7" />
        </svg>
    );
}

function IconTemplates({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
        </svg>
    );
}

function IconConnected({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
    );
}

function IconCampaignAnalytics({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
        </svg>
    );
}

function IconPostTracking({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}

function IconSettings({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    );
}

function IconSearchSmall({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
        </svg>
    );
}

function IconClock({ className = "w-[14px] h-[14px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    );
}

function IconSparkle({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
        </svg>
    );
}

function IconChevron({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

function IconChevronDown({ className = "w-3.5 h-3.5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

/* ────────────── Time Ago Helper ────────────── */
function timeAgo(dateString: string): string {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
}

/* ────────────── Nav Data ────────────── */
interface NavItemData {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    badge?: number | string;
    badgeType?: "count" | "pro" | "coming-soon";
    disabled?: boolean;
}

const mainNav: NavItemData[] = [
    { label: "Dashboard", icon: IconHome, href: "/" },
];

const discoverNav: NavItemData[] = [
    { label: "AI Search", icon: IconSearch, href: "/search" },
    { label: "Creators CRM", icon: IconCreatorsCRM, href: "/crm" },
];



const analyticsNav: NavItemData[] = [
    { label: "Campaign Analytics", icon: IconCampaignAnalytics, href: "/dashboard/campaigns" },
    { label: "Post Tracking", icon: IconPostTracking, href: "/dashboard/post-tracking" },
];

/* ────────────── Sidebar Component ────────────── */
export default function Sidebar() {
    const [collapsed] = useState(false);
    const [searchesOpen, setSearchesOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // ─── Recent Searches state ───
    const [searches, setSearches] = useState<any[]>([]);
    const [loadingSearches, setLoadingSearches] = useState(true);

    const [unreadCount, setUnreadCount] = useState<number>(0);

    const fetchRecentSearches = useCallback(async () => {
        try {
            const res = await fetch('/api/search/history');
            const data = await res.json();
            setSearches(data.searches || []);
        } catch { }
        finally { setLoadingSearches(false); }
    }, []);

    useEffect(() => {
        fetchRecentSearches();
    }, [fetchRecentSearches]);

    useEffect(() => {
        fetch('/api/outreach/drafts')
            .then(r => r.json())
            .then(data => {
                setUnreadCount(data.counts?.queued || 0)
            })
            .catch(() => {})
    }, [])

    // Refetch when a new search is completed
    useEffect(() => {
        const handler = () => fetchRecentSearches();
        window.addEventListener('clinch:search_completed', handler);
        return () => window.removeEventListener('clinch:search_completed', handler);
    }, [fetchRecentSearches]);

    const outreachNav: NavItemData[] = [
        { label: "Mailbox", icon: IconMailbox, href: "/mailbox", badge: unreadCount > 0 ? unreadCount : undefined, badgeType: "count" },
        { label: "Email Templates", icon: IconTemplates, href: "/templates" },
        { label: "Connected Accounts", icon: IconConnected, href: "/connected" },
    ];

    async function deleteSearch(id: string, e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        await fetch('/api/search/history', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        setSearches(prev => prev.filter(s => s.id !== id));
    }

    return (
        <aside
            className={`
        flex flex-col h-screen bg-bg-sidebar
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[260px]"}
        shrink-0
      `}
        >
            {/* ─── Logo ─── */}
            <div className="flex items-center gap-3 px-6 pt-5 pb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-brand-primary">
                    <IconSparkle className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <h1 className="text-[17px] font-semibold text-text-sidebar tracking-tight font-[family-name:var(--font-heading)]">
                            Clinch.ai
                        </h1>
                    </div>
                )}
            </div>

            {/* ─── Search Bar ─── */}
            <div className="px-4 mb-3">
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] bg-white/[0.06] border border-white/[0.06] hover:bg-white/[0.09] transition-colors cursor-pointer">
                    <IconSearchSmall className="w-4 h-4 text-text-sidebar-muted" />
                    {!collapsed && (
                        <span className="text-[13px] text-text-sidebar-muted">Search…</span>
                    )}
                    {!collapsed && (
                        <kbd className="ml-auto text-[10px] text-text-sidebar-muted bg-white/[0.06] px-1.5 py-0.5 rounded font-mono">
                            ⌘K
                        </kbd>
                    )}
                </div>
            </div>

            {/* ─── Scrollable Nav Area ─── */}
            <nav className="flex-1 overflow-y-auto sidebar-scroll px-3">
                {/* Main Section */}
                <NavSection label="Main">
                    {mainNav.map((item) => (
                        <NavItem key={item.label} {...item} collapsed={collapsed} pathname={pathname} />
                    ))}
                </NavSection>

                {/* Discover Section */}
                <NavSection label="Discover">
                    {discoverNav.map((item) => (
                        <NavItem key={item.label} {...item} collapsed={collapsed} pathname={pathname} />
                    ))}
                </NavSection>

                {/* Outreach Section */}
                <NavSection label="Outreach">
                    {outreachNav.map((item) => (
                        <NavItem key={item.label} {...item} collapsed={collapsed} pathname={pathname} />
                    ))}
                </NavSection>

                {/* Analytics Section */}
                <NavSection label="Analytics">
                    {analyticsNav.map((item) => (
                        <NavItem key={item.label} {...item} collapsed={collapsed} pathname={pathname} />
                    ))}
                </NavSection>

                {/* Recent Searches Section */}
                {!collapsed && (
                    <div className="mt-3 mb-1">
                        <button
                            onClick={() => setSearchesOpen(!searchesOpen)}
                            className="flex items-center justify-between w-full px-3 mb-1.5 group"
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B5B4E]">
                                Recent Searches
                            </p>
                            <IconChevronDown
                                className={`w-3 h-3 text-[#6B5B4E] transition-transform duration-200 ${searchesOpen ? "" : "-rotate-90"
                                    }`}
                            />
                        </button>
                        {searchesOpen && (
                            <div className="space-y-0">
                                {/* Loading state */}
                                {loadingSearches && (
                                    <>
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} className="px-3 py-1.5">
                                                <div
                                                    className="h-[36px] rounded-lg bg-white/[0.06]"
                                                    style={{
                                                        width: `${70 + i * 5}%`,
                                                        animation: 'pulse 1.5s ease-in-out infinite',
                                                        animationDelay: `${i * 0.15}s`,
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Empty state */}
                                {!loadingSearches && searches.length === 0 && (
                                    <p className="px-3 py-2 text-[12px] text-[rgba(245,240,232,0.3)] italic">
                                        No recent searches yet
                                    </p>
                                )}

                                {/* Search items */}
                                {!loadingSearches && searches.map((search) => (
                                    <div
                                        key={search.id}
                                        className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all cursor-pointer group"
                                        onClick={() => {
                                            router.push('/search');
                                            sessionStorage.setItem('clinch_run_query', search.query);
                                        }}
                                    >
                                        <span className="text-[12px] opacity-50 flex-shrink-0">🔍</span>
                                        <div className="flex-1 min-w-0">
                                            <span className="block text-[13px] text-[rgba(245,240,232,0.85)] truncate max-w-[140px]">
                                                {search.query}
                                            </span>
                                            <span className="block text-[11px] text-[rgba(245,240,232,0.4)] mt-[2px]">
                                                {search.results_count} results · {timeAgo(search.created_at)}
                                            </span>
                                        </div>
                                        <button
                                            className="opacity-0 group-hover:opacity-100 bg-transparent border-none text-[rgba(245,240,232,0.4)] cursor-pointer text-[12px] px-1 py-[2px] rounded flex-shrink-0 transition-opacity duration-150 hover:text-[rgba(245,240,232,0.7)]"
                                            onClick={(e) => deleteSearch(search.id, e)}
                                            aria-label="Delete search"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings */}
                <div className="mt-2 pb-2">
                    <NavItem
                        label="Settings"
                        icon={IconSettings}
                        href="/settings"
                        collapsed={collapsed}
                        pathname={pathname}
                    />
                </div>
            </nav>

            {/* ─── Upgrade Card ─── */}
            {!collapsed && (
                <div className="px-4 mb-2">
                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/20 px-3.5 py-3">
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-text-sidebar mb-0.5">
                                    Upgrade to Pro
                                </p>
                                <p className="text-[10px] text-text-sidebar-muted leading-snug">
                                    Unlimited campaigns & AI
                                </p>
                            </div>
                            <button className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-[11px] font-semibold rounded-lg transition-colors shrink-0">
                                Upgrade
                            </button>
                        </div>
                        <div className="absolute -top-6 -right-6 w-16 h-16 bg-brand-primary/20 rounded-full blur-2xl" />
                    </div>
                </div>
            )}

            {/* ─── User Profile ─── */}
            <div className="px-4 pb-3 pt-1.5 border-t border-white/[0.06]">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer group">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-[#D4784A] flex items-center justify-center text-white text-[12px] font-semibold">
                            VV
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-[2px] border-[#1C1410]" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-text-sidebar truncate">
                                Vinil Verma
                            </p>
                            <p className="text-[11px] text-text-sidebar-muted truncate">
                                Pro Plan
                            </p>
                        </div>
                    )}
                    {!collapsed && (
                        <IconChevron className="w-4 h-4 text-text-sidebar-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>
            </div>
        </aside>
    );
}

/* ────────────── Sub-components ────────────── */
function NavSection({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-1">
            <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B5B4E]">
                {label}
            </p>
            <div className="space-y-0">{children}</div>
        </div>
    );
}

function NavItem({
    label,
    icon: Icon,
    href,
    badge,
    badgeType,
    disabled = false,
    collapsed = false,
    pathname = "",
}: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    badge?: number | string;
    badgeType?: "count" | "pro" | "coming-soon";
    disabled?: boolean;
    collapsed?: boolean;
    pathname?: string;
}) {
    const active = href ? pathname === href : false;

    const content = (
        <>
            <Icon
                className={`w-[18px] h-[18px] ${active ? "text-brand-primary" : "text-text-sidebar-muted group-hover:text-text-sidebar"
                    } transition-colors flex-shrink-0`}
            />
            {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
            {!collapsed && badge !== undefined && badgeType === "count" && (
                <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full text-[11px] font-semibold px-1.5 bg-brand-primary text-white ml-auto">
                    {badge}
                </span>
            )}
            {!collapsed && badge !== undefined && badgeType === "pro" && (
                <span className="text-[10px] font-semibold bg-brand-primary text-[#F5F0E8] px-1.5 py-[2px] rounded-full ml-auto">
                    {badge}
                </span>
            )}
            {!collapsed && badge !== undefined && badgeType === "coming-soon" && (
                <span className="text-[10px] font-medium bg-white/[0.1] text-text-sidebar-muted px-1.5 py-[2px] rounded-full ml-auto whitespace-nowrap">
                    {badge}
                </span>
            )}
        </>
    );

    const className = `
        flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium
        transition-all group relative
        ${disabled
            ? "opacity-40 cursor-not-allowed text-text-sidebar-muted"
            : active
                ? "text-brand-primary bg-brand-primary/[0.15]"
                : "text-text-sidebar-muted hover:text-text-sidebar hover:bg-white/[0.06]"
        }
    `;

    // Active indicator bar
    const activeBar = active ? (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-brand-primary rounded-r-sm" />
    ) : null;

    if (disabled || !href) {
        return (
            <button className={className} disabled={disabled}>
                {activeBar}
                {content}
            </button>
        );
    }

    return (
        <Link href={href} className={className}>
            {activeBar}
            {content}
        </Link>
    );
}
