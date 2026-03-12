'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Edit, Sparkles, AlertCircle, X, 
  MoreVertical, Copy, ExternalLink, MessageSquare, Heart, Eye, Share2
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts'
import ReactMarkdown from 'react-markdown'

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num ? num.toString() : '0'
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [report, setReport] = useState('')

  useEffect(() => {
    fetchCampaign()
  }, [])

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${params.id}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setCampaign(data.campaign)
    } catch (error: any) {
      console.error('Error fetching campaign:', error)
      showToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const generateReport = async () => {
    setReportModalOpen(true)
    setReportLoading(true)
    setReport('')
    try {
      const res = await fetch(`/api/campaigns/${params.id}/report`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReport(data.report)
    } catch (err: any) {
      showToast('error', err.message || 'Failed to generate report')
      setReportModalOpen(false)
    } finally {
      setReportLoading(false)
    }
  }

  const copyReport = () => {
    navigator.clipboard.writeText(report)
    showToast('success', 'Report copied!')
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-4 border-[#C4622D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <h2 className="font-playfair text-[24px] text-[#1C1410] mb-2">Campaign Not Found</h2>
          <button 
            onClick={() => router.push('/dashboard/campaigns')}
            className="text-[#C4622D] font-dm-sans underline"
          >
            Return to Campaigns
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string, text: string }> = {
      active: { bg: '#DCFCE7', text: '#16A34A' },
      completed: { bg: '#EFF6FF', text: '#3B82F6' },
      draft: { bg: '#F5F0E8', text: '#A89585' },
      paused: { bg: '#FEF3C7', text: '#D97706' }
    }
    const color = map[status] || map.draft
    return (
      <span style={{ backgroundColor: color.bg, color: color.text }} className="px-[10px] py-[3px] rounded-[6px] text-[12px] font-medium capitalize font-dm-sans">
        {status}
      </span>
    )
  }

  const getGoalChip = (goal: string) => {
    const map: Record<string, string> = {
      awareness: '🎯 Awareness',
      sales: '💰 Drive Sales',
      ugc: '📱 UGC Content',
      community: '👥 Community',
      launch: '🚀 Product Launch',
      partnership: '🤝 Partnership'
    }
    return map[goal] || '🎯 Awareness'
  }

  const m = campaign.metrics || {}
  const influencers = campaign.campaign_influencers || []
  const posts = campaign.tracked_posts || []

  // Group posts by date for chart
  const postsByDate = posts.reduce((acc: any, post: any) => {
    const d = new Date(post.post_published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (!acc[d]) acc[d] = { date: d, views: 0, engagement: 0, count: 0 }
    acc[d].views += (post.views || 0)
    acc[d].engagement += (post.engagement_rate || 0)
    acc[d].count += 1
    return acc
  }, {})

  const chartData = Object.values(postsByDate).map((v: any) => ({
    ...v,
    avgEngagement: parseFloat((v.engagement / v.count).toFixed(2))
  })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Platform badges
  const platformConfig: Record<string, { color: string, bg: string }> = {
    instagram: { color: '#E1306C', bg: '#FDF2F5' },
    youtube: { color: '#FF0000', bg: '#FFF0F0' },
    linkedin: { color: '#0A66C2', bg: '#F0F6FC' },
    tiktok: { color: '#000000', bg: '#F2F2F2' },
  }

  return (
    <div className="p-8 pb-20 max-w-[1200px] mx-auto">
      {/* HEADER */}
      <button 
        onClick={() => router.push('/dashboard/campaigns')}
        className="flex items-center gap-2 text-[#C4622D] font-dm-sans text-[13px] hover:text-[#A85125] transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Campaigns
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-playfair text-[26px] text-[#1C1410] mb-3">{campaign.name}</h1>
          <div className="flex items-center gap-3">
            {getStatusBadge(campaign.status)}
            <div className="bg-[#F5F0E8] text-[#C4622D] rounded-[20px] px-[10px] py-[4px] text-[12px] font-dm-sans">
              {getGoalChip(campaign.goal)}
            </div>
            {(campaign.start_date || campaign.end_date) && (
              <div className="text-[13px] font-dm-sans text-[#A89585]">
                {formatDate(campaign.start_date)} → {formatDate(campaign.end_date)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-[10px] border border-[#E8DDD4] font-dm-sans text-[14px] font-semibold text-[#1C1410] hover:bg-[#F5F0E8] transition-colors flex items-center gap-2">
            <Edit size={16} />
            Edit Campaign
          </button>
          <button 
            onClick={generateReport}
            className="bg-[#C4622D] text-white rounded-[10px] px-5 py-2.5 font-dm-sans font-semibold hover:bg-[#A85125] transition-colors flex items-center gap-2 shadow-sm"
          >
            <Sparkles size={16} />
            Generate AI Report
          </button>
        </div>
      </div>

      {/* 6 STAT CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-5">
          <div className="text-[12px] font-dm-sans text-[#A89585] uppercase tracking-wider mb-1">TOTAL REACH</div>
          <div className="text-[28px] font-bold font-dm-sans text-[#1C1410]">{formatNumber(m.total_reach)}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-5">
          <div className="text-[12px] font-dm-sans text-[#A89585] uppercase tracking-wider mb-1">AVG ENGAGEMENT</div>
          <div className="text-[28px] font-bold font-dm-sans text-[#1C1410]">{m.avg_engagement_rate}%</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-5">
          <div className="text-[12px] font-dm-sans text-[#A89585] uppercase tracking-wider mb-1">POSTS LIVE</div>
          <div className="text-[28px] font-bold font-dm-sans text-[#1C1410]">{m.posts_count}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-5">
          <div className="text-[12px] font-dm-sans text-[#A89585] uppercase tracking-wider mb-1">TOTAL SPEND</div>
          <div className="text-[28px] font-bold font-dm-sans text-[#1C1410]">₹{formatNumber(campaign.budget_spent || 0)}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-5">
          <div className="text-[12px] font-dm-sans text-[#A89585] uppercase tracking-wider mb-1">COST PER ENG.</div>
          <div className="text-[28px] font-bold font-dm-sans text-[#1C1410]">₹{m.cost_per_engagement}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-5">
          <div className="text-[12px] font-dm-sans text-[#A89585] uppercase tracking-wider mb-1">INFLUENCERS</div>
          <div className="text-[28px] font-bold font-dm-sans text-[#1C1410]">{m.influencers_count}</div>
        </div>
      </div>

      {/* PERFORMANCE CHART */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-[12px] border border-[#E8DDD4] p-6 mb-8">
          <h3 className="font-playfair text-[18px] text-[#1C1410] mb-6">Performance Timeline</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DDD4" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A89585', fontFamily: 'DM Sans' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12, fill: '#A89585', fontFamily: 'DM Sans' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: '#A89585', fontFamily: 'DM Sans' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E8DDD4', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'DM Sans', fontSize: '12px' }}
                  cursor={{ stroke: '#E8DDD4', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="views" name="Views" stroke="#C4622D" strokeWidth={3} dot={{ r: 4, fill: '#C4622D', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="avgEngagement" name="Avg Engagement" stroke="#2D7DD2" strokeWidth={3} dot={{ r: 4, fill: '#2D7DD2', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* INFLUENCERS TABLE */}
      <div className="bg-white border border-[#E8DDD4] rounded-[12px] overflow-hidden mb-8">
        <div className="p-6 border-b border-[#E8DDD4] flex justify-between items-center">
          <h3 className="font-playfair text-[18px] text-[#1C1410]">Influencers</h3>
          <button className="px-4 py-2 border border-[#E8DDD4] text-[#1C1410] rounded-[8px] font-dm-sans text-[13px] font-medium hover:bg-[#F5F0E8] transition-colors flex items-center gap-2">
            <span className="text-[16px] leading-none">+</span> Add Influencer
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F6F3]">
                <th className="font-dm-sans text-[11px] uppercase tracking-wider text-[#A89585] py-3 px-6 font-medium">INFLUENCER</th>
                <th className="font-dm-sans text-[11px] uppercase tracking-wider text-[#A89585] py-3 px-6 font-medium">PLATFORM</th>
                <th className="font-dm-sans text-[11px] uppercase tracking-wider text-[#A89585] py-3 px-6 font-medium">BUDGET</th>
                <th className="font-dm-sans text-[11px] uppercase tracking-wider text-[#A89585] py-3 px-6 font-medium">PAID</th>
                <th className="font-dm-sans text-[11px] uppercase tracking-wider text-[#A89585] py-3 px-6 font-medium">STATUS</th>
                <th className="font-dm-sans text-[11px] uppercase tracking-wider text-[#A89585] py-3 px-6 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {influencers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-dm-sans text-[13px] text-[#A89585]">
                    No influencers added to this campaign yet.
                  </td>
                </tr>
              ) : (
                influencers.map((inf: any) => {
                  const plat = platformConfig[inf.platform] || platformConfig.instagram
                  
                  let statusBg = '#F2F2F2'
                  let statusText = '#666666'
                  
                  if (inf.status === 'content_live') { statusBg = '#FFF5F0'; statusText = '#C4622D' }
                  else if (inf.status === 'completed') { statusBg = '#EFF6FF'; statusText = '#3B82F6' }
                  else if (inf.status === 'paid') { statusBg = '#DCFCE7'; statusText = '#16A34A' }
                  
                  return (
                    <tr key={inf.id} className="border-t border-[#E8DDD4] hover:bg-[#F9F6F3] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-dm-sans text-[11px] font-bold" style={{ backgroundColor: inf.influencer_avatar_color || '#C4622D' }}>
                            {inf.influencer_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-dm-sans text-[14px] text-[#1C1410] font-medium">{inf.influencer_name}</div>
                            <div className="font-dm-sans text-[12px] text-[#A89585]">@{inf.influencer_handle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-1 rounded-[6px] text-[11px] font-medium font-dm-sans capitalize" style={{ backgroundColor: plat.bg, color: plat.color }}>
                          {inf.platform}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-dm-sans text-[14px] text-[#1C1410] font-medium">
                        ₹{formatNumber(inf.budget_allocated)}
                      </td>
                      <td className="py-4 px-6 font-dm-sans text-[14px] text-[#1C1410] font-medium">
                        ₹{formatNumber(inf.amount_paid)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-[10px] py-[3px] rounded-[6px] text-[12px] font-medium font-dm-sans capitalize" style={{ backgroundColor: statusBg, color: statusText }}>
                          {inf.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-[#A89585] hover:text-[#C4622D] p-1 rounded-md hover:bg-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POSTS TABLE */}
      <div className="bg-white border border-[#E8DDD4] rounded-[12px] overflow-hidden mb-8">
        <div className="p-6 border-b border-[#E8DDD4] flex justify-between items-center">
          <h3 className="font-playfair text-[18px] text-[#1C1410]">Campaign Posts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F6F3]">
                <th className="font-dm-sans text-[11px] uppercase tracking-wider text-[#A89585] py-3 px-6 font-medium">POST INFO</th>
                <th className="font-dm-sans text-[11px] uppercase tracking-wider text-[#A89585] py-3 px-6 font-medium">INFLUENCER & PLATFORM</th>
                <th className="font-dm-sans text-[11px] uppercase tracking-wider text-[#A89585] py-3 px-6 font-medium">PERFORMANCE</th>
                <th className="font-dm-sans text-[11px] uppercase tracking-wider text-[#A89585] py-3 px-6 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="font-dm-sans text-[14px] text-[#1C1410] mb-2 font-medium">No posts linked to this campaign yet</div>
                    <div className="font-dm-sans text-[13px] text-[#A89585] mb-4">Go to Post Tracking to add or link posts</div>
                    <button 
                      onClick={() => router.push('/dashboard/post-tracking')}
                      className="text-[#C4622D] font-dm-sans text-[13px] font-medium hover:underline flex items-center gap-1 mx-auto"
                    >
                      Go to Post Tracking <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ) : (
                posts.map((post: any) => {
                  const plat = platformConfig[post.platform] || platformConfig.instagram
                  return (
                    <tr key={post.id} className="border-t border-[#E8DDD4] hover:bg-[#F9F6F3] transition-colors">
                      <td className="py-4 px-6 w-[35%]">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-[8px] bg-[#F5F0E8] border border-[#E8DDD4] flex items-center justify-center flex-shrink-0 relative overflow-hidden group cursor-pointer">
                            <span className="font-dm-sans text-[10px] text-[#A89585] select-none">IMAGE</span>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="text-white w-5 h-5" />
                            </div>
                          </div>
                          <div>
                            <p className="font-dm-sans text-[13px] text-[#1C1410] leading-snug line-clamp-2 mb-2">
                              {post.caption || 'No caption provided'}
                            </p>
                            <span className="font-dm-sans text-[11px] text-[#A89585]">
                              {formatDate(post.post_published_at)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full flex justify-center items-center text-white font-dm-sans text-[9px] font-bold" style={{ backgroundColor: '#2D7DD2' }}>
                            {post.influencer_name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-dm-sans text-[13px] font-medium text-[#1C1410]">{post.influencer_name}</span>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium font-dm-sans capitalize" style={{ backgroundColor: plat.bg, color: plat.color }}>
                          {post.platform}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                          <div className="flex items-center gap-1.5 text-[#A89585]">
                            <Eye size={12} /> <span className="font-dm-sans text-[12px] text-[#1C1410] font-medium">{formatNumber(post.views)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#A89585]">
                            <Heart size={12} /> <span className="font-dm-sans text-[12px] text-[#1C1410] font-medium">{formatNumber(post.likes)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#A89585]">
                            <MessageSquare size={12} /> <span className="font-dm-sans text-[12px] text-[#1C1410] font-medium">{formatNumber(post.comments)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#A89585]">
                            <Share2 size={12} /> <span className="font-dm-sans text-[12px] text-[#1C1410] font-medium">{formatNumber(post.shares)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-dm-sans text-[11px] font-semibold px-2 py-0.5 rounded-[4px] ${
                            post.engagement_rate >= 5 ? 'bg-[#DCFCE7] text-[#16A34A]' : 
                            post.engagement_rate >= 2 ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#FEE2E2] text-[#EF4444]'
                          }`}>
                            {post.engagement_rate}% Eng
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-[#A89585] hover:text-[#C4622D] p-1 rounded-md hover:bg-[#F5F0E8] transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] w-[600px] max-w-full relative flex flex-col max-h-[85vh] shadow-2xl">
            <div className="p-6 border-b border-[#E8DDD4] shrink-0 flex justify-between items-center bg-[#FDFBF9] rounded-t-[16px]">
              <div>
                <h2 className="font-playfair text-[20px] text-[#1C1410] flex items-center gap-2">
                  <Sparkles size={20} className="text-[#C4622D]" />
                  AI Campaign Report
                </h2>
                <p className="font-dm-sans text-[13px] text-[#A89585] mt-1">{campaign.name}</p>
              </div>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="text-[#A89585] hover:text-[#1C1410] transition-colors bg-white w-8 h-8 rounded-full border border-[#E8DDD4] flex justify-center items-center shadow-sm"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 font-dm-sans prose prose-p:text-[13px] prose-p:text-[#1C1410] prose-p:leading-[1.6] prose-li:text-[13px] prose-li:text-[#1C1410] prose-li:leading-[1.6]">
              {reportLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-[#F5F0E8] border-t-[#C4622D] rounded-full animate-spin mb-4"></div>
                  <p className="text-[#A89585] text-[14px]">Analyzing campaign data with AI...</p>
                </div>
              ) : (
                <div className="report-markdown">
                  <ReactMarkdown
                    components={{
                      h2: ({node, ...props}: any) => <h2 className="font-playfair text-[16px] text-[#1C1410] mt-6 mb-3 font-semibold" {...props} />,
                      ul: ({node, ...props}: any) => <ul className="space-y-2 mb-4" {...props} />,
                      li: ({node, ...props}: any) => (
                        <li className="flex gap-2 items-start" {...props}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C4622D] mt-[7px] shrink-0"></span>
                          <span>{props.children}</span>
                        </li>
                      ),
                      p: ({node, ...props}: any) => <p className="mb-4" {...props} />
                    }}
                  >
                    {report}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#E8DDD4] shrink-0 flex justify-end gap-3 bg-[#FDFBF9] rounded-b-[16px]">
              <button 
                onClick={() => setReportModalOpen(false)}
                className="px-6 py-2.5 rounded-[10px] bg-white border border-[#E8DDD4] font-dm-sans text-[14px] font-semibold text-[#1C1410] hover:bg-[#F5F0E8] transition-colors"
              >
                Close
              </button>
              <button 
                onClick={copyReport}
                disabled={reportLoading}
                className="px-6 py-2.5 rounded-[10px] bg-[#C4622D] text-white font-dm-sans text-[14px] font-semibold hover:bg-[#A85125] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Copy size={16} />
                Copy Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Placeholder */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5">
          <div className={`rounded-xl shadow-lg border px-4 py-3 flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-white border-[#E8DDD4]' : 'bg-red-50 border-red-200'
          }`}>
            {toast.type === 'success' ? (
              <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            ) : (
              <AlertCircle className="text-red-500" size={20} />
            )}
            <div>
              <p className="font-dm-sans text-[14px] font-medium text-[#1C1410]">
                {toast.message}
              </p>
            </div>
            <button onClick={() => setToast(null)} className="ml-2 text-[#A89585] hover:text-[#1C1410]">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
