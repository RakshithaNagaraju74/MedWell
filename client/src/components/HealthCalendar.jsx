import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default styles for react-calendar
import { FaPlusCircle, FaTimesCircle, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa'; // Icons
import clsx from 'clsx'; // For conditional classes
import { v4 as uuidv4 } from 'uuid'; // For generating temporary IDs

const API_BASE_URL = 'http://localhost:5000'; // Assuming this is consistent

export default function HealthCalendar({ userId }) { // userId will be passed from Dashboard
  const [date, setDate] = useState(new Date()); // Current date displayed on calendar
  const [allEvents, setAllEvents] = useState([]); // All events fetched for the current view
  const [selectedDateEvents, setSelectedDateEvents] = useState([]); // Events for selected date
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', eventDate: date, eventTime: '' });
  const [loading, setLoading] = useState(false); // For API calls (fetch/add)
  const [error, setError] = useState(null);

  // Mock data for demonstration - in a real app, this would come from backend
  const mockEvents = [
    { id: 'mock-1', title: 'Doctor Appointment', description: 'Annual check-up', eventDate: new Date(2025, 4, 29, 10, 0).toISOString(), eventTime: '10:00' },
    { id: 'mock-2', title: 'Dentist Visit', description: 'Routine cleaning', eventDate: new Date(2025, 4, 29, 14, 30).toISOString(), eventTime: '14:30' },
    { id: 'mock-3', title: 'Yoga Class', description: 'Evening flexibility session', eventDate: new Date(2025, 4, 30, 18, 0).toISOString(), eventTime: '18:00' },
    { id: 'mock-4', title: 'Blood Test', description: 'Fasting blood work', eventDate: new Date(2025, 5, 5, 8, 0).toISOString(), eventTime: '08:00' }, // Next month
    { id: 'mock-5', title: 'Dietitian Session', description: 'Review meal plan', eventDate: new Date(2025, 5, 15, 11, 0).toISOString(), eventTime: '11:00' }, // Next month
  ];

  // Effect to fetch events for the current month when component mounts or date changes month
  useEffect(() => {
    const fetchEventsForMonth = async () => {
      // In a real app, fetch events for the current month/year of `date`
      // For now, use mockEvents and filter them client-side for the current month.
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();
        const filteredMockEvents = mockEvents.filter(event => {
          const eventDate = new Date(event.eventDate);
          return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        });
        setAllEvents(filteredMockEvents);
        setSelectedDateEvents(filteredMockEvents.filter(event => new Date(event.eventDate).toDateString() === date.toDateString()));

      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventsForMonth();
  }, [date]); // Re-run when `date` changes (specifically month/year for fetching allEvents)

  // Effect to filter `selectedDateEvents` whenever `allEvents` or `date` changes
  useEffect(() => {
    setSelectedDateEvents(allEvents.filter(event => new Date(event.eventDate).toDateString() === date.toDateString()));
  }, [date, allEvents]);


  // Helper to format date for input fields (YYYY-MM-DD)
  const formatEventDateForInput = (dateObj) => {
    if (!dateObj) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.eventDate) {
      setError("Title and Date are required!");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // In a real app, send newEvent to backend
      console.log("Adding new event:", newEvent);
      // Construct event object to send to backend, converting date to ISO string
      const eventToSend = {
        userId, // Pass userId from props
        title: newEvent.title,
        description: newEvent.description,
        eventDate: new Date(newEvent.eventDate).toISOString(), // Ensure it's an ISO string
        eventTime: newEvent.eventTime,
      };

      // Simulate API call for adding
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      const tempId = uuidv4(); // Generate a temporary ID for optimistic update
      const addedEvent = { ...eventToSend, id: tempId, eventDate: new Date(eventToSend.eventDate) }; // Convert back to Date object for local state

      // Optimistically update the UI
      setAllEvents(prev => [...prev, addedEvent].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)));
      setNewEvent({ title: '', description: '', eventDate: date, eventTime: '' }); // Reset form
      setShowAddModal(false); // Close modal

      // In a real application, you'd then make the actual fetch POST request here:
      /*
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventToSend),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add event');
      }
      const confirmedEvent = await res.json();
      // Replace temporary event with confirmed event from backend, or refetch
      // For simplicity, refetch all events for the month after successful add
      // fetchEventsForMonth(); // Re-fetch to ensure data is in sync
      */

    } catch (err) {
      console.error("Error adding event:", err);
      setError(err.message || "Could not add event.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle clicking on a calendar tile
  const handleDateChange = (newDate) => {
    setDate(newDate);
    // Filtering `selectedDateEvents` is now handled by the `useEffect` above,
    // which reacts to changes in `date` and `allEvents`.
  };

  // Tile content to mark dates with events (dots)
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasEvent = allEvents.some(event => new Date(event.eventDate).toDateString() === date.toDateString());
      return hasEvent ? <div className="event-dot"></div> : null;
    }
    return null;
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl min-h-[calc(100vh-120px)] flex flex-col">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">Health Calendar</h2>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Calendar Section */}
        <div className="flex-1 max-w-full md:max-w-[50%] lg:max-w-[40%] mx-auto">
          <Calendar
            onChange={handleDateChange}
            value={date}
            className="react-calendar-custom" // Custom class for styling
            tileContent={tileContent}
            onActiveStartDateChange={({ activeStartDate, view }) => {
                // If the month/year changes in the calendar view, re-fetch events for that new month.
                if (view === 'month') {
                    // Only fetch if the month/year is different from the currently loaded `allEvents` month/year
                    if (allEvents.length === 0 ||
                        activeStartDate.getMonth() !== new Date(allEvents[0]?.eventDate).getMonth() ||
                        activeStartDate.getFullYear() !== new Date(allEvents[0]?.eventDate).getFullYear()) {
                        setDate(activeStartDate); // Update date to new active start date (e.g. first day of new month)
                    }
                }
            }}
          />
          <button
            onClick={() => {
              setShowAddModal(true);
              setNewEvent(prev => ({ ...prev, eventDate: date })); // Pre-fill with selected date
            }}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center font-bold text-lg shadow-lg"
          >
            <FaPlusCircle className="mr-2" /> Add New Appointment
          </button>
        </div>

        {/* Selected Date Events Section */}
        <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-8 md:pt-0 md:pl-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Appointments for {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : selectedDateEvents.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {selectedDateEvents.map(event => (
                <div key={event.id} className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-blue-200 dark:border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">{event.title}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{event.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {event.eventTime ? `Time: ${event.eventTime} - ` : ''}
                        Date: {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {/* Placeholder for Edit/Delete functionality */}
                      <button className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900"><FaEdit /></button>
                      <button className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"><FaTrash /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No appointments for this date.</p>
          )}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-md relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <FaTimesCircle size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Add New Appointment</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                <textarea
                  id="description"
                  rows="3"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                ></textarea>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                  <input
                    type="date"
                    id="eventDate"
                    value={formatEventDateForInput(newEvent.eventDate)}
                    onChange={(e) => setNewEvent({ ...newEvent, eventDate: new Date(e.target.value) })}
                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time (Optional)</label>
                  <input
                    type="time"
                    id="eventTime"
                    value={newEvent.eventTime}
                    onChange={(e) => setNewEvent({ ...newEvent, eventTime: e.target.value })}
                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors duration-200 font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin mr-2 inline-block" /> : ''}
                {loading ? 'Adding...' : 'Add Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom styles for react-calendar and scrollbar */}
      <style>{`
        /* React-Calendar customizations */
        .react-calendar {
          width: 100%;
          max-width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem; /* rounded-lg */
          font-family: 'Inter', sans-serif;
          line-height: 1.125em;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
        }
        .dark .react-calendar {
          background: #374151; /* gray-700 */
          border-color: #4b5563; /* gray-600 */
        }

        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 1.25rem; /* text-xl */
          color: #1a202c; /* gray-900 */
        }
        .dark .react-calendar__navigation button {
          color: #e2e8f0; /* gray-200 */
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #f0fdf4; /* green-50 */
          color: #16a34a; /* green-600 */
          border-radius: 0.5rem;
        }
        .dark .react-calendar__navigation button:enabled:hover,
        .dark .react-calendar__navigation button:enabled:focus {
          background-color: #1f2937; /* gray-800 */
          color: #4ade80; /* green-400 */
        }
        .react-calendar__navigation button[disabled] {
          background-color: #f3f4f6; /* gray-100 */
          color: #9ca3af; /* gray-400 */
        }
        .dark .react-calendar__navigation button[disabled] {
          background-color: #1a202c; /* gray-900 */
          color: #4b5563; /* gray-600 */
        }


        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: 500; /* font-medium */
          font-size: 0.75rem; /* text-xs */
          color: #6b7280; /* gray-500 */
        }
        .dark .react-calendar__month-view__weekdays {
          color: #9ca3af; /* gray-400 */
        }

        .react-calendar__month-view__days__day {
          color: #1a202c; /* gray-900 */
        }
        .dark .react-calendar__month-view__days__day {
          color: #e2e8f0; /* gray-200 */
        }

        .react-calendar__tile {
          padding: 0.5em 0.5em;
          background: none;
          font-size: 0.875rem; /* text-sm */
          border-radius: 0.5rem; /* rounded-md */
          position: relative; /* For event dots */
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #f0fdf4; /* green-50 */
          color: #16a34a; /* green-600 */
        }
        .dark .react-calendar__tile:enabled:hover,
        .dark .react-calendar__tile:enabled:focus {
          background-color: #1f2937; /* gray-800 */
          color: #4ade80; /* green-400 */
        }

        .react-calendar__tile--now {
          background: #dcfce7; /* green-100 */
          color: #16a34a; /* green-600 */
          font-weight: bold;
        }
        .dark .react-calendar__tile--now {
          background: #064e3b; /* green-800 */
          color: #bbf7d0; /* green-200 */
        }

        .react-calendar__tile--active {
          background: #22c55e; /* green-500 */
          color: white;
        }
        .dark .react-calendar__tile--active {
          background: #10b981; /* emerald-500 */
          color: white;
        }
        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background: #16a34a; /* green-600 */
          color: white;
        }
        .dark .react-calendar__tile--active:enabled:hover,
        .dark .react-calendar__tile--active:enabled:focus {
          background: #059669; /* emerald-600 */
          color: white;
        }

        /* Event Dot */
        .event-dot {
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          height: 6px;
          width: 6px;
          background-color: #ef4444; /* red-500 */
          border-radius: 50%;
        }

        /* View-specific styles for year/decade view */
        .react-calendar__year-view .react-calendar__tile,
        .react-calendar__decade-view .react-calendar__tile,
        .react-calendar__century-view .react-calendar__tile {
            padding: 2em 0.5em; /* Adjust padding for larger view tiles */
        }

        /* Custom Scrollbar (already defined in Dashboard.jsx, but good to keep here for component self-containment if moved) */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px; /* For horizontal scrollbars */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0; /* Light background for track */
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151; /* Dark background for track in dark mode */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #a7a7a7; /* Gray thumb */
          border-radius: 10px;
          border: 2px solid #f0f0f0; /* Padding around thumb */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #6b7280; /* Darker gray thumb in dark mode */
          border: 2px solid #374151;
        }
      `}</style>
    </div>
  );
}