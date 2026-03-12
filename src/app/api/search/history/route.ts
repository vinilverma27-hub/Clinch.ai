import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — Fetch recent searches for the authenticated user's brand
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get brand_id
        const { data: brand } = await supabase
            .from('brands')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!brand) {
            return NextResponse.json({ searches: [] })
        }

        // Fetch last 8 searches
        const { data: searches, error } = await supabase
            .from('search_history')
            .select('id, query, results_count, created_at, filters')
            .eq('brand_id', brand.id)
            .order('created_at', { ascending: false })
            .limit(8)

        if (error) throw error

        return NextResponse.json({ searches: searches || [] })
    } catch (error: any) {
        console.error('Search history GET error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

// DELETE — Remove a search history entry
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await request.json()
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        }

        // Get brand_id for security check
        const { data: brand } = await supabase
            .from('brands')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
        }

        // Delete only if it belongs to this brand
        const { error } = await supabase
            .from('search_history')
            .delete()
            .eq('id', id)
            .eq('brand_id', brand.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Search history DELETE error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
