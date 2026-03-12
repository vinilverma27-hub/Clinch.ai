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
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
        }

        // Replace with Supabase count queries for performance
        const [total, emailSent, replied, negotiating, dealClosed, rejected] = await Promise.all([
            supabase.from('crm_entries')
                .select('*', { count: 'exact', head: true })
                .eq('brand_id', brand.id),

            supabase.from('crm_entries')
                .select('*', { count: 'exact', head: true })
                .eq('brand_id', brand.id)
                .eq('status', 'email_sent'),

            supabase.from('crm_entries')
                .select('*', { count: 'exact', head: true })
                .eq('brand_id', brand.id)
                .eq('status', 'replied'),

            supabase.from('crm_entries')
                .select('*', { count: 'exact', head: true })
                .eq('brand_id', brand.id)
                .eq('status', 'negotiating'),

            supabase.from('crm_entries')
                .select('*', { count: 'exact', head: true })
                .eq('brand_id', brand.id)
                .eq('status', 'deal_closed'),

            supabase.from('crm_entries')
                .select('*', { count: 'exact', head: true })
                .eq('brand_id', brand.id)
                .eq('status', 'rejected')
        ])

        const stats = {
            total: total.count || 0,
            email_sent: emailSent.count || 0,
            replied: replied.count || 0,
            negotiating: negotiating.count || 0,
            deal_closed: dealClosed.count || 0,
            rejected: rejected.count || 0,
            not_contacted: (total.count || 0) - ((emailSent.count || 0) + (replied.count || 0) + (negotiating.count || 0) + (dealClosed.count || 0) + (rejected.count || 0))
        }

        return NextResponse.json(stats)

    } catch (error: any) {
        console.error('Error in GET /api/crm/stats:', error.message)
        return NextResponse.json(
            { error: error.message || 'Unexpected server error' },
            { status: 500 }
        )
    }
}
