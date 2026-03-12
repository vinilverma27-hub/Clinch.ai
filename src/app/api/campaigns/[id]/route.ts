import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const { data: c, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_influencers (*),
        tracked_posts (*)
      `)
      .eq('id', id)
      .eq('brand_id', brand?.id)
      .single()

    if (error) throw error
    if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })

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

    const enriched = {
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

    return NextResponse.json({ campaign: enriched })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).single()

    const updates = await req.json()

    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .eq('brand_id', brand?.id)
      .select().single()

    if (error) throw error

    return NextResponse.json({ success: true, campaign: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).single()

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('brand_id', brand?.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
