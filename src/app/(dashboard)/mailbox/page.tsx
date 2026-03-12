"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";
import "./mailbox.css";

/* ════════════════════════════════════════════════
   Types & Constants
   ════════════════════════════════════════════════ */
type StatusKey =
    | "not-contacted"
    | "email-sent"
    | "replied"
    | "negotiating"
    | "interested"
    | "deal-closed"
    | "content-live"
    | "rejected"
    | "needs-review";

type ChannelKey = "email" | "instagram" | "linkedin";

interface Message {
    id: number;
    direction: "outgoing" | "incoming";
    text: string;
    time: string;
    date: string;
    channel: ChannelKey;
    isUnread?: boolean;
}

interface Thread {
    id: number;
    handle: string;
    name: string;
    followers: string;
    status: StatusKey;
    statusLabel: string;
    preview: string;
    timeAgo: string;
    unread: boolean;
    avatarGradient: string;
    initials: string;
    channels: ChannelKey[];
    email?: string;
    messages: Message[];
    aiDraft?: string;
    aiDraftContext?: string;
}

const CHANNEL_ICONS: Record<ChannelKey, string> = {
    email: "📧",
    instagram: "💬",
    linkedin: "💼",
};

const CHANNEL_LABELS: Record<ChannelKey, string> = {
    email: "Email",
    instagram: "Instagram DM",
    linkedin: "LinkedIn",
};

const STATUS_CONFIG: Record<StatusKey, { label: string; className: string; dotColor: string }> = {
    "not-contacted": { label: "Not Contacted", className: "mbx-status-not-contacted", dotColor: "#9CA3AF" },
    "email-sent": { label: "Email Sent", className: "mbx-status-email-sent", dotColor: "#3B82F6" },
    "replied": { label: "Replied", className: "mbx-status-replied", dotColor: "#EAB308" },
    "negotiating": { label: "Negotiating", className: "mbx-status-negotiating", dotColor: "#F97316" },
    "interested": { label: "Interested", className: "mbx-status-interested", dotColor: "#22C55E" },
    "deal-closed": { label: "Deal Closed", className: "mbx-status-deal-closed", dotColor: "#16A34A" },
    "content-live": { label: "Content Live", className: "mbx-status-content-live", dotColor: "#8B5CF6" },
    "rejected": { label: "Rejected", className: "mbx-status-rejected", dotColor: "#EF4444" },
    "needs-review": { label: "Needs Review", className: "mbx-status-needs-review", dotColor: "#A855F7" },
};

const STATUS_LABELS: { key: StatusKey; label: string; dotColor: string; emoji: string }[] = [
    { key: "not-contacted", label: "Not Contacted", dotColor: "#9CA3AF", emoji: "⚪" },
    { key: "email-sent", label: "Email Sent", dotColor: "#3B82F6", emoji: "🔵" },
    { key: "replied", label: "Replied", dotColor: "#EAB308", emoji: "🟡" },
    { key: "negotiating", label: "Negotiating", dotColor: "#F97316", emoji: "🟠" },
    { key: "interested", label: "Interested", dotColor: "#22C55E", emoji: "🟢" },
    { key: "deal-closed", label: "Deal Closed", dotColor: "#16A34A", emoji: "✅" },
    { key: "content-live", label: "Content Live", dotColor: "#8B5CF6", emoji: "🌟" },
    { key: "rejected", label: "Rejected", dotColor: "#EF4444", emoji: "🔴" },
    { key: "needs-review", label: "Needs Review", dotColor: "#A855F7", emoji: "🟣" },
];

const CHANNEL_FILTERS: { key: "all" | ChannelKey; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "🌐" },
    { key: "email", label: "Email", icon: "📧" },
    { key: "instagram", label: "Instagram DM", icon: "💬" },
    { key: "linkedin", label: "LinkedIn", icon: "💼" },
];

/* ════════════════════════════════════════════════
   Sample Data
   ════════════════════════════════════════════════ */
// Hardcoded initial fallback while loading
const FALLBACK_THREADS: Thread[] = [];

