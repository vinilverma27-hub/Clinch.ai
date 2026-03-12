"use client";

import { useState, useEffect } from "react";
import "./dashboard.css";

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

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchBrand = () => {
    fetch('/api/brand/profile')
      .then(r => r.json())
      .then(data => {
        if (data.brand) setBrand(data.brand);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    fetchBrand();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval); // cleanup
  }, []);

  const hour = new Date().getHours()
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const greetingName = brand?.name || "Clinch User"

  return (
    <div className="p-8 lg:p-12 max-w-5xl">
      {/* Greeting */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary font-[family-name:var(--font-heading)] mb-2">
          Good {greetingTime}, {greetingName}!
        </h1>
        <p className="text-[15px] text-text-muted">
          Here&apos;s what&apos;s happening across your campaigns today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Searches", value: stats?.total_searches, icon: "🔍", sub: "Searches performed" },
          { label: "In Pipeline", value: stats?.crm_total, icon: "👥", sub: "Creators in CRM" },
          { label: "Emails Queued", value: stats?.emails_sent, icon: "✉️", sub: "Outreach sent" },
          { label: "Deals Closed", value: stats?.deals_closed, icon: "🤝", sub: "Partnerships signed" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-[12px] font-medium text-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>{stat.icon}</span> {stat.label}
            </p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mb-2" />
            ) : (
              <p className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-heading)]">
                {stat.value ?? 0}
              </p>
            )}
            <p className="text-[12px] text-text-muted mt-1.5 font-medium">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ──────────── Recent Activity ──────────── */}
      <div
        className="bg-bg-surface rounded-xl border border-border p-6 mb-6"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-heading)] mb-2">
          Recent Activity
        </h2>

        <div className="activity-feed">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recent_activity?.length > 0 ? (
            stats.recent_activity.map((item: any) => (
              <div key={item.id} className="activity-item border-b border-border last:border-0 py-3 flex items-center gap-4">
                <span className="activity-emoji flex-shrink-0">🔍</span>
                <div className="activity-content flex-1">
                  <p className="activity-title text-[14px] text-text-primary">
                    Searched for <strong>"{item.query}"</strong>
                  </p>
                  <p className="activity-sub text-[12px] text-text-muted">
                    {item.results_count} results
                    <span className="mx-2 inline-block w-1 h-1 rounded-full bg-border align-middle" />
                    {timeAgo(item.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-text-muted text-[14px] mb-3">No recent activity yet.</p>
              <a href="/dashboard/search" className="text-terracotta font-medium text-[14px] hover:underline">
                Start searching →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ──────────── Top AI Matches Today ──────────── */}
      <div className="ai-matches-section bg-bg-surface rounded-xl border border-border p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="ai-matches-header mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-heading)]">
            Top Matches from CRM
          </h2>
          <span className="ai-badge bg-terracotta/10 text-terracotta px-3 py-1 rounded-full text-xs font-semibold">🤖 AI Curated</span>
        </div>

        <div className="match-cards space-y-4">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded" />
              </div>
            ))
          ) : stats?.top_matches?.length > 0 ? (
            stats.top_matches.map((entry: any) => {
              const inf = entry.influencers;
              if (!inf) return null;
              return (
                <div key={entry.id} className="match-card p-4 border border-border rounded-lg flex items-center gap-4 hover:border-terracotta transition-colors group cursor-pointer" onClick={() => window.location.href=`/dashboard/influencer/${entry.influencer_id}`}>
                  <div className="match-avatar w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center font-bold flex-shrink-0">
                    {inf.full_name?.[0] || '?'}
                  </div>
                  <div className="match-info flex-1">
                    <div className="match-name font-semibold text-text-primary group-hover:text-terracotta transition-colors">
                      {inf.full_name}
                    </div>
                    <div className="match-handle text-sm text-text-muted">
                      @{inf.handle} • {inf.platform}
                    </div>
                  </div>
                  <div className="match-score text-terracotta font-bold text-lg">
                    {entry.match_score}%
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center border border-dashed border-border rounded-lg">
              <p className="text-text-muted text-[14px] mb-2">No top matches yet.</p>
              <p className="text-[12px] text-text-muted">Add influencers to CRM to see recommendations here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
