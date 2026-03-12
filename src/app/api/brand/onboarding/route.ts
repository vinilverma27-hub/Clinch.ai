import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } =
            await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            name,
            description,
            logo_url,
            industry,
            niche,
            target_age,
            target_gender,
            target_location,
            platforms,
            monthly_budget,
            campaign_goals,
            campaign_brief_url,
        } = body

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: 'Brand name is required' },
                { status: 400 }
            )
        }

        // Check if brand already exists for this user
        const { data: existingBrand } = await supabase
            .from('brands')
            .select('id')
            .eq('user_id', user.id)
            .single()

        let brand;

        if (existingBrand) {
            // Update existing brand
            const { data, error } = await supabase
                .from('brands')
                .update({
                    name,
                    description,
                    logo_url,
                    industry,
                    niche,
                    target_age,
                    target_gender,
                    target_location,
                    platforms: platforms || [],
                    monthly_budget,
                    campaign_goals: campaign_goals || [],
                    campaign_brief_url,
                    onboarding_complete: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
                .select()
                .single()

            if (error) throw error
            brand = data
        } else {
            // Create new brand
            const { data, error } = await supabase
                .from('brands')
                .insert({
                    user_id: user.id,
                    name,
                    description,
                    logo_url,
                    industry,
                    niche,
                    target_age,
                    target_gender,
                    target_location,
                    platforms: platforms || [],
                    monthly_budget,
                    campaign_goals: campaign_goals || [],
                    campaign_brief_url,
                    onboarding_complete: true,
                })
                .select()
                .single()

            if (error) throw error
            brand = data
        }

        return NextResponse.json({
            success: true,
            brand
        })

    } catch (error: any) {
        console.error('Onboarding error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to save brand' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } =
            await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { data: brand, error } = await supabase
            .from('brands')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        return NextResponse.json({ brand: brand || null })

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
