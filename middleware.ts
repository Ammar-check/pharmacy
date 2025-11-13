import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request: req,
	});

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ndtmojatnuxjmogkazrd.supabase.co";
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdG1vamF0bnV4am1vZ2thenJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mjk0ODUsImV4cCI6MjA3ODAwNTQ4NX0.aG2KuI8jJ81Tu-S1xD7n0d0BBLg92EBAgdoMdFbtZ80";

	const supabase = createServerClient(url, key, {
		cookies: {
			getAll() {
				return req.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
				supabaseResponse = NextResponse.next({
					request: req,
				});
				cookiesToSet.forEach(({ name, value, options }) =>
					supabaseResponse.cookies.set(name, value, options)
				);
			},
		},
	});

	// Refresh session if expired - required for Server Components
	await supabase.auth.getSession();

	return supabaseResponse;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - images, icons, etc.
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
	],
};


