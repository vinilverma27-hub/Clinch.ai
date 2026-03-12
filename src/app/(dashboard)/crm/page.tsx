"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";
import "./crm.css";
import "../search/search.css";
import { OutreachModal } from "../search/OutreachModal";
import { useRouter } from "next/navigation";

/* ════════════════════════════════════════════════
   Icons
   ════════════════════════════════════════════════ */
function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
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

function IconSparkle({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
        </svg>
    );
}

/* ════════════════════════════════════════════════
   Types & Constants
   ════════════════════════════════════════════════ */
type ViewMode = "table" | "kanban";
type StatusKey = "not_contacted" | "email_sent" | "replied" | "negotiating" | "deal_closed" | "rejected";

interface CrmEntry {
    id: string; // From crm_entries
    status: StatusKey;
    notes: string;
    campaign_name: string;
    estimated_cost: string;
    match_score: number;
    ai_insight: string;
    updated_at: string;
    influencer_id: string;
    influencers: {
        id: string;
        handle: string;
        full_name: string;
        platform: string;
        city: string | null;
        followers: number;
        engagement_rate: number;
        estimated_cost_min: number;
        estimated_cost_max: number;
        is_verified: boolean;
        niche: string | null;
        avatar_url: string | null;
        external_id: string;
        bio: string | null;
        brand_collabs_past: unknown[] | null;
    };
}

interface PipelineStats {
    total: number;
    not_contacted: number;
    email_sent: number;
    replied: number;
    negotiating: number;
    deal_closed: number;
    rejected: number;
}

const STATUS_CONFIG: Record<StatusKey, { label: string; className: string; dotColor: string }> = {
    "not_contacted": { label: "Not Contacted", className: "status-not-contacted", dotColor: "#9CA3AF" },
    "email_sent": { label: "Email Sent", className: "status-email-sent", dotColor: "#3B82F6" },
    "replied": { label: "Replied", className: "status-replied", dotColor: "#D97706" },
    "negotiating": { label: "Negotiating", className: "status-negotiating", dotColor: "#EA580C" },
    "deal_closed": { label: "Deal Closed", className: "status-deal-closed", dotColor: "#16A34A" },
    "rejected": { label: "Rejected", className: "status-rejected", dotColor: "#E11D48" }
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as StatusKey[];

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    instagram: IconInstagram,
    youtube: IconYouTube,
    linkedin: IconLinkedIn,
    Instagram: IconInstagram,
    YouTube: IconYouTube,
    LinkedIn: IconLinkedIn,
};

const platformColorClass: Record<string, string> = {
    instagram: "platform-instagram",
    youtube: "platform-youtube",
    linkedin: "platform-linkedin",
    Instagram: "platform-instagram",
    YouTube: "platform-youtube",
    LinkedIn: "platform-linkedin",
};

// Map profile hashes to gradients
const gradients = [
    "linear-gradient(135deg, #C4622D, #E8956A)",
    "linear-gradient(135deg, #2E7D32, #66BB6A)",
    "linear-gradient(135deg, #7B1FA2, #BA68C8)",
    "linear-gradient(135deg, #1565C0, #42A5F5)",
    "linear-gradient(135deg, #D32F2F, #EF5350)",
    "linear-gradient(135deg, #F57F17, #FFB74D)",
    "linear-gradient(135deg, #E91E63, #F48FB1)",
    "linear-gradient(135deg, #00897B, #4DB6AC)",
    "linear-gradient(135deg, #5D4037, #8D6E63)"
];

const getGradient = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
};

const getInitials = (name: string, handle: string) => {
    if (name) {
        return name.substring(0, 2).toUpperCase();
    }
    return handle.replace('@', '').substring(0, 2).toUpperCase();
};

const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const timeAgo = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMins = Math.floor(diffTime / (1000 * 60));
            return `${diffMins} min ago`;
        }
        return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const STATUS_OPTIONS = [
    { value: 'not_contacted', label: 'Not Contacted', bg: '#F5F0E8', color: '#A89585' },
    { value: 'email_sent', label: 'Email Sent', bg: '#EFF6FF', color: '#3B82F6' },
    { value: 'replied', label: 'Replied', bg: '#FFFBEB', color: '#D97706' },
    { value: 'negotiating', label: 'Negotiating', bg: '#FFF7ED', color: '#EA580C' },
    { value: 'deal_closed', label: 'Deal Closed', bg: '#F0FDF4', color: '#16A34A' },
    { value: 'rejected', label: 'Rejected', bg: '#FFF1F2', color: '#E11D48' },
];

