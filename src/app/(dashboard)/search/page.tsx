"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "./Toast";
import { OutreachModal } from "./OutreachModal";
import FilterDrawer, { FilterValues, DEFAULT_FILTERS } from "./FilterDrawer";
import "./search.css";

/* ════════════════════════════════════════════════
   Icons
   ════════════════════════════════════════════════ */
function IconUpload({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}

function IconFilter({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21V14" /><path d="M4 10V3" /><path d="M12 21V12" /><path d="M12 8V3" />
            <path d="M20 21V16" /><path d="M20 12V3" /><path d="M1 14h6" /><path d="M9 8h6" /><path d="M17 16h6" />
        </svg>
    );
}

function IconSend({ className = "w-[18px] h-[18px]" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
        </svg>
    );
}

function IconClose({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
        </svg>
    );
}

function IconVerified({ className = "w-3.5 h-3.5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
    );
}

function IconInstagram({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><path d="M17.5 6.5h.01" />
        </svg>
    );
}

function IconYouTube({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z" />
            <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" />
        </svg>
    );
}

function IconLinkedIn({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
        </svg>
    );
}

function IconTwitter({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l11.733 16h4.267l-11.733-16z" /><path d="M4 20l6.768-6.768" /><path d="M20 4l-6.768 6.768" />
        </svg>
    );
}

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

/* ════════════════════════════════════════════════
   Platform Icon Map
   ════════════════════════════════════════════════ */
const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Instagram: IconInstagram, YouTube: IconYouTube, LinkedIn: IconLinkedIn, Twitter: IconTwitter,
    instagram: IconInstagram, youtube: IconYouTube, linkedin: IconLinkedIn,
};

const platformEmoji: Record<string, string> = {
    Instagram: "📸", YouTube: "▶️", LinkedIn: "💼", Twitter: "🐦",
    instagram: "📸", youtube: "▶️", linkedin: "💼",
};

/* ════════════════════════════════════════════════
   Suggestion Pills Data
   ════════════════════════════════════════════════ */
const DEFAULT_SUGGESTIONS = [
    { emoji: "✨", text: "Sustainable fashion in Mumbai" },
    { emoji: "💪", text: "Fitness influencers on YouTube" },
    { emoji: "🍕", text: "Food bloggers under ₹15k" },
    { emoji: "💄", text: "Beauty micro-influencers" },
    { emoji: "📱", text: "Tech reviewers in Bangalore" },
    { emoji: "✈️", text: "Travel creators on Instagram" },
];

function getContextualPills(lastQuery: string): { emoji: string; text: string }[] {
    const q = lastQuery.toLowerCase();
    if (q.includes("fashion")) {
        return [
            { emoji: "💰", text: "Under ₹15k" },
            { emoji: "📸", text: "Nano only" },
            { emoji: "📍", text: "Delhi instead" },
            { emoji: "🔄", text: "More results" },
        ];
    }
    if (q.includes("fitness") || q.includes("gym")) {
        return [
            { emoji: "🏋️", text: "Supplement brands" },
            { emoji: "💪", text: "Macro only" },
            { emoji: "📍", text: "Add Mumbai filter" },
            { emoji: "🔄", text: "More results" },
        ];
    }
    if (q.includes("food") || q.includes("cook")) {
        return [
            { emoji: "📍", text: "Mumbai food creators" },
            { emoji: "💰", text: "Under ₹10k" },
            { emoji: "📸", text: "Instagram reels" },
            { emoji: "🔄", text: "More results" },
        ];
    }
    if (q.includes("tech") || q.includes("review")) {
        return [
            { emoji: "▶️", text: "YouTube only" },
            { emoji: "📍", text: "Bangalore based" },
            { emoji: "💰", text: "Under ₹25k" },
            { emoji: "🔄", text: "More results" },
        ];
    }
    return [
        { emoji: "📍", text: "Add location filter" },
        { emoji: "💰", text: "Budget under ₹20k" },
        { emoji: "📸", text: "Instagram only" },
        { emoji: "🔄", text: "More results" },
    ];
}

/* ════════════════════════════════════════════════
   Types
   ════════════════════════════════════════════════ */
