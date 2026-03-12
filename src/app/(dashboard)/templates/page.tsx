"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import "./templates.css";

/* ════════════════════════════════════════════════
   Types & Constants
   ════════════════════════════════════════════════ */
type Channel = "email" | "instagram_dm" | "linkedin";

export interface Template {
    id: number;
    brand_id?: string;
    name: string;
    channel: Channel;
    status: string;
    sent_count: number;
    opened_count: number;
    replied_count: number;
    open_rate: number;
    reply_rate: number;
    subject: string;
    body: string;
    created_at: string;
    updated_at: string;
}

const CHANNEL_CONFIG: Record<string, { icon: string; label: string; pillClass: string }> = {
    email: { icon: "📧", label: "Email", pillClass: "tpl-channel-email" },
    instagram_dm: { icon: "💬", label: "Instagram DM", pillClass: "tpl-channel-instagram" },
    linkedin: { icon: "💼", label: "LinkedIn DM", pillClass: "tpl-channel-linkedin" },
};

const STATUS_CONFIG: Record<string, { label: string; pillClass: string }> = {
    email: { label: "Gmail Connected", pillClass: "tpl-status-connected" },
    instagram_dm: { label: "No Instagram Connection", pillClass: "tpl-status-warning" },
    linkedin: { label: "No LinkedIn Connection", pillClass: "tpl-status-warning" },
};

const VARIABLES = [
    "{first_name}",
    "{brand_name}",
    "{platform}",
    "{niche}",
    "{handle}",
    "{budget_range}"
];

const PREVIEW_VALUES: Record<string, string> = {
    "{first_name}": "Priya",
    "{brand_name}": "Your Brand",
    "{platform}": "Instagram",
    "{niche}": "beauty",
    "{handle}": "@priya",
    "{budget_range}": "₹10,000 – ₹25,000"
};

function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ════════════════════════════════════════════════
   Icons (inline SVG)
   ════════════════════════════════════════════════ */
function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

