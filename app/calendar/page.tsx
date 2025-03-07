"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from '../components/ProtectedRoute';

type Event = {
  id: number;
  subject: string;
  start: { dateTime: string };
  end: { dateTime: string };
};

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetch("/api/calendar/outlook")
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  console.log(events);

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8 bg-gray-50 text-black">
        <h1 className="text-3xl font-bold mb-8 text-center text-black">Calendar Information</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          {events.length > 0 ? (
            <ul className="space-y-4">
              {events.map(event => (
                <li key={event.id} className="p-4 bg-gray-100 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-black">{event.subject}</h2>
                  <p className="text-gray-600">{event.start.dateTime}</p>
                  <p className="text-gray-600">{event.end.dateTime}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-gray-700">No calendar events available. Please check back later.</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CalendarPage;