export default function MailboxPage() {
    const { showToast } = useToast();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeChannel, setActiveChannel] = useState<"all" | ChannelKey>("all");
    const [activeLabel, setActiveLabel] = useState<string>("all"); // Make default 'all'
    const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
    const [showCrmPanel, setShowCrmPanel] = useState(false);
    const [showSequenceModal, setShowSequenceModal] = useState(false);
    const [showNewConvoModal, setShowNewConvoModal] = useState(false);
    const [showMultiSendModal, setShowMultiSendModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [messageChannelFilter, setMessageChannelFilter] = useState<"all" | ChannelKey>("all");
    const [composeChannels, setComposeChannels] = useState<ChannelKey[]>(["email"]);
    const [aiSendChannel, setAiSendChannel] = useState<ChannelKey>("email");
    const [connectionBannerDismissed, setConnectionBannerDismissed] = useState(false);
    const [composeText, setComposeText] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Helpers
    const countByChannel = (ch: ChannelKey) => threads.filter((t) => t.channels.includes(ch) && t.unread).length;
    const UNREAD_COUNTS = {
        all: threads.filter((t) => t.unread).length,
        email: countByChannel("email"),
        instagram: countByChannel("instagram"),
        linkedin: countByChannel("linkedin"),
    };
    const labelCount = (key: StatusKey) => threads.filter((t) => t.status === key).length;
    const threadChannelCounts = (ch: ChannelKey) => {
        if (!selectedThread) return 0;
        return selectedThread.messages.filter((m) => m.channel === ch).length;
    };

    // Fetch data
    const fetchThreads = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/mailbox/conversations');
            const data = await res.json();
            
            if (data.conversations) {
                // Map db conversations to Thread[]
                const mappedThreads: Thread[] = data.conversations.map((conv: any) => {
                    const status = conv.crm_entry?.status || "not-contacted";
                    const statusKey = status.replace('_', '-') as StatusKey;
                    
                    const messages: Message[] = (conv.messages || []).map((m: any) => ({
                        id: m.id,
                        direction: m.direction,
                        text: m.body,
                        time: new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        date: new Date(m.sent_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                        channel: m.channel,
                        isUnread: !m.is_read
                    }));
                    
                    // Deduplicate channels from messages
                    const channels = Array.from(new Set(messages.map(m => m.channel))) as ChannelKey[];
                    if(channels.length === 0) channels.push('email'); // default

                    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

                    return {
                        id: conv.id,
                        handle: conv.influencer?.handle || "@unknown",
                        name: conv.influencer?.full_name || "Unknown",
                        followers: conv.influencer?.followers ? (conv.influencer.followers / 1000).toFixed(1) + "K" : "0",
                        status: statusKey,
                        statusLabel: Object.keys(STATUS_CONFIG).includes(statusKey) ? STATUS_CONFIG[statusKey].label : "Not Contacted",
                        preview: lastMsg?.text || "Started conversation",
                        timeAgo: conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : 'Just now',
                        unread: messages.some(m => m.isUnread),
                        avatarGradient: "linear-gradient(135deg, #1565C0, #42A5F5)", // Randomize in future
                        initials: (conv.influencer?.full_name || "U")[0].toUpperCase(),
                        channels,
                        email: conv.influencer?.email,
                        messages
                    };
                });
                
                setThreads(mappedThreads);
                if (mappedThreads.length > 0 && selectedThreadId === null) {
                    setSelectedThreadId(mappedThreads[0].id);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [selectedThreadId]);


    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);

    // Filter threads based on active channel + active label
    const filteredThreads = threads.filter((t) => {
        const channelMatch = activeChannel === "all" || t.channels.includes(activeChannel);
        const labelMatch = activeLabel === "all" || t.status === activeLabel;
        const searchMatch =
            !searchQuery ||
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.handle.toLowerCase().includes(searchQuery.toLowerCase());
        return channelMatch && labelMatch && searchMatch;
    });

    const selectedThread = threads.find((t) => t.id === selectedThreadId);

    // Filter messages within thread by message channel filter
    const filteredMessages = selectedThread?.messages ? (
        messageChannelFilter === "all"
            ? selectedThread.messages
            : selectedThread.messages.filter((m) => m.channel === messageChannelFilter)
    ) : [];

    // Count messages per channel for the selected thread
    // Handle sending message
    const handleSend = async () => {
        if (!selectedThread || !composeText.trim() || composeChannels.length === 0) return;

        setIsSending(true);
        try {
            // We're iterating over selected channels
            for (const channel of composeChannels) {
                await fetch(`/api/mailbox/conversations/${selectedThread.id}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        channel,
                        direction: 'outgoing',
                        text: composeText,
                        subject: null // could add subject state if needed
                    })
                });
            }
            
            // Re-fetch threads to get the new messages
            await fetchThreads();
            setComposeText("");
            setShowMultiSendModal(false);
            showToast("success", "Message sent!");
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    // Filter threads based on active channel + active label
    const showFollowup = (thread: Thread) => {
        return thread.handle === "@ananya.creates";
    };

    // Toggle compose channel
    const toggleComposeChannel = (ch: ChannelKey) => {
        setComposeChannels((prev) =>
            prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
        );
    };

    // Should show channel divider?
    const shouldShowDivider = (messages: Message[], idx: number) => {
        if (idx === 0) return true;
        const prev = messages[idx - 1];
        const curr = messages[idx];
        return prev.channel !== curr.channel || prev.date !== curr.date;
    };

    return (
        <div className="mailbox-page">
            {/* ═══════════════ PANEL 1 — Labels ═══════════════ */}
            <div className="labels-panel">
                {/* Channel Filter Tabs */}
                <div className="channel-tabs">
                    {CHANNEL_FILTERS.map((ch) => (
                        <button
                            key={ch.key}
                            className={`channel-tab ${activeChannel === ch.key ? "active" : ""}`}
                            onClick={() => setActiveChannel(ch.key as "all" | ChannelKey)}
                        >
                            <span className="channel-tab-icon">{ch.icon}</span>
                            <span className="channel-tab-label">{ch.label}</span>
                            <span className="channel-tab-badge">
                                {UNREAD_COUNTS[ch.key as keyof typeof UNREAD_COUNTS]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="label-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery || ""}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="labels-divider" />

                {/* Labels */}
                <div className="label-section-title">Labels</div>
                <button 
                     className={`label-item ${activeLabel === "all" ? "active" : ""}`}
                     onClick={() => setActiveLabel("all")}
                >
                    <span className="label-dot" style={{ background: "transparent" }} />
                    <span>All Statuses</span>
                    <span className="label-count">{threads.length}</span>
                </button>
                {STATUS_LABELS.map((item) => (
                    <button
                        key={item.key}
                        className={`label-item ${activeLabel === item.key ? "active" : ""}`}
                        onClick={() => setActiveLabel(item.key)}
                    >
                        <span className="label-dot" style={{ background: item.dotColor }} />
                        <span>{item.label}</span>
                        <span className="label-count">{labelCount(item.key)}</span>
                    </button>
                ))}

                <div className="labels-divider" />

                {/* Connected Accounts */}
                <div className="label-section-title">Accounts</div>
                <div className="account-item">
                    <div className="account-avatar gmail">
                        <span style={{ fontSize: 9 }}>G</span>
                        <span className="account-connected-dot" />
                    </div>
                    <span className="account-email">brand@gmail.com</span>
                </div>
                <div className="account-item">
                    <div className="account-avatar instagram">
                        <span style={{ fontSize: 10 }}>📸</span>
                        <span className="account-connected-dot" />
                    </div>
                    <span className="account-email">@brandaccount</span>
                </div>
                <div className="account-item">
                    <div className="account-avatar linkedin">
                        <span style={{ fontSize: 10 }}>💼</span>
                        <span className="account-connected-dot" />
                    </div>
                    <span className="account-email">Brand Company</span>
                </div>
                <button className="add-account-btn">
                    <span>+</span>
                    <span>Add Account</span>
                </button>
            </div>

            {/* ═══════════════ PANEL 2 — Thread List ═══════════════ */}
            <div className="thread-list-panel">
                <div className="thread-list-header">
                    <span className="thread-list-title">All Conversations</span>
                    <div className="thread-header-actions">
                        <button className="thread-sort-btn">
                            Sort: Recent <span style={{ fontSize: 10 }}>▾</span>
                        </button>
                        <button
                            className="new-convo-btn"
                            title="New Conversation"
                            onClick={() => setShowNewConvoModal(true)}
                        >
                            +
                        </button>
                    </div>
                </div>
                <div className="thread-list-scroll">
                    {filteredThreads.length === 0 && (
                        <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                            No conversations found
                        </div>
                    )}
                    {filteredThreads.map((thread) => (
                        <div
                            key={thread.id}
                            className={`thread-item ${selectedThreadId === thread.id ? "selected" : ""}`}
                            onClick={() => {
                                setSelectedThreadId(thread.id);
                                setMessageChannelFilter("all");
                            }}
                        >
                            <div className="thread-avatar" style={{ background: thread.avatarGradient }}>
                                {thread.initials}
                            </div>
                            <div className="thread-content">
                                <div className="thread-top-row">
                                    <span className={`thread-name ${thread.unread ? "unread" : ""}`}>
                                        {thread.name}
                                    </span>
                                    <span className="thread-time">{thread.timeAgo}</span>
                                </div>
                                <span className="thread-handle">{thread.handle}</span>
                                <div className="thread-mid-row">
                                    <span className={`thread-status-pill ${STATUS_CONFIG[thread.status].className}`}>
                                        {STATUS_CONFIG[thread.status].label}
                                    </span>
                                    <span className="thread-channel-icons">
                                        {(["email", "instagram", "linkedin"] as ChannelKey[]).map((ch) => (
                                            <span
                                                key={ch}
                                                className={`thread-channel-icon ${thread.channels.includes(ch) ? "active" : ""}`}
                                            >
                                                {CHANNEL_ICONS[ch]}
                                            </span>
                                        ))}
                                    </span>
                                </div>
                                <span className={`thread-preview ${thread.unread ? "unread" : ""}`}>
                                    {thread.preview}
                                </span>
                            </div>
                            {thread.unread && <span className="thread-unread-dot" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════ PANEL 3 — Message View ═══════════════ */}
            <div className="message-view-panel">
                {!selectedThread ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        {isLoading ? "Loading..." : "Select a conversation to view"}
                    </div>
                ) : (
                    <>
                {/* Top Bar */}
                <div className="message-top-bar">
                    <div className="message-top-left">
                        <div className="message-top-avatar" style={{ background: selectedThread.avatarGradient }}>
                            {selectedThread.initials}
                        </div>
                        <div>
                            <div className="message-top-name">{selectedThread.name}</div>
                            <div className="message-top-meta">
                                {selectedThread.handle} • 📸 {selectedThread.followers} • {STATUS_CONFIG[selectedThread.status].label}
                            </div>
                        </div>
                    </div>

                    {/* Channel Tabs */}
                    <div className="message-channel-tabs">
                        <button
                            className={`message-channel-tab ${messageChannelFilter === "all" ? "active" : ""}`}
                            onClick={() => setMessageChannelFilter("all")}
                        >
                            🌐 All
                        </button>
                        {selectedThread.channels.map((ch) => (
                            <button
                                key={ch}
                                className={`message-channel-tab ${messageChannelFilter === ch ? "active" : ""}`}
                                onClick={() => setMessageChannelFilter(ch)}
                            >
                                {CHANNEL_ICONS[ch]} {CHANNEL_LABELS[ch]} ({threadChannelCounts(ch)})
                            </button>
                        ))}
                    </div>

                    <div className="message-top-actions">
                        <button className="msg-action-btn" onClick={() => setShowCrmPanel(true)}>
                            👤 View in CRM
                        </button>
                        <button className="msg-action-btn">✓ Mark Resolved</button>
                        <button className="msg-action-btn">⋯</button>
                    </div>
                </div>

                {/* Connection Banner */}
                {!connectionBannerDismissed && !selectedThread.channels.includes("instagram") && (
                    <div className="connection-banner">
                        <span>💬 Connect Instagram to send DMs to {selectedThread.name}</span>
                        <div className="connection-banner-actions">
                            <button className="connection-banner-connect">Connect Instagram →</button>
                            <button
                                className="connection-banner-dismiss"
                                onClick={() => setConnectionBannerDismissed(true)}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="message-thread-scroll">
                    {filteredMessages.map((msg, idx) => (
                        <div key={msg.id}>
                            {/* Channel Divider */}
                            {shouldShowDivider(filteredMessages, idx) && (
                                <div className="channel-divider">
                                    <span className="channel-divider-line" />
                                    <span className="channel-divider-label">
                                        {CHANNEL_ICONS[msg.channel]} {CHANNEL_LABELS[msg.channel]} — {msg.date}
                                    </span>
                                    <span className="channel-divider-line" />
                                </div>
                            )}

                            {/* Unread divider */}
                            {msg.isUnread && !filteredMessages[idx - 1]?.isUnread && (
                                <div className="unread-badge" style={{ marginBottom: 12 }}>● New Messages</div>
                            )}

                            <div className={`message-row ${msg.direction}`}>
                                <div className={`message-bubble ${msg.direction}`}>
                                    {msg.text}
                                </div>
                                <div className={`message-channel-tag ${msg.direction}`}>
                                    <span>{CHANNEL_ICONS[msg.channel]}</span>
                                    <span>via {CHANNEL_LABELS[msg.channel]}</span>
                                </div>
                                <span className="message-timestamp">{msg.time}</span>
                            </div>
                        </div>
                    ))}

                    {/* Follow-up Banner */}
                    {showFollowup(selectedThread) && (
                        <div className="followup-banner">
                            <span>⏰ No reply from {selectedThread.handle} in 5 days. Want me to send a follow-up?</span>
                            <div className="followup-banner-actions">
                                <button className="followup-send-btn">Send Follow-up</button>
                                <button className="followup-dismiss-btn">Dismiss</button>
                            </div>
                        </div>
                    )}

                    {/* AI Draft */}
                    {selectedThread.aiDraft && selectedThread.unread && (
                        <div className="ai-draft-container">
                            <div className="ai-draft-header">
                                <span className="ai-draft-label">✨ AI Draft</span>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <span className="ai-draft-meta">{selectedThread.aiDraftContext}</span>
                                    <button className="ai-draft-regen-btn">↻ Regenerate</button>
                                </div>
                            </div>
                            <textarea
                                className="ai-draft-text"
                                defaultValue={selectedThread.aiDraft}
                            />
                            {/* Send via channel */}
                            <div className="ai-draft-send-row">
                                <span className="ai-draft-send-label">Send via:</span>
                                {(["email", "instagram", "linkedin"] as ChannelKey[]).map((ch) => (
                                    <button
                                        key={ch}
                                        className={`channel-pill ${aiSendChannel === ch ? "active" : ""} ${!selectedThread.channels.includes(ch) ? "disabled" : ""
                                            }`}
                                        onClick={() => {
                                            if (selectedThread.channels.includes(ch)) setAiSendChannel(ch);
                                        }}
                                        title={!selectedThread.channels.includes(ch) ? "Connect first" : ""}
                                    >
                                        {CHANNEL_ICONS[ch]} {CHANNEL_LABELS[ch]}
                                    </button>
                                ))}
                            </div>
                            <div className="ai-draft-actions">
                                <button className="btn-ghost-small">✏️ Edit</button>
                                <button className="btn-ghost-small muted">↻ Regenerate</button>
                                <button className="btn-send">✅ Send Reply →</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Compose Bar */}
                <div className="compose-bar">
                    {/* Row 1: Channel Selector */}
                    <div className="compose-channel-row">
                        <span className="compose-channel-label">Send via:</span>
                        {(["email", "instagram", "linkedin"] as ChannelKey[]).map((ch) => (
                            <button
                                key={ch}
                                className={`compose-channel-btn ${composeChannels.includes(ch) ? "active" : ""}`}
                                onClick={() => toggleComposeChannel(ch)}
                            >
                                {CHANNEL_ICONS[ch]} {CHANNEL_LABELS[ch]}
                            </button>
                        ))}
                        {composeChannels.length > 1 && (
                            <span className="multi-send-badge">
                                📧 + {composeChannels.length > 2 ? "💬 +" : ""} Multi-send
                            </span>
                        )}
                    </div>

                    {/* Subject line (email) */}
                    {composeChannels.includes("email") && (
                        <div className="compose-subject">
                            <input type="text" placeholder="Subject: Re: Summer Campaign Collaboration" />
                        </div>
                    )}

                    {/* Tone indicator (linkedin) */}
                    {composeChannels.includes("linkedin") && (
                        <div className="compose-tone-indicator">
                            💡 LinkedIn tone: Professional
                        </div>
                    )}

                    <div className="compose-input-row">
                        <button className="compose-attach-btn">📎</button>
                        <div className="compose-input-wrap">
                            <input
                                className="compose-input"
                                type="text"
                                placeholder="Write a message..."
                                value={composeText ?? ""}
                                onChange={(e) => setComposeText(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        if (composeChannels.length > 1) {
                                            setShowMultiSendModal(true);
                                        } else {
                                            handleSend();
                                        }
                                    }
                                }}
                            />
                            {composeChannels.includes("instagram") && !composeChannels.includes("email") && (
                                <span className="compose-char-counter">{composeText.length}/500</span>
                            )}
                        </div>
                        <button
                            className="compose-sequences-btn"
                            onClick={() => setShowSequenceModal(true)}
                        >
                            📅 Sequences
                        </button>
                        <button
                            className="compose-send-btn"
                            disabled={isSending || !composeText.trim()}
                            onClick={() => {
                                if (composeChannels.length > 1) {
                                    setShowMultiSendModal(true);
                                } else {
                                     handleSend();
                                }
                            }}
                        >
                        </button>
                    </div>
                </div>
                </>
                )}
            </div>

            {/* ═══════════════ CRM Profile Panel ═══════════════ */}
            {showCrmPanel && (
                <div className="crm-panel-overlay">
                    <div className="crm-panel-backdrop" onClick={() => setShowCrmPanel(false)} />
                    <div className="crm-profile-panel">
                        <button className="crm-panel-close" onClick={() => setShowCrmPanel(false)}>✕</button>

                        <div className="crm-panel-avatar" style={{ background: selectedThread?.avatarGradient }}>
                            {selectedThread?.initials}
                        </div>
                        <div>
                            <div className="crm-panel-name">{selectedThread?.name}</div>
                            <div className="crm-panel-handle">{selectedThread?.handle}</div>
                        </div>

                        <div className="crm-stats-grid">
                            <div className="crm-stat-item">
                                <span className="crm-stat-label">Followers</span>
                                <span className="crm-stat-value">{selectedThread?.followers}</span>
                            </div>
                            <div className="crm-stat-item">
                                <span className="crm-stat-label">Eng. Rate</span>
                                <span className="crm-stat-value">4.8%</span>
                            </div>
                            <div className="crm-stat-item">
                                <span className="crm-stat-label">Avg Views</span>
                                <span className="crm-stat-value">12.4K</span>
                            </div>
                            <div className="crm-stat-item">
                                <span className="crm-stat-label">Est. Cost</span>
                                <span className="crm-stat-value">₹8k–12k</span>
                            </div>
                            <div className="crm-stat-item">
                                <span className="crm-stat-label">Match</span>
                                <span className="crm-stat-value">96%</span>
                            </div>
                            <div className="crm-stat-item">
                                <span className="crm-stat-label">Status</span>
                                <span className="crm-stat-value" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <span className="label-dot" style={{ background: STATUS_CONFIG[selectedThread?.status || "not-contacted"].dotColor, width: 8, height: 8 }} />
                                    {STATUS_CONFIG[selectedThread?.status || "not-contacted"].label}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div className="crm-stat-label" style={{ marginBottom: 6 }}>Campaign</div>
                            <span className="crm-campaign-chip">Summer Style</span>
                        </div>

                        <div>
                            <div className="crm-stat-label" style={{ marginBottom: 6 }}>Notes</div>
                            <textarea
                                className="crm-notes-textarea"
                                defaultValue="Prefers reels over static posts. Responds faster on DM than email."
                            />
                        </div>

                        <button className="crm-open-profile-link">
                            Open Full Profile →
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════ Email Sequence Modal ═══════════════ */}
            {showSequenceModal && (
                <div className="modal-overlay">
                    <div className="modal-backdrop" onClick={() => setShowSequenceModal(false)} />
                    <div className="sequence-modal">
                        <div className="sequence-modal-header">
                            <span className="sequence-modal-title">Create Email Sequence</span>
                            <button className="sequence-modal-close" onClick={() => setShowSequenceModal(false)}>✕</button>
                        </div>
                        <div className="sequence-modal-body">
                            <div className="sequence-email-row">
                                <div className="sequence-step-num">1</div>
                                <div className="sequence-email-content">
                                    <div className="sequence-email-top">
                                        <span className="sequence-email-title">Initial Outreach</span>
                                        <span className="sequence-timing-badge green">Immediate</span>
                                    </div>
                                    <p className="sequence-email-preview">
                                        Hi {"{name}"}, I came across your recent content and loved it. We&apos;re running a campaign and think you&apos;d be a perfect fit...
                                    </p>
                                </div>
                                <button className="sequence-edit-btn">✏️ Edit</button>
                            </div>
                            <div className="sequence-email-row">
                                <div className="sequence-step-num">2</div>
                                <div className="sequence-email-content">
                                    <div className="sequence-email-top">
                                        <span className="sequence-email-title">Follow-up</span>
                                        <span className="sequence-timing-badge amber">Day 3</span>
                                    </div>
                                    <p className="sequence-email-preview">
                                        Just following up on my previous message. We&apos;d love to hear your thoughts on the collaboration opportunity...
                                    </p>
                                </div>
                                <button className="sequence-edit-btn">✏️ Edit</button>
                            </div>
                            <div className="sequence-email-row">
                                <div className="sequence-step-num">3</div>
                                <div className="sequence-email-content">
                                    <div className="sequence-email-top">
                                        <span className="sequence-email-title">Final Nudge</span>
                                        <span className="sequence-timing-badge muted">Day 7</span>
                                    </div>
                                    <p className="sequence-email-preview">
                                        Last check-in before I close this out. If the timing isn&apos;t right, no worries at all — we&apos;d love to keep in touch for future opportunities...
                                    </p>
                                </div>
                                <button className="sequence-edit-btn">✏️ Edit</button>
                            </div>
                        </div>
                        <div className="sequence-modal-footer">
                            <button className="sequence-cancel-btn" onClick={() => setShowSequenceModal(false)}>
                                Cancel
                            </button>
                            <button className="sequence-approve-btn">
                                Approve &amp; Schedule →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ Multi-Send Confirmation Modal ═══════════════ */}
            {showMultiSendModal && (
                <div className="modal-overlay">
                    <div className="modal-backdrop" onClick={() => setShowMultiSendModal(false)} />
                    <div className="multisend-modal">
                        <div className="multisend-modal-header">
                            <div className="multisend-modal-title">
                                Send to {selectedThread?.name} via:
                            </div>
                        </div>
                        <div className="multisend-modal-body">
                            {composeChannels.map((ch) => (
                                <div key={ch} className="multisend-channel-row">
                                    <input type="checkbox" defaultChecked />
                                    <span>{CHANNEL_ICONS[ch]} {CHANNEL_LABELS[ch]}</span>
                                    <span className="multisend-channel-detail">
                                        {ch === "email" && selectedThread?.email}
                                        {ch === "instagram" && selectedThread?.handle}
                                        {ch === "linkedin" && selectedThread?.name}
                                    </span>
                                </div>
                            ))}
                            <div className="multisend-preview-label">Message Preview:</div>
                            <div className="multisend-preview-text">
                                {composeText || "Your message will appear here..."}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel-btn" onClick={() => setShowMultiSendModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="modal-primary-btn" 
                                onClick={handleSend}
                                disabled={isSending}
                            >
                                {isSending ? "Sending..." : `Send to ${composeChannels.length === 2 ? "Both" : "All"} Channels →`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ New Conversation Modal ═══════════════ */}
            {showNewConvoModal && (
                <div className="modal-overlay">
                    <div className="modal-backdrop" onClick={() => setShowNewConvoModal(false)} />
                    <div className="new-convo-modal">
                        <div className="new-convo-modal-header">
                            <span className="new-convo-modal-title">Start New Conversation</span>
                            <button className="modal-close-btn" onClick={() => setShowNewConvoModal(false)}>✕</button>
                        </div>
                        <div className="new-convo-modal-body">
                            {/* Step 1 */}
                            <div className="new-convo-step">
                                <span className="new-convo-step-label">Step 1: Select Influencer</span>
                                <input
                                    className="new-convo-search-input"
                                    type="text"
                                    placeholder="Search CRM influencers..."
                                />
                            </div>

                            {/* Step 2 */}
                            <div className="new-convo-step">
                                <span className="new-convo-step-label">Step 2: Select Channel(s)</span>
                                <div className="new-convo-channel-select">
                                    {(["email", "instagram", "linkedin"] as ChannelKey[]).map((ch) => (
                                        <button key={ch} className="channel-pill">
                                            {CHANNEL_ICONS[ch]} {CHANNEL_LABELS[ch]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="new-convo-step">
                                <span className="new-convo-step-label">Step 3: Message</span>
                                <textarea
                                    className="new-convo-textarea"
                                    placeholder="Write your message..."
                                />
                                <button className="new-convo-ai-btn">
                                    ✨ Generate AI Opening Message
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel-btn" onClick={() => setShowNewConvoModal(false)}>
                                Cancel
                            </button>
                            <button className="modal-primary-btn">
                                Send Message →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
