import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTemporalQueryBounds, TimeFilter } from "@/lib/temporal-utils";
import { searchRateLimit } from "@/lib/ratelimit";

export async function GET(request: Request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await searchRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const textQuery = searchParams.get("textQuery");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const timeFilter = searchParams.get("timeFilter") || "today";
  const dateParam = searchParams.get("date");
  const customStartTime = searchParams.get("customStartTime");
  const customEndTime = searchParams.get("customEndTime");

  // Advanced Filters
  const distance = parseInt(searchParams.get("distance") || "25");
  const giStyles = searchParams.get("giStyles")?.split(",") || ["gi", "no_gi", "both"];
  const maxFee = searchParams.get("maxFee") ? parseInt(searchParams.get("maxFee")!) * 100 : null;
  const hasShower = searchParams.get("hasShower") === "true";
  const hasLockers = searchParams.get("hasLockers") === "true";
  const hasParking = searchParams.get("hasParking") === "true";

  if (!textQuery && (!lat || !lng)) {
    return NextResponse.json({ error: "Missing textQuery or coordinates" }, { status: 400 });
  }

  const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!googlePlacesApiKey) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY is not configured" }, { status: 500 });
  }

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: "Supabase credentials are not configured" }, { status: 500 });
  }

  // Use service role for cache operations to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // 1. Generate Cache Key
    let queryKey = "";
    if (lat && lng) {
      // Round coordinates to ~1km precision (0.01 degree) to increase cache hits for nearby users
      const roundedLat = Math.round(parseFloat(lat) * 100) / 100;
      const roundedLng = Math.round(parseFloat(lng) * 100) / 100;
      queryKey = `loc:${roundedLat},${roundedLng}:${distance}:${textQuery || ''}`;
    } else {
      queryKey = `text:${textQuery?.toLowerCase()}:${distance}`;
    }

    // 2. Check Cache
    const { data: cacheEntry } = await supabase
      .from("search_cache")
      .select("raw_results, created_at")
      .eq("query_key", queryKey)
      .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hour expiry
      .single();

    let googleResults: any[] = [];

    if (cacheEntry) {
      console.log("Cache hit for:", queryKey);
      googleResults = cacheEntry.raw_results;
    } else {
      console.log("Cache miss for:", queryKey.substring(0, 50));
      // 3. Fetch from Google if miss
      // Removed strict &type=gym to catch "Martial Arts School" and other categories
      let placesApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${googlePlacesApiKey}`;
      
      if (lat && lng) {
        const query = textQuery ? `${textQuery} jiu jitsu gym` : "jiu jitsu gym";
        placesApiUrl += `&query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${distance * 1609}`;
      } else {
        placesApiUrl += `&query=${encodeURIComponent(textQuery + " jiu jitsu gym")}`;
      }

      const response = await fetch(placesApiUrl);
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Google Places API error:", data.status, data.error_message);
        return NextResponse.json({ error: "Failed to fetch from Google" }, { status: 500 });
      }

      googleResults = data.results || [];

      // 4. Update Cache (UPSERT)
      if (googleResults.length > 0) {
        await supabase.from("search_cache").upsert({
          query_key: queryKey,
          raw_results: googleResults,
          created_at: new Date().toISOString()
        }, { onConflict: 'query_key' });
      }
    }

    const placeIds = googleResults.map((place: any) => place.place_id);

    // 5. Normal Data Hydration & Filtering Logic continues...
    let gymsQuery = supabase
      .from("gyms")
      .select("id, google_place_id, owner_verified, last_confirmed_at")
      .in("google_place_id", placeIds);

    if (hasShower) gymsQuery = gymsQuery.eq("has_shower", true);
    if (hasLockers) gymsQuery = gymsQuery.neq("locker_type", "none");
    if (hasParking) gymsQuery = gymsQuery.neq("parking_type", "none");
    if (maxFee !== null) gymsQuery = gymsQuery.lte("drop_in_fee_cents", maxFee);

    const { data: localGymsData, error: supabaseGymsError } = await gymsQuery;

    if (supabaseGymsError) {
      console.error("Supabase gyms error:", supabaseGymsError);
    }

    const gymIds = localGymsData?.map(g => g.id) || [];
    const { data: reportData } = await supabase
      .from("community_reports")
      .select("gym_id")
      .in("gym_id", gymIds);
    
    const reportCounts = new Map<string, number>();
    reportData?.forEach(r => {
      reportCounts.set(r.gym_id, (reportCounts.get(r.gym_id) || 0) + 1);
    });

    const localGymsMap = new Map(
      localGymsData?.map((gym) => [gym.google_place_id, gym])
    );

    const augmentedPlaces = await Promise.all(
      googleResults.map(async (place: any) => {
        const gymData = localGymsMap.get(place.place_id);
        const hasLocalData = !!gymData;
        let openMats: any[] = [];

        if (hasLocalData && gymData) {
          if (timeFilter === "anytime") {
            // "Anytime": Fetch all active open mats for this gym matching gi style
            const { data: fetchedOpenMats, error: openMatsError } = await supabase
              .from("open_mats")
              .select("*")
              .eq("gym_id", gymData.id)
              .eq("active", true)
              .in("style", giStyles);
            
            if (!openMatsError) openMats = fetchedOpenMats || [];
          } else {
            const targetDate = dateParam ? new Date(dateParam + "T12:00:00") : new Date();
            const { targetDayOfWeek, startTimeBound, endTimeBound } = getTemporalQueryBounds({
              timeFilter: timeFilter as TimeFilter,
              customStartTime,
              customEndTime,
              currentDate: targetDate
            });

            let openMatsQuery = supabase.from("open_mats")
              .select("*")
              .eq("gym_id", gymData.id)
              .eq("active", true)
              .in("style", giStyles);

            if (targetDayOfWeek !== null) {
              openMatsQuery = openMatsQuery.eq("day_of_week", targetDayOfWeek);
            }

            if (startTimeBound && endTimeBound) {
              openMatsQuery = openMatsQuery
                .lte("start_time", endTimeBound)
                .gte("end_time", startTimeBound);
            }

            const { data: fetchedOpenMats, error: openMatsError } = await openMatsQuery;
            if (!openMatsError) openMats = fetchedOpenMats || [];
          }
        }

        return {
          place_id: place.place_id,
          name: place.name,
          geometry: {
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            },
          },
          has_local_data: hasLocalData,
          owner_verified: gymData?.owner_verified || false,
          last_confirmed_at: gymData?.last_confirmed_at || null,
          report_count: gymData ? (reportCounts.get(gymData.id) || 0) : 0,
          open_mats: openMats,
        };
      })
    );

    const { data: allLocalGyms } = await supabase.from("gyms").select("google_place_id").in("google_place_id", placeIds);
    const allLocalPlaceIds = new Set(allLocalGyms?.map(g => g.google_place_id));

    const finalPlaces = augmentedPlaces.filter(place => {
      const isInDB = allLocalPlaceIds.has(place.place_id);
      const matchesFacilityFilters = localGymsMap.has(place.place_id);
      
      if (isInDB) {
        if (timeFilter === "anytime") {
          // Default view: show all matching facilities regardless of schedule
          return matchesFacilityFilters;
        } else {
          // Filtered view: only show gyms that match facilities AND have open mats at that time
          return matchesFacilityFilters && place.open_mats.length > 0;
        }
      }
      
      // If it's NOT in our DB, we always show the raw Google result to allow discovery
      return true;
    });

    return NextResponse.json(finalPlaces);
  } catch (error) {
    console.error("Error in search-places API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
