import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = 
      await supabase.auth.getUser()
    if (!user) return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )

    const { data: brand } = await supabase
      .from('brands')
      .select('id, name')
      .eq('user_id', user.id)
      .single()

    if (!brand) return NextResponse.json({
      total_searches: 0, crm_total: 0,
      emails_sent: 0, deals_closed: 0,
      recent_activity: [], top_matches: []
    })

    // Run all queries in parallel
    const [
      searchesRes,
      crmRes,
      emailsRes,
      dealsRes,
      activityRes,
      topMatchesRes
    ] = await Promise.all([

      // Total searches
      supabase
        .from('search_history')
        .select('id', { count: 'exact' })
        .eq('brand_id', brand.id),

      // Total CRM entries
      supabase
        .from('crm_entries')
        .select('id', { count: 'exact' })
        .eq('brand_id', brand.id),

      // Emails sent
      supabase
        .from('crm_entries')
        .select('id', { count: 'exact' })
        .eq('brand_id', brand.id)
        .eq('status', 'email_sent'),

      // Deals closed
      supabase
        .from('crm_entries')
        .select('id', { count: 'exact' })
        .eq('brand_id', brand.id)
        .eq('status', 'deal_closed'),

      // Recent activity — last 5 searches
      supabase
        .from('search_history')
        .select('id, query, results_count, created_at')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false })
        .limit(5),

      // Top matches from CRM by match_score
      supabase
        .from('crm_entries')
        .select(`
          id, match_score, status,
          influencers (
            full_name, handle, platform,
            followers, engagement_rate,
            estimated_cost_min, estimated_cost_max
          )
        `)
        .eq('brand_id', brand.id)
        .order('match_score', { ascending: false })
        .limit(3)
    ])

    return NextResponse.json({
      total_searches: searchesRes.count || 0,
      crm_total: crmRes.count || 0,
      emails_sent: emailsRes.count || 0,
      deals_closed: dealsRes.count || 0,
      recent_activity: activityRes.data || [],
      top_matches: topMatchesRes.data || []
    })

  } catch (err: any) {
    console.error('Dashboard stats error:', err)
    return NextResponse.json({
      total_searches: 0, crm_total: 0,
      emails_sent: 0, deals_closed: 0,
      recent_activity: [], top_matches: []
    })
  }
}
