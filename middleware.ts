import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // Public routes — always accessible
    const publicRoutes = ['/', '/login', '/signup', '/auth/callback']
    const isPublicRoute = publicRoutes.some(
        route => path.startsWith(route)
    )

    // Not logged in → redirect to login
    if (!user && !isPublicRoute) {
        return NextResponse.redirect(
            new URL('/login', request.url)
        )
    }

    // Logged in + trying to access auth pages → redirect to dashboard
    if (user && (path === '/login' || path === '/signup')) {
        return NextResponse.redirect(
            new URL('/dashboard', request.url)
        )
    }

    // Logged in + accessing dashboard → check if onboarding complete
    if (user && path.startsWith('/dashboard')) {
        const { data: brand } = await supabase
            .from('brands')
            .select('onboarding_complete')
            .eq('user_id', user.id)
            .single()

        if (!brand || !brand.onboarding_complete) {
            return NextResponse.redirect(
                new URL('/onboarding', request.url)
            )
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