interface InfluencerResult {
    id: string;
    external_id: string;
    platform: string;
    handle: string;
    full_name: string;
    bio: string;
    city: string;
    country: string;
    language: string[];
    followers: number;
    avg_views: number;
    avg_likes: number;
    avg_comments: number;
    engagement_rate: number;
    estimated_cost_min: number;
    estimated_cost_max: number;
    is_verified: boolean;
    niche: string;
    profile_pic_url: string | null;
    match_score: number;
    ai_insight: string;
}

interface ChatMessage {
    id: string;
    type: 'user' | 'ai';
    content: string;
    results?: InfluencerResult[];
    loading?: boolean;
    timestamp: Date;
    query?: string;
    filters_used?: any;
}

interface FilterChipDisplay {
    id: string;
    emoji: string;
    label: string;
}

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

function getAvatarGradient(platform: string): string {
    switch (platform.toLowerCase()) {
        case "instagram": return "linear-gradient(135deg, #C4622D, #E8956A)";
        case "youtube": return "linear-gradient(135deg, #D32F2F, #EF5350)";
        case "linkedin": return "linear-gradient(135deg, #1565C0, #42A5F5)";
        default: return "linear-gradient(135deg, #7B1FA2, #BA68C8)";
    }
}

function getInitials(name: string): string {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
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

function formatTime(d: Date): string {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function countActiveFilters(f: FilterValues): number {
    let count = 0;
    if (f.platforms.length > 0) count++;
    if (f.min_followers !== null || f.max_followers !== null) count++;
    if (f.max_budget_inr !== null) count++;
    if (f.location !== null) count++;
    if (f.min_engagement_rate !== null) count++;
    if (f.result_count !== 10) count++;
    if (f.gender !== null) count++;
    return count;
}

function buildFilterChips(applied: FilterValues): FilterChipDisplay[] {
    const chips: FilterChipDisplay[] = [];
    if (applied.platforms.length > 0) {
        applied.platforms.forEach((p) => {
            chips.push({
                id: `platform-${p}`,
                emoji: platformEmoji[p] || "📱",
                label: p.charAt(0).toUpperCase() + p.slice(1),
            });
        });
    }
    if (applied.location) {
        chips.push({ id: "location", emoji: "📍", label: applied.location });
    }
    if (applied.min_followers !== null || applied.max_followers !== null) {
        const label = applied.min_followers && applied.max_followers
            ? `${formatFollowers(applied.min_followers)}–${formatFollowers(applied.max_followers)}`
            : applied.min_followers
                ? `${formatFollowers(applied.min_followers)}+`
                : `Under ${formatFollowers(applied.max_followers!)}`;
        chips.push({ id: "followers", emoji: "👥", label });
    }
    if (applied.max_budget_inr) {
        const v = applied.max_budget_inr;
        const label = v >= 100000 ? `Under ₹${(v / 100000).toFixed(0)}L` : `Under ₹${(v / 1000).toFixed(0)}k`;
        chips.push({ id: "budget", emoji: "💰", label });
    }
    if (applied.min_engagement_rate) {
        chips.push({ id: "engagement", emoji: "📊", label: `${applied.min_engagement_rate}%+` });
    }
    if (applied.result_count !== 10) {
        chips.push({ id: "results", emoji: "🔢", label: `${applied.result_count} results` });
    }
    if (applied.gender) {
        chips.push({ 
            id: "gender", 
            emoji: "👤", 
            label: applied.gender.charAt(0).toUpperCase() + applied.gender.slice(1) 
        });
    }
    return chips;
}

/* ════════════════════════════════════════════════
   Page Component
   ════════════════════════════════════════════════ */
export default function SearchPage() {
    const router = useRouter();

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPills, setShowPills] = useState(true);

    // Filters
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filterValues, setFilterValues] = useState<FilterValues>(DEFAULT_FILTERS);
    const [filterChips, setFilterChips] = useState<FilterChipDisplay[]>([]);

    // CRM state
    const [addedToCRM, setAddedToCRM] = useState<Set<string>>(new Set());
    const [addingToCRM, setAddingToCRM] = useState<string | null>(null);

    // Outreach state
    const [outreachInfluencer, setOutreachInfluencer] = useState<any>(null);

    // Toast
    // Toast
    const { toasts, showToast, dismissToast } = useToast();

    // History and Persistence
    const [recentSessions, setRecentSessions] = useState<any[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Refs
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Track last query for contextual pills
    const [lastQuery, setLastQuery] = useState("");

    // Hide pills while typing
    useEffect(() => {
        setShowPills(inputText.trim().length === 0 && !isLoading);
    }, [inputText, isLoading]);

    // Load or Create Session on mount
    useEffect(() => {
        const initChat = async () => {
            try {
                // 1. Check if we have a current session in memory (not persistent across reloads yet, but let's check recent)
                const res = await fetch('/api/search/chat/sessions').catch(() => null);
                if (!res) return;
                const data = await res.json().catch(() => ({ sessions: [] }));
                
                if (data.requires_setup) {
                    showToast("Chat setup required. See guide.", "warning");
                    console.log("SQL TO RUN:", data.setup_sql);
                    return;
                }

                setRecentSessions(data.sessions || []);

                if (data.sessions?.length > 0) {
                    // Load the most recent session
                    const lastId = data.sessions[0].id;
                    const sessRes = await fetch(`/api/search/chat/sessions/${lastId}`).catch(() => null);
                    if (sessRes) {
                        const sessData = await sessRes.json().catch(() => ({}));
                        if (sessData.session) {
                            setCurrentSessionId(lastId);
                            setMessages((sessData.session.messages || []).map((m: any) => ({
                                ...m,
                                timestamp: new Date(m.timestamp)
                            })));
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to init chat", err);
            } finally {
                setIsLoading(false);
            }
        };

        initChat();

        window.addEventListener('clinch:search_completed', fetchSessions);
        return () => window.removeEventListener('clinch:search_completed', fetchSessions);
    }, []);

    // Fetch sessions for dropdown
    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/search/chat/sessions');
            if (!res.ok) return;
            const data = await res.json();
            setRecentSessions(data.sessions || []);
        } catch (err) {
            // Silently ignore
        }
    };

    // Auto-save messages to DB
    useEffect(() => {
        if (!currentSessionId || messages.length === 0 || isLoading) return;

        const timer = setTimeout(async () => {
            setIsSaving(true);
            try {
                await fetch(`/api/search/chat/sessions/${currentSessionId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        messages,
                        title: messages[0]?.type === 'user' ? messages[0].content.substring(0, 40) + '...' : 'New Discovery'
                    })
                });
            } catch (err) {
                console.error("Failed to save session", err);
            } finally {
                setIsSaving(false);
            }
        }, 1000); // Debounce saves

        return () => clearTimeout(timer);
    }, [messages, currentSessionId]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    // ─── Send handler ───
    const handleSend = async () => {
        const query = inputText.trim();
        const hasFilters = countActiveFilters(filterValues) > 0;
        if (!query && !hasFilters) return;
        if (isLoading) return;

        const displayText = query || 'Searching with filters...';

        // 1. Add user message to chat
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: displayText,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // 2. Clear input (keep filters)
        setInputText('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        setLastQuery(query);

        // 3. Add loading AI message
        const loadingId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, {
            id: loadingId,
            type: 'ai',
            content: '',
            loading: true,
            timestamp: new Date(),
        }]);

        setIsLoading(true);

        try {
            // 4. Call search API
            const parseRes = await fetch('/api/ai/search-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query || 'Manual filter search' }),
            });
            const parseData = await parseRes.json();

            if (parseData.error) throw new Error(parseData.error);

            // Merge AI-parsed filters with manual drawer filters
            const mergedFilters = {
                ...parseData.filters,
                // Manual filters override AI
                ...(filterValues.platforms.length > 0 && { platforms: filterValues.platforms }),
                ...(filterValues.location && { location: filterValues.location }),
                ...(filterValues.min_followers !== null && { min_followers: filterValues.min_followers }),
                ...(filterValues.max_followers !== null && { max_followers: filterValues.max_followers }),
                ...(filterValues.max_budget_inr !== null && { max_budget_inr: filterValues.max_budget_inr }),
                ...(filterValues.min_engagement_rate !== null && { min_engagement_rate: filterValues.min_engagement_rate }),
            };

            const searchRes = await fetch('/api/search/influencers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query || 'Manual filter search',
                    filters: mergedFilters,
                    limit: filterValues.result_count || 10,
                }),
            });
            const searchData = await searchRes.json();

            if (searchData.error) throw new Error(searchData.error);

            // 5. Replace loading message with real AI response
            const resultCount = searchData.results?.length || 0;
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId ? {
                    ...msg,
                    loading: false,
                    content: resultCount > 0
                        ? `Found ${resultCount} influencer${resultCount !== 1 ? 's' : ''} for "${query || 'your filters'}"`
                        : `No influencers matched "${query || 'your filters'}"`,
                    results: searchData.results || [],
                    query,
                    filters_used: mergedFilters,
                } : msg
            ));

            // 6. Save session — fire and forget, never block UI
            fetch('/api/search/chat/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    query: query || 'Manual filter search', 
                    results_count: resultCount,
                    filters: mergedFilters
                })
            }).catch(() => {});

            // Notify sidebar to refetch recent searches
            window.dispatchEvent(new CustomEvent('clinch:search_completed'));
        } catch (error: any) {
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId ? {
                    ...msg,
                    loading: false,
                    content: '⚠️ ' + (error?.message || 'Something went wrong. Please try again.'),
                    results: [],
                } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Key handler ───
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ─── Send with specific query (for auto-run) ───
    const handleSendWithQuery = (query: string) => {
        setInputText(query);
        // Need to use setTimeout so state updates first
        setTimeout(() => {
            const el = textareaRef.current;
            if (el) {
                el.value = query;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 120) + 'px';
            }
            // Trigger handleSend via a synthetic approach
            handleSendDirect(query);
        }, 50);
    };

    // ─── Direct send (bypasses input state) ───
    const handleSendDirect = async (query: string) => {
        const hasFilters = countActiveFilters(filterValues) > 0;
        if (!query && !hasFilters) return;
        if (isLoading) return;

        const displayText = query || 'Searching with filters...';

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: displayText,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        setLastQuery(query);

        const loadingId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, {
            id: loadingId,
            type: 'ai',
            content: '',
            loading: true,
            timestamp: new Date(),
        }]);

        setIsLoading(true);

        try {
            const parseRes = await fetch('/api/ai/search-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query || 'Manual filter search' }),
            });
            const parseData = await parseRes.json();
            if (parseData.error) throw new Error(parseData.error);

            const mergedFilters = {
                ...parseData.filters,
                ...(filterValues.platforms.length > 0 && { platforms: filterValues.platforms }),
                ...(filterValues.location && { location: filterValues.location }),
                ...(filterValues.min_followers !== null && { min_followers: filterValues.min_followers }),
                ...(filterValues.max_followers !== null && { max_followers: filterValues.max_followers }),
                ...(filterValues.max_budget_inr !== null && { max_budget_inr: filterValues.max_budget_inr }),
                ...(filterValues.min_engagement_rate !== null && { min_engagement_rate: filterValues.min_engagement_rate }),
            };

            const searchRes = await fetch('/api/search/influencers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query || 'Manual filter search',
                    filters: mergedFilters,
                    limit: filterValues.result_count || 10,
                }),
            });
            const searchData = await searchRes.json();
            if (searchData.error) throw new Error(searchData.error);

            const resultCount = searchData.results?.length || 0;
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId ? {
                    ...msg,
                    loading: false,
                    content: resultCount > 0
                        ? `Found ${resultCount} influencer${resultCount !== 1 ? 's' : ''} for "${query || 'your filters'}"`
                        : `No influencers matched "${query || 'your filters'}"`,
                    results: searchData.results || [],
                    query,
                    filters_used: mergedFilters,
                } : msg
            ));

            // Save session — fire and forget
            fetch('/api/search/chat/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    query: query || 'Manual filter search', 
                    results_count: resultCount,
                    filters: mergedFilters
                })
            }).catch(() => {});

            window.dispatchEvent(new CustomEvent('clinch:search_completed'));
        } catch (error: any) {
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId ? {
                    ...msg,
                    loading: false,
                    content: '⚠️ ' + (error?.message || 'Something went wrong. Please try again.'),
                    results: [],
                } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Auto-run saved query from sidebar ───
    useEffect(() => {
        const pendingQuery = sessionStorage.getItem('clinch_run_query');
        if (pendingQuery) {
            sessionStorage.removeItem('clinch_run_query');
            handleSendDirect(pendingQuery);
        }
    }, []);

    // ─── Pill click ───
    const handlePillClick = (text: string) => {
        setInputText(text);
        textareaRef.current?.focus();
        // Auto-resize
        if (textareaRef.current) {
            textareaRef.current.value = text;
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    // ─── New Chat ───
    const startNewChat = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const res = await fetch('/api/search/chat/sessions', { method: 'POST' });
            const data = await res.json();
            if (data.session) {
                setCurrentSessionId(data.session.id);
                setMessages([]);
                setInputText("");
                setFilterValues(DEFAULT_FILTERS);
                setFilterChips([]);
                setRecentSessions(prev => [data.session, ...prev]);
                showToast("Started a new discovery flow ✦", "success");
            }
        } catch (err) {
            showToast("Failed to create new chat", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSession = async (sessionId: string) => {
        setHistoryOpen(false);
        setIsLoading(true);
        try {
            const res = await fetch(`/api/search/chat/sessions/${sessionId}`);
            const data = await res.json();
            if (data.session) {
                setCurrentSessionId(data.session.id);
                setMessages((data.session.messages || []).map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                })));
                setInputText("");
                showToast("Conversation restored", "success");
            }
        } catch (err) {
            showToast("Failed to load conversation", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Apply filters from drawer ───
    const handleApplyFilters = (applied: FilterValues) => {
        setFilterValues(applied);
        setDrawerOpen(false);
        setFilterChips(buildFilterChips(applied));
        // Does NOT trigger search per RULE 3
    };

    // ─── Remove a filter chip ───
    const removeFilterChip = (chipId: string) => {
        // Reset the matching filter value
        setFilterValues(prev => {
            const updated = { ...prev };
            if (chipId.startsWith('platform-')) {
                const platform = chipId.replace('platform-', '');
                updated.platforms = prev.platforms.filter(p => p !== platform);
            } else if (chipId === 'location') {
                updated.location = null;
            } else if (chipId === 'followers') {
                updated.min_followers = null;
                updated.max_followers = null;
            } else if (chipId === 'budget') {
                updated.max_budget_inr = null;
            } else if (chipId === 'engagement') {
                updated.min_engagement_rate = null;
            } else if (chipId === 'results') {
                updated.result_count = 10;
            } else if (chipId === 'gender') {
                updated.gender = null;
            }
            setFilterChips(buildFilterChips(updated));
            return updated;
        });
    };

    // ─── CRM handler ───
    async function handleAddToCRM(influencer: InfluencerResult) {
        setAddingToCRM(influencer.id);
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
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setAddedToCRM(prev => new Set(prev).add(influencer.id));
            showToast('✅ Added to CRM!', 'success');
        } catch (error: any) {
            showToast('❌ Failed to add: ' + error.message, 'error');
        } finally {
            setAddingToCRM(null);
        }
    }

    // ─── Start Outreach handler ───
    async function handleStartOutreach(influencer: InfluencerResult) {
        if (!addedToCRM.has(influencer.id)) {
            await handleAddToCRM(influencer);
        }
        setOutreachInfluencer(influencer);
    }

    // ─── Open influencer profile ───
    function openProfile(influencer: InfluencerResult) {
        sessionStorage.setItem('clinch_influencer', JSON.stringify(influencer));
        router.push(`/influencer/${influencer.id}`);
    }

    // ─── File Upload Handlers ───
    function handleUploadClick() {
        fileInputRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            showToast(`📁 File "${file.name}" uploaded for analysis`, 'success');
            // Reset input so the same file can be uploaded again if needed
            e.target.value = '';
        }
    }

    // Determine pills to show
    const pillsToShow = messages.length > 0 && lastQuery
        ? getContextualPills(lastQuery)
        : DEFAULT_SUGGESTIONS;

    const hasActiveFilters = countActiveFilters(filterValues) > 0;
    const canSend = inputText.trim().length > 0 || hasActiveFilters;

    return (
        <div className="search-page">
            {/* ─── Header ─── */}
            <div className="search-header">
                <div className="header-left">
                    <h1 className="search-title">AI Search</h1>
                    <span className="agent-status-tag">Agent Online</span>
                </div>
                
                <div className="header-right">
                    <button className="btn-new-chat" onClick={startNewChat}>
                        <span>+</span> New Chat
                    </button>
                    
                    <div className="history-popover-wrap">
                        <button 
                            className={`header-history-btn ${historyOpen ? 'active' : ''}`}
                            onClick={() => setHistoryOpen(!historyOpen)}
                        >
                            🕒 Recent
                        </button>
                        
                        {historyOpen && (
                            <div className="history-dropdown">
                                <div className="history-dropdown-head">Recent Discoveries</div>
                                <div className="history-items">
                                    {recentSessions.length === 0 ? (
                                        <div className="history-empty">No recent chats</div>
                                    ) : (
                                        recentSessions.map(sess => (
                                            <button 
                                                key={sess.id} 
                                                className={`history-item ${sess.id === currentSessionId ? 'current' : ''}`} 
                                                onClick={() => loadSession(sess.id)}
                                            >
                                                <div className="history-item-query">{sess.title || 'New Discovery'}</div>
                                                <div className="history-item-meta">
                                                    Updated {new Date(sess.updated_at).toLocaleDateString()}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ─── Chat Area ─── */}
            <div className="chat-area">
                {messages.length === 0 && !isLoading ? (
                    /* Welcome state */
                    <div className="chat-welcome">
                        <div className="chat-welcome-icon">✦</div>
                        <h2 className="chat-welcome-heading">
                            What kind of influencer<br />are you looking for?
                        </h2>
                        <p className="chat-welcome-sub">
                            Describe in plain English — our AI understands
                        </p>
                    </div>
                ) : (
                    /* Chat messages */
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            msg.type === 'user' ? (
                                <UserBubble key={msg.id} message={msg} />
                            ) : msg.loading ? (
                                <AILoadingBlock key={msg.id} />
                            ) : (
                                <AIResponseBlock
                                    key={msg.id}
                                    message={msg}
                                    addedToCRM={addedToCRM}
                                    addingToCRM={addingToCRM}
                                    onAddToCRM={handleAddToCRM}
                                    onStartOutreach={handleStartOutreach}
                                    onOpenProfile={openProfile}
                                />
                            )
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* ─── Suggestion Pills ─── */}
            {showPills && (
                <div className="suggestion-pills-row">
                    <div className="suggestion-pills-scroll">
                        {pillsToShow.map((pill, i) => (
                            <button
                                key={i}
                                className="suggestion-pill"
                                onClick={() => handlePillClick(pill.text)}
                            >
                                <span className="pill-emoji">{pill.emoji}</span>
                                {pill.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Sticky Chat Input Bar ─── */}
            <div className="chat-input-sticky">
                {/* Active filter chips */}
                {filterChips.length > 0 && (
                    <div className="chat-filter-chips">
                        {filterChips.map((chip) => (
                            <span key={chip.id} className="chat-filter-chip">
                                {chip.emoji} {chip.label}
                                <button
                                    onClick={() => removeFilterChip(chip.id)}
                                    aria-label={`Remove ${chip.label}`}
                                >
                                    <IconClose className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Input row */}
                <div className="chat-input-row">
                    <textarea
                        ref={textareaRef}
                        value={inputText || ""}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for influencers..."
                        rows={1}
                        className="chat-textarea"
                    />
                    <button
                        className="chat-filter-btn"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open filters"
                    >
                        <IconFilter />
                        {hasActiveFilters && (
                            <span className="filter-badge-dot" />
                        )}
                    </button>
                    <button
                        className="chat-upload-btn"
                        onClick={handleUploadClick}
                        aria-label="Upload file"
                    >
                        <IconUpload />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                    />
                    <button
                        className={`chat-send-btn ${!canSend || isLoading ? 'disabled' : ''}`}
                        onClick={handleSend}
                        disabled={!canSend || isLoading}
                        aria-label="Send"
                    >
                        {isLoading ? (
                            <span className="send-spinner" />
                        ) : (
                            <IconSend className="w-[16px] h-[16px]" />
                        )}
                    </button>
                </div>
            </div>

            {/* ─── Filter Drawer ─── */}
            <FilterDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onApply={handleApplyFilters}
                currentFilters={filterValues}
            />

            {/* ─── Outreach Modal ─── */}
            {outreachInfluencer && (
                <OutreachModal
                    influencer={outreachInfluencer}
                    onClose={() => setOutreachInfluencer(null)}
                    onSent={() => {
                        const name = outreachInfluencer.full_name || outreachInfluencer.handle;
                        setOutreachInfluencer(null);
                        showToast(`✅ Email queued for ${name}`, 'success');
                    }}
                />
            )}

            {/* ─── Toast Notifications ─── */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}

/* ════════════════════════════════════════════════
   User Message Bubble
   ════════════════════════════════════════════════ */
function UserBubble({ message }: { message: ChatMessage }) {
    return (
        <div className="chat-msg-user-wrap">
            <div className="chat-msg-user">
                {message.content}
            </div>
            <span className="chat-msg-time">
                {formatTime(message.timestamp)}
            </span>
        </div>
    );
}

/* ════════════════════════════════════════════════
   AI Loading Block (typing indicator + skeleton)
   ════════════════════════════════════════════════ */
function AILoadingBlock() {
    return (
        <div className="chat-msg-ai-wrap">
            <div className="chat-ai-typing">
                <span className="ai-sparkle">✦</span>
                <span className="typing-dots">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                </span>
            </div>
            <p className="chat-ai-searching">Searching for influencers...</p>
            <div className="chat-skeleton-grid">
                {[0, 1].map((i) => (
                    <div key={i} className="skel-card" style={{ animationDelay: `${i * 0.15}s` }}>
                        <div className="skel-profile-row">
                            <div className="skel-avatar" />
                            <div className="skel-profile-lines">
                                <div className="skel-line skel-line-name" />
                                <div className="skel-line skel-line-handle" />
                            </div>
                        </div>
                        <div className="skel-stats-row">
                            <div className="skel-stat-box" />
                            <div className="skel-stat-box" />
                            <div className="skel-stat-box" />
                            <div className="skel-stat-box" />
                        </div>
                        <div className="skel-insight" />
                        <div className="skel-cta-row">
                            <div className="skel-cta" />
                            <div className="skel-cta" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════
   AI Response Block (results)
   ════════════════════════════════════════════════ */
interface AIResponseBlockProps {
    message: ChatMessage;
    addedToCRM: Set<string>;
    addingToCRM: string | null;
    onAddToCRM: (influencer: InfluencerResult) => void;
    onStartOutreach: (influencer: InfluencerResult) => void;
    onOpenProfile: (influencer: InfluencerResult) => void;
}

function AIResponseBlock({ message, addedToCRM, addingToCRM, onAddToCRM, onStartOutreach, onOpenProfile }: AIResponseBlockProps) {
    const hasResults = message.results && message.results.length > 0;

    return (
        <div className="chat-msg-ai-wrap">
            <div className="chat-ai-header">
                <span className="ai-sparkle">✦</span>
                <span className="chat-ai-summary">{message.content}</span>
            </div>

            {hasResults && (
                <>
                    <div className="chat-results-grid">
                        {message.results!.map((inf) => (
                            <InfluencerCard
                                key={inf.id}
                                data={inf}
                                isAdded={addedToCRM.has(inf.id)}
                                isAdding={addingToCRM === inf.id}
                                onAddToCRM={onAddToCRM}
                                onStartOutreach={onStartOutreach}
                                onOpenProfile={onOpenProfile}
                            />
                        ))}
                    </div>
                    <div className="chat-end-of-results">
                        ─── End of results ───
                    </div>
                </>
            )}

            {!hasResults && message.content.includes('No influencers') && (
                <p className="chat-ai-no-results-hint">
                    Try broadening your search — remove filters or use more general terms.
                </p>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════
   Influencer Card
   ════════════════════════════════════════════════ */
interface InfluencerCardProps {
    data: InfluencerResult;
    isAdded: boolean;
    isAdding: boolean;
    onAddToCRM: (influencer: InfluencerResult) => void;
    onStartOutreach: (influencer: InfluencerResult) => void;
    onOpenProfile: (influencer: InfluencerResult) => void;
}

function InfluencerCard({ data, isAdded, isAdding, onAddToCRM, onStartOutreach, onOpenProfile }: InfluencerCardProps) {
    const PlatformIcon = platformIcons[data.platform] || IconInstagram;

    return (
        <div className="influencer-card" onClick={() => onOpenProfile(data)}>
            <div className="card-top-row">
                <div className="card-top-left">
                    {data.is_verified && (
                        <span className="verified-badge">
                            <IconVerified /> Verified
                        </span>
                    )}
                    <button 
                        className="card-view-profile-link"
                        onClick={(e) => { e.stopPropagation(); onOpenProfile(data); }}
                    >
                        View Full Profile ↗
                    </button>
                </div>
                <div className="match-bar-container">
                    <span className="match-label">{data.match_score}% Match</span>
                    <div className="match-bar-bg">
                        <div className="match-bar-fill" style={{ width: `${data.match_score}%` }} />
                    </div>
                </div>
            </div>

            {/* Profile row */}
            <div className="profile-row">
                <div
                    className="profile-avatar"
                    style={{ background: getAvatarGradient(data.platform) }}
                >
                    {getInitials(data.full_name)}
                </div>
                <div className="profile-info">
                    <p className="profile-name">
                        {data.full_name}
                        <a
                            href={getProfileUrl(data.platform, data.handle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`View ${data.handle} on ${data.platform}`}
                            onClick={(e) => e.stopPropagation()}
                            className="platform-profile-link"
                        >
                            <PlatformIcon className="w-3.5 h-3.5" />
                        </a>
                    </p>
                    <p className="profile-handle">{data.handle}</p>
                    <div className="profile-meta">
                        <span className="profile-meta-item">
                            <IconPin /> {data.city}
                        </span>
                        <span className="profile-meta-item">
                            <IconGlobe /> {data.language.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(", ")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="stats-grid">
                <div className="stat-cell">
                    <p className="stat-label">Followers</p>
                    <p className="stat-value">{formatFollowers(data.followers)}</p>
                </div>
                <div className="stat-cell">
                    <p className="stat-label">Eng. Rate</p>
                    <p className="stat-value">{data.engagement_rate}%</p>
                </div>
                <div className="stat-cell">
                    <p className="stat-label">Avg Views</p>
                    <p className="stat-value">{formatFollowers(data.avg_views)}</p>
                </div>
                <div className="stat-cell">
                    <p className="stat-label">Est. Cost</p>
                    <p className="stat-value">{formatCost(data.estimated_cost_min, data.estimated_cost_max)}</p>
                </div>
            </div>

            {/* AI insight */}
            <div className="ai-insight">
                <p className="ai-insight-label">✨ AI Insight</p>
                <p>{data.ai_insight}</p>
            </div>

            {/* CTAs */}
            <div className="card-ctas">
                <button
                    className={`btn-outline ${isAdded ? 'btn-added' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onAddToCRM(data); }}
                    disabled={isAdding || isAdded}
                >
                    {isAdding ? '⏳ Adding...' : isAdded ? '✅ Added to CRM' : '+ Add to CRM'}
                </button>
                <button
                    className="btn-primary"
                    onClick={(e) => { e.stopPropagation(); onStartOutreach(data); }}
                >
                    ✉️ Start Outreach
                </button>
            </div>
        </div>
    );
}
