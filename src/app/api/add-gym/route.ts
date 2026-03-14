import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mutationRateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  // 1. Rate limiting
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
    const body = await request.json();
    const { selectedPlace, gymDetails, openMatSchedules } = body;

    // 2. Strict Input Validation
    if (!selectedPlace?.place_id || !selectedPlace?.name) {
      return NextResponse.json({ error: "Invalid Google Place data" }, { status: 400 });
    }

    if (!Array.isArray(openMatSchedules) || openMatSchedules.length === 0) {
      return NextResponse.json({ error: "At least one open mat schedule is required" }, { status: 400 });
    }

    // Sanitize gym details
    const sanitizedGym = {
      google_place_id: String(selectedPlace.place_id),
      drop_in_fee_cents: typeof gymDetails?.dropInFeeCents === 'number' ? gymDetails.dropInFeeCents : null,
      cash_only: Array.isArray(gymDetails?.paymentMethods) ? gymDetails.paymentMethods.includes('Cash') : false,
      payment_methods: Array.isArray(gymDetails?.paymentMethods) ? gymDetails.paymentMethods : [],
      waiver_type: ['none', 'online', 'in_person'].includes(gymDetails?.waiverType) ? gymDetails.waiverType : 'none',
      has_shower: Boolean(gymDetails?.hasShower),
      locker_type: ['none', 'free', 'bring_lock'].includes(gymDetails?.lockerType) ? gymDetails.lockerType : 'none',
      parking_type: ['none', 'street', 'lot', 'garage'].includes(gymDetails?.parkingType) ? gymDetails.parkingType : 'none',
      advance_notice_required: Boolean(gymDetails?.advanceNoticeRequired),
      typical_attendance: ['<10', '10-50', '50+'].includes(gymDetails?.typicalAttendance) ? gymDetails.typicalAttendance : '<10',
      preferred_contact: ['instagram', 'sms'].includes(gymDetails?.preferredContact) ? gymDetails.preferredContact : 'instagram',
      last_confirmed_at: new Date().toISOString(),
    };

    // 3. Database Operations
    // Check for existing gym
    const { data: existingGym } = await supabase
      .from("gyms")
      .select("id")
      .eq("google_place_id", sanitizedGym.google_place_id)
      .single();

    let gymId;
    if (existingGym) {
      gymId = existingGym.id;
      // Update existing gym with new metadata
      await supabase.from("gyms").update(sanitizedGym).eq("id", gymId);
    } else {
      const { data: newGym, error: insertError } = await supabase
        .from("gyms")
        .insert(sanitizedGym)
        .select("id")
        .single();
      
      if (insertError) throw insertError;
      gymId = newGym.id;
    }

    // 4. Validate and Insert Open Mats
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM format
    
    const sanitizedSchedules = openMatSchedules.map((om: any) => {
      if (!timeRegex.test(om.start_time) || !timeRegex.test(om.end_time)) {
        throw new Error("Invalid time format in schedule");
      }
      return {
        gym_id: gymId,
        day_of_week: Number(om.day_of_week) % 7,
        start_time: om.start_time,
        end_time: om.end_time,
        is_recurring: Boolean(om.is_recurring),
        one_off_date: om.one_off_date || null,
        style: ['gi', 'no_gi', 'both'].includes(om.style) ? om.style : 'both',
        active: true,
      };
    });

    const { error: scheduleError } = await supabase.from("open_mats").insert(sanitizedSchedules);
    if (scheduleError) throw scheduleError;

    return NextResponse.json({ message: "Gym and schedules added successfully!" });
  } catch (error: any) {
    console.error("Error in add-gym API:", error);
    return NextResponse.json({ error: error.message || "Failed to add gym" }, { status: 500 });
  }
}
