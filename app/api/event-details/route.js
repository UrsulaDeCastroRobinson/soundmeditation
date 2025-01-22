import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase project details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data: eventDetails, error: fetchError } = await supabase
      .from("event_details")
      .select("*")
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(eventDetails);
  } catch (error) {
    console.error("Error:", error.message);
    return NextResponse.json({ error: "Event details not found." }, { status: 500 });
  }
}
