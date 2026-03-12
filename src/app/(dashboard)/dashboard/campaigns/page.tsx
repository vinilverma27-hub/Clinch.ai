'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, MoreVertical, Target, DollarSign, 
  Smartphone, Users, Rocket, Handshake,
  BarChart2, X, AlertCircle
} from 'lucide-react'

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [globalStats, setGlobalStats] = useState({
    active_campaigns: 0,
    total_reach: 0,
    total_spend: 0,
    avg_engagement: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [form, setForm] = useState({
    name: '',
    goal: '',
    status: 'draft',
    budget_allocated: '',
    start_date: '',
    end_date: '',
    description: '',
    auto_link_posts: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
      setGlobalStats(data.global_stats || {})
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreate = async () => {
    if (!form.name) return showToast('error', 'Campaign name is required')
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...form,
          budget_allocated: parseFloat(form.budget_allocated) || 0
        })
      })
      const data = await res.json()
      if (data.success) {
        setCampaigns(prev => [data.campaign, ...prev])
        setModalOpen(false)
        setForm({
          name: '', goal: '', status: 'draft', budget_allocated: '',
          start_date: '', end_date: '', description: '', auto_link_posts: true
        })
        showToast('success', 'Campaign created! ✓')
        fetchData()
      } else {
        throw new Error(data.error || 'Failed to create campaign')
      }
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = activeTab === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === activeTab)

  const goals = [
    { id: 'awareness', name: 'Brand Awareness', desc: 'Reach new audiences', icon: Target },
    { id: 'sales', name: 'Drive Sales', desc: 'Convert followers', icon: DollarSign },
    { id: 'ugc', name: 'UGC Content', desc: 'Get authentic content', icon: Smartphone },
    { id: 'community', name: 'Community', desc: 'Grow your following', icon: Users },
    { id: 'launch', name: 'Product Launch', desc: 'Build hype', icon: Rocket },
    { id: 'partnership', name: 'Partnership', desc: 'Long-term creators', icon: Handshake },
  ]

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

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-4 border-[#C4622D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-playfair text-[28px] text-[#1C1410] mb-1">Campaign Analytics</h1>
          <p className="font-dm-sans text-[14px] text-[#A89585]">Measure ROI across your influencer campaigns</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-[#C4622D] text-white rounded-[10px] px-5 py-2.5 font-dm-sans font-medium hover:bg-[#A85125] transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* GLOBAL STATS */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-5">
          <div className="text-[12px] font-dm-sans text-[#A89585] uppercase tracking-wider mb-1">ACTIVE CAMPAIGNS</div>
          <div className="text-[24px] font-bold font-dm-sans text-[#1C1410]">{globalStats.active_campaigns}</div>
          <div className="text-[12px] font-dm-sans text-[#A89585] mt-1">running now</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-5">
          <div className="text-[12px] font-dm-sans text-[#A89585] uppercase tracking-wider mb-1">TOTAL REACH</div>
          <div className="text-[24px] font-bold font-dm-sans text-[#1C1410]">{formatNumber(globalStats.total_reach)}</div>
          <div className="text-[12px] font-dm-sans text-[#A89585] mt-1">across all campaigns</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-5">
          <div className="text-[12px] font-dm-sans text-[#A89585] uppercase tracking-wider mb-1">TOTAL SPEND</div>
          <div className="text-[24px] font-bold font-dm-sans text-[#1C1410]">₹{formatNumber(globalStats.total_spend)}</div>
          <div className="text-[12px] font-dm-sans text-[#A89585] mt-1">all time</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-5">
          <div className="text-[12px] font-dm-sans text-[#A89585] uppercase tracking-wider mb-1">AVG ENGAGEMENT</div>
          <div className="text-[24px] font-bold font-dm-sans text-[#1C1410]">{globalStats.avg_engagement.toFixed(1)}%</div>
          <div className="text-[12px] font-dm-sans text-[#A89585] mt-1">across campaigns</div>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'completed', 'draft', 'paused'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-dm-sans text-[14px] capitalize transition-colors ${
              activeTab === tab 
                ? 'bg-[#1C1410] text-white' 
                : 'text-[#A89585] hover:text-[#1C1410]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CAMPAIGNS GRID */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E8DDD4] rounded-2xl flex flex-col items-center justify-center p-16 text-center">
          <BarChart2 size={48} className="text-[#A89585] mb-4 opacity-50" />
          <h3 className="font-playfair text-[18px] text-[#1C1410] mb-2">No campaigns yet</h3>
          <p className="font-dm-sans text-[14px] text-[#A89585] max-w-[300px] mb-6">
            Create your first campaign to track ROI across your influencer partnerships
          </p>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-[#C4622D] text-white rounded-[10px] px-6 py-2.5 font-dm-sans font-medium hover:bg-[#A85125] transition-colors"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[20px]">
          {filtered.map(c => {
            const m = c.metrics || {}
            const best = m.best_post
            const influencers = c.campaign_influencers || []
            const timelineColor = c.status === 'completed' ? '#3B82F6' : (m.timeline_progress < 100 ? '#C4622D' : '#3B82F6')
            const budgetColor = m.budget_progress < 75 ? '#16A34A' : (m.budget_progress < 90 ? '#F59E0B' : '#EF4444')

            return (
              <div 
                key={c.id} 
                onClick={() => router.push(`/dashboard/campaigns/${c.id}`)}
                className="bg-white border border-[#E8DDD4] rounded-[16px] p-6 cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col"
              >
                {/* Row 1 */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-playfair text-[18px] text-[#1C1410] font-semibold">{c.name}</h3>
                  {getStatusBadge(c.status)}
                </div>

                {/* Row 2 */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-[#F5F0E8] text-[#C4622D] rounded-[20px] px-[10px] py-[4px] text-[12px] font-dm-sans">
                    {getGoalChip(c.goal)}
                  </div>
                  {(c.start_date || c.end_date) && (
                    <div className="text-[12px] font-dm-sans text-[#A89585]">
                      {formatDate(c.start_date)} → {formatDate(c.end_date)}
                    </div>
                  )}
                </div>

                {/* Row 3 Timeline */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-1.5 label text-[#A89585] font-dm-sans text-[11px]">
                    <span>Timeline</span>
                    <span>{m.timeline_progress || 0}% complete</span>
                  </div>
                  <div className="h-[6px] rounded-[3px] bg-[#F5F0E8] w-full overflow-hidden">
                    <div className="h-full rounded-[3px]" style={{ width: `${m.timeline_progress || 0}%`, backgroundColor: timelineColor }}></div>
                  </div>
                </div>

                {/* Row 4 Quick Metrics */}
                <div className="grid grid-cols-3 gap-4 border-t border-[#E8DDD4] py-4 mb-2">
                  <div className="flex flex-col border-r border-[#E8DDD4]">
                    <span className="font-dm-sans text-[14px] text-[#1C1410] font-semibold">👥 {m.influencers_count || 0}</span>
                    <span className="font-dm-sans text-[11px] text-[#A89585]">Influencers</span>
                  </div>
                  <div className="flex flex-col border-r border-[#E8DDD4] pl-2">
                    <span className="font-dm-sans text-[14px] text-[#1C1410] font-semibold">📝 {m.posts_count || 0}</span>
                    <span className="font-dm-sans text-[11px] text-[#A89585]">Posts</span>
                  </div>
                  <div className="flex flex-col pl-2">
                    <span className="font-dm-sans text-[14px] text-[#1C1410] font-semibold">💰 ₹{formatNumber(c.budget_spent || 0)}</span>
                    <span className="font-dm-sans text-[11px] text-[#A89585]">Spent</span>
                  </div>
                </div>

                {/* Row 5 Performance */}
                <div className="grid grid-cols-3 gap-4 bg-[#F9F6F3] p-3 rounded-[10px] mb-4">
                  <div className="flex flex-col">
                    <span className="font-dm-sans text-[11px] text-[#A89585] mb-0.5">Reach</span>
                    <span className="font-dm-sans text-[15px] font-bold text-[#1C1410]">{formatNumber(m.total_reach || 0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-dm-sans text-[11px] text-[#A89585] mb-0.5">Engagement</span>
                    <span className="font-dm-sans text-[15px] font-bold text-[#1C1410]">{m.avg_engagement_rate || 0}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-dm-sans text-[11px] text-[#A89585] mb-0.5">CPE</span>
                    <span className="font-dm-sans text-[15px] font-bold text-[#1C1410]">₹{m.cost_per_engagement || 0}</span>
                  </div>
                </div>

                {/* Row 6 Budget */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5 label text-[#A89585] font-dm-sans text-[11px]">
                    <span>Budget</span>
                    <span>₹{formatNumber(c.budget_spent || 0)} / ₹{formatNumber(c.budget_allocated || 0)}</span>
                  </div>
                  <div className="h-[6px] rounded-[3px] bg-[#F5F0E8] w-full overflow-hidden">
                    <div className="h-full rounded-[3px]" style={{ width: `${Math.min(m.budget_progress || 0, 100)}%`, backgroundColor: budgetColor }}></div>
                  </div>
                </div>

                {/* Row 7 Best Post */}
                <div className="mt-auto mb-4 min-h-[40px]">
                  {best && (
                    <div className="flex items-center gap-2">
                      <span className="font-dm-sans text-[12px] text-[#A89585]">🏆 Best:</span>
                      <span className="font-dm-sans text-[13px] text-[#1C1410]">@{best.influencer_handle} · {best.engagement_rate}% eng</span>
                    </div>
                  )}
                </div>

                {/* Row 8 + Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-[#E8DDD4]">
                  <div className="flex items-center">
                    {influencers.slice(0, 5).map((inf: any, i: number) => (
                      <div 
                        key={i} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-dm-sans text-[11px] font-bold border-2 border-white ${i > 0 ? '-ml-2' : ''}`}
                        style={{ backgroundColor: inf.influencer_avatar_color || '#C4622D', zIndex: 10 - i }}
                        title={inf.influencer_name}
                      >
                        {inf.influencer_name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {influencers.length > 5 && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#A89585] text-white font-dm-sans text-[11px] font-bold border-2 border-white -ml-2 z-0">
                        +{influencers.length - 5}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="border border-[#E8DDD4] text-[#1C1410] rounded-lg px-4 py-2 font-dm-sans text-[13px] font-medium hover:border-[#C4622D] hover:text-[#C4622D] transition-colors">
                      View Details →
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E8DDD4] text-[#A89585] hover:border-[#C4622D] hover:text-[#C4622D] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO Dropdown placeholder
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* NEW CAMPAIGN MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] w-[560px] max-w-full p-8 relative flex flex-col max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-[#A89585] hover:text-[#1C1410]"
            >
              <X size={20} />
            </button>
            
            <h2 className="font-playfair text-[24px] text-[#1C1410] mb-6">Create New Campaign</h2>

            <div className="space-y-6">
              <div>
                <label className="font-dm-sans text-[11px] text-[#A89585] uppercase tracking-wider mb-2 block">Campaign Name *</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-[#F5F0E8] border-none rounded-[8px] px-4 py-3 font-dm-sans text-[13px] text-[#1C1410] outline-none focus:ring-2 focus:ring-[#C4622D]/20"
                  placeholder="e.g. Summer Collection 2026"
                />
              </div>

              <div>
                <label className="font-dm-sans text-[11px] text-[#A89585] uppercase tracking-wider mb-2 block">Campaign Goal</label>
                <div className="grid grid-cols-2 gap-[10px]">
                  {goals.map(g => {
                    const selected = form.goal === g.id
                    const Icon = g.icon
                    return (
                      <div 
                        key={g.id}
                        onClick={() => setForm({...form, goal: g.id})}
                        className={`border rounded-[10px] p-3 cursor-pointer relative transition-all ${
                          selected 
                            ? 'border-[#C4622D] bg-[#FFF5F0]' 
                            : 'border-[#E8DDD4] hover:border-[#C4622D]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={14} className={selected ? 'text-[#C4622D]' : 'text-[#A89585]'} />
                          <span className={`font-dm-sans text-[13px] font-medium ${selected ? 'text-[#C4622D]' : 'text-[#1C1410]'}`}>
                            {g.name}
                          </span>
                        </div>
                        <p className="font-dm-sans text-[11px] text-[#A89585] pl-6">{g.desc}</p>
                        {selected && (
                          <div className="absolute top-3 right-3 text-[#C4622D]">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-dm-sans text-[11px] text-[#A89585] uppercase tracking-wider mb-2 block">Start Date</label>
                  <input 
                    type="date" 
                    value={form.start_date}
                    onChange={e => setForm({...form, start_date: e.target.value})}
                    className="w-full bg-[#F5F0E8] border-none rounded-[8px] px-4 py-3 font-dm-sans text-[13px] text-[#1C1410] outline-none focus:ring-2 focus:ring-[#C4622D]/20"
                  />
                </div>
                <div>
                  <label className="font-dm-sans text-[11px] text-[#A89585] uppercase tracking-wider mb-2 block">End Date</label>
                  <input 
                    type="date" 
                    value={form.end_date}
                    onChange={e => setForm({...form, end_date: e.target.value})}
                    className="w-full bg-[#F5F0E8] border-none rounded-[8px] px-4 py-3 font-dm-sans text-[13px] text-[#1C1410] outline-none focus:ring-2 focus:ring-[#C4622D]/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-dm-sans text-[11px] text-[#A89585] uppercase tracking-wider mb-2 block">Total Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-[10px] text-[#A89585] font-dm-sans text-[14px]">₹</span>
                  <input 
                    type="number" 
                    value={form.budget_allocated}
                    onChange={e => setForm({...form, budget_allocated: e.target.value})}
                    className="w-full bg-[#F5F0E8] border-none rounded-[8px] pl-8 pr-4 py-3 font-dm-sans text-[13px] text-[#1C1410] outline-none focus:ring-2 focus:ring-[#C4622D]/20"
                    placeholder="250000"
                  />
                </div>
              </div>

              <div>
                <label className="font-dm-sans text-[11px] text-[#A89585] uppercase tracking-wider mb-2 block">Description</label>
                <textarea 
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-[#F5F0E8] border-none rounded-[8px] px-4 py-3 font-dm-sans text-[13px] text-[#1C1410] outline-none focus:ring-2 focus:ring-[#C4622D]/20 resize-none"
                  placeholder="Brief campaign description..."
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[#E8DDD4]">
                <div>
                  <div className="font-dm-sans text-[14px] text-[#1C1410] font-medium mb-1">Auto-link existing tracked posts</div>
                  <div className="font-dm-sans text-[12px] text-[#A89585]">Match posts with same campaign name</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={form.auto_link_posts} onChange={e => setForm({...form, auto_link_posts: e.target.checked})} />
                  <div className="w-11 h-6 bg-[#E8DDD4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C4622D]"></div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DDD4]">
                <button 
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-[10px] bg-white border border-[#E8DDD4] font-dm-sans text-[14px] font-semibold text-[#1C1410] hover:bg-[#F5F0E8] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-[10px] bg-[#C4622D] text-white font-dm-sans text-[14px] font-semibold hover:bg-[#A85125] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Campaign →'
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Global Toast Placeholder */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5">
          <div className={`rounded-xl shadow-lg border px-4 py-3 flex items-center gap-3 ${
            toast.type === 'success' 
            ? 'bg-white border-[#E8DDD4]' 
            : 'bg-red-50 border-red-200'
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
