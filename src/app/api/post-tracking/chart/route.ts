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
    const daysStr = searchParams.get('days') || '7'
    const days = parseInt(daysStr, 10)
    const platform = searchParams.get('platform')

    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - days)

    let query = supabase
      .from('post_metrics_history')
      .select(`
        recorded_at,
        views,
        likes,
        comments,
        shares,
        engagement_rate,
        tracked_posts!inner (
          brand_id,
          platform
        )
      `)
      .eq('tracked_posts.brand_id', brand.id)
      .gte('recorded_at', from.toISOString())
      .lte('recorded_at', to.toISOString())
      .order('recorded_at', { ascending: true })

    if (platform && platform !== 'all') {
      query = query.eq('tracked_posts.platform', platform)
    }

    const { data, error } = await query

    if (error) throw error

    const grouped: Record<string, any> = {}
    
    data?.forEach(row => {
      const dateObj = new Date(row.recorded_at)
      const dateKey = dateObj.toISOString().split('T')[0] // YYYY-MM-DD
      const formattedDate = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          dateKey,
          date: formattedDate,
          views: 0,
          engagement: 0,
          count: 0
        }
      }
      grouped[dateKey].views += row.views
      grouped[dateKey].engagement += (row.likes + row.comments + row.shares)
      grouped[dateKey].count++
    })

    const chartData = Object.values(grouped).sort((a: any, b: any) => a.dateKey.localeCompare(b.dateKey))
    
    const formattedChartData = chartData.map((item: any) => ({
      date: item.date,
      views: item.views,
      engagement: item.engagement
    }))

    return NextResponse.json(formattedChartData)

  } catch (err: any) {
    console.error('Tracked posts chart error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
