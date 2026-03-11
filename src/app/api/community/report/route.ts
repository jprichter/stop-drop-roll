import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signalRateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await signalRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many signals. Try again later." }, { status: 429 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: "Supabase credentials are not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { gymId, openMatId, reason, note } = await request.json();

    if (!gymId || !openMatId || !reason) {
      return NextResponse.json({ error: "Missing gymId, openMatId, or reason" }, { status: 400 });
    }

    const { error } = await supabase
      .from("community_reports")
      .insert({
        gym_id: gymId,
        open_mat_id: openMatId,
        reason: reason,
        note: note || null,
        // IP hash could be added here for rate limiting/spam protection
      });

    if (error) {
      console.error("Error inserting report:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Report recorded" });
  } catch (error) {
    console.error("Community report API error:", error);
    return NextResponse.json({ error: "Failed to report" }, { status: 500 });
  }
}
