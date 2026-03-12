import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get brand
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (brandError || !brand) {
            return NextResponse.json({ conversations: [] })
        }

        // Get conversations with relations
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select(`
        *,
        influencer:influencer_id(*),
        crm_entry:crm_entry_id(*),
        messages(*)
      `)
            .eq('brand_id', brand.id)
            .order('last_message_at', { ascending: false })

        if (convError) {
            throw convError
        }

        return NextResponse.json({ conversations })

    } catch (error: any) {
        console.error('GET /api/mailbox/conversations error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { influencer_id, crm_entry_id } = body

        if (!influencer_id) {
            return NextResponse.json({ error: 'influencer_id is required' }, { status: 400 })
        }

        // Get brand
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (brandError || !brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
        }

        // Create or get conversation
        const { data: existing, error: existingError } = await supabase
            .from('conversations')
            .select('*')
            .eq('brand_id', brand.id)
            .eq('influencer_id', influencer_id)
            .single()

        if (existing) {
             return NextResponse.json({ conversation: existing })
        }

        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
                brand_id: brand.id,
                influencer_id,
                crm_entry_id: crm_entry_id || null
            })
            .select()
            .single()

        if (createError) {
            throw createError
        }

        return NextResponse.json({ conversation: newConversation })

    } catch (error: any) {
        console.error('POST /api/mailbox/conversations error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
