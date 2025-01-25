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
    address: '',
  });
  const [message, setMessage] = useState('');
  const [eventDate, setEventDate] = useState('');

  useEffect(() => {
    fetchEventDetails();
    fetchAttendees();
    calculateEventDate();
  }, []);

  const calculateEventDate = () => {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilSunday = 7 - dayOfWeek;
      const upcomingSunday = new Date(today);
      upcomingSunday.setDate(today.getDate() + daysUntilSunday);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      setEventDate(upcomingSunday.toLocaleDateString(undefined, options));
    } catch (error) {
      console.error("Error calculating event date:", error);
    }
  };

  const fetchEventDetails = async () => {
    try {
      const response = await fetch('/api/event-details');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.error) {
        setMessage('Event details are not configured yet.');
      } else if (data.max_spots) {
        setEventDetails(data);
        if (data.spots_taken >= data.max_spots) {
          setMessage('The event is full. No more registrations are accepted.');
        } else {
          setMessage(''); // Clear any previous message if there are still spots available
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      setMessage("An error occurred while fetching event details.");
    }
  };

  const fetchAttendees = async () => {
    try {
      const response = await fetch('/api/attendees');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data) {
        setAttendees(data);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
      setMessage("An error occurred while fetching attendees.");
    }
  };

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
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.error || 'An error occurred while submitting the form.');
        return;
      }
      const data = await response.json();

      if (data.success) {
        setName('');
        setEmail('');
        setInstrument('');
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
      {eventDetails.spots_taken < eventDetails.max_spots && (
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
      )}

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
          <p>Address: {eventDetails.address}</p>
          <p><strong>Event Date:</strong> {eventDate}</p>
        </>
      )}
    </div>
  );
}