import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
	// Check admin gate cookie
	const cookieStore = await cookies();
	const adminGate = cookieStore.get("admin_gate")?.value;
	if (adminGate !== "ok") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Use service role client to bypass RLS and fetch ALL submissions
	const supabase = createSupabaseServiceRole();

	if (!supabase) {
		return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
	}

	// Fetch all form_types and aggregate counts
	const { data: rows, error } = await supabase
		.from("form_submissions")
		.select("form_type");

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
	const counts: Record<string, number> = {};
	for (const r of rows || []) {
		counts[r.form_type] = (counts[r.form_type] || 0) + 1;
	}
	return NextResponse.json({ counts });
}


