import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables
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

        // Fetch all attendees from the 'attendees' table to check for the instrument
        const { data: attendees, error: fetchError } = await supabase
            .from("attendees")
            .select("instrument");

        if (fetchError) {
            console.error("Error fetching attendees:", fetchError);
            return NextResponse.json(
                { error: "Error fetching attendees." },
                { status: 500 }
            );
        }

        // Check if a pianist is already registered
        const pianoUser = attendees.some(
            (attendee) => attendee.instrument.toLowerCase() === "piano"
        );

        // If a pianist is already registered and the new registration is for piano, reject it
        if (pianoUser && instrument.toLowerCase() === "piano") {
            return NextResponse.json(
                { error: "The piano slot is already taken." },
                { status: 400 }
            );
        }

        // Insert the new attendee into the attendees table
        const { data: attendeeData, error: insertError } = await supabase
            .from("attendees")
            .insert([{ name, email, instrument }]);

        if (insertError) {
            console.error("Error inserting attendee:", insertError);
            return NextResponse.json(
                { error: "Error registering the attendee." },
                { status: 500 }
            );
        }

        // Fetch the current event details to update spots_taken
        const { data: eventDetails, error: fetchEventError } = await supabase
            .from("event_details")
            .select("*")
            .single();

        if (fetchEventError) {
            console.error("Error fetching event details:", fetchEventError);
            return NextResponse.json(
                { error: "Error fetching event details." },
                { status: 500 }
            );
        }

        // Update the number of spots_taken
        const updatedSpotsTaken = eventDetails.spots_taken + 1;

        // Check if spots have reached the maximum limit
        if (updatedSpotsTaken > eventDetails.max_spots) {
            return NextResponse.json(
                { error: "The event is full." },
                { status: 400 }
            );
        }

        // Update the event details with the new spots_taken count
        const { error: updateEventError } = await supabase
            .from("event_details")
            .update({ spots_taken: updatedSpotsTaken })
            .eq("id", eventDetails.id);

        if (updateEventError) {
            console.error("Error updating event details:", updateEventError);
            return NextResponse.json(
                { error: "Error updating event details." },
                { status: 500 }
            );
        }

        // Return the response with the new attendee data and updated event details
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
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}


