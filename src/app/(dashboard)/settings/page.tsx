'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import './settings.css';

const TABS = [
  { id: 'profile', label: '👤 Brand Profile' },
  { id: 'goals', label: '🎯 Campaign Goals' },
  { id: 'billing', label: '💳 Billing' }
];

const INDUSTRIES = [
  'Fashion', 'Beauty', 'Food & Beverage', 'Fitness & Wellness', 
  'Tech', 'Travel', 'Lifestyle', 'Gaming', 'Finance', 'Other'
];

const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'Twitter', 'Pinterest'];
const NICHES = ['Fashion', 'Beauty', 'Food', 'Fitness', 'Tech', 'Travel', 'Gaming', 'Finance', 'Lifestyle', 'Parenting', 'Education', 'Entertainment'];
const BUDGETS = ['Under ₹10k', '₹10k–₹50k', '₹50k–₹1L', '₹1L–₹5L', '₹5L+'];
const FORMATS = ['Reels', 'Stories', 'Posts', 'YouTube Videos', 'Shorts', 'Live', 'Podcasts', 'Blog Posts'];

const GOALS = [
  { id: 'Brand Awareness', title: '🎯 Brand Awareness', desc: 'Reach new audiences at scale' },
  { id: 'Drive Sales', title: '💰 Drive Sales', desc: 'Convert followers to customers' },
  { id: 'Content Creation', title: '📱 Content Creation', desc: 'Get authentic UGC content' },
  { id: 'Community Building', title: '👥 Community Building', desc: 'Grow an engaged following' },
  { id: 'Product Launch', title: '🚀 Product Launch', desc: 'Build hype for new releases' },
  { id: 'Long-term Partnerships', title: '🤝 Long-term Partnerships', desc: 'Build ongoing creator relationships' },
];

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [niches, setNiches] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [formats, setFormats] = useState<string[]>([]);
  const [campaignGoals, setCampaignGoals] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState('');

  // Dashboard stats for Billing tab
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/brand/profile')
      .then(res => res.json())
      .then(data => {
        if (data.brand) {
          const b = data.brand;
          setName(b.name || '');
          setIndustry(b.industry || '');
          setWebsite(b.website || '');
          setDescription(b.description || '');
          setPlatforms(b.target_platforms || []);
          setNiches(b.target_niches || []);
          setBudget(b.monthly_budget || '');
          setFormats(b.content_formats || []);
          setCampaignGoals(b.campaign_goals || []);
          setLogoUrl(b.logo_url || '');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/brand/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, industry, website, description,
          target_platforms: platforms,
          target_niches: niches,
          monthly_budget: budget,
          content_formats: formats,
          campaign_goals: campaignGoals,
          logo_url: logoUrl
        })
      });
      if (!res.ok) throw new Error('Failed to save');
      
      showToast('success', 'Brand profile updated!');
      setDirty(false);
    } catch (err) {
      showToast('error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const markDirty = () => !dirty && setDirty(true);

  // Handlers
  const toggleArray = (arr: string[], setArr: any, val: string) => {
    markDirty();
    if (arr.includes(val)) {
      setArr(arr.filter(item => item !== val));
    } else {
      setArr([...arr, val]);
    }
  };

  const setSingle = (setFn: any, val: string) => {
    markDirty();
    setFn(val);
  };

  if (loading) return <div className="settings-page">Loading...</div>;

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your brand profile and preferences</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar */}
        <div className="settings-sidebar">
          <div className="settings-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.id === 'profile' && dirty && <span className="unsaved-dot" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="settings-content">
          
          {/* ──────────────── TAB 1: BRAND PROFILE ──────────────── */}
          {activeTab === 'profile' && (
            <>
              {/* SECTION 1: Brand Identity */}
              <div className="settings-card">
                <h2 className="settings-card-title">Brand Identity</h2>
                
                <div className="logo-row">
                  <div className="logo-avatar">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <span style={{fontSize: 24, paddingBottom: 4}}>{name ? name.substring(0, 2).toUpperCase() : 'B'}</span>
                    )}
                  </div>
                  <div className="logo-info">
                    <strong>Brand Logo</strong>
                    <p>JPG, PNG up to 2MB</p>
                    {/* Placeholder for real upload */}
                    <button className="btn-upload" onClick={() => showToast('info', 'Logo upload coming soon')}>
                      Upload Logo
                    </button>
                  </div>
                </div>

                <div className="settings-field">
                  <span className="settings-label">Brand Name</span>
                  <input className="settings-input" value={name} onChange={e => setSingle(setName, e.target.value)} />
                </div>

                <div className="settings-field">
                  <span className="settings-label">Industry</span>
                  <select className="settings-select" value={industry} onChange={e => setSingle(setIndustry, e.target.value)}>
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>

                <div className="settings-field">
                  <span className="settings-label">Website</span>
                  <input className="settings-input" placeholder="https://yourbrand.com" value={website} onChange={e => setSingle(setWebsite, e.target.value)} />
                </div>

                <div className="settings-field">
                  <span className="settings-label">Brand Description</span>
                  <textarea 
                    className="settings-textarea" 
                    rows={4} 
                    maxLength={300}
                    placeholder="What does your brand do and who is your target audience?"
                    value={description}
                    onChange={e => setSingle(setDescription, e.target.value)}
                  />
                  <div className="settings-helper">
                    <span>Briefly describe your brand to creators.</span>
                    <span>{description.length}/300</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Target Audience */}
              <div className="settings-card">
                <h2 className="settings-card-title">Target Audience</h2>

                <div className="settings-field">
                  <span className="settings-label">Target Platforms</span>
                  <div className="chips-container">
                    {PLATFORMS.map(p => (
                      <div 
                        key={p} 
                        className={`chip ${platforms.includes(p) ? 'active' : ''}`}
                        onClick={() => toggleArray(platforms, setPlatforms, p)}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="settings-field">
                  <span className="settings-label">Target Niches</span>
                  <div className="chips-container">
                    {NICHES.map(n => (
                      <div 
                        key={n} 
                        className={`chip ${niches.includes(n) ? 'active' : ''}`}
                        onClick={() => toggleArray(niches, setNiches, n)}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="settings-field">
                  <span className="settings-label">Monthly Budget</span>
                  <div className="chips-container">
                    {BUDGETS.map(b => (
                      <div 
                        key={b} 
                        className={`chip ${budget === b ? 'active' : ''}`}
                        onClick={() => setSingle(setBudget, b)}
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Content Preferences */}
              <div className="settings-card">
                <h2 className="settings-card-title">Content Preferences</h2>
                <div className="settings-field">
                  <span className="settings-label">Preferred Formats</span>
                  <div className="chips-container">
                    {FORMATS.map(f => (
                      <div 
                        key={f} 
                        className={`chip ${formats.includes(f) ? 'active' : ''}`}
                        onClick={() => toggleArray(formats, setFormats, f)}
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                className="btn-save" 
                onClick={handleSave}
                disabled={!dirty || saving}
              >
                {saving ? (
                  <><span className="spinner" /> Saving...</>
                ) : 'Save Changes'}
              </button>
            </>
          )}

          {/* ──────────────── TAB 2: CAMPAIGN GOALS ──────────────── */}
          {activeTab === 'goals' && (
            <>
              <div className="settings-card" style={{border: 'none', padding: 0, background: 'transparent'}}>
                <h2 className="settings-card-title">What are your main goals?</h2>
                
                <div className="goals-grid">
                  {GOALS.map(goal => {
                    const isActive = campaignGoals.includes(goal.id);
                    return (
                      <div 
                        key={goal.id} 
                        className={`goal-card ${isActive ? 'active' : ''}`}
                        onClick={() => toggleArray(campaignGoals, setCampaignGoals, goal.id)}
                      >
                        {isActive && <div className="goal-checkmark">✓</div>}
                        <strong style={{display: 'block', fontSize: 16, marginBottom: 8}}>{goal.title}</strong>
                        <p style={{margin: 0, fontSize: 14, color: '#A89585'}}>{goal.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button 
                className="btn-save" 
                style={{marginTop: 24}}
                onClick={handleSave}
                disabled={!dirty || saving}
              >
                {saving ? (
                  <><span className="spinner" /> Saving...</>
                ) : 'Save Goals'}
              </button>
            </>
          )}

          {/* ──────────────── TAB 3: BILLING ──────────────── */}
          {activeTab === 'billing' && (
            <>
              <div className="billing-card">
                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24}}>
                  <span style={{background: '#C4622D', color: 'white', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700}}>Pro Plan</span>
                  <strong style={{fontSize: 20}}>Current Plan</strong>
                </div>

                <ul style={{listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: 12}}>
                  {['Unlimited AI searches', 'Full CRM access', 'AI outreach drafting', 'Mailbox & conversation threads', 'Email templates', 'Priority support'].map(f => (
                    <li key={f} style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 15}}>
                      <span style={{color: '#C4622D', fontWeight: 'bold'}}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                <button className="btn-save" style={{background: 'white', color: '#1C1410', border: '1px solid #E8DDD4'}} disabled>
                  Manage Billing (Coming soon)
                </button>
              </div>

              <div className="settings-card">
                <h2 className="settings-card-title">Usage This Month</h2>
                <div className="goals-grid" style={{gap: 20}}>
                  <div>
                    <span style={{fontSize: 13, color: '#A89585', textTransform: 'uppercase', fontWeight: 600}}>🔍 AI Searches</span>
                    <strong style={{display: 'block', fontSize: 24, marginTop: 4}}>{stats?.total_searches || 0}</strong>
                  </div>
                  <div>
                    <span style={{fontSize: 13, color: '#A89585', textTransform: 'uppercase', fontWeight: 600}}>👥 In Pipeline</span>
                    <strong style={{display: 'block', fontSize: 24, marginTop: 4}}>{stats?.crm_total || 0}</strong>
                  </div>
                  <div>
                    <span style={{fontSize: 13, color: '#A89585', textTransform: 'uppercase', fontWeight: 600}}>✉️ Emails Queued</span>
                    <strong style={{display: 'block', fontSize: 24, marginTop: 4}}>{stats?.emails_sent || 0}</strong>
                  </div>
                  <div>
                    <span style={{fontSize: 13, color: '#A89585', textTransform: 'uppercase', fontWeight: 600}}>🤝 Deals Closed</span>
                    <strong style={{display: 'block', fontSize: 24, marginTop: 4}}>{stats?.deals_closed || 0}</strong>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