function getStatusStyle(status: string) {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

/* ════════════════════════════════════════════════
   Main Page Component
   ════════════════════════════════════════════════ */
export default function CRMPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [influencers, setInfluencers] = useState<CrmEntry[]>([]);
    const [stats, setStats] = useState<PipelineStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [platformFilter, setPlatformFilter] = useState("all");
    const [campaignFilter, setCampaignFilter] = useState("all");
    const [sortCol, setSortCol] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [openStatusId, setOpenStatusId] = useState<string | null>(null);
    const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<StatusKey | null>(null);
    const [outreachInfluencer, setOutreachInfluencer] = useState<Record<string, unknown> | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [bulkStatusOpen, setBulkStatusOpen] = useState(false);

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    const PER_PAGE = 25;
    const router = useRouter();
    const { showToast: globalShowToast } = useToast();

    const showToast = useCallback((msg: string) => {
        if (msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("error")) {
            globalShowToast("error", msg);
        } else if (msg.toLowerCase().includes("importing")) {
            globalShowToast("info", msg);
        } else {
            globalShowToast("success", msg.replace(" ✓", ""));
        }
    }, [globalShowToast]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [entriesRes, statsRes] = await Promise.all([
                fetch('/api/crm/entries'),
                fetch('/api/crm/stats')
            ]);

            if (entriesRes.ok) {
                const data = await entriesRes.json();
                setInfluencers(data.entries || []);
            }
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch CRM data:", error);
            showToast("Failed to load pipeline data");
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ─── Filtering ───
    const filtered = influencers.filter((inf) => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const name = inf.influencers?.full_name?.toLowerCase() || '';
            const handle = inf.influencers?.handle?.toLowerCase() || '';
            if (!name.includes(q) && !handle.includes(q)) return false;
        }
        if (statusFilter !== "all" && inf.status !== statusFilter) return false;
        if (platformFilter !== "all" && inf.influencers?.platform?.toLowerCase() !== platformFilter.toLowerCase()) return false;
        if (campaignFilter !== "all" && inf.campaign_name !== campaignFilter) return false;
        return true;
    });

    // ─── Sorting ───
    const sorted = [...filtered].sort((a, b) => {
        if (!sortCol) return 0;
        const dir = sortDir === "asc" ? 1 : -1;
        switch (sortCol) {
            case "name": return dir * (a.influencers?.full_name || '').localeCompare(b.influencers?.full_name || '');
            case "platform": return dir * (a.influencers?.platform || '').localeCompare(b.influencers?.platform || '');
            case "followers": return dir * ((a.influencers?.followers || 0) - (b.influencers?.followers || 0));
            case "engRate": return dir * ((a.influencers?.engagement_rate || 0) - (b.influencers?.engagement_rate || 0));
            case "estCost": {
                return dir * (a.estimated_cost || '').localeCompare(b.estimated_cost || '');
            }
            case "status": return dir * (a.status || '').localeCompare(b.status || '');
            case "updatedAt": return dir * (new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime());
            default: return 0;
        }
    });

    // ─── Pagination ───
    const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    const paged = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    // ─── Campaigns for dropdown ───
    const campaigns = Array.from(new Set(influencers.map((i) => i.campaign_name).filter(Boolean)));

    // ─── Handlers ───
    const handleSort = (col: string) => {
        if (sortCol === col) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortCol(col);
            setSortDir("asc");
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paged.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paged.map((i) => i.id)));
        }
    };

    const copyEmail = (email: string) => {
        navigator.clipboard.writeText(email).catch(() => { });
        showToast("Email copied! ✓");
    };

    const changeStatus = async (id: string, newStatus: StatusKey) => {
        // Optimistic update
        const previousInfluencers = [...influencers];
        setInfluencers((prev) => prev.map((inf) => inf.id === id ? { ...inf, status: newStatus } : inf));
        setOpenStatusId(null);

        try {
            const res = await fetch(`/api/crm/entries/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Update failed");

            // Re-fetch stats in background
            fetch('/api/crm/stats')
                .then(r => r.json())
                .then(data => setStats(data))
                .catch(() => { });

        } catch (error) {
            console.error("Failed to update status:", error);
            showToast("Failed to update status");
            setInfluencers(previousInfluencers); // Revert
        }
    };

    const saveNote = async (id: string, note: string) => {
        // Optimistic update
        const previousInfluencers = [...influencers];
        setInfluencers((prev) => prev.map((inf) => inf.id === id ? { ...inf, notes: note } : inf));

        try {
            const res = await fetch(`/api/crm/entries/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: note })
            });
            if (!res.ok) throw new Error("Update failed");
            showToast("Note saved ✓");
        } catch (error) {
            console.error("Failed to save note:", error);
            showToast("Failed to save note");
            setInfluencers(previousInfluencers); // Revert
        }
    };

    const fetchStats = useCallback(async () => {
        const res = await fetch('/api/crm/stats');
        const data = await res.json();
        setStats(data);
    }, []);

    function handleOutreach(entry: CrmEntry) {
        const influencer = {
            id: entry.influencer_id,
            external_id: entry.influencers?.external_id || entry.influencer_id,
            handle: entry.influencers?.handle || 'unknown',
            full_name: entry.influencers?.full_name || 'Creator',
            platform: entry.influencers?.platform || 'instagram',
            niche: entry.influencers?.niche || '',
            city: entry.influencers?.city || '',
            bio: entry.influencers?.bio || '',
            followers: entry.influencers?.followers || 0,
            engagement_rate: entry.influencers?.engagement_rate || 0,
            estimated_cost_min: entry.influencers?.estimated_cost_min || 0,
            estimated_cost_max: entry.influencers?.estimated_cost_max || 0,
            brand_collabs_past: entry.influencers?.brand_collabs_past || [],
            match_score: entry.match_score || 0,
            ai_insight: entry.ai_insight || ''
        }
        setOutreachInfluencer(influencer);
    }

    function handleViewProfile(entry: CrmEntry & { score_breakdown?: unknown }) {
        const influencer = {
            ...entry.influencers,
            match_score: entry.match_score,
            ai_insight: entry.ai_insight,
            score_breakdown: entry.score_breakdown
        }
        sessionStorage.setItem('clinch_influencer', JSON.stringify(influencer));
        router.push(`/influencer/${entry.influencer_id}`);
    }

    async function handleDelete(entryId: string) {
        const previousInfluencers = [...influencers];
        setInfluencers(prev => prev.filter(e => e.id !== entryId));

        try {
            const res = await fetch(`/api/crm/entries/${entryId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            fetchStats();
            showToast("Removed from pipeline");
        } catch {
            setInfluencers(previousInfluencers);
            showToast("Failed to remove. Please try again.");
        }
    }

    const clearSelection = () => setSelectedIds(new Set());

    const bulkRemove = async () => {
        if (selectedIds.size === 0) return;
        
        const idsToDelete = Array.from(selectedIds);
        const previousInfluencers = [...influencers];
        setInfluencers((prev) => prev.filter((inf) => !selectedIds.has(inf.id)));
        setSelectedIds(new Set());

        try {
            // Sequential delete for now as API is single-id
            await Promise.all(idsToDelete.map(id => fetch(`/api/crm/entries/${id}`, { method: 'DELETE' })));
            fetchStats();
            showToast(`Removed ${idsToDelete.length} creators ✓`);
        } catch (error) {
            console.error("Bulk remove failed:", error);
            showToast("Failed to remove some creators");
            setInfluencers(previousInfluencers);
        }
    };

    const handleBulkStatusChange = async (newStatus: StatusKey) => {
        if (selectedIds.size === 0) return;
        const idsToUpdate = Array.from(selectedIds);
        const previousInfluencers = [...influencers];

        setInfluencers((prev) => prev.map((inf) => selectedIds.has(inf.id) ? { ...inf, status: newStatus } : inf));
        setBulkStatusOpen(false);
        setSelectedIds(new Set());

        try {
            await Promise.all(idsToUpdate.map(id =>
                fetch(`/api/crm/entries/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus })
                })
            ));
            fetchStats();
            showToast(`Updated status for ${idsToUpdate.length} creators ✓`);
        } catch (error) {
            console.error("Bulk status update failed:", error);
            showToast("Failed to update status for some creators");
            setInfluencers(previousInfluencers);
        }
    };

    const handleExport = () => {
        if (influencers.length === 0) {
            showToast("No data to export");
            return;
        }

        const headers = ["Name", "Handle", "Platform", "Followers", "Eng rate", "Est Cost", "Status", "Notes"];
        const rows = influencers.map(inf => [
            inf.influencers?.full_name || "",
            inf.influencers?.handle || "",
            inf.influencers?.platform || "",
            inf.influencers?.followers || 0,
            `${inf.influencers?.engagement_rate || 0}%`,
            inf.estimated_cost || "",
            inf.status || "",
            inf.notes || ""
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `crm_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("CRM data exported ✓");
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split("\n").filter(l => l.trim());
            if (lines.length <= 1) return;

            showToast(`Importing ${lines.length - 1} creators...`);

            // Skip header
            const entries = lines.slice(1).map(line => {
                const parts = line.split(",");
                return {
                    handle: parts[1]?.trim(),
                    platform: parts[2]?.trim()?.toLowerCase() || 'instagram',
                    full_name: parts[0]?.trim()
                };
            }).filter(e => e.handle);

            let successCount = 0;
            for (const entry of entries) {
                try {
                    const res = await fetch('/api/crm/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            influencer: {
                                handle: entry.handle,
                                platform: entry.platform,
                                full_name: entry.full_name
                            }
                        })
                    });
                    if (res.ok) successCount++;
                } catch (err) {
                    console.error("Import entry failed:", err);
                }
            }

            if (successCount > 0) {
                showToast(`Successfully imported ${successCount} creators ✓`);
                fetchData();
            } else {
                showToast("Import failed. Check CSV format.");
            }
        };
        reader.readAsText(file);
    };

    // ─── Drag and Drop ───
    const handleDragStart = (id: string) => setDragId(id);
    const handleDragEnd = () => { setDragId(null); setDragOverCol(null); };
    const handleDragOverCol = (status: StatusKey) => setDragOverCol(status);
    const handleDropOnCol = (status: StatusKey) => {
        if (dragId !== null) {
            changeStatus(dragId, status);
        }
        setDragId(null);
        setDragOverCol(null);
    };

    // Close status dropdown on outside click
    useEffect(() => {
        const handler = () => setOpenStatusId(null);
        if (openStatusId !== null) {
            document.addEventListener("click", handler);
            return () => document.removeEventListener("click", handler);
        }
    }, [openStatusId]);

    // ─── Eng rate color ───
    const engRateClass = (rate: number) => {
        if (rate > 5) return "eng-green";
        if (rate >= 3) return "eng-amber";
        return "eng-muted";
    };

    return (
        <div className="crm-page">
            {/* ─── Header ─── */}
            <div className="crm-header">
                <div className="crm-header-left">
                    <h1>Creators CRM</h1>
                    <p>Manage and track your creator pipeline</p>
                </div>
                <div className="crm-header-actions">
                    <label className="btn-ghost" style={{ cursor: 'pointer' }}>
                        ↑ Import CSV
                        <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
                    </label>
                    <button className="btn-ghost" onClick={handleExport}>↓ Export</button>
                    <button className="btn-terracotta" onClick={() => setIsAddModalOpen(true)}>+ Add Influencer</button>
                </div>
            </div>

            {/* ─── Pipeline Stats Bar ─── */}
            <div className="crm-stats-bar">
                <div className="stat-card">
                    <div className="stat-num">{isLoading || !stats ? "—" : stats.total}</div>
                    <div className="stat-label">Total Pipeline</div>
                </div>
                <div className="stat-card">
                    <div className="stat-num">{isLoading || !stats ? "—" : stats.email_sent}</div>
                    <div className="stat-label">Emailed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-num">{isLoading || !stats ? "—" : stats.replied}</div>
                    <div className="stat-label">Replied</div>
                </div>
                <div className="stat-card">
                    <div className="stat-num">{isLoading || !stats ? "—" : stats.negotiating}</div>
                    <div className="stat-label">Negotiating</div>
                </div>
                <div className="stat-card">
                    <div className="stat-num">{isLoading || !stats ? "—" : stats.deal_closed}</div>
                    <div className="stat-label">Closed</div>
                </div>
            </div>

            {/* ─── Controls ─── */}
            <div className="crm-controls">
                <div className="crm-controls-left">
                    <select className="crm-dropdown" value={campaignFilter || "all"} onChange={(e) => { setCampaignFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="all">All Campaigns</option>
                        {campaigns.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="crm-dropdown" value={platformFilter || "all"} onChange={(e) => { setPlatformFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="all">All Platforms</option>
                        <option value="Instagram">Instagram</option>
                        <option value="YouTube">YouTube</option>
                        <option value="LinkedIn">LinkedIn</option>
                    </select>
                    <select className="crm-dropdown" value={statusFilter || "all"} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="all">All Statuses</option>
                        {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                    </select>
                    <div className="crm-search">
                        <IconSearch />
                        <input
                            type="text"
                            placeholder="Search influencers..."
                            value={searchQuery || ""}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>
                <div className="crm-controls-right">
                    <div className="view-toggle">
                        <button className={`view-toggle-btn ${viewMode === "kanban" ? "active" : ""}`} onClick={() => setViewMode("kanban")}>⊞ Kanban</button>
                        <button className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`} onClick={() => setViewMode("table")}>☰ Table</button>
                    </div>
                </div>
            </div>

            {/* ─── Content ─── */}
            <div className="crm-content">
                {isLoading ? (
                    <div className="crm-table-wrapper">
                        <table className="crm-table">
                            <thead>
                                <tr>
                                    <th className="col-checkbox"><input type="checkbox" className="crm-checkbox" checked={false} readOnly /></th>
                                    <th className="col-influencer">Influencer</th>
                                    <th className="col-platform">Platform</th>
                                    <th className="col-followers">Followers</th>
                                    <th className="col-engRate">Eng. Rate</th>
                                    <th className="col-estCost">Est. Cost</th>
                                    <th className="col-notes">Notes</th>
                                    <th className="col-status">Status</th>
                                    <th className="col-actions">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4].map((i) => (
                                    <tr key={`skeleton-${i}`} className="skeleton-row">
                                        <td className="col-checkbox"><input type="checkbox" className="crm-checkbox" checked={false} readOnly /></td>
                                        <td>
                                            <div className="influencer-cell">
                                                <div className="skeleton-avatar" />
                                                <div className="influencer-info" style={{ width: "100%" }}>
                                                    <div className="skeleton-cell" style={{ width: "80%", marginBottom: 4 }} />
                                                    <div className="skeleton-cell" style={{ width: "40%" }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td><div className="skeleton-cell" style={{ width: "80%" }} /></td>
                                        <td><div className="skeleton-cell" style={{ width: "60%" }} /></td>
                                        <td><div className="skeleton-cell" /></td>
                                        <td><div className="skeleton-cell" style={{ width: "60%" }} /></td>
                                        <td><div className="skeleton-cell" style={{ width: "100%" }} /></td>
                                        <td><div className="skeleton-cell" style={{ width: "80%", height: 24, borderRadius: 12 }} /></td>
                                        <td><div className="skeleton-cell" style={{ width: "60%" }} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : sorted.length === 0 ? (
                    <EmptyState />
                ) : viewMode === "table" ? (
                    <div className="crm-table-wrapper">
                        <table className="crm-table">
                            <thead>
                                <tr>
                                    <th className="col-checkbox">
                                        <input
                                            type="checkbox"
                                            className="crm-checkbox"
                                            checked={selectedIds.size === paged.length && paged.length > 0 ? true : false}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <SortTh col="name" label="Influencer" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                    <SortTh col="platform" label="Platform" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                    <SortTh col="followers" label="Followers" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                    <SortTh col="engRate" label="Eng. Rate" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                    <SortTh col="estCost" label="Est. Cost" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                    <th style={{ width: '200px', minWidth: '200px' }}>Notes</th>
                                    <SortTh col="status" label="Status" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                                    <th style={{ width: '120px', minWidth: '120px' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map((inf) => {
                                    const PlatIcon = platformIcons[inf.influencers.platform] || IconInstagram;
                                    return (
                                        <tr key={inf.id}>
                                            <td className="col-checkbox" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="crm-checkbox"
                                                    checked={selectedIds.has(inf.id)}
                                                    onChange={() => toggleSelect(inf.id)}
                                                />
                                            </td>
                                            <td onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewProfile(inf);
                                            }} style={{ cursor: "pointer" }}>
                                                <div className="influencer-cell">
                                                    <div className="influencer-avatar" style={{ background: getGradient(inf.influencers?.handle || 'Unknown') }}>{getInitials(inf.influencers?.full_name || 'Unknown Creator', inf.influencers?.handle || 'Unknown')}</div>
                                                    <div className="influencer-info">
                                                        <div className="influencer-name">{inf.influencers?.full_name || 'Unknown Creator'}</div>
                                                        <div className="influencer-handle">{inf.influencers?.handle || 'Unknown'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`platform-cell ${platformColorClass[inf.influencers?.platform || 'instagram']}`}>
                                                    <PlatIcon className="w-[15px] h-[15px]" />
                                                    {inf.influencers?.platform || 'instagram'}
                                                </span>
                                            </td>
                                            <td><span className="num-cell">{formatNumber(inf.influencers?.followers || 0)}</span></td>
                                            <td><span className={`num-cell ${engRateClass(inf.influencers?.engagement_rate || 0)}`}>{inf.influencers?.engagement_rate || 0}%</span></td>
                                            <td><span className="cost-cell">{inf.estimated_cost || 'TBD'}</span></td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <textarea
                                                    value={editingNotes[inf.id] !== undefined ? editingNotes[inf.id] : (inf.notes || '')}
                                                    onChange={(e) => setEditingNotes(prev => ({
                                                        ...prev,
                                                        [inf.id]: e.target.value
                                                    }))}
                                                    onBlur={async () => {
                                                        const newNote = editingNotes[inf.id]
                                                        if (newNote === undefined) return
                                                        await fetch(`/api/crm/entries/${inf.id}`, {
                                                            method: 'PUT',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ notes: newNote })
                                                        })
                                                    }}
                                                    placeholder="Add note..."
                                                    rows={1}
                                                    style={{
                                                        border: 'none',
                                                        background: 'transparent',
                                                        resize: 'none',
                                                        width: '100%',
                                                        fontFamily: 'DM Sans, sans-serif',
                                                        fontSize: '13px',
                                                        color: '#1C1410',
                                                        outline: 'none',
                                                        cursor: 'text'
                                                    }}
                                                />
                                            </td>
                                            <td className="status-cell" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setOpenStatusId(openStatusId === inf.id ? null : inf.id)
                                                    }}
                                                    style={{
                                                        padding: '4px 10px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                                                        fontSize: '12px', fontFamily: 'DM Sans, sans-serif', fontWeight: '500',
                                                        backgroundColor: getStatusStyle(inf.status).bg, color: getStatusStyle(inf.status).color,
                                                        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px'
                                                    }}
                                                >
                                                    {getStatusStyle(inf.status).label}
                                                    <span style={{ fontSize: '10px' }}>▼</span>
                                                </button>
                                                {openStatusId === inf.id && (
                                                    <>
                                                        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpenStatusId(null)} />
                                                        <div style={{
                                                            position: 'absolute', top: '100%', left: 0, zIndex: 20, background: 'white',
                                                            borderRadius: '10px', border: '1px solid #E8DDD4', boxShadow: '0 8px 24px rgba(28,20,16,0.12)',
                                                            padding: '6px', minWidth: '160px', marginTop: '4px'
                                                        }}>
                                                            {STATUS_OPTIONS.map(option => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation()
                                                                        setOpenStatusId(null)
                                                                        setInfluencers(prev => prev.map(e => e.id === inf.id ? { ...e, status: option.value as StatusKey } : e))
                                                                        try {
                                                                            await fetch(`/api/crm/entries/${inf.id}`, {
                                                                                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ status: option.value })
                                                                            })
                                                                            fetchStats()
                                                                        } catch {
                                                                            fetchData()
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                                                        padding: '8px 10px', borderRadius: '6px', border: 'none',
                                                                        background: inf.status === option.value ? option.bg : 'transparent',
                                                                        color: option.color, cursor: 'pointer', fontSize: '13px',
                                                                        fontFamily: 'DM Sans, sans-serif', textAlign: 'left'
                                                                    }}
                                                                    onMouseEnter={e => e.currentTarget.style.background = option.bg}
                                                                    onMouseLeave={e => e.currentTarget.style.background = inf.status === option.value ? option.bg : 'transparent'}
                                                                >
                                                                    {inf.status === option.value && '✓ '}
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                            <td className="actions-cell">
                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleOutreach(inf); }}
                                                        title="Draft Outreach Email"
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'transparent',
                                                            cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#A89585'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#F5F0E8'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        ✉️
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleViewProfile(inf); }}
                                                        title="View Full Profile"
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'transparent',
                                                            cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#A89585'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#F5F0E8'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(inf.id); }}
                                                        title="Remove from CRM"
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'transparent',
                                                            cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#A89585'
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#FFF1F2'; e.currentTarget.style.color = '#E11D48'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A89585'; }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* ─── Kanban View ─── */
                    <div className="kanban-wrapper">
                        {ALL_STATUSES.map((status) => {
                            const cardsInCol = sorted.filter((inf) => inf.status === status);
                            return (
                                <div
                                    key={status}
                                    className={`kanban-col ${dragOverCol === status ? "drag-over" : ""}`}
                                    data-status={status}
                                    onDragOver={(e) => { e.preventDefault(); handleDragOverCol(status); }}
                                    onDragLeave={() => setDragOverCol(null)}
                                    onDrop={(e) => { e.preventDefault(); handleDropOnCol(status); }}
                                >
                                    <div className="kanban-col-header">
                                        <span className="kanban-col-title">{STATUS_CONFIG[status].label}</span>
                                        <span className="kanban-col-count">{cardsInCol.length}</span>
                                    </div>
                                    <div className="kanban-col-body">
                                        {cardsInCol.map((inf) => {
                                            const PlatIcon = platformIcons[inf.influencers.platform] || IconInstagram;
                                            return (
                                                <div
                                                    key={inf.id}
                                                    className={`kanban-card ${dragId === inf.id ? "dragging" : ""}`}
                                                    draggable
                                                    onDragStart={() => handleDragStart(inf.id)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewProfile(inf);
                                                    }}
                                                >
                                                    <div className="kanban-card-head">
                                                        <div className="kanban-avatar" style={{ background: getGradient(inf.influencers?.handle || 'Unknown') }}>{getInitials(inf.influencers?.full_name || 'Unknown', inf.influencers?.handle || 'Unknown')}</div>
                                                        <div>
                                                            <div className="kanban-card-name">{inf.influencers?.full_name || inf.influencers?.handle || 'Unknown'}</div>
                                                            <div className="kanban-card-handle">{inf.influencers?.handle || 'Unknown'}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`kanban-card-detail ${platformColorClass[inf.influencers?.platform || 'instagram']}`}>
                                                        <PlatIcon className="w-[13px] h-[13px]" />
                                                        {inf.influencers?.platform || 'instagram'}
                                                    </div>
                                                    <div className="kanban-card-detail" style={{ color: "var(--text-primary)" }}>
                                                        {formatNumber(inf.influencers?.followers || 0)} followers
                                                    </div>
                                                    <div className="kanban-card-cost">{inf.estimated_cost || 'TBD'}</div>
                                                    <div className="kanban-match-bar">
                                                        <div className="kanban-match-track">
                                                            <div className="kanban-match-fill" style={{ width: `${inf.match_score || 0}%` }} />
                                                        </div>
                                                        <span className="kanban-match-label">{inf.match_score || 0}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button className="kanban-add-btn" onClick={() => setIsAddModalOpen(true)}>+ Add Influencer</button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── Pagination (table only) ─── */}
            {viewMode === "table" && sorted.length > 0 && (
                <div className="crm-pagination">
                    <span className="pagination-info">
                        Showing {Math.min((currentPage - 1) * PER_PAGE + 1, sorted.length)}–{Math.min(currentPage * PER_PAGE, sorted.length)} of {sorted.length} influencers
                    </span>
                    <div className="pagination-buttons">
                        <button className="page-btn" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>← Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i + 1} className={`page-btn ${currentPage === i + 1 ? "active" : ""}`} onClick={() => setCurrentPage(i + 1)}>
                                {i + 1}
                            </button>
                        ))}
                        <button className="page-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next →</button>
                    </div>
                </div>
            )}

            {/* ─── Bulk Actions Bar ─── */}
            <div className={`bulk-actions-bar ${selectedIds.size > 0 ? "visible" : ""}`}>
                <span className="bulk-info">{selectedIds.size} influencer{selectedIds.size !== 1 ? "s" : ""} selected</span>
                <div className="bulk-buttons">
                    <button className="bulk-btn" onClick={() => showToast("Bulk outreach modal coming soon!")}>✉️ Bulk Outreach</button>
                    <div className="bulk-dropdown-wrap">
                        <button className="bulk-btn" onClick={() => setBulkStatusOpen(!bulkStatusOpen)}>🏷️ Change Status</button>
                        {bulkStatusOpen && (
                            <div className="bulk-status-dropdown">
                                {ALL_STATUSES.map(s => (
                                    <button key={s} onClick={() => handleBulkStatusChange(s)}>
                                        <span className="status-dot" style={{ background: STATUS_CONFIG[s].dotColor }} />
                                        {STATUS_CONFIG[s].label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="bulk-btn danger" onClick={bulkRemove}>🗑️ Remove</button>
                    <button className="bulk-btn" onClick={clearSelection}>✕ Clear selection</button>
                </div>
            </div>



            {/* ─── Outreach Modal ─── */}
            {outreachInfluencer && (
                <OutreachModal
                    influencer={outreachInfluencer}
                    onClose={() => setOutreachInfluencer(null)}
                    onSent={async () => {
                        setOutreachInfluencer(null)
                        const entry = influencers.find(e => e.influencer_id === outreachInfluencer.id)
                        if (entry) {
                            setInfluencers(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'email_sent' } : e))
                            await fetch(`/api/crm/entries/${entry.id}`, {
                                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'email_sent' })
                            })
                            fetchStats()
                        }
                    }}
                />
            )}

            {/* ─── Add Influencer Modal ─── */}
            {isAddModalOpen && (
                <AddInfluencerModal
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={async (influencer) => {
                        try {
                            const res = await fetch('/api/crm/add', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ influencer })
                            });
                            const data = await res.json();
                            if (res.ok) {
                                showToast(`${influencer.handle} added to CRM ✓`);
                                setIsAddModalOpen(false);
                                fetchData();
                            } else {
                                throw new Error(data.error);
                            }
                        } catch (err: any) {
                            alert(err.message || 'Failed to add influencer');
                        }
                    }}
                />
            )}

            {/* ─── Toast ─── */}

        </div>
    );
}

