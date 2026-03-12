'use client'
import { useState, useEffect } from 'react'
import { Brand } from '@/lib/supabase/types'

export function useBrand() {
    const [brand, setBrand] = useState<Brand | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchBrand()
    }, [])

    async function fetchBrand() {
        try {
            const res = await fetch('/api/brand/profile')
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setBrand(data.brand)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function updateBrand(updates: Partial<Brand>) {
        try {
            const res = await fetch('/api/brand/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setBrand(data.brand)
            return data.brand
        } catch (err: any) {
            setError(err.message)
            throw err
        }
    }

    return { brand, loading, error, fetchBrand, updateBrand }
}
