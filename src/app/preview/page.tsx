"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Tiny mock data for the live UI demos ─── */
const MOCK_INFLUENCERS = [
  {
    handle: "@priyakamble_style",
    name: "Priya Kamble",
    niche: "Fashion & Lifestyle",
    city: "Mumbai",
    platform: "Instagram",
    followers: "248K",
    engagement: "4.2%",
    match: 94,
    initials: "PK",
    color: "#C4622D",
  },
  {
    handle: "@fitwith_arjun",
    name: "Arjun Mehta",
    niche: "Fitness & Wellness",
    city: "Bangalore",
    platform: "YouTube",
    followers: "512K",
    engagement: "6.1%",
    match: 88,
    initials: "AM",
    color: "#6B6B6B",
  },
  {
    handle: "@techdesk_riya",
    name: "Riya Sharma",
    niche: "Tech & Gadgets",
    city: "Delhi",
    platform: "Instagram",
    followers: "189K",
    engagement: "3.8%",
    match: 82,
    initials: "RS",
    color: "#A8501F",
  },
];

const CRM_PIPELINE = [
  { name: "Priya Kamble", status: "negotiating", cost: "₹45,000", days: 2 },
  { name: "Arjun Mehta", status: "email_sent", cost: "₹72,000", days: 5 },
  { name: "Riya Sharma", status: "interested", cost: "₹38,000", days: 1 },
  { name: "Karan Nair", status: "deal_closed", cost: "₹60,000", days: 8 },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  not_contacted: { label: "Not Contacted", bg: "#F5F0E8", text: "#A89585" },
  email_sent: { label: "Email Sent", bg: "#EBF4FF", text: "#2563EB" },
  replied: { label: "Replied", bg: "#F0FDF4", text: "#16A34A" },
  negotiating: { label: "Negotiating", bg: "#FFF7ED", text: "#C4622D" },
  interested: { label: "Interested", bg: "#FDF4FF", text: "#9333EA" },
  deal_closed: { label: "Deal Closed", bg: "#F0FDF4", text: "#15803D" },
};

const FEATURES = [
  {
    icon: "🔍",
    title: "AI-Powered Discovery",
    desc: "Type a natural language query like 'fitness influencers in Mumbai under \u20B950K' and Claude instantly parses intent, extracts filters, and surfaces the perfect matches.",
  },
  {
    icon: "🎯",
    title: "Smart Match Scoring",
    desc: "Every creator gets a dynamic match score blending niche fit, location overlap, platform alignment, audience size, and your budget — all ranked in real-time.",
  },
  {
    icon: "✉️",
    title: "1-Click AI Outreach",
    desc: "Generate hyper-personalized cold emails with a single click. Claude writes a subject + body tailored to the creator's niche and your brand's voice in under 3 seconds.",
  },
  {
    icon: "📋",
    title: "Creator CRM Pipeline",
    desc: "Track every creator from first touch to content live. Built-in status stages, deal values, notes, and match scores keep your entire pipeline visible at a glance.",
  },
  {
    icon: "📊",
    title: "Campaign Analytics",
    desc: "Monitor campaign reach, engagement, and ROI across all active collaborations with real-time charts and performance benchmarks tailored to Indian markets.",
  },
  {
    icon: "🔗",
    title: "Unified Inbox",
    desc: "Connect Gmail, Instagram DMs, and LinkedIn to manage all creator conversations in one place. AI drafts replies based on conversation history and deal context.",
  },
];

const STATS = [
  { label: "Avg. time to first outreach", value: "< 3 min", sub: "vs 2+ hours manually" },
  { label: "Match accuracy", value: "94%", sub: "AI + algorithmic scoring" },
  { label: "Email open rate lift", value: "+62%", sub: "AI-personalized subject lines" },
  { label: "Deals closed faster", value: "3×", sub: "with pipeline visibility" },
];

/* ─── Match Score Ring ─── */
function ScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 100) * circ;
  const color = score >= 90 ? "#15803D" : score >= 75 ? "#C4622D" : "#A89585";
  return (
    <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
      <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="26" cy="26" r={radius} fill="none" stroke="#E8DDD4" strokeWidth="4" />
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color,
        }}
      >
        {score}
      </span>
    </div>
  );
}

