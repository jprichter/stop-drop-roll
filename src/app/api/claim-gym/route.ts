import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mutationRateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await mutationRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again tomorrow." }, { status: 429 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: "Supabase credentials are not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { googlePlaceId, gymName, method, externalIdentifier } = await request.json();

    if (!googlePlaceId || !gymName || !method || !externalIdentifier) {
      return NextResponse.json({ error: "Missing required claim data" }, { status: 400 });
    }

    // 1. Ensure the gym exists in our 'gyms' table
    let { data: gym, error: gymError } = await supabase
      .from("gyms")
      .select("id")
      .eq("google_place_id", googlePlaceId)
      .single();

    if (gymError && gymError.code === 'PGRST116') {
      // Gym doesn't exist in our DB yet, create a minimal entry
      const { data: newGym, error: insertError } = await supabase
        .from("gyms")
        .insert({ google_place_id: googlePlaceId })
        .select("id")
        .single();
      
      if (insertError) throw insertError;
      gym = newGym;
    } else if (gymError) {
      throw gymError;
    }

    if (!gym) throw new Error("Could not identify gym");

    // 2. Insert the claim request
    const { error: claimError } = await supabase
      .from("owner_claims")
      .insert({
        gym_id: gym.id,
        method: method,
        external_identifier: externalIdentifier,
        verified: false
      });

    if (claimError) {
      console.error("Error inserting claim:", claimError);
      return NextResponse.json({ error: "Database error recording claim" }, { status: 500 });
    }

    // 3. Send Notification (Optional/Best Effort)
    const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🔔 **New Gym Claim Received!**\n**Gym:** ${gymName}\n**Method:** ${method}\n**ID:** ${externalIdentifier}\n**Place ID:** ${googlePlaceId}`,
          }),
        });
      } catch (err) {
        console.error("Failed to send notification:", err);
        // We don't fail the request if the notification fails
      }
    }

    return NextResponse.json({ message: "Claim submitted successfully" });
  } catch (error: any) {
    console.error("Claim API error:", error);
    return NextResponse.json({ error: error.message || "Failed to process claim" }, { status: 500 });
  }
}
