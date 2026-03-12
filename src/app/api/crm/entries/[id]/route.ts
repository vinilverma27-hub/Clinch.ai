import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        const body = await request.json()
        const allowedFields = ['status', 'notes', 'campaign_name', 'estimated_cost']
        const updateData: Record<string, any> = {}

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field]
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
        }

        const { data: updated, error: updateError } = await supabase
            .from('crm_entries')
            .update(updateData)
            .eq('id', id)
            .eq('brand_id', brand.id)
            .select()
            .single()

        if (updateError) {
            return NextResponse.json(
                { error: `Update failed: ${updateError.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({ entry: updated })

    } catch (error: any) {
        console.error('Error in PUT /api/crm/entries/[id]:', error.message)
        return NextResponse.json(
            { error: error.message || 'Unexpected server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        const { error: deleteError } = await supabase
            .from('crm_entries')
            .delete()
            .eq('id', id)
            .eq('brand_id', brand.id)

        if (deleteError) {
            return NextResponse.json(
                { error: `Delete failed: ${deleteError.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Error in DELETE /api/crm/entries/[id]:', error.message)
        return NextResponse.json(
            { error: error.message || 'Unexpected server error' },
            { status: 500 }
        )
    }
}
