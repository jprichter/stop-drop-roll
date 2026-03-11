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
    const { gymId, openMatId } = await request.json();

    if (!gymId || !openMatId) {
      return NextResponse.json({ error: "Missing gymId or openMatId" }, { status: 400 });
    }

    const { error } = await supabase
      .from("community_confirmations")
      .insert({
        gym_id: gymId,
        open_mat_id: openMatId,
        // IP hash could be added here for rate limiting/spam protection in a real app
      });

    if (error) {
      console.error("Error inserting confirmation:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Update last_confirmed_at on the gym table as well
    await supabase
      .from("gyms")
      .update({ last_confirmed_at: new Date().toISOString() })
      .eq("id", gymId);

    return NextResponse.json({ message: "Confirmation recorded" });
  } catch (error) {
    console.error("Community confirm API error:", error);
    return NextResponse.json({ error: "Failed to confirm" }, { status: 500 });
  }
}
