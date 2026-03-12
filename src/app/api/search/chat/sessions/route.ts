import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = 
      await supabase.auth.getUser()
    if (!user) return NextResponse.json(
      { sessions: [] }, { status: 200 }
    )

    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!brand) return NextResponse.json(
      { sessions: [] }, { status: 200 }
    )

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, query, created_at, results_count')
      .eq('brand_id', brand.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      // Table might not exist yet — return empty
      // instead of crashing
      console.error('chat_sessions error:', error)
      return NextResponse.json({ sessions: [] })
    }

    return NextResponse.json({ 
      sessions: sessions || [] 
    })

  } catch (err: any) {
    console.error('GET chat/sessions error:', err)
    // Never return 500 — return empty array instead
    return NextResponse.json({ sessions: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = 
      await supabase.auth.getUser()
    if (!user) return NextResponse.json(
      { success: false }, { status: 200 }
    )

    const body = await request.json()
    const { query, results_count, filters } = body

    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!brand) return NextResponse.json(
      { success: false }
    )

    // Try to insert — fail silently if table 
    // doesn't exist
    const { error } = await supabase
      .from('chat_sessions')
      .insert({
        brand_id: brand.id,
        query: query || '',
        results_count: results_count || 0,
        filters: filters || {}
      })

    if (error) {
      console.error('Insert chat_session:', error)
      return NextResponse.json({ success: false })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('POST chat/sessions error:', err)
    return NextResponse.json({ success: false })
  }
}
