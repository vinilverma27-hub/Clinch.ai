import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
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

    if (error || !c) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    const posts = c.tracked_posts || []
    const influencers = c.campaign_influencers || []
    
    const total_reach = posts.reduce((sum: number, p: any) => sum + (p.views||0), 0)
    const total_engagement_actions = posts.reduce((sum: number, p: any) => sum + (p.likes||0) + (p.comments||0) + (p.shares||0), 0)
    const avg_engagement = posts.length > 0 ? posts.reduce((sum: number, p: any) => sum + (p.engagement_rate||0), 0) / posts.length : 0
    const cost_per_engagement = total_engagement_actions > 0 && c.budget_spent > 0 ? c.budget_spent / total_engagement_actions : 0
    const budget_progress = c.budget_allocated > 0 ? (c.budget_spent / c.budget_allocated) * 100 : 0
    
    const best_post = posts.length > 0
      ? posts.reduce((best: any, p: any) => (p.engagement_rate||0) > (best.engagement_rate||0) ? p : best)
      : null

    const metrics = {
      total_reach,
      total_engagement_actions,
      avg_engagement_rate: parseFloat(avg_engagement.toFixed(1)),
      cost_per_engagement: parseFloat(cost_per_engagement.toFixed(2)),
      posts_count: posts.length,
      influencers_count: influencers.length,
      budget_progress: parseFloat(budget_progress.toFixed(0)),
      best_post
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620', // Ensure model name is correct for Anthropic API
        max_tokens: 1000,
        system: `You are a campaign analytics expert for influencer marketing in India. Write clear, data-driven, actionable reports for brand managers. Use Indian market context and INR currency.`,
        messages: [{
          role: 'user',
          content: `Generate an executive campaign performance report:
            
            Campaign: ${c.name}
            Goal: ${c.goal}
            Status: ${c.status}
            Period: ${c.start_date} to ${c.end_date}
            Budget: ₹${c.budget_allocated} allocated, ₹${c.budget_spent} spent
            
            Performance Metrics:
            - Total Reach: ${metrics.total_reach}
            - Posts Live: ${metrics.posts_count}
            - Influencers: ${metrics.influencers_count}
            - Avg Engagement Rate: ${metrics.avg_engagement_rate}%
            - Total Engagements: ${metrics.total_engagement_actions}
            - Cost Per Engagement: ₹${metrics.cost_per_engagement}
            - Budget Utilization: ${metrics.budget_progress}%
            ${metrics.best_post ? `
            - Best Post: @${metrics.best_post.influencer_handle} with ${metrics.best_post.engagement_rate}% engagement rate` : ''}
            
            Write a structured report with:
            ## Executive Summary
            (2-3 sentences on overall performance)
            
            ## What Worked
            (3 specific bullet points with data)
            
            ## Areas to Improve
            (2-3 actionable bullet points)
            
            ## Recommendations
            (3 specific recommendations for next campaign with this type of goal)
            
            Be specific, data-driven, concise.`
        }]
      })
    })

    const data = await response.json()
    const report = data.content?.[0]?.text || 'Unable to generate report at this time.'

    return NextResponse.json({ report })
  } catch (error: any) {
    console.error('Report Generation Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
