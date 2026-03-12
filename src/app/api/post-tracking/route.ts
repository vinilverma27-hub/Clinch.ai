import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const sort = searchParams.get('sort')
    const direction = searchParams.get('direction')

    let query = supabase
      .from('tracked_posts')
      .select('*')
      .eq('brand_id', brand.id)

    if (platform && platform !== 'all') query = query.eq('platform', platform)
    if (status && status !== 'all') query = query.eq('status', status)
    if (date_from) query = query.gte('post_published_at', date_from)
    if (date_to) query = query.lte('post_published_at', date_to)

    query = query.order(
      sort || 'post_published_at',
      { ascending: direction === 'asc' }
    )

    const { data, error } = await query

    if (error) throw error

    // DEMO DATA SEEDING
    if (!data || data.length === 0) {
      const demoPosts = [
        {
          brand_id: brand.id,
          post_url: 'https://instagram.com/p/demo1',
          platform: 'instagram',
          caption: 'Summer skincare routine that changed my life ✨ #skincare #summer',
          campaign: 'Summer 2026',
          influencer_name: 'Priya Sharma',
          influencer_handle: 'priya_stylefiles',
          influencer_avatar_color: '#C4622D',
          views: 48200,
          likes: 3840,
          comments: 284,
          shares: 180,
          engagement_rate: 8.5,
          status: 'live',
          post_published_at: '2026-03-08T10:00:00Z'
        },
        {
          brand_id: brand.id,
          post_url: 'https://youtube.com/watch?v=demo2',
          platform: 'youtube',
          caption: 'Honest review: Is this ₹5000 moisturizer actually worth it?',
          campaign: 'Summer 2026',
          influencer_name: 'Arjun Mehta',
          influencer_handle: 'techwitharjun',
          influencer_avatar_color: '#2D7DD2',
          views: 92400,
          likes: 5820,
          comments: 641,
          shares: 320,
          engagement_rate: 6.2,
          status: 'live',
          post_published_at: '2026-03-06T10:00:00Z'
        },
        {
          brand_id: brand.id,
          post_url: 'https://instagram.com/p/demo3',
          platform: 'instagram',
          caption: 'POV: Found the best street food in Bangalore 🍜 #foodie #bangalore',
          campaign: 'Summer 2026',
          influencer_name: 'Sneha Iyer',
          influencer_handle: 'sneha.eats',
          influencer_avatar_color: '#3BB273',
          views: 124000,
          likes: 9200,
          comments: 820,
          shares: 640,
          engagement_rate: 7.8,
          status: 'live',
          post_published_at: '2026-03-05T10:00:00Z'
        },
        {
          brand_id: brand.id,
          post_url: 'https://linkedin.com/posts/demo4',
          platform: 'linkedin',
          caption: 'Why Indian brands need to invest in micro-influencers in 2026',
          campaign: '',
          influencer_name: 'Rahul Kapoor',
          influencer_handle: 'rahulkapoor',
          influencer_avatar_color: '#7B2D8B',
          views: 8400,
          likes: 420,
          comments: 84,
          shares: 62,
          engagement_rate: 3.1,
          status: 'paused',
          post_published_at: '2026-03-03T10:00:00Z'
        }
      ]

      const { data: insertedPosts, error: insertError } = await supabase
        .from('tracked_posts')
        .insert(demoPosts)
        .select()

      if (!insertError && insertedPosts && insertedPosts.length > 0) {
        // Seed 7 days of history for each post
        const historyData = []
        for (const post of insertedPosts) {
          for (let i = 0; i < 7; i++) {
            const date = new Date('2026-03-04T12:00:00Z')
            date.setDate(date.getDate() + i)
            
            const multiplier = 0.5 + (i * 0.1)
            const views = Math.floor(post.views * multiplier)
            const likes = Math.floor(post.likes * multiplier)
            const comments = Math.floor(post.comments * multiplier)
            const shares = Math.floor(post.shares * multiplier)
            
            let eRate = 0
            if (views > 0) {
                eRate = Number((((likes + comments + shares) / views) * 100).toFixed(1))
            }

            historyData.push({
              post_id: post.id,
              views,
              likes,
              comments,
              shares,
              engagement_rate: eRate,
              recorded_at: date.toISOString()
            })
          }
        }
        await supabase.from('post_metrics_history').insert(historyData)
        
        // Re-fetch the data after seeding
        const { data: newData } = await query
        if (newData) {
           return buildResponse(newData)
        }
      }
    }

    return buildResponse(data || [])

  } catch (err: any) {
    console.error('Tracked posts GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function buildResponse(data: any[]) {
  const total_views = data.reduce((sum, p) => sum + (p.views || 0), 0)
  const total_engagement = data.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0)
  
  let avg_engagement_rate = 0
  if (data.length > 0) {
    const sumRates = data.reduce((sum, p) => sum + (p.engagement_rate || 0), 0)
    avg_engagement_rate = sumRates / data.length
  }
  avg_engagement_rate = Number(avg_engagement_rate.toFixed(1))

  const platformBreakdown = data.reduce((acc, p) => {
    acc[p.platform] = (acc[p.platform] || 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    posts: data,
    stats: {
      posts_tracked: data.length,
      total_views,
      total_engagement,
      avg_engagement_rate,
      platform_breakdown: {
        instagram: platformBreakdown['instagram'] || 0,
        youtube: platformBreakdown['youtube'] || 0,
        linkedin: platformBreakdown['linkedin'] || 0,
      }
    }
  })
}

export async function POST(request: Request) {
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

    const body = await request.json()
    let {
      post_url, platform, caption, campaign,
      notes, influencer_id, influencer_name,
      influencer_handle, influencer_avatar_color,
      post_published_at
    } = body

    if (!platform && post_url) {
      if (post_url.includes('instagram.com')) platform = 'instagram'
      else if (post_url.includes('youtube.com') || post_url.includes('youtu.be')) platform = 'youtube'
      else if (post_url.includes('linkedin.com')) platform = 'linkedin'
    }

    const { data: newPost, error } = await supabase
      .from('tracked_posts')
      .insert({
        brand_id: brand.id,
        post_url,
        platform,
        caption: caption || '',
        campaign: campaign || '',
        notes: notes || '',
        influencer_id,
        influencer_name: influencer_name || '',
        influencer_handle: influencer_handle || '',
        influencer_avatar_color: influencer_avatar_color || '#C4622D',
        post_published_at: post_published_at || new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagement_rate: 0,
        status: 'live'
      })
      .select()
      .single()

    if (error) throw error

    // Insert first metric snapshot
    await supabase.from('post_metrics_history').insert({
      post_id: newPost.id,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      engagement_rate: 0,
      recorded_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true, post: newPost })
  } catch (err: any) {
    console.error('Tracked posts POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
