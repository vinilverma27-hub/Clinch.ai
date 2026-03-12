import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } =
            await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' }, { status: 401 }
            )
        }

        // Step 1: Get brand
        const { data: brand, error: brandError } =
            await supabase
                .from('brands')
                .select('id')
                .eq('user_id', user.id)
                .single()

        if (brandError || !brand) {
            console.error('Brand error:', brandError)
            return NextResponse.json({ entries: [] })
        }

        // Step 2: Fetch crm_entries and influencers with single Supabase join query
        const { data, error } = await supabase
            .from('crm_entries')
            .select(`
                id,
                status,
                match_score,
                ai_insight,
                notes,
                score_breakdown,
                campaign_name,
                created_at,
                updated_at,
                influencers (
                    id,
                    handle,
                    full_name,
                    platform,
                    niche,
                    city,
                    followers,
                    engagement_rate,
                    estimated_cost_min,
                    estimated_cost_max,
                    bio,
                    external_id
                )
            `)
            .eq('brand_id', brand.id)
            .order('updated_at', { ascending: false })

        if (error) {
            console.error('CRM entries error:', error)
            return NextResponse.json(
                { error: error.message }, { status: 500 }
            )
        }

        return NextResponse.json({ entries: data || [] })

    } catch (error: any) {
        console.error('GET /api/crm/entries error:', error)
        return NextResponse.json(
            { error: error.message }, { status: 500 }
        )
    }
}