/* ════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════ */
export default function TemplatesPage() {
    const { showToast } = useToast();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [stats, setStats] = useState({
        total_templates: 0,
        total_sent: 0,
        avg_open_rate: 0,
        avg_reply_rate: 0
    });
    
    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [channelFilter, setChannelFilter] = useState<string>("all");
    const [showModal, setShowModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    // Modal form state
    const [formName, setFormName] = useState("");
    const [formChannel, setFormChannel] = useState<Channel>("email");
    const [formSubject, setFormSubject] = useState("");
    const [formBody, setFormBody] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    
    // AI Improve state
    const [aiSubject, setAiSubject] = useState("");
    const [aiBody, setAiBody] = useState("");
    const [aiChanges, setAiChanges] = useState<string[]>([]);
    const [isImproving, setIsImproving] = useState(false);

    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetch('/api/templates')
            .then(r => r.json())
            .then(data => {
                setTemplates(data.templates || []);
                setStats(data.stats || {
                    total_templates: 0,
                    total_sent: 0,
                    avg_open_rate: 0,
                    avg_reply_rate: 0
                });
            })
            .catch(err => console.error("Error fetching templates:", err));
    }, []);

    // ─── Filtered templates ───
    const filtered = templates.filter((t) => {
        const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchChannel = channelFilter === "all" || t.channel === channelFilter;
        return matchSearch && matchChannel;
    });

    // ─── Modal helpers ───
    const openNewModal = useCallback(() => {
        setEditingTemplate(null);
        setFormName("");
        setFormChannel("email");
        setFormSubject("");
        setFormBody("");
        setShowPreview(false);
        setShowModal(true);
    }, []);

    const openEditModal = useCallback((tpl: Template) => {
        setEditingTemplate(tpl);
        setFormName(tpl.name);
        setFormChannel(tpl.channel);
        setFormSubject(tpl.subject || "");
        setFormBody(tpl.body || "");
        setShowPreview(false);
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setEditingTemplate(null);
    }, []);

    const handleSave = useCallback(async () => {
        if (!formName.trim()) return;

        if (editingTemplate) {
            // Update
            const res = await fetch(`/api/templates/${editingTemplate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formName,
                    channel: formChannel,
                    subject: formSubject,
                    body: formBody,
                })
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? data.template : t));
                showToast("success", "Template saved!");
            }
        } else {
            // Create
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formName,
                    channel: formChannel,
                    subject: formSubject,
                    body: formBody,
                })
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(prev => [data.template, ...prev]);
                setStats(prev => ({...prev, total_templates: prev.total_templates + 1}));
                showToast("success", "Template created!");
            }
        }
        closeModal();
    }, [editingTemplate, formName, formChannel, formSubject, formBody, closeModal]);

    const duplicateTemplate = useCallback(async (template: Template) => {
        const res = await fetch('/api/templates', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: template.name + ' (Copy)',
            subject: template.subject,
            body: template.body,
            channel: template.channel
          })
        });
        if (res.ok) {
            const data = await res.json();
            setTemplates(prev => [data.template, ...prev]);
            setStats(prev => ({...prev, total_templates: prev.total_templates + 1}));
            showToast("success", "Template duplicated!");
        }
    }, []);

    const deleteTemplate = useCallback(async (id: number) => {
        const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setTemplates(prev => prev.filter(t => t.id !== id));
            setStats(prev => ({
                ...prev, 
                total_templates: Math.max(0, prev.total_templates - 1)
            }));
            showToast("success", "Template deleted!");
            
            // Note: Recalculating full averages client side can be complex without full list,
            // standard approach would be to refetch data, but for UI responsiveness
            // we'll just update the visible arrays.
        }
    }, [showToast]);
    
    const handleAIImprove = useCallback(async () => {
        if (!formBody.trim()) return;
        setIsImproving(true);
        try {
            const res = await fetch('/api/ai/improve-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: formSubject, body: formBody, channel: formChannel })
            });
            if (res.ok) {
                const data = await res.json();
                setAiSubject(data.subject || formSubject);
                setAiBody(data.body || "");
                setAiChanges(data.changes || []);
                setShowAIModal(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsImproving(false);
        }
    }, [formSubject, formBody, formChannel]);
    
    const applyAIImprovement = useCallback(() => {
        setFormSubject(aiSubject);
        setFormBody(aiBody);
        setShowAIModal(false);
        showToast("success", "Template improved with AI ✨");
    }, [aiSubject, aiBody, showToast]);

    const insertVariable = useCallback((variable: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = ta.value.substring(0, start);
        const after = ta.value.substring(end);
        const newValue = before + variable + after;
        setFormBody(newValue);
        setTimeout(() => {
            ta.focus();
            ta.selectionStart = ta.selectionEnd = start + variable.length;
        }, 0);
    }, []);

    const renderPreview = useCallback((text: string) => {
        let output = text;
        Object.entries(PREVIEW_VALUES).forEach(([key, val]) => {
            output = output.replaceAll(key, val);
        });
        return output;
    }, []);

    // ─── Rate color helpers ───
    const openRateClass = (rate: number) => {
        if (rate > 60) return "rate-good";
        if (rate >= 40) return "rate-ok";
        return "rate-low";
    };

    const replyRateClass = (rate: number) => {
        if (rate > 20) return "reply-good";
        if (rate >= 10) return "reply-ok";
        return "reply-low";
    };

    const openRateBarFill = (rate: number) => {
        if (rate > 60) return "fill-terracotta";
        if (rate >= 40) return "fill-amber";
        return "fill-muted";
    };

    const replyRateBarFill = (rate: number) => {
        if (rate > 20) return "fill-green";
        if (rate >= 10) return "fill-amber";
        return "fill-muted";
    };

    /* ════════════════════════════════════════════════
       RENDER
       ════════════════════════════════════════════════ */
    return (
        <div className="tpl-page">
            <div className="tpl-content">
                {/* ─── Page Header ─── */}
                <div className="tpl-header">
                    <div className="tpl-header-left">
                        <h1>Email Templates</h1>
                        <p>Create and manage outreach templates for your influencer campaigns</p>
                    </div>
                    <button className="tpl-btn-terracotta" onClick={openNewModal}>
                        + New Template
                    </button>
                </div>

                {/* ─── Stats Bar ─── */}
                <div className="tpl-stats">
                    <div className="tpl-stat-card">
                        <div className="tpl-stat-label">TEMPLATES</div>
                        <div className="tpl-stat-value">{stats.total_templates}</div>
                        <div className="tpl-stat-sub">active</div>
                    </div>
                    <div className="tpl-stat-card">
                        <div className="tpl-stat-label">TOTAL SENT</div>
                        <div className="tpl-stat-value">{stats.total_sent}</div>
                        <div className="tpl-stat-sub">all time</div>
                    </div>
                    <div className="tpl-stat-card">
                        <div className="tpl-stat-label">AVG OPEN RATE</div>
                        <div className="tpl-stat-value">{stats.avg_open_rate}%</div>
                        <div className="tpl-stat-sub">
                            <span className="tpl-stat-trend">↑ 4.2%</span>
                        </div>
                    </div>
                    <div className="tpl-stat-card">
                        <div className="tpl-stat-label">AVG REPLY RATE</div>
                        <div className="tpl-stat-value">{stats.avg_reply_rate}%</div>
                        <div className="tpl-stat-sub">
                            <span className="tpl-stat-trend">↑ 1.8%</span>
                        </div>
                    </div>
                </div>

                {/* ─── Filter Bar ─── */}
                <div className="tpl-controls">
                    <div className="tpl-controls-left">
                        <select
                            className="tpl-dropdown"
                            value={channelFilter}
                            onChange={(e) => setChannelFilter(e.target.value)}
                        >
                            <option value="all">All Channels</option>
                            <option value="email">📧 Email</option>
                            <option value="instagram_dm">💬 Instagram DM</option>
                            <option value="linkedin">💼 LinkedIn DM</option>
                        </select>
                        <select className="tpl-dropdown">
                            <option>All Owners</option>
                            <option>Vinil Verma</option>
                        </select>
                        <div className="tpl-search">
                            <IconSearch className="tpl-search-icon" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery || ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className="tpl-btn-terracotta" onClick={openNewModal}>
                        + New Template
                    </button>
                </div>

                {/* ─── Templates Table or Empty State ─── */}
                {filtered.length === 0 && templates.length === 0 ? (
                    <div className="tpl-empty-state">
                        <svg
                            className="tpl-empty-icon"
                            fill="none"
                            viewBox="0 0 64 64"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <rect x="8" y="12" width="48" height="36" rx="4" />
                            <path d="M8 20l24 16 24-16" />
                            <circle cx="50" cy="14" r="8" fill="#C4622D" stroke="none" />
                            <text x="50" y="18" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+</text>
                        </svg>
                        <h3>No templates yet</h3>
                        <p>Create your first outreach template to start reaching influencers at scale</p>
                        <button className="tpl-btn-terracotta" onClick={openNewModal}>
                            + Create Your First Template
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="tpl-empty-state">
                        <h3>No matching templates</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="tpl-table-wrapper">
                        <table className="tpl-table">
                            <thead>
                                <tr>
                                    <th>Template Name</th>
                                    <th>Channel</th>
                                    <th>Status</th>
                                    <th className="text-center">Sent</th>
                                    <th className="text-center">Opened</th>
                                    <th>Open Rate</th>
                                    <th>Reply Rate</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((tpl) => {
                                    const c = CHANNEL_CONFIG[tpl.channel] || CHANNEL_CONFIG.email;
                                    const s = STATUS_CONFIG[tpl.channel] || STATUS_CONFIG.email;
                                    return (
                                    <tr key={tpl.id}>
                                        {/* Template Name */}
                                        <td>
                                            <div className="tpl-name-cell">
                                                <div
                                                    className="tpl-name-link"
                                                    onClick={() => openEditModal(tpl)}
                                                >
                                                    {tpl.name}
                                                </div>
                                                <div className="tpl-created-date">
                                                    Created {formatDate(tpl.created_at)}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Channel */}
                                        <td>
                                            <span
                                                className={`tpl-channel-pill ${c.pillClass}`}
                                            >
                                                {c.icon} {c.label}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span
                                                className={`tpl-status-pill ${s.pillClass}`}
                                            >
                                                {tpl.channel === "email" ? "✅ " : "⚠️ "}
                                                {s.label}
                                            </span>
                                        </td>

                                        {/* Sent / Opened */}
                                        <td className="text-center">
                                            <span className={`tpl-num ${!tpl.sent_count ? "muted" : ""}`}>
                                                {tpl.sent_count || 0}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`tpl-num ${!tpl.opened_count ? "muted" : ""}`}>
                                                {tpl.opened_count || 0}
                                            </span>
                                        </td>

                                        {/* Open Rate */}
                                        <td>
                                            <div className="tpl-rate-cell">
                                                <div className={`tpl-rate-value ${openRateClass(tpl.open_rate || 0)}`}>
                                                    {(tpl.open_rate || 0)}%
                                                </div>
                                                <div className="tpl-rate-bar">
                                                    <div
                                                        className={`tpl-rate-bar-fill ${openRateBarFill(tpl.open_rate || 0)}`}
                                                        style={{ width: `${tpl.open_rate || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Reply Rate */}
                                        <td>
                                            <div className="tpl-rate-cell">
                                                <div className={`tpl-rate-value ${replyRateClass(tpl.reply_rate || 0)}`}>
                                                    {(tpl.reply_rate || 0)}%
                                                </div>
                                                <div className="tpl-rate-bar">
                                                    <div
                                                        className={`tpl-rate-bar-fill ${replyRateBarFill(tpl.reply_rate || 0)}`}
                                                        style={{ width: `${Math.min((tpl.reply_rate || 0) * 2, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div className="tpl-row-actions">
                                                <button
                                                    className="tpl-action-btn"
                                                    data-tooltip="Edit"
                                                    onClick={() => openEditModal(tpl)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="tpl-action-btn"
                                                    data-tooltip="Duplicate"
                                                    onClick={() => duplicateTemplate(tpl)}
                                                >
                                                    📋
                                                </button>
                                                {deleteConfirmId === tpl.id ? (
                                                    <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
                                                        <button 
                                                            onClick={async () => {
                                                                await deleteTemplate(tpl.id);
                                                                setDeleteConfirmId(null);
                                                            }}
                                                            style={{color:'#EF4444', fontSize:'12px', border:'1px solid #EF4444', borderRadius:'6px', padding:'2px 8px', background:'white', cursor:'pointer'}}
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            style={{fontSize:'12px', color:'#A89585', border:'1px solid #E8DDD4', borderRadius:'6px', padding:'2px 8px', background:'white', cursor:'pointer'}}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="tpl-action-btn"
                                                        data-tooltip="Delete"
                                                        onClick={() => setDeleteConfirmId(tpl.id)}
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════════════════
               Modal — Template Builder
               ════════════════════════════════════════════════ */}
            {showModal && !showAIModal && (
                <div className="tpl-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="tpl-modal">
                        {/* Header */}
                        <div className="tpl-modal-header">
                            <h2>{editingTemplate ? "Edit Template" : "New Template"}</h2>
                            <button className="tpl-modal-close" onClick={closeModal}>
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="tpl-modal-body">
                            {/* Section 1: Template Details */}
                            <div className="tpl-section-title">Template Details</div>
                            <input
                                className="tpl-input"
                                type="text"
                                placeholder="e.g. Summer Campaign Outreach"
                                value={formName || ""}
                                onChange={(e) => setFormName(e.target.value)}
                            />

                            <div style={{ marginTop: 18 }}>
                                <div className="tpl-section-title">Channel</div>
                                <div className="tpl-channel-cards">
                                    {(Object.entries(CHANNEL_CONFIG) as [Channel, typeof CHANNEL_CONFIG.email][]).map(
                                        ([key, cfg]) => (
                                            <div
                                                key={key}
                                                className={`tpl-channel-card ${formChannel === key ? "selected" : ""}`}
                                                onClick={() => setFormChannel(key)}
                                            >
                                                <span className="tpl-channel-card-icon">{cfg.icon}</span>
                                                {cfg.label}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {formChannel === "email" && (
                                <div style={{ marginTop: 18 }}>
                                    <div className="tpl-section-title">Subject Line</div>
                                    <input
                                        className="tpl-input"
                                        type="text"
                                        placeholder="e.g. Collaboration opportunity with {brand_name}"
                                        value={formSubject || ""}
                                        onChange={(e) => setFormSubject(e.target.value)}
                                    />
                                </div>
                            )}

                            <hr className="tpl-section-divider" />

                            {/* Section 2: Template Body */}
                            <div className="tpl-section-title">Message Body</div>
                            <div className="tpl-variable-chips">
                                <span className="tpl-variable-label">Insert variable:</span>
                                {VARIABLES.map((v) => (
                                    <button key={v} className="tpl-variable-chip" onClick={() => insertVariable(v)}>
                                        {v}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                ref={textareaRef}
                                className="tpl-textarea"
                                placeholder="Write your outreach message here..."
                                value={formBody || ""}
                                onChange={(e) => setFormBody(e.target.value)}
                            />

                            <div style={{ marginTop: 14 }}>
                                <button 
                                  className="tpl-btn-outline-terracotta" 
                                  onClick={handleAIImprove}
                                  disabled={isImproving || !formBody.trim()}
                                >
                                    {isImproving ? "✨ Improving..." : "✨ Improve with AI"}
                                </button>
                            </div>

                            <hr className="tpl-section-divider" />

                            {/* Section 3: Preview */}
                            <button
                                className="tpl-preview-toggle"
                                onClick={() => setShowPreview(!showPreview)}
                            >
                                <span className={`chevron ${showPreview ? "open" : ""}`}>▶</span>
                                Preview Message
                            </button>

                            {showPreview && (
                                <div className="tpl-preview-box">
                                    {formChannel === "email" && formSubject && (
                                        <div className="tpl-preview-subject">
                                            Subject: {renderPreview(formSubject)}
                                        </div>
                                    )}
                                    {renderPreview(formBody) || (
                                        <span style={{ color: "var(--text-muted)" }}>
                                            Start typing your message above to see a preview...
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer (sticky) */}
                        <div className="tpl-modal-footer">
                            <div></div>
                            <div className="tpl-modal-footer-right">
                                <button className="tpl-btn-cancel" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button className="tpl-btn-terracotta" onClick={handleSave}>
                                    Save Template →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* AI Improve Modal */}
            {showAIModal && (
                <div className="tpl-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAIModal(false)}>
                    <div className="tpl-modal" style={{ maxWidth: '800px' }}>
                        <div className="tpl-modal-header">
                            <h2>✨ AI Improvement</h2>
                            <button className="tpl-modal-close" onClick={() => setShowAIModal(false)}>✕</button>
                        </div>
                        <div className="tpl-modal-body" style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4>Original</h4>
                                <div className="tpl-preview-box" style={{ marginTop: '10px' }}>
                                    {formChannel === 'email' && <div className="tpl-preview-subject" style={{wordBreak: "break-word"}}>Subject: {formSubject}</div>}
                                    <pre style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', margin: 0, wordBreak: "break-word" }}>{formBody}</pre>
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4>Improved</h4>
                                <div className="tpl-preview-box" style={{ marginTop: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                    {formChannel === 'email' && <div className="tpl-preview-subject" style={{wordBreak: "break-word"}}>Subject: {aiSubject}</div>}
                                    <pre style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', margin: 0, wordBreak: "break-word" }}>{aiBody}</pre>
                                </div>
                            </div>
                        </div>
                        {aiChanges.length > 0 && (
                            <div className="tpl-modal-body" style={{ borderTop: 'none', paddingTop: 0 }}>
                                <h4>Changes made:</h4>
                                <ul style={{ paddingLeft: '20px', marginTop: '10px', color: 'var(--text-muted)' }}>
                                    {aiChanges.map((change, i) => <li key={i}>{change}</li>)}
                                </ul>
                            </div>
                        )}
                        <div className="tpl-modal-footer">
                            <button className="tpl-btn-cancel" onClick={() => setShowAIModal(false)}>Keep Original</button>
                            <button className="tpl-btn-terracotta" onClick={applyAIImprovement}>Use Improved</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
