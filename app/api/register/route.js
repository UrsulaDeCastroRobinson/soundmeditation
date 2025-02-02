import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name, and email are required." },
        { status: 400 }
      );
    }

    const { data: attendees, error: fetchError } = await supabase
      .from("attendees")
      .select("name, email");

    if (fetchError) {
      console.error("Error fetching attendees:", fetchError);
      return NextResponse.json({ error: "Error fetching attendees." }, { status: 500 });
      }

    const { data: attendeeData, error: insertError } = await supabase
      .from("attendees")
      .insert([{ name, email }]);

    if (insertError) {
      console.error("Error inserting attendee:", insertError);
      return NextResponse.json({ error: "Error registering the attendee." }, { status: 500 });
    }

    const { data: eventDetails, error: fetchEventError } = await supabase
      .from("event_details")
      .select("*")
      .single();

    if (fetchEventError) {
      console.error("Error fetching event details:", fetchEventError);
      return NextResponse.json({ error: "Error fetching event details." }, { status: 500 });
    }

    const updatedSpotsTaken = eventDetails.spots_taken + 1;

    if (updatedSpotsTaken > eventDetails.max_spots) {
      return NextResponse.json(
        { error: "The event is full." },
        { status: 400 }
      );
    }

    const { error: updateEventError } = await supabase
      .from("event_details")
      .update({ spots_taken: updatedSpotsTaken })
      .eq("id", eventDetails.id);

    if (updateEventError) {
      console.error("Error updating event details:", updateEventError);
      return NextResponse.json({ error: "Error updating event details." }, { status: 500 });
    }

   

    return NextResponse.json(
      {
        message: "Registration successful!",
        success: true,
        attendeeData,
        updatedEventDetails: {
          max_spots: eventDetails.max_spots,
          spots_taken: updatedSpotsTaken,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Function to calculate the event date
const calculateEventDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = 7 - dayOfWeek;
  const upcomingSaturday = new Date(today);
  upcomingSaturday.setDate(today.getDate() + daysUntilSaturday);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return upcomingSaturday.toLocaleDateString(undefined, options);
};

