import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sendEmail from '../../../sendEmail'; // Import sendEmail module

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, instrument } = body;

    if (!name || !email || !instrument) {
      return NextResponse.json(
        { error: "Name, email, and instrument are required." },
        { status: 400 }
      );
    }

    const { data: attendees, error: fetchError } = await supabase
      .from("attendees")
      .select("name, email, instrument");

    if (fetchError) {
      console.error("Error fetching attendees:", fetchError);
      return NextResponse.json({ error: "Error fetching attendees." }, { status: 500 });
    }

    const pianoUser = attendees.some(
      (attendee) => attendee.instrument.toLowerCase() === "piano"
    );

    if (pianoUser && instrument.toLowerCase() === "piano") {
      return NextResponse.json(
        { error: "The piano slot is already taken." },
        { status: 400 }
      );
    }

    const { data: attendeeData, error: insertError } = await supabase
      .from("attendees")
      .insert([{ name, email, instrument }]);

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

    // Send email to all attendees if the event is full
    if (updatedSpotsTaken === eventDetails.max_spots) {
      const eventDate = calculateEventDate(); // Function to calculate the event date
      sendEmail(attendees, eventDetails, eventDate);
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
  const daysUntilSunday = 7 - dayOfWeek;
  const upcomingSunday = new Date(today);
  upcomingSunday.setDate(today.getDate() + daysUntilSunday);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return upcomingSunday.toLocaleDateString(undefined, options);
};

