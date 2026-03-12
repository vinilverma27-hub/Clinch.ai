import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
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

    const { id } = await context.params

    const { data: post, error: postError } = await supabase
      .from('tracked_posts')
      .select('*')
      .eq('id', id)
      .eq('brand_id', brand.id)
      .single()

    if (postError) throw postError

    const { data: history, error: historyError } = await supabase
      .from('post_metrics_history')
      .select('*')
      .eq('post_id', id)
      .order('recorded_at', { ascending: true })

    if (historyError) throw historyError

    return NextResponse.json({ post, history })
  } catch (err: any) {
    console.error('Tracked post GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
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

    const { id } = await context.params
    const body = await request.json()

    const updates: any = {}
    if (body.status !== undefined) updates.status = body.status
    if (body.caption !== undefined) updates.caption = body.caption
    if (body.campaign !== undefined) updates.campaign = body.campaign
    if (body.notes !== undefined) updates.notes = body.notes
    
    if (typeof body.views === 'number') updates.views = body.views
    if (typeof body.likes === 'number') updates.likes = body.likes
    if (typeof body.comments === 'number') updates.comments = body.comments
    if (typeof body.shares === 'number') updates.shares = body.shares
    
    if (body.influencer_name !== undefined) updates.influencer_name = body.influencer_name
    if (body.influencer_handle !== undefined) updates.influencer_handle = body.influencer_handle

    const { data: existingPost } = await supabase
      .from('tracked_posts')
      .select('views, likes, comments, shares')
      .eq('id', id)
      .eq('brand_id', brand.id)
      .single()
      
    if (!existingPost) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const currentViews = typeof body.views === 'number' ? body.views : existingPost.views;
    const currentLikes = typeof body.likes === 'number' ? body.likes : existingPost.likes;
    const currentComments = typeof body.comments === 'number' ? body.comments : existingPost.comments;
    const currentShares = typeof body.shares === 'number' ? body.shares : existingPost.shares;

    let engagement_rate = 0
    if (currentViews > 0) {
      engagement_rate = ((currentLikes + currentComments + currentShares) / currentViews) * 100
    }
    updates.engagement_rate = engagement_rate

    const { data: updated, error } = await supabase
      .from('tracked_posts')
      .update(updates)
      .eq('id', id)
      .eq('brand_id', brand.id)
      .select()
      .single()

    if (error) throw error

    await supabase.from('post_metrics_history').insert({
      post_id: id,
      views: currentViews,
      likes: currentLikes,
      comments: currentComments,
      shares: currentShares,
      engagement_rate,
      recorded_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true, post: updated })
  } catch (err: any) {
    console.error('Tracked post PUT error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
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

    const { id } = await context.params

    const { error } = await supabase
      .from('tracked_posts')
      .delete()
      .eq('id', id)
      .eq('brand_id', brand.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Tracked post DELETE error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
