import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch event details including the new address field
    const { data: eventDetails, error: fetchError } = await supabase
      .from("event_details")
      .select("max_spots, spots_taken, address")
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(eventDetails);
  } catch (error) {
    console.error("Error fetching event details:", error.message);
    return NextResponse.json({ error: "Event details not found." }, { status: 500 });
  }
}