import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } =
            await supabase.auth.getUser()

        console.log('1. Auth check:', {
            userId: user?.id,
            authError: authError?.message
        })

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' }, { status: 401 }
            )
        }

        const body = await request.json()
        const { influencer, match_score, ai_insight } = body

        console.log('2. Request body received:', {
            hasInfluencer: !!influencer,
            handle: influencer?.handle,
            external_id: influencer?.external_id,
            platform: influencer?.platform
        })

        // Get brand
        const { data: brand, error: brandError } =
            await supabase
                .from('brands')
                .select('id')
                .eq('user_id', user.id)
                .single()

        console.log('3. Brand lookup:', {
            brandId: brand?.id,
            brandError: brandError?.message,
            brandCode: brandError?.code
        })

        if (brandError || !brand) {
            return NextResponse.json(
                { error: 'Brand not found: ' + brandError?.message },
                { status: 404 }
            )
        }

        // Upsert influencer
        const influencerData = {
            external_id: influencer.external_id ||
                `manual_${influencer.handle}_${influencer.platform}`,
            platform: influencer.platform || 'instagram',
            handle: influencer.handle || '',
            full_name: influencer.full_name || influencer.handle || '',
            bio: influencer.bio || null,
            city: influencer.city || null,
            country: influencer.country || 'India',
            language: Array.isArray(influencer.language)
                ? influencer.language : [],
            followers: Number(influencer.followers) || 0,
            avg_views: Number(influencer.avg_views) || 0,
            avg_likes: Number(influencer.avg_likes) || 0,
            avg_comments: Number(influencer.avg_comments) || 0,
            engagement_rate: Number(influencer.engagement_rate) || 0,
            estimated_cost_min: Number(influencer.estimated_cost_min) || 0,
            estimated_cost_max: Number(influencer.estimated_cost_max) || 0,
            is_verified: Boolean(influencer.is_verified) || false,
        }

        console.log('4. About to upsert influencer:', {
            external_id: influencerData.external_id,
            platform: influencerData.platform,
            handle: influencerData.handle
        })

        const { data: savedInfluencer, error: infError } =
            await supabase
                .from('influencers')
                .upsert(influencerData, {
                    onConflict: 'external_id,platform'
                })
                .select('id')
                .single()

        console.log('5. Influencer upsert result:', {
            savedId: savedInfluencer?.id,
            infError: infError?.message,
            infCode: infError?.code,
            infDetails: infError?.details
        })

        if (infError) {
            return NextResponse.json(
                { error: `Influencer save failed: ${infError.message}` },
                { status: 500 }
            )
        }

        // Build cost string
        const minCost = Number(influencer.estimated_cost_min) || 0
        const maxCost = Number(influencer.estimated_cost_max) || 0
        const costString = minCost && maxCost
            ? `₹${Math.round(minCost / 1000)}k–₹${Math.round(maxCost / 1000)}k`
            : 'Not specified'

        console.log('6. Checking for existing CRM entry:', {
            brand_id: brand.id,
            influencer_id: savedInfluencer.id
        })

        // Step 2: Check for duplicate CRM entry
        const { data: existing } = await supabase
            .from('crm_entries')
            .select('id')
            .eq('brand_id', brand.id)
            .eq('influencer_id', savedInfluencer.id)
            .single()

        if (existing) {
            console.log('CRM entry already exists:', existing.id)
            return NextResponse.json({ 
                success: false, 
                error: 'Already in CRM',
                already_exists: true
            })
        }

        console.log('7. About to insert new CRM entry:', {
            brand_id: brand.id,
            influencer_id: savedInfluencer.id,
            match_score,
            costString
        })

        // Step 3: Insert CRM entry
        const { data: crmEntry, error: crmError } =
            await supabase
                .from('crm_entries')
                .insert({
                    brand_id: brand.id,
                    influencer_id: savedInfluencer.id,
                    match_score: Number(match_score) || 0,
                    ai_insight: ai_insight || '',
                    estimated_cost: costString,
                    status: 'not_contacted',
                    campaign_name: 'Default Campaign',
                })
                .select()
                .single()

        console.log('8. CRM entry result:', {
            crmId: crmEntry?.id,
            crmError: crmError?.message,
            crmCode: crmError?.code,
            crmDetails: crmError?.details
        })

        if (crmError) {
            return NextResponse.json(
                { error: `CRM save failed: ${crmError.message}` },
                { status: 500 }
            )
        }

        console.log('9. ✅ Success! CRM entry created:', crmEntry.id)

        return NextResponse.json({
            success: true,
            message: `${influencer.full_name || influencer.handle} added to CRM!`,
            crm_entry: crmEntry
        })

    } catch (error: any) {
        console.error('💥 Unexpected error in /api/crm/add:', {
            message: error.message,
            stack: error.stack
        })
        return NextResponse.json(
            { error: error.message || 'Unexpected server error' },
            { status: 500 }
        )
    }
}
