'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [instrument, setInstrument] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [eventDetails, setEventDetails] = useState({
    max_spots: 0,
    spots_taken: 0,
  });
  const [message, setMessage] = useState('');

  // Fetch event details and attendees when the page loads
  useEffect(() => {
    fetchEventDetails();
    fetchAttendees();
  }, []);

  // Fetch event details from the API
  const fetchEventDetails = async () => {
    try {
      const response = await fetch('/api/event-details');
      const data = await response.json();

      if (data.error) {
        setMessage('Event details are not configured yet.');
      } else if (data.max_spots) {
        setEventDetails(data);
        if (data.spots_taken >= data.max_spots) {
          setMessage('The event is full. No more registrations are accepted.');
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  // Fetch attendees from the API
  const fetchAttendees = async () => {
    try {
      const response = await fetch('/api/attendees');
      const data = await response.json();
      if (data) {
        setAttendees(data);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (eventDetails.spots_taken >= eventDetails.max_spots) {
      setMessage('The event is full. No more registrations are accepted.');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, instrument }),
      });
      const data = await response.json();

      if (data.success) {
        // Clear the form fields after successful registration
        setName('');
        setEmail('');
        setInstrument('');

        // Update the list of attendees and event details
        setAttendees([...attendees, { name, instrument }]);
        setEventDetails(data.updatedEventDetails);
        setMessage('Registration successful!');
      } else {
        setMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('An error occurred while submitting the form.');
    }
  };

  return (
    <div>
      <h1>Chamber Music Event Registration</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Instrument"
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
          required
        />
        <button type="submit" disabled={eventDetails.spots_taken >= eventDetails.max_spots}>
          Register
        </button>
      </form>

      <h2>Current Attendees:</h2>
      {attendees.length === 0 ? (
        <p>No attendees have registered yet.</p>
      ) : (
        <ul>
          {attendees.map((attendee, index) => (
            <li key={index}>
              {attendee.name} - {attendee.instrument}
            </li>
          ))}
        </ul>
      )}

      <h3>Event Details:</h3>
      {eventDetails.max_spots === 0 ? (
        <p>No event details available. Please configure your event.</p>
      ) : (
        <>
          <p>Max spots: {eventDetails.max_spots}</p>
          <p>Spots taken: {eventDetails.spots_taken}</p>
        </>
      )}
    </div>
  );
}


