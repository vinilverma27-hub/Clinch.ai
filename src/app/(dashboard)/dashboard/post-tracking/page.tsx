"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ────────────── Icons ────────────── */
function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconX({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconChevronDown({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function IconEye({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconExternal({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconPause({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function IconPlay({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function IconInstagram({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconYouTube({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33 2.78 2.78 0 001.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29.02 29.02 0 0023 11.75a29 29 0 00-.46-5.33zM9.75 15.02V8.48L15.5 11.75l-5.75 3.27z" />
    </svg>
  );
}

function IconLinkedIn({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function IconChartBar({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}

/* ────────────── Mock Data ────────────── */
const statsData = {
  posts_tracked: 12,
  total_views: "284.7K",
  total_engagement: "18.4K",
  avg_engagement_rate: 4.8,
};

const lineChartDataAll = [
  { date: "Mar 4", views: 12.4, engagement: 0.8 },
  { date: "Mar 5", views: 18.2, engagement: 1.2 },
  { date: "Mar 6", views: 15.8, engagement: 0.9 },
  { date: "Mar 7", views: 22.1, engagement: 1.5 },
  { date: "Mar 8", views: 19.4, engagement: 1.3 },
  { date: "Mar 9", views: 28.7, engagement: 2.1 },
  { date: "Mar 10", views: 31.2, engagement: 2.4 },
];

const lineChartDataInsta = [
  { date: "Mar 4", views: 8.4, engagement: 0.5 },
  { date: "Mar 5", views: 12.2, engagement: 0.8 },
  { date: "Mar 6", views: 10.8, engagement: 0.6 },
  { date: "Mar 7", views: 15.1, engagement: 1.0 },
  { date: "Mar 8", views: 13.4, engagement: 0.9 },
  { date: "Mar 9", views: 18.7, engagement: 1.3 },
  { date: "Mar 10", views: 20.2, engagement: 1.6 },
];

const lineChartDataYoutube = [
  { date: "Mar 4", views: 3.0, engagement: 0.2 },
  { date: "Mar 5", views: 5.0, engagement: 0.3 },
  { date: "Mar 6", views: 4.0, engagement: 0.2 },
  { date: "Mar 7", views: 6.0, engagement: 0.4 },
  { date: "Mar 8", views: 5.0, engagement: 0.3 },
  { date: "Mar 9", views: 9.0, engagement: 0.7 },
  { date: "Mar 10", views: 10.0, engagement: 0.7 },
];

const lineChartDataLinkedin = [
  { date: "Mar 4", views: 1.0, engagement: 0.1 },
  { date: "Mar 5", views: 1.0, engagement: 0.1 },
  { date: "Mar 6", views: 1.0, engagement: 0.1 },
  { date: "Mar 7", views: 1.0, engagement: 0.1 },
  { date: "Mar 8", views: 1.0, engagement: 0.1 },
  { date: "Mar 9", views: 1.0, engagement: 0.1 },
  { date: "Mar 10", views: 1.0, engagement: 0.1 },
];

const initialTableData = [
  {
    id: 1,
    caption:
      "Summer skincare routine that changed my life ✨ #skincare #summer",
    influencer: "Priya Sharma",
    handle: "priya_stylefiles",
    platform: "instagram",
    views: "48.2K",
    likes: "3.8K",
    comments: "284",
    engagement_rate: 8.5,
    status: "live",
    posted: "Mar 8, 2026",
    avatar_color: "#C4622D",
  },
  {
    id: 2,
    caption: "Honest review: Is this ₹5000 moisturizer actually worth it?",
    influencer: "Arjun Mehta",
    handle: "techwitharjun",
    platform: "youtube",
    views: "92.4K",
    likes: "5.8K",
    comments: "641",
    engagement_rate: 6.2,
    status: "live",
    posted: "Mar 6, 2026",
    avatar_color: "#2D7DD2",
  },
  {
    id: 3,
    caption:
      "POV: Found the best street food in Bangalore 🍜 #foodie #bangalore",
    influencer: "Sneha Iyer",
    handle: "sneha.eats",
    platform: "instagram",
    views: "124K",
    likes: "9.2K",
    comments: "820",
    engagement_rate: 7.8,
    status: "live",
    posted: "Mar 5, 2026",
    avatar_color: "#3BB273",
  },
  {
    id: 4,
    caption: "Why Indian brands need to invest in micro-influencers in 2026",
    influencer: "Rahul Kapoor",
    handle: "rahulkapoor",
    platform: "linkedin",
    views: "8.4K",
    likes: "420",
    comments: "84",
    engagement_rate: 3.1,
    status: "paused",
    posted: "Mar 3, 2026",
    avatar_color: "#7B2D8B",
  },
];

export default function PostTrackingPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [drawerHistory, setDrawerHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostUrl, setNewPostUrl] = useState("");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Last 7 days");
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Filters State
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    platform: "",
    status: "",
    engagement_min: "",
    engagement_max: "",
    views_min: "",
    views_max: "",
    influencer: "",
    campaign: "",
    date_from: "",
    date_to: "",
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    const count = Object.values(filters).filter((v) => v !== "").length;
    setActiveFilterCount(count);
  }, [filters]);

  const fetchPosts = async (platformFilter?: string) => {
    try {
      setIsLoading(true);
      let url = "/api/post-tracking";
      if (platformFilter && platformFilter !== "All") {
        url += `?platform=${platformFilter.toLowerCase().replace(/[^a-z]/g, "")}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data.posts || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error("Error fetching posts:", err);
      showToast("error", "Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async (daysLabel: string) => {
    try {
      let days = "7";
      if (daysLabel === "Last 14 days") days = "14";
      if (daysLabel === "Last 30 days") days = "30";
      if (daysLabel === "Last 90 days") days = "90";
      
      let url = `/api/post-tracking/chart?days=${days}`;
      if (activeTab !== "All") {
         url += `&platform=${activeTab.toLowerCase().replace(/[^a-z]/g, "")}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setChartData(data || []);
    } catch (err) {
      console.error("Error fetching chart data:", err);
    }
  };

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchChartData(dateRange);
  }, [dateRange, activeTab]);

  useEffect(() => {
    if (selectedPost) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`/api/post-tracking/${selectedPost.id}`);
          const { history } = await res.json();
          setDrawerHistory(history || []);
        } catch (err) {
          console.error("Error fetching post history:", err);
        }
      };
      fetchHistory();
    } else {
      setDrawerHistory([]);
    }
  }, [selectedPost]);

  // Sort State
  const [sortConfig, setSortConfig] = useState({
    key: "posted",
    direction: "desc",
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const parseK = (val: string | number) => {
    const stringVal = val.toString().trim().toUpperCase();
    if (stringVal.endsWith("K")) return parseFloat(stringVal) * 1000;
    if (stringVal.endsWith("M")) return parseFloat(stringVal) * 1000000;
    return parseFloat(stringVal) || 0;
  };

  const filteredPosts = posts.filter((post) => {
    // Platform match (respect tab + filters panel)
    if (activeTab !== "All") {
      const selectedTabPlatform = activeTab
        .toLowerCase()
        .replace(/[^a-z]/g, "");
      if (post.platform !== selectedTabPlatform) return false;
    }
    if (filters.platform && post.platform !== filters.platform) return false;

    // Status filter
    if (filters.status && post.status !== filters.status) return false;

    // Engagement rate range
    if (
      filters.engagement_min &&
      post.engagement_rate < parseFloat(filters.engagement_min)
    )
      return false;
    if (
      filters.engagement_max &&
      post.engagement_rate > parseFloat(filters.engagement_max)
    )
      return false;

    // Views range
    const postViews = parseK(post.views);
    if (filters.views_min && postViews < parseInt(filters.views_min))
      return false;
    if (filters.views_max && postViews > parseInt(filters.views_max))
      return false;

    // Influencer search
    const influencerName = post.influencer_name || post.influencer || "";
    const influencerHandle = post.influencer_handle || post.handle || "";
    if (filters.influencer) {
      const q = filters.influencer.toLowerCase();
      if (
        !influencerName.toLowerCase().includes(q) &&
        !influencerHandle.toLowerCase().includes(q)
      )
        return false;
    }

    // Date range
    const postDateVal = post.post_published_at || post.posted;
    if (filters.date_from) {
      const postDate = new Date(postDateVal);
      const fromDate = new Date(filters.date_from);
      if (postDate < fromDate) return false;
    }
    if (filters.date_to) {
      const postDate = new Date(postDateVal);
      const toDate = new Date(filters.date_to);
      toDate.setHours(23, 59, 59, 999);
      if (postDate > toDate) return false;
    }

    // Global search match
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        (post.caption || "").toLowerCase().includes(searchLower) ||
        influencerName.toLowerCase().includes(searchLower) ||
        influencerHandle.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    let aVal: any = a[sortConfig.key === "posted" ? "post_published_at" : sortConfig.key as keyof typeof a];
    let bVal: any = b[sortConfig.key === "posted" ? "post_published_at" : sortConfig.key as keyof typeof b];

    // Handle numeric strings like views, likes, comments (e.g. "48.2K")
    if (["views", "likes", "comments"].includes(sortConfig.key)) {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else if (sortConfig.key === "posted" || sortConfig.key === "post_published_at") {
      aVal = new Date(a.post_published_at || a.posted as string).getTime();
      bVal = new Date(b.post_published_at || b.posted as string).getTime();
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const formatK = (num: number) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const dynamicStats = {
    posts_tracked: stats.posts_tracked || 0,
    total_views: formatK(stats.total_views || 0),
    total_engagement: formatK(stats.total_engagement || 0),
    avg_engagement_rate: stats.avg_engagement_rate || 0,
  };

  const pb = stats.platform_breakdown || {};
  const dynamicPieData = [
    { name: "Instagram", value: pb.instagram || 0, color: "#E4405F" },
    { name: "YouTube", value: pb.youtube || 0, color: "#FF0000" },
    { name: "LinkedIn", value: pb.linkedin || 0, color: "#0077B5" },
  ].filter((p) => p.value > 0);

  const getLineData = () => chartData;

  const detectPlatform = (url: string) => {
    if (url.includes("instagram.com"))
      return {
        platform: "instagram",
        label: "📸 Instagram post detected",
        color: "#E4405F",
      };
    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return {
        platform: "youtube",
        label: "▶️ YouTube video detected",
        color: "#FF0000",
      };
    if (url.includes("linkedin.com"))
      return {
        platform: "linkedin",
        label: "💼 LinkedIn post detected",
        color: "#0077B5",
      };
    return null;
  };
  const detectedPlatformInfo = detectPlatform(newPostUrl);

  // Handle Pause/Resume
  const handleToggleStatus = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    try {
      const newStatus = post.status === "live" ? "paused" : "live";
      await fetch(`/api/post-tracking/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setPosts(
        posts.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
      );
      showToast("success", `Post ${newStatus === "live" ? "resumed" : "paused"}`);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update tracking status");
    }
  };

  // Handle Delete
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await fetch(`/api/post-tracking/${id}`, { method: "DELETE" });
      setPosts(posts.filter((p) => p.id !== id));
      showToast("success", "Post removed from tracking");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete post");
    }
  };

  const handleStartTracking = async () => {
    if (!newPostUrl.trim()) return;
    try {
      const platform = newPostUrl.toLowerCase().includes("youtube")
        ? "youtube"
        : newPostUrl.toLowerCase().includes("linkedin")
          ? "linkedin"
          : "instagram";

      const res = await fetch("/api/post-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_url: newPostUrl,
          platform,
          campaign: "",
          notes: "",
          influencer_name: "Unknown Creator",
          post_published_at: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => [data.post, ...prev]);
        showToast("success", "Post is now being tracked!");
      } else {
        showToast("error", data.error || "Failed to add post");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to add post");
    }
    setNewPostUrl("");
    setIsModalOpen(false);
  };

  // Platform icon helper
  const getPlatformIcon = (platform: string, className?: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <IconInstagram className={className} />;
      case "youtube":
        return <IconYouTube className={className} />;
      case "linkedin":
        return <IconLinkedIn className={className} />;
      default:
        return null;
    }
  };

  // Platform gradient helper
  const getPlatformBg = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "linear-gradient(135deg, #F58529, #DD2A7B, #515BD4)";
      case "youtube":
        return "#FF0000";
      case "linkedin":
        return "#0077B5";
      default:
        return "#A89585";
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "bg-[#FDF2F8] text-[#E4405F]";
      case "youtube":
        return "bg-[#FFF0F0] text-[#FF0000]";
      case "linkedin":
        return "bg-[#EBF5FB] text-[#0077B5]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEngagementColor = (rate: number) => {
    if (rate > 5) return "#16A34A";
    if (rate >= 3) return "#C4622D";
    if (rate >= 1) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F5F0E8] p-8 overflow-y-auto selection:bg-[#C4622D] selection:text-white">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.5 }
        }
      `}</style>
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] text-[#1C1410] font-[family-name:var(--font-heading)] mb-1">
              Post Tracking
            </h1>
            <p className="text-[14px] text-[#A89585] font-[family-name:var(--font-body)]">
              Track and measure your influencer content performance
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#C4622D] hover:bg-[#b05828] text-white rounded-[10px] px-5 py-2.5 text-[14px] font-semibold transition-colors font-[family-name:var(--font-body)]"
          >
            + Track New Post
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {["All", "📸 Instagram", "▶️ YouTube", "💼 LinkedIn"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors font-[family-name:var(--font-body)] ${
                  activeTab === tab
                    ? "bg-[#1C1410] text-white"
                    : "bg-transparent text-[#A89585] hover:text-[#1C1410]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-[#E8DDD4] rounded-lg px-3 py-1.5 text-[13px] text-[#1C1410] font-[family-name:var(--font-body)] hover:bg-[#FDFAF6]"
            >
              {dateRange}{" "}
              <span
                className={`transition-transform ${isDateDropdownOpen ? "rotate-180" : ""}`}
              >
                <IconChevronDown />
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDateDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-[160px] bg-white border border-[#E8DDD4] rounded-lg shadow-lg z-50 py-1 font-[family-name:var(--font-body)]">
                {[
                  "Last 7 days",
                  "Last 14 days",
                  "Last 30 days",
                  "Last 90 days",
                  "Custom range",
                ].map((range) => (
                  <button
                    key={range}
                    className={`block w-full text-left px-3 py-2 text-[13px] hover:bg-[#F5F0E8] ${dateRange === range ? "text-[#C4622D] font-medium" : "text-[#1C1410]"}`}
                    onClick={() => {
                      setDateRange(range);
                      setIsDateDropdownOpen(false);
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`stat-skeleton-${i}`}
                  style={{
                    background: "#F5F0E8",
                    borderRadius: 12,
                    height: 100,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </>
          ) : (
            <>
              <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 shadow-sm">
                <p className="text-[11px] text-[#A89585] uppercase tracking-[0.08em] font-[family-name:var(--font-body)] mb-2">
                  Posts Tracked
                </p>
                <div className="text-[32px] text-[#1C1410] font-bold font-[family-name:var(--font-heading)] leading-none mb-1">
                  {dynamicStats.posts_tracked}
                </div>
                <p className="text-[12px] text-[#A89585] font-[family-name:var(--font-body)]">
                  active posts
                </p>
              </div>

              <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-[#A89585] uppercase tracking-[0.08em] font-[family-name:var(--font-body)]">
                    Total Views
                  </p>
                  <span className="bg-[#F0FDF4] text-[#16A34A] text-[11px] font-[family-name:var(--font-body)] font-medium px-2 py-0.5 rounded-md">
                    ↑ 12%
                  </span>
                </div>
                <div className="text-[32px] text-[#1C1410] font-bold font-[family-name:var(--font-heading)] leading-none mb-1">
                  {dynamicStats.total_views}
                </div>
                <p className="text-[12px] text-[#A89585] font-[family-name:var(--font-body)]">
                  across tracked posts
                </p>
              </div>

              <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-[#A89585] uppercase tracking-[0.08em] font-[family-name:var(--font-body)]">
                    Total Engagement
                  </p>
                  <span className="bg-[#F0FDF4] text-[#16A34A] text-[11px] font-[family-name:var(--font-body)] font-medium px-2 py-0.5 rounded-md">
                    ↑ 8%
                  </span>
                </div>
                <div className="text-[32px] text-[#1C1410] font-bold font-[family-name:var(--font-heading)] leading-none mb-1">
                  {dynamicStats.total_engagement}
                </div>
                <p className="text-[12px] text-[#A89585] font-[family-name:var(--font-body)]">
                  likes + comments + shares
                </p>
              </div>

              <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-[#A89585] uppercase tracking-[0.08em] font-[family-name:var(--font-body)]">
                    Avg Engagement Rate
                  </p>
                  <span className="bg-[#F0FDF4] text-[#16A34A] text-[11px] font-[family-name:var(--font-body)] font-medium px-2 py-0.5 rounded-md">
                    ↑ 2.1%
                  </span>
                </div>
                <div className="text-[32px] text-[#1C1410] font-bold font-[family-name:var(--font-heading)] leading-none mb-1">
                  {dynamicStats.avg_engagement_rate}%
                </div>
                <p className="text-[12px] text-[#A89585] font-[family-name:var(--font-body)]">
                  across tracked posts
                </p>
              </div>
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 shadow-sm w-[60%] flex flex-col">
            <h2 className="text-[16px] text-[#1C1410] font-[family-name:var(--font-heading)] mb-1">
              Performance Over Time
            </h2>
            <p className="text-[12px] text-[#A89585] font-[family-name:var(--font-body)] mb-6">
              Views and engagement trend
            </p>
            <div className="h-[220px] w-full mt-auto font-[family-name:var(--font-body)] text-[11px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getLineData()}
                  margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F5F0E8"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A89585" }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A89585" }}
                    tickFormatter={(v) => `${v}K`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A89585" }}
                    tickFormatter={(v) => `${v}K`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E8DDD4",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontFamily: "var(--font-body)",
                    }}
                    itemStyle={{ fontSize: "12px" }}
                    labelStyle={{
                      fontSize: "12px",
                      color: "#1C1410",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  />
                  <RechartsLegend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="views"
                    name="Views (K)"
                    stroke="#C4622D"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="engagement"
                    name="Engagement (K)"
                    stroke="#2D7DD2"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 shadow-sm w-[40%] flex flex-col relative">
            <h2 className="text-[16px] text-[#1C1410] font-[family-name:var(--font-heading)] mb-1">
              Platform Breakdown
            </h2>
            <p className="text-[12px] text-[#A89585] font-[family-name:var(--font-body)] mb-6">
              Posts by platform
            </p>
            <div className="h-[220px] w-full mt-auto font-[family-name:var(--font-body)] flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={dynamicPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {dynamicPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontFamily: "var(--font-body)",
                    }}
                    itemStyle={{ fontSize: "12px", color: "#1C1410" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[40px] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[28px] text-[#1C1410] font-[family-name:var(--font-heading)] font-bold">
                  {dynamicStats.posts_tracked}
                </span>
                <span className="text-[11px] text-[#A89585] -mt-1">
                  Total Posts
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {dynamicPieData.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-1.5 text-[11px] text-[#1C1410]"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    ></span>
                    {p.name} ({p.value})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tracked Posts Table */}
        <div className="bg-white border border-[#E8DDD4] rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E8DDD4] flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-[16px] text-[#1C1410] font-[family-name:var(--font-heading)]">
                Tracked Posts
              </h3>
              <p className="text-[13px] text-[#A89585] font-[family-name:var(--font-body)]">
                Showing {filteredPosts.length} of {posts.length} posts
                {activeFilterCount > 0 &&
                  ` · Filtered by: ${Object.entries(filters)
                    .filter(([k, v]) => v !== "")
                    .map(([k]) =>
                      k
                        .replace("_min", "")
                        .replace("_max", "")
                        .replace("date_from", "Date")
                        .replace("date_to", "Date"),
                    )
                    .filter(
                      (value, index, self) => self.indexOf(value) === index,
                    )
                    .join(", ")}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4622D] w-4 h-4 opacity-70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="bg-[#F5F0E8] border border-[#C4622D] rounded-xl pl-9 pr-4 py-2 text-[13px] text-[#1C1410] placeholder:text-[#A89585] focus:ring-1 focus:ring-[#C4622D] outline-none font-[family-name:var(--font-body)] w-[280px] shadow-[0_2px_4px_rgba(196,98,45,0.1)]"
                />
              </div>

              {/* SORT DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-2 border border-[#E8DDD4] bg-white rounded-lg px-[14px] py-2 text-[13px] text-[#1C1410] font-[family-name:var(--font-body)] hover:bg-[#F5F0E8] transition-colors"
                >
                  Sort:{" "}
                  {sortConfig.key === "posted"
                    ? sortConfig.direction === "desc"
                      ? "Recent"
                      : "Oldest First"
                    : sortConfig.key === "views"
                      ? sortConfig.direction === "desc"
                        ? "Highest Views"
                        : "Lowest Views"
                      : sortConfig.key === "engagement_rate"
                        ? sortConfig.direction === "desc"
                          ? "Highest Eng Rate"
                          : "Lowest Eng Rate"
                        : sortConfig.key === "likes"
                          ? "Most Likes"
                          : sortConfig.key === "comments"
                            ? "Most Comments"
                            : "Recent"}{" "}
                  <IconChevronDown />
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E8DDD4] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-40 py-2">
                    {[
                      { label: "Most Recent", k: "posted", d: "desc" },
                      { label: "Oldest First", k: "posted", d: "asc" },
                      { label: "Highest Views", k: "views", d: "desc" },
                      { label: "Lowest Views", k: "views", d: "asc" },
                      {
                        label: "Highest Engagement Rate",
                        k: "engagement_rate",
                        d: "desc",
                      },
                      {
                        label: "Lowest Engagement Rate",
                        k: "engagement_rate",
                        d: "asc",
                      },
                      { label: "Most Likes", k: "likes", d: "desc" },
                      { label: "Most Comments", k: "comments", d: "desc" },
                    ].map((opt) => {
                      const isActive =
                        sortConfig.key === opt.k &&
                        sortConfig.direction === opt.d;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setSortConfig({ key: opt.k, direction: opt.d });
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[13px] font-[family-name:var(--font-body)] hover:bg-[#F5F0E8] ${isActive ? "text-[#C4622D]" : "text-[#1C1410]"}`}
                        >
                          {isActive && <span className="mr-2">✓</span>}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* FILTER DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={`flex items-center gap-2 border rounded-xl px-4 py-2 text-[13px] font-[family-name:var(--font-body)] transition-colors ${
                    activeFilterCount > 0
                      ? "border-[#C4622D] bg-[#FFF5F0] text-[#C4622D]"
                      : "border-[#E8DDD4] bg-white text-[#1C1410] hover:bg-[#F5F0E8]"
                  }`}
                >
                  Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}{" "}
                  <IconChevronDown />
                </button>
                {isFilterDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[320px] bg-white border border-[#E8DDD4] rounded-xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-40 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[14px] text-[#1C1410] font-semibold font-[family-name:var(--font-body)]">
                        Filters
                      </h4>
                      <button
                        onClick={() =>
                          setFilters({
                            platform: "",
                            status: "",
                            engagement_min: "",
                            engagement_max: "",
                            views_min: "",
                            views_max: "",
                            influencer: "",
                            campaign: "",
                            date_from: "",
                            date_to: "",
                          })
                        }
                        className="text-[13px] text-[#C4622D] font-[family-name:var(--font-body)]"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="space-y-5 pb-4">
                      {/* Platform */}
                      <div>
                        <p className="text-[11px] text-[#A89585] uppercase mb-2 font-[family-name:var(--font-body)]">
                          Platform
                        </p>
                        <div className="flex gap-2">
                          {[
                            { id: "instagram", icon: "📸", label: "Instagram" },
                            { id: "youtube", icon: "▶️", label: "YouTube" },
                            { id: "linkedin", icon: "💼", label: "LinkedIn" },
                          ].map((p) => (
                            <button
                              key={p.id}
                              onClick={() =>
                                setFilters((f) => ({
                                  ...f,
                                  platform: f.platform === p.id ? "" : p.id,
                                }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-[12px] font-[family-name:var(--font-body)] border transition-colors ${
                                filters.platform === p.id
                                  ? "bg-[#C4622D] text-white border-[#C4622D]"
                                  : "bg-[#F5F0E8] text-[#A89585] border-[#E8DDD4]"
                              }`}
                            >
                              {p.icon} {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-[11px] text-[#A89585] uppercase mb-2 font-[family-name:var(--font-body)]">
                          Status
                        </p>
                        <div className="flex gap-2">
                          {[
                            {
                              id: "live",
                              icon: "●",
                              label: "Live",
                              activeBg: "#DCFCE7",
                              activeColor: "#16A34A",
                            },
                            {
                              id: "paused",
                              icon: "⏸",
                              label: "Paused",
                              activeBg: "#F5F0E8",
                              activeColor: "#A89585",
                            },
                            {
                              id: "removed",
                              icon: "✕",
                              label: "Removed",
                              activeBg: "#FEE2E2",
                              activeColor: "#EF4444",
                            },
                          ].map((s) => (
                            <button
                              key={s.id}
                              onClick={() =>
                                setFilters((f) => ({
                                  ...f,
                                  status: f.status === s.id ? "" : s.id,
                                }))
                              }
                              className="px-3 py-1.5 rounded-lg text-[12px] font-[family-name:var(--font-body)] transition-colors"
                              style={{
                                backgroundColor:
                                  filters.status === s.id
                                    ? s.activeBg
                                    : "#F5F0E8",
                                color:
                                  filters.status === s.id
                                    ? s.activeColor
                                    : "#A89585",
                                outline:
                                  filters.status === s.id
                                    ? "1px solid currentColor"
                                    : "none",
                              }}
                            >
                              {s.icon} {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Engagement Range */}
                      <div>
                        <p className="text-[11px] text-[#A89585] uppercase mb-2 font-[family-name:var(--font-body)]">
                          Engagement Rate
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "any", label: "Any", min: "", max: "" },
                            { id: "5plus", label: "5%+", min: "5", max: "100" },
                            { id: "3to5", label: "3–5%", min: "3", max: "5" },
                            { id: "1to3", label: "1–3%", min: "1", max: "3" },
                            {
                              id: "under1",
                              label: "Below 1%",
                              min: "0",
                              max: "1",
                            },
                          ].map((btn) => {
                            const isActive =
                              filters.engagement_min === btn.min &&
                              filters.engagement_max === btn.max;
                            return (
                              <button
                                key={btn.id}
                                onClick={() =>
                                  setFilters((f) => ({
                                    ...f,
                                    engagement_min: btn.min,
                                    engagement_max: btn.max,
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-[family-name:var(--font-body)] transition-colors ${
                                  isActive
                                    ? "bg-[#C4622D] text-white"
                                    : "bg-[#F5F0E8] text-[#A89585]"
                                }`}
                              >
                                {btn.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Views Range */}
                      <div>
                        <p className="text-[11px] text-[#A89585] uppercase mb-2 font-[family-name:var(--font-body)]">
                          Views
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "any", label: "Any", min: "", max: "" },
                            {
                              id: "100k+",
                              label: "100K+",
                              min: "100000",
                              max: "",
                            },
                            {
                              id: "10kto100k",
                              label: "10K–100K",
                              min: "10000",
                              max: "100000",
                            },
                            {
                              id: "under10k",
                              label: "Under 10K",
                              min: "",
                              max: "10000",
                            },
                          ].map((btn) => {
                            const isActive =
                              filters.views_min === btn.min &&
                              filters.views_max === btn.max;
                            return (
                              <button
                                key={btn.id}
                                onClick={() =>
                                  setFilters((f) => ({
                                    ...f,
                                    views_min: btn.min,
                                    views_max: btn.max,
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-[family-name:var(--font-body)] transition-colors ${
                                  isActive
                                    ? "bg-[#C4622D] text-white"
                                    : "bg-[#F5F0E8] text-[#A89585]"
                                }`}
                              >
                                {btn.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Influencer text input */}
                      <div>
                        <p className="text-[11px] text-[#A89585] uppercase mb-2 font-[family-name:var(--font-body)]">
                          Influencer
                        </p>
                        <input
                          type="text"
                          placeholder="Search by name or @handle"
                          value={filters.influencer}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              influencer: e.target.value,
                            }))
                          }
                          className="w-full bg-[#F5F0E8] border-none rounded-lg px-3 py-2 text-[13px] text-[#1C1410] font-[family-name:var(--font-body)] outline-none focus:ring-1 focus:ring-[#C4622D]"
                        />
                      </div>

                      {/* Campaign text input */}
                      <div>
                        <p className="text-[11px] text-[#A89585] uppercase mb-2 font-[family-name:var(--font-body)]">
                          Campaign
                        </p>
                        <input
                          type="text"
                          placeholder="Campaign name"
                          value={filters.campaign}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              campaign: e.target.value,
                            }))
                          }
                          className="w-full bg-[#F5F0E8] border-none rounded-lg px-3 py-2 text-[13px] text-[#1C1410] font-[family-name:var(--font-body)] outline-none focus:ring-1 focus:ring-[#C4622D]"
                        />
                      </div>

                      {/* Date Range */}
                      <div>
                        <p className="text-[11px] text-[#A89585] uppercase mb-2 font-[family-name:var(--font-body)]">
                          Date Posted
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) =>
                              setFilters((f) => ({
                                ...f,
                                date_from: e.target.value,
                              }))
                            }
                            className="w-1/2 bg-[#F5F0E8] border-none rounded-lg px-3 py-2 text-[13px] text-[#1C1410] font-[family-name:var(--font-body)] outline-none focus:ring-1 focus:ring-[#C4622D]"
                          />
                          <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) =>
                              setFilters((f) => ({
                                ...f,
                                date_to: e.target.value,
                              }))
                            }
                            className="w-1/2 bg-[#F5F0E8] border-none rounded-lg px-3 py-2 text-[13px] text-[#1C1410] font-[family-name:var(--font-body)] outline-none focus:ring-1 focus:ring-[#C4622D]"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setIsFilterDropdownOpen(false)}
                        className="w-full bg-[#C4622D] text-white rounded-lg py-2.5 text-[14px] font-semibold font-[family-name:var(--font-body)] mt-2"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="px-4 py-3 bg-white border-b border-[#E8DDD4] flex flex-wrap gap-2 items-center">
              {Object.entries(filters).map(([key, val]) => {
                if (!val) return null;
                let displayKey = key
                  .replace("_min", "")
                  .replace("_max", "")
                  .replace("date_from", "From")
                  .replace("date_to", "To");
                displayKey =
                  displayKey.charAt(0).toUpperCase() + displayKey.slice(1);

                // Group eng/views logic simply
                if (key === "engagement_min" || key === "views_min") {
                  const maxKey = key.replace("min", "max");
                  const maxVal = filters[maxKey as keyof typeof filters];
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 bg-[#FFF5F0] border border-[#C4622D] text-[#C4622D] rounded-md px-2.5 py-1 text-[12px] font-[family-name:var(--font-body)]"
                    >
                      {displayKey}: {val}
                      {maxVal ? ` - ${maxVal}` : "+"}
                      <button
                        onClick={() =>
                          setFilters((f) => ({ ...f, [key]: "", [maxKey]: "" }))
                        }
                        className="hover:text-black mt-0.5"
                      >
                        <IconX className="w-3 h-3" />
                      </button>
                    </span>
                  );
                }
                if (key === "engagement_max" || key === "views_max")
                  return null; // handled by min if both, or we can just ignore max visually if handled above.
                if (key === "views_max" && !filters.views_min) {
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 bg-[#FFF5F0] border border-[#C4622D] text-[#C4622D] rounded-md px-2.5 py-1 text-[12px] font-[family-name:var(--font-body)]"
                    >
                      Views: Under {val}
                      <button
                        onClick={() => setFilters((f) => ({ ...f, [key]: "" }))}
                        className="hover:text-black mt-0.5"
                      >
                        <IconX className="w-3 h-3" />
                      </button>
                    </span>
                  );
                }

                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 bg-[#FFF5F0] border border-[#C4622D] text-[#C4622D] rounded-md px-2.5 py-1 text-[12px] font-[family-name:var(--font-body)]"
                  >
                    {displayKey}: {val}
                    <button
                      onClick={() => setFilters((f) => ({ ...f, [key]: "" }))}
                      className="hover:text-black mt-0.5"
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={() =>
                  setFilters({
                    platform: "",
                    status: "",
                    engagement_min: "",
                    engagement_max: "",
                    views_min: "",
                    views_max: "",
                    influencer: "",
                    campaign: "",
                    date_from: "",
                    date_to: "",
                  })
                }
                className="text-[12px] text-[#A89585] hover:text-[#C4622D] ml-2 font-[family-name:var(--font-body)] inline-flex items-center gap-1"
              >
                Clear all <IconX className="w-3 h-3" />
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="w-full">
              <div className="p-4 flex flex-col pt-0">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={`row-skeleton-${i}`}
                    style={{
                      background: "#F5F0E8",
                      borderRadius: 8,
                      height: 72,
                      margin: "4px 0",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <IconChartBar className="text-[#E8DDD4] mb-4 w-12 h-12" />
              <h3 className="text-[18px] text-[#1C1410] font-[family-name:var(--font-heading)] mb-2">
                No posts tracked yet
              </h3>
              <p className="text-[14px] text-[#A89585] font-[family-name:var(--font-body)] max-w-[300px] mb-6">
                Add influencer posts to track their performance in real time
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#C4622D] hover:bg-[#b05828] text-white rounded-[10px] px-5 py-2.5 text-[14px] font-semibold transition-colors font-[family-name:var(--font-body)]"
              >
                + Track Your First Post
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <IconChartBar className="text-[#E8DDD4] mb-4 w-12 h-12" />
              <h3 className="text-[18px] text-[#1C1410] font-[family-name:var(--font-heading)] mb-2">
                No posts match your search
              </h3>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("All");
                }}
                className="text-[#C4622D] text-[14px] font-medium hover:underline font-[family-name:var(--font-body)] mt-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-[11px] text-[#A89585] uppercase tracking-[0.06em] font-[family-name:var(--font-body)] font-medium border-b border-[#E8DDD4] w-[35%]">
                      Content
                    </th>
                    <th className="py-3 px-4 text-[11px] text-[#A89585] uppercase tracking-[0.06em] font-[family-name:var(--font-body)] font-medium border-b border-[#E8DDD4] w-[15%]">
                      Influencer
                    </th>
                    <th className="py-3 px-4 text-[11px] text-[#A89585] uppercase tracking-[0.06em] font-[family-name:var(--font-body)] font-medium border-b border-[#E8DDD4] w-[10%]">
                      Platform
                    </th>
                    {["views", "likes", "comments", "engagement_rate"].map(
                      (key) => {
                        const labels: any = {
                          views: "Views",
                          likes: "Likes",
                          comments: "Comments",
                          engagement_rate: "Eng. Rate",
                        };
                        const isSorted = sortConfig.key === key;
                        return (
                          <th
                            key={key}
                            onClick={() => handleSort(key)}
                            className={`py-3 px-4 text-[11px] uppercase tracking-[0.06em] font-[family-name:var(--font-body)] font-medium border-b border-[#E8DDD4] w-[8%] cursor-pointer transition-colors hover:text-[#1C1410] ${isSorted ? "text-[#1C1410]" : "text-[#A89585]"}`}
                          >
                            <div className="flex items-center gap-1">
                              {labels[key]}
                              <span
                                className={`text-[12px] ${isSorted ? "text-[#C4622D]" : "text-[#E8DDD4]"}`}
                              >
                                {!isSorted
                                  ? "↕"
                                  : sortConfig.direction === "asc"
                                    ? "↑"
                                    : "↓"}
                              </span>
                            </div>
                          </th>
                        );
                      },
                    )}
                    <th className="py-3 px-4 text-[11px] text-[#A89585] uppercase tracking-[0.06em] font-[family-name:var(--font-body)] font-medium border-b border-[#E8DDD4] w-[8%]">
                      Status
                    </th>
                    <th className="py-3 px-4 text-[11px] text-[#A89585] uppercase tracking-[0.06em] font-[family-name:var(--font-body)] font-medium border-b border-[#E8DDD4] w-[8%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-b border-[#F5F0E8] hover:bg-[#FDFAF6] transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex gap-3 items-center">
                          <div
                            className="w-[60px] h-[60px] rounded-lg shrink-0 flex items-center justify-center text-white"
                            style={{ background: getPlatformBg(post.platform) }}
                          >
                            {getPlatformIcon(post.platform, "w-6 h-6")}
                          </div>
                          <div>
                            <p className="text-[13px] text-[#1C1410] font-[family-name:var(--font-body)] line-clamp-2 leading-relaxed mb-1 pr-2">
                              {post.caption}
                            </p>
                            <p className="text-[11px] text-[#A89585] font-[family-name:var(--font-body)]">
                              Posted {post.post_published_at ? new Date(post.post_published_at).toLocaleDateString() : post.posted} · @{post.influencer_handle || post.handle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-medium shrink-0"
                            style={{ backgroundColor: post.influencer_avatar_color || post.avatar_color || "#1C1410" }}
                          >
                            {(post.influencer_name || post.influencer || "U")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </div>
                          <span className="text-[13px] text-[#1C1410] font-[family-name:var(--font-body)] truncate pr-2">
                            {post.influencer_name || post.influencer}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${getPlatformBadge(post.platform)} font-[family-name:var(--font-body)]`}
                        >
                          {getPlatformIcon(post.platform, "w-3 h-3")}
                          {post.platform}
                        </span>
                      </td>
                      <td className="p-4 text-[13px] text-[#1C1410] font-[family-name:var(--font-body)]">
                        {post.views}
                      </td>
                      <td className="p-4 text-[13px] text-[#1C1410] font-[family-name:var(--font-body)]">
                        {post.likes}
                      </td>
                      <td className="p-4 text-[13px] text-[#1C1410] font-[family-name:var(--font-body)]">
                        {post.comments}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[13px] text-[#1C1410] font-bold font-[family-name:var(--font-body)]">
                            {post.engagement_rate}%
                          </span>
                          <div className="w-10 bg-[#E8DDD4] h-1 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(post.engagement_rate * 10, 100)}%`,
                                backgroundColor: getEngagementColor(
                                  post.engagement_rate,
                                ),
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            post.status === "live"
                              ? "bg-[#16A34A]"
                              : post.status === "paused"
                                ? "bg-[#A89585]"
                                : "bg-[#EF4444]"
                          }`}
                          title={
                            post.status === "live"
                              ? "Live"
                              : post.status === "paused"
                                ? "Paused"
                                : "Removed"
                          }
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="w-7 h-7 rounded-full border border-[#E8DDD4] flex items-center justify-center text-[#A89585] hover:text-[#C4622D] hover:border-[#C4622D] bg-white transition-colors"
                            onClick={() => setSelectedPost(post)}
                            title="View Details"
                          >
                            <IconEye />
                          </button>
                          <button
                            className="w-7 h-7 rounded-full border border-[#E8DDD4] flex items-center justify-center text-[#A89585] hover:text-[#C4622D] hover:border-[#C4622D] bg-white transition-colors"
                            title="Open Original"
                          >
                            <IconExternal />
                          </button>
                          <button
                            className="w-7 h-7 rounded-full border border-[#E8DDD4] flex items-center justify-center text-[#A89585] hover:text-[#C4622D] hover:border-[#C4622D] bg-white transition-colors"
                            onClick={(e) => handleToggleStatus(e, post.id)}
                            title={
                              post.status === "live"
                                ? "Pause Tracking"
                                : "Resume Tracking"
                            }
                          >
                            {post.status === "live" ? (
                              <IconPause />
                            ) : (
                              <IconPlay />
                            )}
                          </button>
                          <button
                            className="w-7 h-7 rounded-full border border-[#E8DDD4] flex items-center justify-center text-[#A89585] hover:text-[#C4622D] hover:border-[#C4622D] bg-white transition-colors"
                            onClick={(e) => handleDelete(e, post.id)}
                            title="Remove from tracking"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Track New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-[16px] w-[520px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col font-[family-name:var(--font-body)] relative">
            <button
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#F5F0E8] hover:bg-[#E8DDD4] flex items-center justify-center text-[#A89585] transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-[20px] text-[#1C1410] font-[family-name:var(--font-heading)] mb-6">
              Track New Post
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[12px] text-[#A89585] uppercase tracking-wide mb-2 font-medium">
                  Post URL
                </label>
                <input
                  type="text"
                  value={newPostUrl}
                  onChange={(e) => setNewPostUrl(e.target.value)}
                  placeholder="https://instagram.com/p/... or https://youtube.com/watch?v=..."
                  className="w-full bg-[#F5F0E8] border-none rounded-lg p-3 text-[14px] text-[#1C1410] placeholder:text-[#A89585] focus:ring-2 focus:ring-[#C4622D] outline-none"
                />
                {detectedPlatformInfo && (
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: detectedPlatformInfo.color }}
                    />
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: detectedPlatformInfo.color }}
                    >
                      {detectedPlatformInfo.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[12px] text-[#A89585] uppercase tracking-wide mb-2 font-medium">
                  Influencer
                </label>
                <input
                  type="text"
                  placeholder="Search CRM or Add Manually..."
                  className="w-full bg-[#F5F0E8] border-none rounded-lg p-3 text-[14px] text-[#1C1410] placeholder:text-[#A89585] focus:ring-2 focus:ring-[#C4622D] outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[#A89585] uppercase tracking-wide mb-2 font-medium">
                  Campaign (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Summer 2026"
                  className="w-full bg-[#F5F0E8] border-none rounded-lg p-3 text-[14px] text-[#1C1410] placeholder:text-[#A89585] focus:ring-2 focus:ring-[#C4622D] outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[#A89585] uppercase tracking-wide mb-2 font-medium">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Any notes about this post..."
                  className="w-full bg-[#F5F0E8] border-none rounded-lg p-3 text-[14px] text-[#1C1410] placeholder:text-[#A89585] focus:ring-2 focus:ring-[#C4622D] outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-[#E8DDD4] text-[#1C1410] text-[14px] font-semibold hover:bg-[#F5F0E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartTracking}
                className="px-6 py-2.5 rounded-lg bg-[#C4622D] text-white text-[14px] font-semibold hover:bg-[#b05828] transition-colors"
              >
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Drawer */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          />
          <div className="relative w-[420px] bg-white h-full border-l border-[#E8DDD4] p-6 shadow-2xl overflow-y-auto transform transition-transform duration-300 font-[family-name:var(--font-body)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] text-[#1C1410] font-[family-name:var(--font-heading)]">
                Post Details
              </h2>
              <button
                className="w-8 h-8 flex items-center justify-center text-[#A89585] hover:bg-[#F5F0E8] rounded-full transition-colors"
                onClick={() => setSelectedPost(null)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl overflow-hidden border border-[#E8DDD4]">
                <div
                  className="h-[180px] w-full flex items-center justify-center text-white"
                  style={{ background: getPlatformBg(selectedPost.platform) }}
                >
                  {getPlatformIcon(selectedPost.platform, "w-10 h-10")}
                </div>
                <div className="p-4 bg-white">
                  <p className="text-[13px] text-[#1C1410] leading-relaxed line-clamp-3 mb-3">
                    {selectedPost.caption}
                  </p>
                  <a
                    href="#"
                    className="text-[13px] text-[#C4622D] font-medium hover:underline flex items-center gap-1 w-max"
                  >
                    View original post →
                  </a>
                </div>
              </div>

              <div className="bg-[#F5F0E8] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-medium"
                    style={{ backgroundColor: selectedPost.influencer_avatar_color || selectedPost.avatar_color || "#1C1410" }}
                  >
                    {(selectedPost.influencer_name || selectedPost.influencer || "U")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-[14px] text-[#1C1410] font-medium leading-tight flex items-center gap-2">
                      {selectedPost.influencer_name || selectedPost.influencer}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getPlatformBadge(selectedPost.platform)}`}
                      >
                        {getPlatformIcon(selectedPost.platform, "w-2.5 h-2.5")}
                        {selectedPost.platform}
                      </span>
                    </h3>
                    <p className="text-[12px] text-[#A89585]">
                      @{selectedPost.influencer_handle || selectedPost.handle}
                    </p>
                  </div>
                </div>
                <a
                  href="#"
                  className="text-[12px] text-[#C4622D] font-medium hover:underline"
                >
                  View in CRM →
                </a>
              </div>

              <div>
                <h4 className="text-[14px] text-[#1C1410] font-medium mb-3">
                  Performance Stats
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F5F0E8] rounded-lg p-3">
                    <div className="text-[20px] text-[#1C1410] font-bold font-[family-name:var(--font-heading)] mb-0.5">
                      {selectedPost.views}
                    </div>
                    <div className="text-[11px] text-[#A89585]">Views</div>
                  </div>
                  <div className="bg-[#F5F0E8] rounded-lg p-3">
                    <div className="text-[20px] text-[#1C1410] font-bold font-[family-name:var(--font-heading)] mb-0.5">
                      {selectedPost.likes}
                    </div>
                    <div className="text-[11px] text-[#A89585]">Likes</div>
                  </div>
                  <div className="bg-[#F5F0E8] rounded-lg p-3">
                    <div className="text-[20px] text-[#1C1410] font-bold font-[family-name:var(--font-heading)] mb-0.5">
                      {selectedPost.comments}
                    </div>
                    <div className="text-[11px] text-[#A89585]">Comments</div>
                  </div>
                  <div className="bg-[#F5F0E8] rounded-lg p-3">
                    <div className="text-[20px] text-[#1C1410] font-bold font-[family-name:var(--font-heading)] mb-0.5">
                      {selectedPost.engagement_rate}%
                    </div>
                    <div className="text-[11px] text-[#A89585]">Eng. Rate</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] text-[#A89585] mb-2 font-medium">
                  Engagement Rate
                </h4>
                <div
                  className="text-[36px] font-bold font-[family-name:var(--font-heading)] mb-2"
                  style={{
                    color: getEngagementColor(selectedPost.engagement_rate),
                  }}
                >
                  {selectedPost.engagement_rate}%
                </div>
                <div className="w-full bg-[#F5F0E8] h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(selectedPost.engagement_rate * 10, 100)}%`,
                      backgroundColor: getEngagementColor(
                        selectedPost.engagement_rate,
                      ),
                    }}
                  />
                </div>
                <p className="text-[11px] text-[#A89585]">Industry avg: 3.2%</p>
              </div>

              <div className="pt-4 border-t border-[#E8DDD4]">
                <h4 className="text-[14px] text-[#1C1410] font-medium mb-3">
                  Performance Over Time
                </h4>
                <div className="h-[120px] w-full mt-4 -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={drawerHistory}>
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#C4622D"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8DDD4] flex flex-col gap-1.5 text-[12px] text-[#A89585]">
                <p>Tracking since: Feb 24, 2026</p>
                <p>Last updated: 2 hours ago</p>
                <p>Campaign: Summer 2026</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