/* ════════════════════════════════════════════════
   Add Influencer Modal
   ════════════════════════════════════════════════ */
function AddInfluencerModal({ onClose, onAdd }: { onClose: () => void; onAdd: (inf: any) => Promise<void> }) {
    const [handle, setHandle] = useState("");
    const [platform, setPlatform] = useState("instagram");
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!handle) return;
        setIsSubmitting(true);
        await onAdd({ handle, platform, full_name: name });
        setIsSubmitting(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add Influencer Manual</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Handle / Username (required)</label>
                        <input
                            type="text"
                            placeholder="@username"
                            value={handle ?? ""}
                            onChange={e => setHandle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Platform</label>
                        <select value={platform ?? ""} onChange={e => setPlatform(e.target.value)}>
                            <option value="instagram">Instagram</option>
                            <option value="youtube">YouTube</option>
                            <option value="linkedin">LinkedIn</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Full Name (optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={name ?? ""}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-terracotta" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add to CRM"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════
   Sortable Table Header
   ════════════════════════════════════════════════ */
function SortTh({ col, label, sortCol, sortDir, onSort }: {
    col: string; label: string; sortCol: string | null; sortDir: "asc" | "desc"; onSort: (col: string) => void;
}) {
    const active = sortCol === col;
    return (
        <th className={active ? "sorted" : ""} onClick={() => onSort(col)}>
            <span className="th-content">
                {label}
                <span className="sort-icon">{active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
            </span>
        </th>
    );
}





/* ════════════════════════════════════════════════
   Empty State
   ════════════════════════════════════════════════ */
function EmptyState() {
    return (
        <div className="crm-empty-state">
            <div className="crm-empty-mascot">
                <IconSparkle className="w-16 h-16" />
            </div>
            <h2 className="crm-empty-heading">Your CRM is empty</h2>
            <p className="crm-empty-sub">Search for influencers and add them to start tracking your pipeline</p>
            <a href="/search" className="btn-terracotta" style={{ textDecoration: "none" }}>→ Go to AI Search</a>
        </div>
    );
}
