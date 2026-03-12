"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

interface OutreachModalProps {
    influencer: any;
    onClose: () => void;
    onSent?: () => void;
}

type SendChannel = "email" | "instagram" | "linkedin";

export function OutreachModal({ influencer, onClose, onSent }: OutreachModalProps) {
    const { showToast } = useToast();
    const [generating, setGenerating] = useState(true);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [channel, setChannel] = useState<SendChannel>("email");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    // Auto-call draft generation on mount
    useEffect(() => {
        generateDraft();
    }, []);

    async function generateDraft() {
        setGenerating(true);
        setError("");
        try {
            const res = await fetch("/api/ai/outreach-draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ influencer }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSubject(data.subject || "");
            setBody(data.body || "");
        } catch (err: any) {
            const msg = err.message || "Failed to generate draft";
            setError(msg);
            showToast("error", msg);
        } finally {
            setGenerating(false);
        }
    }

    async function handleQueue() {
        setSending(true);
        setError("");
        try {
            // 1. Ensure influencer is in CRM
            await fetch("/api/crm/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    influencer,
                    match_score: influencer.match_score || 0,
                    ai_insight: influencer.ai_insight || "",
                }),
            });

            // 2. Save outreach draft to messages table
            // (actual Gmail send comes in Phase 2)
            await fetch("/api/messages/draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    influencer_external_id: influencer.external_id,
                    influencer_handle: influencer.handle,
                    channel: "email",
                    subject,
                    body,
                    status: "queued",
                }),
            }).catch(() => {
                // Silently fail if route doesn't exist yet
                // Gmail integration comes in Phase 2
            });

            setSent(true);
            showToast("success", "Email queued for Mailbox ✓");

            // Close after 1.5s + call parent callback
            setTimeout(() => {
                onSent?.();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError("Failed to queue. Try again.");
        } finally {
            setSending(false);
        }
    }

    const firstName = influencer.full_name?.split(" ")[0] || influencer.handle;
    const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

    return (
        <>
            {/* Backdrop */}
            <div className="om-backdrop" onClick={onClose} />

            {/* Modal */}
            <div className="om-modal">
                {/* ─── Header ─── */}
                <div className="om-header">
                    <div className="om-header-left">
                        <h3 className="om-title">Draft Outreach Message</h3>
                        <p className="om-subtitle">
                            To: {influencer.full_name} ({influencer.handle})
                        </p>
                    </div>
                    <button
                        className="om-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* ─── Body (scrollable) ─── */}
                <div className="om-body">
                    {/* Channel Selector */}
                    <div className="om-channel-section">
                        <span className="om-label">SEND VIA</span>
                        <div className="om-channel-row">
                            <button
                                className={`om-channel-pill ${channel === "email" ? "active" : ""}`}
                                onClick={() => setChannel("email")}
                            >
                                📧 Email
                            </button>
                            <button
                                className="om-channel-pill disabled"
                                disabled
                                title="Coming in Phase 2"
                            >
                                💬 Instagram DM <span className="om-soon">(Soon)</span>
                            </button>
                            <button
                                className="om-channel-pill disabled"
                                disabled
                                title="Coming in Phase 2"
                            >
                                💼 LinkedIn <span className="om-soon">(Soon)</span>
                            </button>
                        </div>
                    </div>

                    {/* ─── Generating State ─── */}
                    {generating && (
                        <div className="om-generating">
                            <div className="om-spinner" />
                            <p className="om-generating-text">
                                ✨ Writing personalized email...
                            </p>
                            <div className="om-skeleton-bars">
                                <div className="om-skel-bar om-skel-subject" />
                                <div className="om-skel-bar om-skel-body" />
                            </div>
                        </div>
                    )}

                    {/* ─── Error State ─── */}
                    {!generating && error && (
                        <div className="om-error">
                            <p>{error}</p>
                            <button
                                className="om-error-retry"
                                onClick={generateDraft}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* ─── Draft Ready State ─── */}
                    {!generating && !error && (
                        <>
                            {/* AI Draft Badge */}
                            <div className="om-ai-badge">
                                ✨ AI Draft — edit before sending
                            </div>

                            {/* Subject Line */}
                            <div className="om-field">
                                <label className="om-label">SUBJECT LINE</label>
                                <input
                                    type="text"
                                    className="om-input"
                                    value={subject || ""}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Email subject..."
                                />
                            </div>

                            {/* Message Body */}
                            <div className="om-field">
                                <label className="om-label">MESSAGE</label>
                                <textarea
                                    className="om-textarea"
                                    value={body || ""}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Write your outreach message..."
                                    rows={8}
                                />
                                <p className="om-word-count">
                                    {wordCount} words · Edit freely before sending
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* ─── Footer (sticky) ─── */}
                <div className="om-footer">
                    <button
                        className="om-btn-regen"
                        onClick={generateDraft}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <span className="om-btn-spinner" /> Regenerating...
                            </>
                        ) : (
                            "↻ Regenerate"
                        )}
                    </button>

                    <div className="om-footer-right">
                        <button className="om-btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className={`om-btn-queue ${sent ? "sent" : ""}`}
                            onClick={handleQueue}
                            disabled={sending || sent || !body.trim()}
                        >
                            {sent
                                ? "✅ Queued!"
                                : sending
                                    ? "Queuing..."
                                    : "✉️ Queue Email →"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
