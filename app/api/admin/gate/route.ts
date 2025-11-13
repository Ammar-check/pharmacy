import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { username, password } = await req.json().catch(() => ({}));
    if (username === "admin" && password === "admin123") {
        const res = NextResponse.json({ ok: true });
        res.cookies.set("admin_gate", "ok", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
        return res;
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}