/* ─── Animated typing demo ─── */
const SEARCH_QUERIES = [
  "Fashion influencers in Mumbai under ₹50K",
  "YouTube fitness creators with 200K+ followers",
  "Tech reviewers in Bangalore for product launch",
  "Food bloggers for D2C brand campaign",
];

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState<"search" | "crm" | "outreach">("search");
  const [queryIndex, setQueryIndex] = useState(0);
  const [emailVisible, setEmailVisible] = useState(false);

  return (
    <div
      style={{
        background: "#F5F0E8",
        minHeight: "100vh",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        color: "#1C1410",
      }}
    >
      {/* ── NAV ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(245,240,232,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E8DDD4",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg,#C4622D,#D4784A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            C
          </div>
          <span
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "-0.02em",
            }}
          >
            Clinch.ai
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            href="/login"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#1C1410",
              textDecoration: "none",
              padding: "7px 16px",
              borderRadius: 8,
              border: "1px solid #E8DDD4",
              background: "#fff",
            }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              padding: "7px 18px",
              borderRadius: 8,
              background: "linear-gradient(135deg,#C4622D,#D4784A)",
            }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "80px 24px 60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
            border: "1px solid #E8DDD4",
            borderRadius: 100,
            padding: "5px 14px",
            fontSize: 13,
            fontWeight: 500,
            color: "#C4622D",
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 15 }}>✨</span> AI-powered influencer marketing for Indian brands
        </div>

        <h1
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#1C1410",
            marginBottom: 20,
          }}
        >
          Find. Pitch. Close.
          <br />
          <span style={{ color: "#C4622D" }}>Influencer deals in minutes.</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(15px,2vw,19px)",
            color: "#6B5B4E",
            lineHeight: 1.65,
            maxWidth: 640,
            margin: "0 auto 36px",
          }}
        >
          Clinch.ai is the AI-first platform that helps Indian brands discover the right creators,
          auto-generate personalised outreach, and manage every deal — all in one place.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/signup"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              padding: "12px 28px",
              borderRadius: 10,
              background: "linear-gradient(135deg,#C4622D,#D4784A)",
              boxShadow: "0 4px 16px rgba(196,98,45,0.35)",
            }}
          >
            Start for free →
          </Link>
          <a
            href="#demo"
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "#1C1410",
              textDecoration: "none",
              padding: "12px 28px",
              borderRadius: 10,
              border: "1px solid #E8DDD4",
              background: "#fff",
            }}
          >
            See live demo ↓
          </a>
        </div>

        {/* Social proof */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-playfair),serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#C4622D",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "#A89585", marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#C4622D", fontWeight: 500 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE DEMO ── */}
      <section
        id="demo"
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            gap: 6,
            background: "#fff",
            border: "1px solid #E8DDD4",
            borderRadius: 12,
            padding: 5,
            marginBottom: 20,
            width: "fit-content",
            margin: "0 auto 24px",
          }}
        >
          {(["search", "crm", "outreach"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: "7px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background: activeTab === tab ? "linear-gradient(135deg,#C4622D,#D4784A)" : "transparent",
                color: activeTab === tab ? "#fff" : "#A89585",
              }}
            >
              {tab === "search" ? "🔍 AI Search" : tab === "crm" ? "📋 CRM Pipeline" : "✉️ Outreach"}
            </button>
          ))}
        </div>

        {/* Demo panels */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #E8DDD4",
            boxShadow: "0 8px 32px rgba(28,20,16,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              background: "#F5F0E8",
              borderBottom: "1px solid #E8DDD4",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => (
                <div
                  key={c}
                  style={{ width: 12, height: 12, borderRadius: "50%", background: c }}
                />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                maxWidth: 340,
                background: "#fff",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 12,
                color: "#A89585",
                border: "1px solid #E8DDD4",
              }}
            >
              app.clinch.ai/{activeTab === "search" ? "search" : activeTab === "crm" ? "crm" : "search"}
            </div>
          </div>

          {/* ── SEARCH TAB ── */}
          {activeTab === "search" && (
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#A89585", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  AI Search — Natural Language Discovery
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    background: "#F5F0E8",
                    borderRadius: 10,
                    padding: "10px 14px",
                    border: "1px solid #E8DDD4",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 16 }}>🔍</span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#1C1410",
                      fontStyle: "italic",
                      cursor: "pointer",
                    }}
                    onClick={() => setQueryIndex((queryIndex + 1) % SEARCH_QUERIES.length)}
                  >
                    {SEARCH_QUERIES[queryIndex]}
                  </span>
                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      color: "#C4622D",
                      fontWeight: 600,
                      background: "#F0D5C3",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    AI Parsed ✓
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  {["Fashion", "Mumbai", "Instagram", "≤ ₹50K", "100K+ followers"].map((chip) => (
                    <span
                      key={chip}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#C4622D",
                        background: "#FDF0E8",
                        border: "1px solid #F0D5C3",
                        borderRadius: 100,
                        padding: "3px 10px",
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MOCK_INFLUENCERS.map((inf, i) => (
                  <div
                    key={inf.handle}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 16px",
                      background: i === 0 ? "#FDFAF7" : "#FAFAFA",
                      borderRadius: 10,
                      border: `1px solid ${i === 0 ? "#F0D5C3" : "#E8DDD4"}`,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: inf.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {inf.initials}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#1C1410" }}>{inf.name}</span>
                        <span style={{ fontSize: 12, color: "#A89585" }}>{inf.handle}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[inf.niche, inf.city, inf.platform].map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: 11,
                              color: "#A89585",
                              background: "#F5F0E8",
                              padding: "2px 7px",
                              borderRadius: 4,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Metrics */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1410" }}>{inf.followers}</div>
                      <div style={{ fontSize: 11, color: "#A89585" }}>{inf.engagement} eng.</div>
                    </div>
                    {/* Score */}
                    <ScoreRing score={inf.match} />
                    {/* CTA */}
                    <button
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#fff",
                        background: "linear-gradient(135deg,#C4622D,#D4784A)",
                        border: "none",
                        borderRadius: 7,
                        padding: "7px 14px",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Add to CRM
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CRM TAB ── */}
          {activeTab === "crm" && (
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#A89585", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Creator Pipeline — Track Every Deal
              </div>
              {/* Stats bar */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "In Pipeline", value: "4" },
                  { label: "Emails Sent", value: "2" },
                  { label: "Deal Value", value: "₹2.15L" },
                  { label: "Deals Closed", value: "1" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      minWidth: 100,
                      background: "#F5F0E8",
                      borderRadius: 8,
                      padding: "12px 14px",
                      border: "1px solid #E8DDD4",
                    }}
                  >
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#1C1410", fontFamily: "var(--font-playfair),serif" }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 11, color: "#A89585", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Table */}
              <div style={{ borderRadius: 10, border: "1px solid #E8DDD4", overflow: "hidden" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px 100px 80px",
                    gap: 0,
                    background: "#F5F0E8",
                    padding: "8px 16px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#A89585",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span>Creator</span>
                  <span>Status</span>
                  <span>Est. Cost</span>
                  <span>Days</span>
                </div>
                {CRM_PIPELINE.map((row, i) => {
                  const s = STATUS_CONFIG[row.status];
                  return (
                    <div
                      key={row.name}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 140px 100px 80px",
                        padding: "12px 16px",
                        alignItems: "center",
                        borderTop: i > 0 ? "1px solid #F0E8DE" : "none",
                        background: "#fff",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{row.name}</span>
                      <span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            background: s.bg,
                            color: s.text,
                            padding: "3px 8px",
                            borderRadius: 100,
                          }}
                        >
                          {s.label}
                        </span>
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#1C1410" }}>{row.cost}</span>
                      <span style={{ fontSize: 12, color: "#A89585" }}>{row.days}d ago</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── OUTREACH TAB ── */}
          {activeTab === "outreach" && (
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#A89585", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                AI Outreach — Personalised in Seconds
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Left: creator card */}
                <div>
                  <div style={{ fontSize: 12, color: "#A89585", marginBottom: 8, fontWeight: 500 }}>Selected creator</div>
                  <div
                    style={{
                      background: "#F5F0E8",
                      borderRadius: 10,
                      padding: 14,
                      border: "1px solid #E8DDD4",
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "#C4622D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        PK
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>Priya Kamble</div>
                        <div style={{ fontSize: 12, color: "#A89585" }}>Fashion · Mumbai · 248K</div>
                      </div>
                      <ScoreRing score={94} />
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailVisible(!emailVisible)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "linear-gradient(135deg,#C4622D,#D4784A)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    {emailVisible ? "✓ Draft generated" : "✨ Generate AI outreach"}
                  </button>
                  {emailVisible && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: "#15803D",
                        background: "#F0FDF4",
                        border: "1px solid #BBF7D0",
                        borderRadius: 7,
                        padding: "8px 12px",
                        fontWeight: 500,
                      }}
                    >
                      ✓ Email queued for mailbox
                    </div>
                  )}
                </div>

                {/* Right: email draft */}
                <div>
                  <div style={{ fontSize: 12, color: "#A89585", marginBottom: 8, fontWeight: 500 }}>
                    {emailVisible ? "AI-generated draft" : "Click to generate →"}
                  </div>
                  {emailVisible ? (
                    <div
                      style={{
                        background: "#FDFAF7",
                        border: "1px solid #F0D5C3",
                        borderRadius: 10,
                        padding: 14,
                        fontSize: 13,
                        lineHeight: 1.65,
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 8, color: "#1C1410" }}>
                        Subject: Collaboration with Priya — let's create something special ✨
                      </div>
                      <div style={{ color: "#3D2C22" }}>
                        Hi Priya,<br /><br />
                        Love how you blend everyday fashion with Mumbai's energy — your Bandra lookbooks
                        are genuinely stunning.<br /><br />
                        We're Zephyr, a homegrown ethnic-fusion brand, and we'd love to collaborate
                        for our Diwali collection drop. Budget ₹45K + product gifting.<br /><br />
                        Would you be open to a quick chat this week?
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          padding: "6px 10px",
                          background: "#FDF0E8",
                          borderRadius: 6,
                          fontSize: 11,
                          color: "#C4622D",
                          fontWeight: 500,
                        }}
                      >
                        ✨ Generated by Claude · 98 words · 8s
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "#F5F0E8",
                        border: "1px dashed #E8DDD4",
                        borderRadius: 10,
                        padding: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#A89585",
                        fontSize: 13,
                        height: 180,
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 28 }}>✉️</span>
                      <span>Your AI draft will appear here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section
        style={{
          background: "#1C1410",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(28px,4vw,42px)",
                fontWeight: 700,
                color: "#E8DDD4",
                letterSpacing: "-0.02em",
                marginBottom: 12,
              }}
            >
              Everything you need to run
              <br />
              <span style={{ color: "#C4622D" }}>influencer campaigns at scale</span>
            </h2>
            <p style={{ fontSize: 16, color: "#8A7A6C", maxWidth: 520, margin: "0 auto" }}>
              Built for Indian brands who want speed, precision, and results — not spreadsheets.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(232,221,212,0.1)",
                  borderRadius: 12,
                  padding: 22,
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div
                  style={{
                    fontFamily: "var(--font-playfair), serif",
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#E8DDD4",
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </div>
                <p style={{ fontSize: 13, color: "#8A7A6C", lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(26px,4vw,38px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 10,
            }}
          >
            From brief to campaign in 3 steps
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            {
              step: "01",
              title: "Describe your campaign",
              desc: "Type what you're looking for in plain English — niche, platform, city, budget. Claude parses your intent and extracts filters instantly.",
              icon: "💬",
            },
            {
              step: "02",
              title: "Review AI-ranked matches",
              desc: "Clinch scores every creator on 5 dimensions and surfaces the best fits with full profiles, metrics, and AI insights.",
              icon: "🎯",
            },
            {
              step: "03",
              title: "Reach out & close deals",
              desc: "Generate a personalised email in one click, add creators to your CRM pipeline, and track deals from first contact to content live.",
              icon: "🤝",
            },
          ].map((step, i) => (
            <div
              key={step.step}
              style={{
                display: "flex",
                gap: 24,
                alignItems: "flex-start",
                padding: "28px 0",
                borderBottom: i < 2 ? "1px solid #E8DDD4" : "none",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: "linear-gradient(135deg,#C4622D,#D4784A)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C4622D", marginBottom: 4, letterSpacing: "0.1em" }}>
                  STEP {step.step}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-playfair), serif",
                    fontSize: 20,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: "#1C1410",
                  }}
                >
                  {step.title}
                </div>
                <p style={{ fontSize: 14, color: "#6B5B4E", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        style={{
          background: "#fff",
          borderTop: "1px solid #E8DDD4",
          borderBottom: "1px solid #E8DDD4",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(26px,4vw,38px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 10,
              }}
            >
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: 15, color: "#A89585" }}>Start free. Scale when you're ready.</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                name: "Starter",
                price: "Free",
                sub: "forever",
                features: ["50 AI searches / month", "10 creators in CRM", "5 AI-drafted emails", "Basic analytics"],
                cta: "Get started",
                highlight: false,
              },
              {
                name: "Pro",
                price: "₹4,999",
                sub: "/ month",
                features: ["Unlimited AI searches", "Unlimited CRM entries", "Unlimited AI outreach", "Gmail sync", "Full campaign analytics", "Priority support"],
                cta: "Start Pro trial",
                highlight: true,
              },
              {
                name: "Agency",
                price: "₹14,999",
                sub: "/ month",
                features: ["Everything in Pro", "5 brand workspaces", "Team collaboration", "White-label reports", "Dedicated CSM"],
                cta: "Contact sales",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: plan.highlight ? "linear-gradient(160deg,#1C1410,#2A1E18)" : "#F5F0E8",
                  border: plan.highlight ? "1px solid #C4622D" : "1px solid #E8DDD4",
                  borderRadius: 14,
                  padding: 24,
                  position: "relative",
                }}
              >
                {plan.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg,#C4622D,#D4784A)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 12px",
                      borderRadius: 100,
                      letterSpacing: "0.06em",
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: plan.highlight ? "#E8DDD4" : "#A89585",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {plan.name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-playfair),serif",
                      fontSize: 32,
                      fontWeight: 700,
                      color: plan.highlight ? "#fff" : "#1C1410",
                    }}
                  >
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 13, color: plan.highlight ? "#8A7A6C" : "#A89585" }}>{plan.sub}</span>
                </div>
                <div style={{ borderTop: `1px solid ${plan.highlight ? "rgba(232,221,212,0.1)" : "#E8DDD4"}`, margin: "16px 0" }} />
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: plan.highlight ? "#C8B8AA" : "#6B5B4E" }}>
                      <span style={{ color: "#C4622D", flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    background: plan.highlight ? "linear-gradient(135deg,#C4622D,#D4784A)" : "#fff",
                    color: plan.highlight ? "#fff" : "#1C1410",
                    border: plan.highlight ? "none" : "1px solid #E8DDD4",
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(28px,5vw,48px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: 16,
            lineHeight: 1.15,
          }}
        >
          Your next creator deal
          <br />
          <span style={{ color: "#C4622D" }}>is 3 minutes away.</span>
        </h2>
        <p style={{ fontSize: 16, color: "#6B5B4E", marginBottom: 32 }}>
          Join Indian brands already using Clinch.ai to build creator partnerships faster, smarter, and at scale.
        </p>
        <Link
          href="/signup"
          style={{
            display: "inline-block",
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
            textDecoration: "none",
            padding: "14px 36px",
            borderRadius: 12,
            background: "linear-gradient(135deg,#C4622D,#D4784A)",
            boxShadow: "0 8px 24px rgba(196,98,45,0.4)",
          }}
        >
          Start for free — no credit card needed →
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid #E8DDD4",
          padding: "28px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "linear-gradient(135deg,#C4622D,#D4784A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            C
          </div>
          <span style={{ fontFamily: "var(--font-playfair),serif", fontWeight: 700, fontSize: 15 }}>
            Clinch.ai
          </span>
        </div>
        <p style={{ fontSize: 12, color: "#A89585", margin: 0 }}>
          © 2025 Clinch.ai · AI-powered influencer marketing for India
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          {["Privacy", "Terms", "Contact"].map((link) => (
            <a key={link} href="#" style={{ fontSize: 12, color: "#A89585", textDecoration: "none" }}>
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
