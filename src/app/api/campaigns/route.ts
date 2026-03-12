import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_influencers (
          id, influencer_name, influencer_handle,
          influencer_avatar_color, platform,
          budget_allocated, amount_paid, status
        ),
        tracked_posts (
          id, views, likes, comments, shares,
          engagement_rate, platform, status,
          caption, influencer_name, 
          influencer_handle, post_published_at
        )
      `)
      .eq('brand_id', brand.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    let enriched = campaigns?.map(c => {
      const posts = c.tracked_posts || []
      const influencers = c.campaign_influencers || []
      
      const total_reach = posts.reduce((sum: number, p: any) => sum + (p.views||0), 0)
      
      const total_engagement_actions = posts.reduce(
        (sum: number, p: any) => sum + (p.likes||0) + (p.comments||0) + (p.shares||0), 0)
      
      const avg_engagement = posts.length > 0
        ? posts.reduce((sum: number, p: any) => sum + (p.engagement_rate||0), 0) / posts.length
        : 0
      
      const cost_per_engagement = total_engagement_actions > 0 && c.budget_spent > 0
          ? c.budget_spent / total_engagement_actions
          : 0
      
      const now = new Date()
      const start = new Date(c.start_date)
      const end = new Date(c.end_date)
      const total_days = Math.max((end.getTime() - start.getTime()) / 86400000, 1)
      const elapsed = (now.getTime() - start.getTime()) / 86400000
      const timeline_progress = Math.min(Math.max((elapsed / total_days) * 100, 0), 100)
      
      const budget_progress = c.budget_allocated > 0
        ? (c.budget_spent / c.budget_allocated) * 100
        : 0
      
      const best_post = posts.length > 0
        ? posts.reduce((best: any, p: any) => (p.engagement_rate||0) > (best.engagement_rate||0) ? p : best)
        : null
      
      return {
        ...c,
        metrics: {
          total_reach,
          total_engagement_actions,
          avg_engagement_rate: parseFloat(avg_engagement.toFixed(1)),
          cost_per_engagement: parseFloat(cost_per_engagement.toFixed(2)),
          posts_count: posts.length,
          influencers_count: influencers.length,
          budget_progress: parseFloat(budget_progress.toFixed(0)),
          timeline_progress: parseFloat(timeline_progress.toFixed(0)),
          best_post
        }
      }
    }) || []

    const global_stats = {
      active_campaigns: enriched.filter(c => c.status === 'active').length,
      total_reach: enriched.reduce((sum, c) => sum + c.metrics.total_reach, 0),
      total_spend: enriched.reduce((sum, c) => sum + (c.budget_spent||0), 0),
      avg_engagement: enriched.length > 0
        ? enriched.reduce((sum, c) => sum + c.metrics.avg_engagement_rate, 0) / enriched.length
        : 0
    }

    if (enriched.length === 0) {
      // Seed Demo Data
      const { data: c1 } = await supabase
        .from('campaigns')
        .insert({
          brand_id: brand.id,
          name: 'Summer Skincare 2026',
          goal: 'awareness',
          status: 'active',
          budget_allocated: 240000,
          budget_spent: 168000,
          start_date: '2026-03-01',
          end_date: '2026-03-31',
          description: 'Summer skincare awareness campaign with micro and mid-tier creators'
        })
        .select().single()

      const { data: c2 } = await supabase
        .from('campaigns')
        .insert({
          brand_id: brand.id,
          name: 'Tech Launch Q1',
          goal: 'launch',
          status: 'completed',
          budget_allocated: 450000,
          budget_spent: 442000,
          start_date: '2026-01-15',
          end_date: '2026-02-28',
          description: 'Product launch campaign targeting tech creators on YouTube and LinkedIn'
        })
        .select().single()

      if (c1) {
        await supabase.from('campaign_influencers').insert([
          {
            campaign_id: c1.id, brand_id: brand.id,
            influencer_name: 'Priya Sharma', influencer_handle: 'priya_stylefiles',
            influencer_avatar_color: '#C4622D', platform: 'instagram',
            budget_allocated: 70000, amount_paid: 70000, status: 'paid'
          },
          {
            campaign_id: c1.id, brand_id: brand.id,
            influencer_name: 'Sneha Iyer', influencer_handle: 'sneha.eats',
            influencer_avatar_color: '#3BB273', platform: 'instagram',
            budget_allocated: 80000, amount_paid: 48000, status: 'content_live'
          },
          {
            campaign_id: c1.id, brand_id: brand.id,
            influencer_name: 'Arjun Mehta', influencer_handle: 'techwitharjun',
            influencer_avatar_color: '#2D7DD2', platform: 'youtube',
            budget_allocated: 90000, amount_paid: 50000, status: 'content_live'
          }
        ])
        
        await supabase.from('tracked_posts')
          .update({ campaign_id: c1.id })
          .eq('brand_id', brand.id)
          .or('campaign.ilike.%Summer%,campaign.ilike.%summer%')
      }

      if (c2) {
        await supabase.from('campaign_influencers').insert([
          {
            campaign_id: c2.id, brand_id: brand.id,
            influencer_name: 'Rahul Kapoor', influencer_handle: 'rahulkapoor',
            influencer_avatar_color: '#7B2D8B', platform: 'linkedin',
            budget_allocated: 120000, amount_paid: 120000, status: 'paid'
          },
          {
            campaign_id: c2.id, brand_id: brand.id,
            influencer_name: 'Arjun Mehta', influencer_handle: 'techwitharjun',
            influencer_avatar_color: '#2D7DD2', platform: 'youtube',
            budget_allocated: 180000, amount_paid: 180000, status: 'paid'
          }
        ])
      }
      
      // Return fresh after seeding by calling GET again or re-fetching
      const { data: newCampaigns } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_influencers (*),
          tracked_posts (*)
        `)
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false })
      
      // we'll just return response recursive style
      return GET(req)
    }

    return NextResponse.json({ campaigns: enriched, global_stats: global_stats })
  } catch (error: any) {
    console.error('Campaign GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const body = await req.json()
    const { name, goal, status, budget_allocated, start_date, end_date, description, auto_link_posts } = body

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        brand_id: brand.id,
        name,
        goal: goal || 'awareness',
        status: status || 'draft',
        budget_allocated: budget_allocated || 0,
        budget_spent: 0,
        start_date,
        end_date,
        description: description || ''
      })
      .select().single()
    
    if (error) throw error

    if (auto_link_posts && campaign) {
      await supabase.from('tracked_posts')
        .update({ campaign_id: campaign.id })
        .eq('brand_id', brand.id)
        .ilike('campaign', `%${name}%`)
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error: any) {
    console.error('Campaign POST Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
